using DemoEnglish.Infrastructure.YouTube;

namespace DemoEnglish.Tests.YouTube;

public sealed class YouTubeCaptionsServiceTests
{
    [Fact]
    public void ParseSrt_ExtractsLinesWithSecondsOffsets()
    {
        const string srt = """
            1
            00:00:01,000 --> 00:00:03,500
            Hello world

            2
            00:00:04,000 --> 00:00:05,000
            Second line
            """;

        var lines = YouTubeCaptionsService.ParseSrt(srt, "en");

        Assert.Equal(2, lines.Count);
        Assert.Equal("Hello world", lines[0].Text);
        Assert.Equal(1.0, lines[0].Offset, 3);
        Assert.Equal(2.5, lines[0].Duration, 3);
        Assert.Equal("Second line", lines[1].Text);
    }
}
