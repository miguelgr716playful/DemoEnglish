using System.Text;
using System.Text.Json;
using Azure;
using Azure.Data.Tables;

namespace DemoEnglish.Tools.AnkiSqlEtl;

/// <summary>
/// Writes flattened Anki notes to Azure Table Storage.
/// PartitionKey = deck name; RowKey = zero-padded ordinal within the import.
/// Media refs live in a JSON property (no child table).
/// </summary>
internal static class TableStorageWriter
{
    public const string DefaultNotesTable = "AnkiNotes";
    public const string DefaultImportsTable = "AnkiImports";

    /// <summary>Azure Table string property max is 64 KiB (UTF-16 ≈ 32 767 chars).</summary>
    private const int MaxStringChars = 32_000;

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public static async Task EnsureTablesAsync(
        TableServiceClient service,
        string notesTable,
        string importsTable,
        CancellationToken cancellationToken)
    {
        await service.CreateTableIfNotExistsAsync(notesTable, cancellationToken).ConfigureAwait(false);
        await service.CreateTableIfNotExistsAsync(importsTable, cancellationToken).ConfigureAwait(false);
    }

    public static async Task DeleteDeckAsync(
        TableClient notes,
        TableClient imports,
        string deckName,
        CancellationToken cancellationToken)
    {
        var pk = SanitizeKey(deckName);
        await DeletePartitionAsync(notes, pk, cancellationToken).ConfigureAwait(false);
        await DeletePartitionAsync(imports, pk, cancellationToken).ConfigureAwait(false);
    }

    public static async Task<string> WriteAsync(
        TableClient notes,
        TableClient imports,
        string deckName,
        string sourceFileName,
        string? sourceSha256,
        IReadOnlyList<ExtractedNote> extracted,
        string? warnings,
        CancellationToken cancellationToken)
    {
        var pk = SanitizeKey(deckName);
        var importId = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff") + "-" + Guid.NewGuid().ToString("n")[..8];
        var importedAt = DateTime.UtcNow;

        var importEntity = new TableEntity(pk, importId)
        {
            ["DeckName"] = deckName,
            ["SourceFileName"] = Truncate(sourceFileName, 512),
            ["SourceSha256"] = sourceSha256,
            ["NoteCount"] = extracted.Count,
            ["MediaRefCount"] = extracted.Sum(n => n.Media.Count),
            ["Warnings"] = Truncate(warnings, MaxStringChars),
            ["ImportedAtUtc"] = importedAt,
        };
        await imports.UpsertEntityAsync(importEntity, TableUpdateMode.Replace, cancellationToken)
            .ConfigureAwait(false);

        var batch = new List<TableTransactionAction>(100);
        var truncated = 0;

        foreach (var n in extracted)
        {
            var front = Fit(n.Front, ref truncated);
            var back = Fit(n.Back, ref truncated);
            var mediaJson = JsonSerializer.Serialize(
                n.Media.Select(m => new { kind = m.Kind, file = m.FileName, order = m.SortOrder }),
                JsonOpts);
            mediaJson = Fit(mediaJson, ref truncated);

            var rowKey = $"{n.Ordinal:D8}";
            var entity = new TableEntity(pk, rowKey)
            {
                ["ImportId"] = importId,
                ["Ordinal"] = n.Ordinal,
                ["Front"] = front,
                ["Back"] = back,
                ["FrontPlain"] = Truncate(n.FrontPlain, 400),
                ["MediaJson"] = mediaJson,
                ["ImportedAtUtc"] = importedAt,
            };
            if (n.AnkiNoteId.HasValue)
                entity["AnkiNoteId"] = n.AnkiNoteId.Value;

            batch.Add(new TableTransactionAction(TableTransactionActionType.UpsertReplace, entity));

            if (batch.Count >= 100)
            {
                await notes.SubmitTransactionAsync(batch, cancellationToken).ConfigureAwait(false);
                batch.Clear();
            }
        }

        if (batch.Count > 0)
            await notes.SubmitTransactionAsync(batch, cancellationToken).ConfigureAwait(false);

        if (truncated > 0)
        {
            importEntity["Warnings"] = Truncate(
                (warnings ?? "") + $"\nTruncated {truncated} string field(s) to Azure Table 64 KiB limit.",
                MaxStringChars);
            await imports.UpsertEntityAsync(importEntity, TableUpdateMode.Replace, cancellationToken)
                .ConfigureAwait(false);
        }

        return importId;
    }

    private static async Task DeletePartitionAsync(
        TableClient table,
        string partitionKey,
        CancellationToken cancellationToken)
    {
        var filter = TableClient.CreateQueryFilter($"PartitionKey eq {partitionKey}");
        var batch = new List<TableTransactionAction>(100);

        await foreach (var entity in table.QueryAsync<TableEntity>(filter, cancellationToken: cancellationToken)
                           .ConfigureAwait(false))
        {
            batch.Add(new TableTransactionAction(
                TableTransactionActionType.Delete,
                entity,
                entity.ETag));

            if (batch.Count < 100)
                continue;

            await table.SubmitTransactionAsync(batch, cancellationToken).ConfigureAwait(false);
            batch.Clear();
        }

        if (batch.Count > 0)
            await table.SubmitTransactionAsync(batch, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>Table keys cannot contain \ / # ? or control characters.</summary>
    public static string SanitizeKey(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return "default";

        var sb = new StringBuilder(value.Length);
        foreach (var ch in value.Trim())
        {
            if (ch is '\\' or '/' or '#' or '?' || char.IsControl(ch))
                sb.Append('_');
            else
                sb.Append(ch);
        }

        var s = sb.ToString();
        return s.Length == 0 ? "default" : s.Length <= 256 ? s : s[..256];
    }

    private static string? Truncate(string? value, int maxChars)
    {
        if (value is null)
            return null;
        return value.Length <= maxChars ? value : value[..maxChars];
    }

    private static string Fit(string value, ref int truncatedCount)
    {
        if (value.Length <= MaxStringChars)
            return value;
        truncatedCount++;
        return value[..MaxStringChars];
    }
}
