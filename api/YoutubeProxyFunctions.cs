using System.Net;
using System.Net.Http.Headers;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace DemoEnglish.Functions;

/// <summary>
/// Server-side proxy for YouTube InnerTube / timedtext (same role as Vite <c>/__yt__</c> in local dev).
/// Browsers cannot set the Android User-Agent; without a proxy captions fail on SWA with HTTP 405
/// when the SPA posts to a non-existent <c>/__yt__</c> path.
/// </summary>
public sealed class YoutubeProxyFunctions
{
    private const string YoutubeOrigin = "https://www.youtube.com";
    private const string AndroidUa =
        "com.google.android.youtube/20.10.38 (Linux; U; Android 14)";

    private static readonly HttpClient Http = CreateClient();

    private static HttpClient CreateClient()
    {
        var c = new HttpClient { Timeout = TimeSpan.FromSeconds(45) };
        c.DefaultRequestHeaders.UserAgent.ParseAdd(AndroidUa);
        return c;
    }

    [Function("YoutubeProxy")]
    public async Task<HttpResponseData> Proxy(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = "yt/{*path}")]
        HttpRequestData request,
        string path,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(path) || path.Contains("..", StringComparison.Ordinal))
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.BadRequest,
                "Invalid path",
                "YouTube proxy path is missing or invalid.").ConfigureAwait(false);
        }

        // Only allow known YouTube API / caption paths.
        var normalized = path.TrimStart('/');
        if (!IsAllowedPath(normalized))
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.Forbidden,
                "Path not allowed",
                "This proxy only forwards YouTube InnerTube and timedtext requests.").ConfigureAwait(false);
        }

        var query = request.Url.Query; // includes leading '?'
        var target = $"{YoutubeOrigin}/{normalized}{query}";

        using var outbound = new HttpRequestMessage(new HttpMethod(request.Method), target);
        outbound.Headers.TryAddWithoutValidation("Origin", YoutubeOrigin);
        outbound.Headers.TryAddWithoutValidation("Referer", $"{YoutubeOrigin}/");
        outbound.Headers.TryAddWithoutValidation("User-Agent", AndroidUa);

        if (request.Body is not null &&
            (HttpMethods.IsPost(request.Method) || HttpMethods.IsPut(request.Method)))
        {
            var bytes = await ReadAllBytesAsync(request.Body, cancellationToken).ConfigureAwait(false);
            outbound.Content = new ByteArrayContent(bytes);
            if (request.Headers.TryGetValues("Content-Type", out var cts))
            {
                var ct = cts.FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(ct))
                    outbound.Content.Headers.ContentType = MediaTypeHeaderValue.Parse(ct);
            }
            else
            {
                outbound.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            }
        }

        HttpResponseMessage upstream;
        try
        {
            upstream = await Http.SendAsync(outbound, HttpCompletionOption.ResponseHeadersRead, cancellationToken)
                .ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.BadGateway,
                "YouTube proxy error",
                ex.Message).ConfigureAwait(false);
        }

        var response = request.CreateResponse(upstream.StatusCode);
        var mediaType = upstream.Content.Headers.ContentType?.ToString();
        if (!string.IsNullOrWhiteSpace(mediaType))
            response.Headers.Add("Content-Type", mediaType);

        var payload = await upstream.Content.ReadAsByteArrayAsync(cancellationToken).ConfigureAwait(false);
        await response.WriteBytesAsync(payload, cancellationToken).ConfigureAwait(false);
        return response;
    }

    private static bool IsAllowedPath(string path)
    {
        return path.StartsWith("youtubei/", StringComparison.OrdinalIgnoreCase)
               || path.StartsWith("api/timedtext", StringComparison.OrdinalIgnoreCase)
               || path.StartsWith("timedtext", StringComparison.OrdinalIgnoreCase);
    }

    private static async Task<byte[]> ReadAllBytesAsync(Stream stream, CancellationToken cancellationToken)
    {
        await using var ms = new MemoryStream();
        await stream.CopyToAsync(ms, cancellationToken).ConfigureAwait(false);
        return ms.ToArray();
    }

    private static class HttpMethods
    {
        public static bool IsPost(string method) =>
            method.Equals("POST", StringComparison.OrdinalIgnoreCase);

        public static bool IsPut(string method) =>
            method.Equals("PUT", StringComparison.OrdinalIgnoreCase);
    }
}
