using System.Net;
using DemoEnglish.Application.Dictionary;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace DemoEnglish.Functions;

public sealed class DictionaryFunctions
{
    private readonly IDictionaryLookupService _dictionaryLookup;

    public DictionaryFunctions(IDictionaryLookupService dictionaryLookup)
    {
        _dictionaryLookup = dictionaryLookup;
    }

    [Function("DictionaryGetEntry")]
    public async Task<HttpResponseData> GetEntry(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "dictionary/entries/{word}")]
        HttpRequestData request,
        string word,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(word))
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.BadRequest,
                "Invalid word",
                "The search term cannot be empty.").ConfigureAwait(false);
        }

        var result = await _dictionaryLookup.LookupAsync(word, cancellationToken).ConfigureAwait(false);

        return result switch
        {
            DictionaryLookupResult.Found found =>
                await HttpJson.JsonAsync(request, HttpStatusCode.OK, found.Definition).ConfigureAwait(false),
            DictionaryLookupResult.WordNotFound notFound =>
                await HttpJson.ProblemAsync(
                    request,
                    HttpStatusCode.NotFound,
                    "Word not found",
                    $"No dictionary entry was found for \"{notFound.Word}\".").ConfigureAwait(false),
            DictionaryLookupResult.TransientError err =>
                await HttpJson.ProblemAsync(
                    request,
                    HttpStatusCode.BadGateway,
                    "Dictionary service error",
                    err.Message).ConfigureAwait(false),
            _ => await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.InternalServerError,
                "Unexpected error",
                "Dictionary lookup failed.").ConfigureAwait(false),
        };
    }
}
