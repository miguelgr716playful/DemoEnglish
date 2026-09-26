using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using DemoEnglish.Application.YouTube;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DemoEnglish.Infrastructure.YouTube;

/// <summary>
/// Official YouTube Data API v3 captions.list + captions.download.
/// Requires OAuth (refresh token). Only works for videos owned by the authorized channel.
/// </summary>
public sealed class YouTubeCaptionsService
{
    public const string HttpClientName = "YouTubeDataApi";

    private static readonly Regex SrtBlock = new(
        @"(\d+)\s*\r?\n(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\s*\r?\n([\s\S]*?)(?=\r?\n\r?\n|\z)",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IOptionsMonitor<YouTubeOptions> _options;
    private readonly ILogger<YouTubeCaptionsService> _logger;

    private string? _cachedAccessToken;
    private DateTimeOffset _accessTokenExpiresAt = DateTimeOffset.MinValue;
    private readonly SemaphoreSlim _tokenLock = new(1, 1);

    public YouTubeCaptionsService(
        IHttpClientFactory httpClientFactory,
        IOptionsMonitor<YouTubeOptions> options,
        ILogger<YouTubeCaptionsService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options;
        _logger = logger;
    }

    public async Task<YoutubeCaptionsOutcome> GetCaptionsAsync(
        string videoId,
        string lang,
        CancellationToken cancellationToken)
    {
        var id = NormalizeVideoId(videoId);
        if (id is null)
        {
            return Fail(400, "Invalid video id", "Provide an 11-character YouTube video id.");
        }

        var opts = _options.CurrentValue;
        if (string.IsNullOrWhiteSpace(opts.ClientId) ||
            string.IsNullOrWhiteSpace(opts.ClientSecret) ||
            string.IsNullOrWhiteSpace(opts.RefreshToken))
        {
            return Fail(
                503,
                "YouTube captions not configured",
                "Set YouTube:ClientId, YouTube:ClientSecret, and YouTube:RefreshToken " +
                "(OAuth for a Google account that owns the videos). See README.");
        }

        string accessToken;
        try
        {
            accessToken = await GetAccessTokenAsync(opts, cancellationToken).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "YouTube OAuth token refresh failed");
            return Fail(502, "YouTube OAuth failed", ex.Message);
        }

        var trackId = await FindCaptionTrackIdAsync(accessToken, id, lang, cancellationToken).ConfigureAwait(false);
        if (trackId.Fail is { } fail)
            return fail;
        if (string.IsNullOrEmpty(trackId.Id))
        {
            return Fail(
                404,
                "No captions",
                $"No caption track found for video {id} (lang={lang}). " +
                "Official API only lists/downloads captions for videos your OAuth account owns.");
        }

        try
        {
            var srt = await DownloadCaptionSrtAsync(accessToken, trackId.Id, cancellationToken).ConfigureAwait(false);
            var lines = ParseSrt(srt, lang);
            if (lines.Count == 0)
                return Fail(502, "Empty captions", "Downloaded caption file had no parseable lines.");
            return new YoutubeCaptionsOutcome(true, lines);
        }
        catch (YouTubeApiException ex)
        {
            return Fail(ex.Status, ex.Title, ex.Detail);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "YouTube caption download failed for {VideoId}", id);
            return Fail(502, "Caption download failed", ex.Message);
        }
    }

    private async Task<string> GetAccessTokenAsync(YouTubeOptions opts, CancellationToken cancellationToken)
    {
        await _tokenLock.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            if (!string.IsNullOrEmpty(_cachedAccessToken) && DateTimeOffset.UtcNow < _accessTokenExpiresAt)
                return _cachedAccessToken;

            var client = _httpClientFactory.CreateClient(HttpClientName);
            using var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = opts.ClientId!.Trim(),
                ["client_secret"] = opts.ClientSecret!.Trim(),
                ["refresh_token"] = opts.RefreshToken!.Trim(),
                ["grant_type"] = "refresh_token",
            });

            using var response = await client.PostAsync("https://oauth2.googleapis.com/token", content, cancellationToken)
                .ConfigureAwait(false);
            var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
            if (!response.IsSuccessStatusCode)
            {
                var google = TryGoogleError(body);
                var hint =
                    " Check that ClientId, ClientSecret, and RefreshToken belong together " +
                    "(OAuth Playground → gear → Use your own OAuth credentials with THIS client). " +
                    "Scope should include https://www.googleapis.com/auth/youtube.force-ssl";
                throw new InvalidOperationException(
                    (google ?? $"Token refresh HTTP {(int)response.StatusCode}") + hint);
            }
            using var doc = JsonDocument.Parse(body);
            var token = doc.RootElement.GetProperty("access_token").GetString()
                        ?? throw new InvalidOperationException("OAuth response missing access_token.");
            var expiresIn = doc.RootElement.TryGetProperty("expires_in", out var exp) ? exp.GetInt32() : 3500;
            _cachedAccessToken = token;
            _accessTokenExpiresAt = DateTimeOffset.UtcNow.AddSeconds(Math.Max(60, expiresIn - 60));
            return token;
        }
        finally
        {
            _tokenLock.Release();
        }
    }

    private async Task<(string? Id, YoutubeCaptionsOutcome? Fail)> FindCaptionTrackIdAsync(
        string accessToken,
        string videoId,
        string lang,
        CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient(HttpClientName);
        var url =
            $"https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId={Uri.EscapeDataString(videoId)}";

        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
        var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);

        if (response.StatusCode == System.Net.HttpStatusCode.Forbidden ||
            response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
        {
            return (null, Fail(
                (int)response.StatusCode,
                "YouTube captions forbidden",
                TryGoogleError(body) ??
                "OAuth token cannot list captions for this video. You must own the video (or be authorized). " +
                "BBC / third-party lessons cannot be downloaded with the official Captions API."));
        }

        if (!response.IsSuccessStatusCode)
        {
            return (null, Fail(
                (int)response.StatusCode,
                "YouTube captions.list failed",
                TryGoogleError(body) ?? response.ReasonPhrase ?? "Unexpected error."));
        }

        using var doc = JsonDocument.Parse(body);
        if (!doc.RootElement.TryGetProperty("items", out var items) || items.GetArrayLength() == 0)
            return (null, null);

        string? preferred = null;
        string? any = null;
        string? asrPreferred = null;

        foreach (var item in items.EnumerateArray())
        {
            var id = item.GetProperty("id").GetString();
            if (string.IsNullOrEmpty(id)) continue;
            any ??= id;

            var snippet = item.GetProperty("snippet");
            var language = snippet.TryGetProperty("language", out var langEl) ? langEl.GetString() : null;
            var trackKind = snippet.TryGetProperty("trackKind", out var kindEl) ? kindEl.GetString() : null;
            var isAsr = string.Equals(trackKind, "asr", StringComparison.OrdinalIgnoreCase);
            var langMatch = language is not null &&
                            language.StartsWith(lang, StringComparison.OrdinalIgnoreCase);

            if (langMatch && !isAsr)
                preferred ??= id;
            else if (langMatch && isAsr)
                asrPreferred ??= id;
        }

        return (preferred ?? asrPreferred ?? any, null);
    }

    private async Task<string> DownloadCaptionSrtAsync(
        string accessToken,
        string captionId,
        CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient(HttpClientName);
        var url =
            $"https://www.googleapis.com/youtube/v3/captions/{Uri.EscapeDataString(captionId)}?tfmt=srt";

        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
        var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);

        if (!response.IsSuccessStatusCode)
        {
            throw new YouTubeApiException(
                (int)response.StatusCode,
                "YouTube captions.download failed",
                TryGoogleError(body) ??
                "Download requires ownership of the video. Third-party captions cannot be fetched with this API.");
        }

        return body;
    }

    public static IReadOnlyList<YoutubeCaptionLineDto> ParseSrt(string srt, string lang)
    {
        var lines = new List<YoutubeCaptionLineDto>();
        foreach (Match m in SrtBlock.Matches(srt))
        {
            var start = ParseSrtTime(m.Groups[2].Value);
            var end = ParseSrtTime(m.Groups[3].Value);
            var text = Regex.Replace(m.Groups[4].Value, @"<[^>]+>", "")
                .Replace("\r\n", "\n", StringComparison.Ordinal)
                .Replace('\n', ' ')
                .Trim();
            if (string.IsNullOrEmpty(text) || double.IsNaN(start) || double.IsNaN(end))
                continue;
            lines.Add(new YoutubeCaptionLineDto(text, start, Math.Max(0, end - start), lang));
        }

        return lines;
    }

    private static double ParseSrtTime(string value)
    {
        // HH:MM:SS,mmm
        if (!TimeSpan.TryParseExact(
                value.Replace(',', '.'),
                @"hh\:mm\:ss\.fff",
                CultureInfo.InvariantCulture,
                out var ts))
        {
            return double.NaN;
        }

        return ts.TotalSeconds;
    }

    private static string? NormalizeVideoId(string videoId)
    {
        var trimmed = videoId.Trim();
        if (trimmed.Length == 11) return trimmed;
        var m = Regex.Match(trimmed, @"(?:v=|/)([\w-]{11})");
        return m.Success ? m.Groups[1].Value : null;
    }

    private static YoutubeCaptionsOutcome Fail(int status, string title, string detail) =>
        new(false, null, status, title, detail);

    private static string? TryGoogleError(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            // OAuth token endpoint: { "error": "invalid_grant", "error_description": "..." }
            if (root.TryGetProperty("error_description", out var desc))
            {
                var d = desc.GetString();
                if (!string.IsNullOrWhiteSpace(d))
                {
                    var code = root.TryGetProperty("error", out var errCode) ? errCode.GetString() : null;
                    return string.IsNullOrWhiteSpace(code) ? d : $"{code}: {d}";
                }
            }

            if (root.TryGetProperty("error", out var err))
            {
                if (err.ValueKind == JsonValueKind.String)
                    return err.GetString();
                if (err.TryGetProperty("message", out var msg))
                    return msg.GetString();
            }
        }
        catch
        {
            /* ignore */
        }

        return null;
    }

    private sealed class YouTubeApiException(int status, string title, string detail) : Exception(detail)
    {
        public int Status { get; } = status;
        public string Title { get; } = title;
        public string Detail { get; } = detail;
    }
}
