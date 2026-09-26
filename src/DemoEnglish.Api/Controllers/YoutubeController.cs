using DemoEnglish.Application.YouTube;
using DemoEnglish.Infrastructure.YouTube;
using Microsoft.AspNetCore.Mvc;

namespace DemoEnglish.Api.Controllers;

[ApiController]
[Route("api/youtube")]
public sealed class YoutubeController : ControllerBase
{
    private readonly YouTubeCaptionsService _captions;

    public YoutubeController(YouTubeCaptionsService captions)
    {
        _captions = captions;
    }

    public sealed class CaptionsResponse
    {
        public IReadOnlyList<YoutubeCaptionLineDto> Lines { get; set; } = [];
    }

    /// <summary>
    /// Downloads captions via YouTube Data API v3 (OAuth). Only works for videos owned by the configured account.
    /// </summary>
    [HttpGet("captions/{videoId}")]
    [ProducesResponseType(typeof(CaptionsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetCaptions(
        string videoId,
        [FromQuery] string lang = "en",
        CancellationToken cancellationToken = default)
    {
        var outcome = await _captions.GetCaptionsAsync(videoId, lang, cancellationToken).ConfigureAwait(false);
        if (!outcome.Ok)
        {
            return StatusCode(
                outcome.Status ?? StatusCodes.Status500InternalServerError,
                new ProblemDetails
                {
                    Title = outcome.Title,
                    Detail = outcome.Detail,
                    Status = outcome.Status,
                });
        }

        return Ok(new CaptionsResponse { Lines = outcome.Lines! });
    }
}
