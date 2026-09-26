using DemoEnglish.Infrastructure.Dictionary;
using DemoEnglish.Infrastructure.Dictionary.FreeDictionary;

namespace DemoEnglish.Tests.Dictionary;

public sealed class WordDefinitionMapperTests
{
    [Fact]
    public void TryMap_UsesFirstSenseAndIpaPronunciation()
    {
        var response = new FreeDictionaryApiResponse
        {
            Word = "hello",
            Entries =
            [
                new FreeDictionaryApiEntry
                {
                    PartOfSpeech = "noun",
                    Pronunciations =
                    [
                        new FreeDictionaryPronunciation { Type = "ipa", Text = "/həˈləʊ/" }
                    ],
                    Senses =
                    [
                        new FreeDictionarySense { Definition = "A greeting." }
                    ]
                }
            ]
        };

        var dto = WordDefinitionMapper.TryMap(response);

        Assert.NotNull(dto);
        Assert.Equal("hello", dto.Word);
        Assert.Equal("/həˈləʊ/", dto.PhoneticText);
        Assert.Null(dto.AudioUrl);
        Assert.Equal("A greeting.", dto.PrimaryDefinition);
        Assert.Equal("noun", dto.PartOfSpeech);
    }

    [Fact]
    public void TryMap_ReturnsNull_WhenNoEntries()
    {
        var response = new FreeDictionaryApiResponse
        {
            Word = "ghost",
            Entries = []
        };

        Assert.Null(WordDefinitionMapper.TryMap(response));
    }

    [Fact]
    public void TryMap_ReturnsNull_WhenNoDefinitions()
    {
        var response = new FreeDictionaryApiResponse
        {
            Word = "ghost",
            Entries =
            [
                new FreeDictionaryApiEntry
                {
                    PartOfSpeech = "noun",
                    Senses = []
                }
            ]
        };

        Assert.Null(WordDefinitionMapper.TryMap(response));
    }
}
