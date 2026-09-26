using System.Net;
using DemoEnglish.Infrastructure.Interview;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace DemoEnglish.Functions;

public sealed class InterviewFunctions
{
    private readonly OpenAiInterviewCoach _coach;

    public InterviewFunctions(OpenAiInterviewCoach coach)
    {
        _coach = coach;
    }

    private sealed class SummaryRequest
    {
        public string Transcript { get; set; } = "";
    }

    private sealed class SummaryResponse
    {
        public string Summary { get; set; } = "";
    }

    [Function("InterviewSummary")]
    public async Task<HttpResponseData> Summarize(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "interview/summary")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        SummaryRequest? body;
        try
        {
            body = await request.ReadFromJsonAsync<SummaryRequest>(cancellationToken).ConfigureAwait(false);
        }
        catch
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.BadRequest,
                "Missing transcript",
                "Send a JSON body with a non-empty \"transcript\" string.").ConfigureAwait(false);
        }

        if (body is null || string.IsNullOrWhiteSpace(body.Transcript))
        {
            return await HttpJson.ProblemAsync(
                request,
                HttpStatusCode.BadRequest,
                "Missing transcript",
                "Send a JSON body with a non-empty \"transcript\" string.").ConfigureAwait(false);
        }

        var outcome = await _coach.SummarizeAsync(body.Transcript, cancellationToken).ConfigureAwait(false);
        if (!outcome.Ok)
        {
            var status = (HttpStatusCode)(outcome.Status ?? 500);
            return await HttpJson.ProblemAsync(
                request,
                status,
                outcome.Title ?? "Error",
                outcome.Detail ?? "Interview summary failed.").ConfigureAwait(false);
        }

        return await HttpJson.JsonAsync(
            request,
            HttpStatusCode.OK,
            new SummaryResponse { Summary = outcome.Summary! }).ConfigureAwait(false);
    }
}
