using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using DemoEnglish.Application.Interview;
using Microsoft.Extensions.Options;

namespace DemoEnglish.Infrastructure.Interview;

public sealed class OpenAiInterviewCoach
{
    public const string HttpClientName = "OpenAI";

    private const int MinTranscriptChars = 25;
    private const int MaxTranscriptChars = 16_000;

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IOptionsMonitor<OpenAiOptions> _options;

    public OpenAiInterviewCoach(IHttpClientFactory httpClientFactory, IOptionsMonitor<OpenAiOptions> options)
    {
        _httpClientFactory = httpClientFactory;
        _options = options;
    }

    public async Task<InterviewSummaryOutcome> SummarizeAsync(string transcript, CancellationToken cancellationToken)
    {
        var trimmed = transcript.Trim();
        if (trimmed.Length < MinTranscriptChars)
        {
            return new InterviewSummaryOutcome(
                false,
                null,
                400,
                "Transcript too short",
                $"Provide at least {MinTranscriptChars} characters of interview text.");
        }

        if (trimmed.Length > MaxTranscriptChars)
        {
            return new InterviewSummaryOutcome(
                false,
                null,
                400,
                "Transcript too long",
                $"Maximum length is {MaxTranscriptChars} characters.");
        }

        var key = _options.CurrentValue.ApiKey?.Trim();
        if (string.IsNullOrEmpty(key))
        {
            return new InterviewSummaryOutcome(
                false,
                null,
                503,
                "Interview summary not configured",
                "Set configuration key OpenAI:ApiKey (user secrets, env, or SWA Application settings).");
        }

        var model = string.IsNullOrWhiteSpace(_options.CurrentValue.ChatModel)
            ? "gpt-4o-mini"
            : _options.CurrentValue.ChatModel.Trim();

        var system =
            "You are an interview coach. The user will paste a rough live transcript of their spoken English practice. "
            + "Give concise feedback: what worked well, what to improve, and 3 specific actionable tips for their next attempt. "
            + "Keep a supportive tone. Use plain paragraphs; avoid markdown headings.";

        var payload = new
        {
            model,
            temperature = 0.35,
            messages = new object[]
            {
                new { role = "system", content = system },
                new
                {
                    role = "user",
                    content = "Interview practice transcript (may contain errors from speech recognition):\n\n" + trimmed,
                },
            },
        };

        var json = JsonSerializer.Serialize(
            payload,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", key);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        var client = _httpClientFactory.CreateClient(HttpClientName);
        HttpResponseMessage response;
        try
        {
            response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return new InterviewSummaryOutcome(
                false,
                null,
                504,
                "OpenAI request timed out",
                "The summary request took too long. Try a shorter transcript.");
        }
        catch (HttpRequestException ex)
        {
            return new InterviewSummaryOutcome(
                false,
                null,
                502,
                "Could not reach OpenAI",
                ex.Message);
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
        if (!response.IsSuccessStatusCode)
        {
            var detail = TryReadOpenAiError(body) ?? response.ReasonPhrase ?? "OpenAI returned an error.";
            return new InterviewSummaryOutcome(false, null, 502, "OpenAI error", detail);
        }

        string? summary;
        try
        {
            using var doc = JsonDocument.Parse(body);
            summary = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        }
        catch (Exception ex)
        {
            return new InterviewSummaryOutcome(false, null, 502, "Unexpected OpenAI response", ex.Message);
        }

        summary = summary?.Trim();
        if (string.IsNullOrEmpty(summary))
        {
            return new InterviewSummaryOutcome(false, null, 502, "Empty summary", "The model returned no text.");
        }

        return new InterviewSummaryOutcome(true, summary);
    }

    private static string? TryReadOpenAiError(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("error", out var err) &&
                err.TryGetProperty("message", out var msg))
            {
                return msg.GetString();
            }
        }
        catch
        {
            /* ignore */
        }

        return null;
    }
}
