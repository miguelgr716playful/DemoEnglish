using DemoEnglish.Application.Dictionary;
using DemoEnglish.Infrastructure.Dictionary.FreeDictionary;

namespace DemoEnglish.Infrastructure.Dictionary;

public static class WordDefinitionMapper
{
    public static WordDefinitionDto? TryMap(FreeDictionaryApiResponse response)
    {
        if (response is null || string.IsNullOrWhiteSpace(response.Word))
            return null;

        if (response.Entries is null || response.Entries.Count == 0)
            return null;

        string? phonetic = null;
        string? partOfSpeech = null;
        string? definition = null;

        foreach (var entry in response.Entries)
        {
            phonetic ??= ResolvePhonetic(entry);
            if (definition is not null)
                continue;

            if (entry.Senses is null)
                continue;

            foreach (var sense in entry.Senses)
            {
                if (string.IsNullOrWhiteSpace(sense.Definition))
                    continue;

                definition = sense.Definition.Trim();
                partOfSpeech = string.IsNullOrWhiteSpace(entry.PartOfSpeech) ? null : entry.PartOfSpeech.Trim();
                break;
            }
        }

        if (string.IsNullOrWhiteSpace(definition))
            return null;

        return new WordDefinitionDto(
            Word: response.Word.Trim(),
            PhoneticText: phonetic,
            AudioUrl: null,
            PrimaryDefinition: definition,
            PartOfSpeech: partOfSpeech);
    }

    private static string? ResolvePhonetic(FreeDictionaryApiEntry entry)
    {
        if (entry.Pronunciations is null)
            return null;

        foreach (var p in entry.Pronunciations)
        {
            if (string.IsNullOrWhiteSpace(p.Text))
                continue;
            if (p.Type is null || p.Type.Equals("ipa", StringComparison.OrdinalIgnoreCase))
                return p.Text.Trim();
        }

        foreach (var p in entry.Pronunciations)
        {
            if (!string.IsNullOrWhiteSpace(p.Text))
                return p.Text.Trim();
        }

        return null;
    }
}
