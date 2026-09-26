using System.Net;
using System.Text;
using DemoEnglish.Application.Anki;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace DemoEnglish.Functions;

public sealed class AnkiFunctions
{
    private const int MaxExportCards = 5_000;

    private readonly IAnkiPlainTextImportParser _plainTextParser;
    private readonly IAnkiApkgImportReader _apkgReader;

    public AnkiFunctions(IAnkiPlainTextImportParser plainTextParser, IAnkiApkgImportReader apkgReader)
    {
        _plainTextParser = plainTextParser;
        _apkgReader = apkgReader;
    }

    [Function("AnkiImport")]
    public async Task<HttpResponseData> ImportDeck(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "anki/import")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        if (!request.Headers.TryGetValues("Content-Type", out var contentTypes) ||
            !contentTypes.Any(v => v.Contains("multipart/form-data", StringComparison.OrdinalIgnoreCase)))
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.BadRequest,
                "No file",
                "Upload a non-empty .txt, .tsv, .csv, or .apkg file as multipart field \"file\".").ConfigureAwait(false);
        }

        MultipartFormReader.UploadedFile form;
        try
        {
            form = await MultipartFormReader.ReadAsync(request, FunctionUploadLimits.MaxMultipartBytes, cancellationToken)
                .ConfigureAwait(false);
        }
        catch (InvalidOperationException ex)
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.RequestEntityTooLarge,
                "File too large",
                ex.Message).ConfigureAwait(false);
        }

        if (form.File.Length == 0)
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.BadRequest,
                "No file",
                "Upload a non-empty .txt, .tsv, .csv, or .apkg file.").ConfigureAwait(false);
        }

        if (form.File.Length > FunctionUploadLimits.MaxMultipartBytes)
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.RequestEntityTooLarge,
                "File too large",
                $"SWA Functions allow up to {FunctionUploadLimits.MaxMultipartBytes / (1024 * 1024)} MiB. Use the full API for larger .apkg files.")
                .ConfigureAwait(false);
        }

        var ext = Path.GetExtension(form.FileName).ToLowerInvariant();
        if (ext == ".apkg")
        {
            await using var upload = form.File;
            var result = await _apkgReader.ReadAsync(upload, cancellationToken).ConfigureAwait(false);
            return await HttpJson.JsonAsync(request, HttpStatusCode.OK, result).ConfigureAwait(false);
        }

        if (ext is not (".txt" or ".tsv" or ".csv"))
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.BadRequest,
                "Unsupported extension",
                "Use .txt, .tsv, .csv, or .apkg.").ConfigureAwait(false);
        }

        using var reader = new StreamReader(form.File, Encoding.UTF8, detectEncodingFromByteOrderMarks: true);
        var text = await reader.ReadToEndAsync(cancellationToken).ConfigureAwait(false);
        var plainResult = _plainTextParser.Parse(text, form.FileName, cancellationToken);
        return await HttpJson.JsonAsync(request, HttpStatusCode.OK, plainResult).ConfigureAwait(false);
    }

    [Function("AnkiExport")]
    public async Task<HttpResponseData> ExportPlainText(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "anki/export")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        AnkiExportRequestDto? body;
        try
        {
            body = await request.ReadFromJsonAsync<AnkiExportRequestDto>(cancellationToken).ConfigureAwait(false);
        }
        catch
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.BadRequest,
                "Invalid body",
                "Expected JSON { \"cards\": [ { \"front\", \"back\" } ] }.").ConfigureAwait(false);
        }

        if (body?.Cards is null || body.Cards.Count == 0)
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.BadRequest,
                "Invalid body",
                "Send at least one card.").ConfigureAwait(false);
        }

        if (body.Cards.Count > MaxExportCards)
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.BadRequest,
                "Too many cards",
                $"Maximum {MaxExportCards:N0} cards per export.").ConfigureAwait(false);
        }

        var sb = new StringBuilder();
        sb.AppendLine("#separator:tab");
        foreach (var c in body.Cards)
            sb.AppendLine($"{SanitizeField(c.Front)}\t{SanitizeField(c.Back)}");

        var utf8Bom = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true);
        var response = request.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "text/plain; charset=utf-8");
        response.Headers.Add("Content-Disposition", "attachment; filename=\"anki-export.txt\"");
        await response.WriteBytesAsync(utf8Bom.GetBytes(sb.ToString()), cancellationToken).ConfigureAwait(false);
        return response;
    }

    [Function("AnkiSample")]
    public async Task<HttpResponseData> DownloadSample(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "anki/sample")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        const string sample =
            "#separator:tab\n" +
            "What is a race condition?\tTwo threads access shared state without proper synchronization; outcomes become unpredictable.\n" +
            "Idempotent operation\tAn operation you can apply more than once without changing the result beyond the first application.\n" +
            "Throughput\tThe amount of work completed per unit of time (e.g. requests per second).\n";
        var utf8Bom = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true);
        var response = request.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "text/plain; charset=utf-8");
        response.Headers.Add("Content-Disposition", "attachment; filename=\"sample-tech-english.txt\"");
        await response.WriteBytesAsync(utf8Bom.GetBytes(sample), cancellationToken).ConfigureAwait(false);
        return response;
    }

    private static string SanitizeField(string value)
    {
        var t = value.Replace("\t", " ", StringComparison.Ordinal).ReplaceLineEndings("<br>");
        return t.Trim();
    }
}
