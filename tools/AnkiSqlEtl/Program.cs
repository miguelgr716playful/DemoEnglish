using DemoEnglish.Tools.AnkiSqlEtl;
using Azure.Data.Tables;
using Microsoft.Extensions.Logging;

// ETL: Anki .apkg → Azure Table Storage (AnkiNotes + AnkiImports)
//
// 1) Create a Storage Account (Tables enabled). No SQL schema required.
// 2) Run:
//    dotnet run --project tools/AnkiSqlEtl -- --apkg "C:\decks\my.apkg" --connection "<Storage connection string>" --deck "Oxford 5000"
//
// Connection string: env DEMOENGLISH_STORAGE_CONNECTION (or legacy DEMOENGLISH_SQL_CONNECTION).
// Optional: --replace  (deletes all rows for that deck partition first)
// Optional Azure SQL script remains at sql/anki-azure-sql.sql if you prefer SQL later.

if (args.Any(a => a is "-h" or "--help" or "/?"))
{
    PrintHelp();
    return 0;
}

string? apkg = GetArg(args, "--apkg");
string? connection = GetArg(args, "--connection")
    ?? Environment.GetEnvironmentVariable("DEMOENGLISH_STORAGE_CONNECTION")
    ?? Environment.GetEnvironmentVariable("DEMOENGLISH_SQL_CONNECTION");
string deck = GetArg(args, "--deck") ?? "default";
string notesTable = GetArg(args, "--notes-table") ?? TableStorageWriter.DefaultNotesTable;
string importsTable = GetArg(args, "--imports-table") ?? TableStorageWriter.DefaultImportsTable;
bool replace = HasFlag(args, "--replace");

if (string.IsNullOrWhiteSpace(apkg) || !File.Exists(apkg))
{
    Console.Error.WriteLine("Missing or invalid --apkg path.");
    PrintHelp();
    return 1;
}

if (string.IsNullOrWhiteSpace(connection))
{
    Console.Error.WriteLine("Missing --connection (or env DEMOENGLISH_STORAGE_CONNECTION).");
    PrintHelp();
    return 1;
}

using var loggerFactory = LoggerFactory.Create(b => b.AddSimpleConsole(o =>
{
    o.SingleLine = true;
    o.TimestampFormat = "HH:mm:ss ";
}));
var log = loggerFactory.CreateLogger("AnkiSqlEtl");

var cts = new CancellationTokenSource();
Console.CancelKeyPress += (_, e) =>
{
    e.Cancel = true;
    cts.Cancel();
};

try
{
    log.LogInformation("Reading {Path}…", apkg);
    var sha = ApkgExtractor.Sha256Hex(apkg);
    var (notes, warnings) = await ApkgExtractor.ReadAsync(apkg, cts.Token).ConfigureAwait(false);
    log.LogInformation("Extracted {Count} notes ({WarnCount} warning line(s)).", notes.Count, warnings.Count);

    var service = new TableServiceClient(connection);
    await TableStorageWriter.EnsureTablesAsync(service, notesTable, importsTable, cts.Token)
        .ConfigureAwait(false);

    var notesClient = service.GetTableClient(notesTable);
    var importsClient = service.GetTableClient(importsTable);
    log.LogInformation("Connected to Table Storage ({Notes}, {Imports}).", notesTable, importsTable);

    if (replace)
    {
        log.LogInformation("Deleting previous rows for deck '{Deck}'…", deck);
        await TableStorageWriter.DeleteDeckAsync(notesClient, importsClient, deck, cts.Token)
            .ConfigureAwait(false);
    }

    var warnText = warnings.Count == 0 ? null : string.Join("\n", warnings.Take(200));
    var importId = await TableStorageWriter.WriteAsync(
            notesClient,
            importsClient,
            deck,
            Path.GetFileName(apkg),
            sha,
            notes,
            warnText,
            cts.Token)
        .ConfigureAwait(false);

    var mediaCount = notes.Sum(n => n.Media.Count);
    log.LogInformation(
        "Done. ImportId={ImportId}, notes={Notes}, media refs={Media}, deck='{Deck}' (PK={Pk}).",
        importId,
        notes.Count,
        mediaCount,
        deck,
        TableStorageWriter.SanitizeKey(deck));
    return 0;
}
catch (Exception ex)
{
    log.LogError(ex, "ETL failed.");
    return 2;
}

static string? GetArg(string[] argv, string name)
{
    for (var i = 0; i < argv.Length - 1; i++)
    {
        if (string.Equals(argv[i], name, StringComparison.OrdinalIgnoreCase))
            return argv[i + 1];
    }

    return null;
}

static bool HasFlag(string[] argv, string name) =>
    argv.Any(a => string.Equals(a, name, StringComparison.OrdinalIgnoreCase));

static void PrintHelp()
{
    Console.WriteLine("""
        AnkiSqlEtl — load an Anki .apkg into Azure Table Storage.

        Creates tables if missing:
          AnkiNotes    PartitionKey=deck, RowKey=00000001…  Front/Back/MediaJson
          AnkiImports  PartitionKey=deck, RowKey=importId   metadata + warnings

        Usage:
          dotnet run --project tools/AnkiSqlEtl -- --apkg <path.apkg> --connection "<storage conn>" [--deck "Name"] [--replace]

        Options:
          --apkg            Path to the .apkg file (required)
          --connection      Storage account connection string
                            (or env DEMOENGLISH_STORAGE_CONNECTION)
          --deck            Partition / logical deck name (default: default)
          --replace         Delete all entities for that deck before insert
          --notes-table     Notes table name (default: AnkiNotes)
          --imports-table   Imports table name (default: AnkiImports)

        Example connection string:
          DefaultEndpointsProtocol=https;AccountName=NAME;AccountKey=KEY;EndpointSuffix=core.windows.net

        Optional (not used by this tool): sql/anki-azure-sql.sql for Azure SQL instead.
        """);
}
