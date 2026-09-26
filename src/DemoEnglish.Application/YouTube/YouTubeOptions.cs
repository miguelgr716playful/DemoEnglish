namespace DemoEnglish.Application.YouTube;

/// <summary>YouTube Data API v3 credentials for caption download (OAuth required by Google).</summary>
public sealed class YouTubeOptions
{
    public const string SectionName = "YouTube";

    /// <summary>Optional API key (not sufficient alone for captions.download).</summary>
    public string? ApiKey { get; set; }

    /// <summary>OAuth 2.0 client id (Desktop or Web).</summary>
    public string? ClientId { get; set; }

    /// <summary>OAuth 2.0 client secret.</summary>
    public string? ClientSecret { get; set; }

    /// <summary>
    /// Long-lived refresh token for an account that <em>owns</em> the videos whose captions you download.
    /// Third-party videos (e.g. BBC) cannot be downloaded via the official Captions API.
    /// </summary>
    public string? RefreshToken { get; set; }
}

public sealed record YoutubeCaptionLineDto(string Text, double Offset, double Duration, string? Lang = null);

public sealed record YoutubeCaptionsOutcome(
    bool Ok,
    IReadOnlyList<YoutubeCaptionLineDto>? Lines = null,
    int? Status = null,
    string? Title = null,
    string? Detail = null);
