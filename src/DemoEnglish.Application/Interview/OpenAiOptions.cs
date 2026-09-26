namespace DemoEnglish.Application.Interview;

/// <summary>Optional OpenAI credentials for interview summary (config / env / SWA app settings).</summary>
public sealed class OpenAiOptions
{
    public const string SectionName = "OpenAI";

    /// <summary>Bearer token for https://api.openai.com (starts with sk-…).</summary>
    public string? ApiKey { get; set; }

    /// <summary>Chat Completions model id (default gpt-4o-mini).</summary>
    public string ChatModel { get; set; } = "gpt-4o-mini";
}

public sealed record InterviewSummaryOutcome(
    bool Ok,
    string? Summary,
    int? Status = null,
    string? Title = null,
    string? Detail = null);
