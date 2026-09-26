using System.IO.Compression;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using DemoEnglish.Infrastructure.Anki;
using Microsoft.Data.Sqlite;

namespace DemoEnglish.Tools.AnkiSqlEtl;

internal sealed record ExtractedNote(
    long? AnkiNoteId,
    int Ordinal,
    string Front,
    string Back,
    string? FrontPlain,
    IReadOnlyList<MediaRef> Media);

internal sealed record MediaRef(string Kind, string FileName, int SortOrder);

/// <summary>
/// Reads notes from an Anki .apkg (ZIP + SQLite) without the API's 10k note cap.
/// Reuses <see cref="AnkiApkgImportReader.StripHtml"/> for field cleanup.
/// </summary>
internal static class ApkgExtractor
{
    private const char FieldSeparator = '\u001f';
    private static readonly Regex MediaTag = new(
        @"\[(sound|img):([^\]]+)\]",
        RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.CultureInvariant);

    public static async Task<(IReadOnlyList<ExtractedNote> Notes, IReadOnlyList<string> Warnings)> ReadAsync(
        string apkgPath,
        CancellationToken cancellationToken)
    {
        var warnings = new List<string>
        {
            ".apkg ETL: first field = Front, remaining fields = Back (HTML stripped).",
        };

        var tempDir = Path.Combine(Path.GetTempPath(), "anki-sql-etl-" + Guid.NewGuid().ToString("n"));
        Directory.CreateDirectory(tempDir);
        string? collectionPath = null;

        try
        {
            await using (var file = new FileStream(
                             apkgPath,
                             FileMode.Open,
                             FileAccess.Read,
                             FileShare.Read,
                             1024 * 128,
                             FileOptions.Asynchronous | FileOptions.SequentialScan))
            using (var zip = new ZipArchive(file, ZipArchiveMode.Read, leaveOpen: false))
            {
                foreach (var entry in zip.Entries)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    if (string.IsNullOrEmpty(entry.Name))
                        continue;

                    var baseName = Path.GetFileName(entry.FullName.Replace('\\', '/'));
                    if (baseName.Equals("collection.anki2", StringComparison.OrdinalIgnoreCase) ||
                        baseName.Equals("collection.anki21", StringComparison.OrdinalIgnoreCase))
                    {
                        if (collectionPath is not null)
                        {
                            warnings.Add("Multiple collection DB entries; using the first.");
                            continue;
                        }

                        collectionPath = Path.Combine(tempDir, baseName);
                        entry.ExtractToFile(collectionPath, overwrite: true);
                    }
                }
            }

            if (collectionPath is null || !File.Exists(collectionPath))
                throw new InvalidOperationException("No collection.anki2 / collection.anki21 inside the .apkg.");

            var notes = await ReadNotesAsync(collectionPath, warnings, cancellationToken).ConfigureAwait(false);
            return (notes, warnings);
        }
        finally
        {
            try
            {
                if (Directory.Exists(tempDir))
                    Directory.Delete(tempDir, recursive: true);
            }
            catch
            {
                /* best-effort */
            }
        }
    }

    private static async Task<List<ExtractedNote>> ReadNotesAsync(
        string collectionPath,
        List<string> warnings,
        CancellationToken cancellationToken)
    {
        var notes = new List<ExtractedNote>();
        var csb = new SqliteConnectionStringBuilder
        {
            DataSource = collectionPath,
            Mode = SqliteOpenMode.ReadOnly,
            Cache = SqliteCacheMode.Shared,
        };

        await using var conn = new SqliteConnection(csb.ConnectionString);
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id, flds FROM notes ORDER BY id";

        var ordinal = 0;
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        while (await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
        {
            ordinal++;
            var ankiId = reader.GetInt64(0);
            var flds = reader.GetString(1);
            var parts = flds.Split(FieldSeparator, StringSplitOptions.None);
            if (parts.Length < 2)
            {
                warnings.Add($"Note id={ankiId}: skipped (need ≥2 fields).");
                continue;
            }

            var front = AnkiApkgImportReader.StripHtml(parts[0]).Trim();
            var back = string.Join("\n", parts.Skip(1).Select(AnkiApkgImportReader.StripHtml).Select(s => s.Trim()))
                .Trim();

            if (string.IsNullOrWhiteSpace(front) || string.IsNullOrWhiteSpace(back))
            {
                warnings.Add($"Note id={ankiId}: skipped (empty front/back after strip).");
                continue;
            }

            var combined = front + "\n" + back;
            var media = ExtractMedia(combined);
            var plain = FirstPlainLine(front);

            notes.Add(new ExtractedNote(ankiId, ordinal, front, back, plain, media));
        }

        if (notes.Count == 0)
            warnings.Add("No importable notes found.");

        return notes;
    }

    private static List<MediaRef> ExtractMedia(string text)
    {
        var list = new List<MediaRef>();
        var order = 0;
        foreach (Match m in MediaTag.Matches(text))
        {
            var kind = m.Groups[1].Value.Equals("img", StringComparison.OrdinalIgnoreCase) ? "img" : "sound";
            var file = m.Groups[2].Value.Trim();
            if (file.Length == 0)
                continue;
            list.Add(new MediaRef(kind, file, order++));
        }

        return list;
    }

    private static string? FirstPlainLine(string front)
    {
        var stripped = MediaTag.Replace(front, " ");
        var line = stripped
            .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .FirstOrDefault() ?? stripped.Trim();
        line = string.Join(' ', line.Split(' ', StringSplitOptions.RemoveEmptyEntries));
        if (line.Length == 0)
            return null;
        return line.Length <= 400 ? line : line[..400];
    }

    public static string Sha256Hex(string filePath)
    {
        using var stream = File.OpenRead(filePath);
        var hash = SHA256.HashData(stream);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
