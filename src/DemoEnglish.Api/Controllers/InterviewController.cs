using DemoEnglish.Infrastructure.Interview;
using Microsoft.AspNetCore.Mvc;

namespace DemoEnglish.Api.Controllers;

[ApiController]
[Route("api/interview")]
public sealed class InterviewController : ControllerBase
{
    private readonly OpenAiInterviewCoach _coach;

    public InterviewController(OpenAiInterviewCoach coach)
    {
        _coach = coach;
    }

    public sealed class SummaryRequest
    {
        public string Transcript { get; set; } = "";
    }

    public sealed class SummaryResponse
    {
        public string Summary { get; set; } = "";
    }

    /// <summary>Generates short interview-coach feedback from a transcript (requires OpenAI:ApiKey).</summary>
    [HttpPost("summary")]
    [ProducesResponseType(typeof(SummaryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status504GatewayTimeout)]
    public async Task<IActionResult> Summarize([FromBody] SummaryRequest body, CancellationToken cancellationToken)
    {
        if (body is null || string.IsNullOrWhiteSpace(body.Transcript))
        {
            return BadRequest(
                new ProblemDetails
                {
                    Title = "Missing transcript",
                    Detail = "Send a JSON body with a non-empty \"transcript\" string.",
                    Status = StatusCodes.Status400BadRequest,
                });
        }

        var outcome = await _coach.SummarizeAsync(body.Transcript, cancellationToken).ConfigureAwait(false);
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

        return Ok(new SummaryResponse { Summary = outcome.Summary! });
    }
}
