namespace DemoEnglish.Infrastructure.Dictionary;

public sealed class DictionaryApiOptions
{
    public const string SectionName = "DictionaryApi";

    /// <summary>Origin for FreeDictionaryAPI.com (Wiktionary).</summary>
    public string BaseUrl { get; set; } = "https://freedictionaryapi.com/";

    public int TimeoutSeconds { get; set; } = 20;
}
