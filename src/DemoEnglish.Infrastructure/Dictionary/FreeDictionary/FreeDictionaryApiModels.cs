using System.Text.Json.Serialization;

namespace DemoEnglish.Infrastructure.Dictionary.FreeDictionary;

/// <summary>Response from FreeDictionaryAPI.com (Wiktionary-backed).</summary>
public sealed class FreeDictionaryApiResponse
{
    [JsonPropertyName("word")]
    public string? Word { get; init; }

    [JsonPropertyName("entries")]
    public IReadOnlyList<FreeDictionaryApiEntry>? Entries { get; init; }
}

public sealed class FreeDictionaryApiEntry
{
    [JsonPropertyName("partOfSpeech")]
    public string? PartOfSpeech { get; init; }

    [JsonPropertyName("pronunciations")]
    public IReadOnlyList<FreeDictionaryPronunciation>? Pronunciations { get; init; }

    [JsonPropertyName("senses")]
    public IReadOnlyList<FreeDictionarySense>? Senses { get; init; }
}

public sealed class FreeDictionaryPronunciation
{
    [JsonPropertyName("type")]
    public string? Type { get; init; }

    [JsonPropertyName("text")]
    public string? Text { get; init; }
}

public sealed class FreeDictionarySense
{
    [JsonPropertyName("definition")]
    public string? Definition { get; init; }
}
