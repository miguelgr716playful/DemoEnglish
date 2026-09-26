using System.Net;
using DemoEnglish.Infrastructure.YouTube;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace DemoEnglish.Functions;

public sealed class YoutubeCaptionsFunctions
{
    private readonly YouTubeCaptionsService _captions;

    public YoutubeCaptionsFunctions(YouTubeCaptionsService captions)
    {
        _captions = captions;
    }

    [Function("YoutubeCaptions")]
    public async Task<HttpResponseData> GetCaptions(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "youtube/captions/{videoId}")]
        HttpRequestData request,
        string videoId,
        CancellationToken cancellationToken)
    {
        var lang = "en";
        var query = request.Url.Query.TrimStart('?');
        foreach (var part in query.Split('&', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var eq = part.IndexOf('=');
            if (eq <= 0) continue;
            var key = Uri.UnescapeDataString(part[..eq]);
            if (!key.Equals("lang", StringComparison.OrdinalIgnoreCase)) continue;
            var val = Uri.UnescapeDataString(part[(eq + 1)..]).Trim();
            if (val.Length > 0) lang = val;
        }
        var outcome = await _captions.GetCaptionsAsync(videoId, lang, cancellationToken).ConfigureAwait(false);
        if (!outcome.Ok)
        {
            var status = (HttpStatusCode)(outcome.Status ?? 500);
            return await HttpJson.ProblemAsync(
                request,
                status,
                outcome.Title ?? "Error",
                outcome.Detail ?? "Caption request failed.").ConfigureAwait(false);
        }

        return await HttpJson.JsonAsync(
            request,
            HttpStatusCode.OK,
            new { lines = outcome.Lines }).ConfigureAwait(false);
    }
}
