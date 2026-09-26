using DemoEnglish.Application.Anki;
using DemoEnglish.Application.Dictionary;
using DemoEnglish.Application.Interview;
using DemoEnglish.Application.YouTube;
using DemoEnglish.Infrastructure.Anki;
using DemoEnglish.Infrastructure.Dictionary;
using DemoEnglish.Infrastructure.Interview;
using DemoEnglish.Infrastructure.YouTube;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DemoEnglish.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<DictionaryApiOptions>(configuration.GetSection(DictionaryApiOptions.SectionName));
        services.Configure<OpenAiOptions>(configuration.GetSection(OpenAiOptions.SectionName));
        services.Configure<YouTubeOptions>(configuration.GetSection(YouTubeOptions.SectionName));
        services.AddSingleton<IAnkiPlainTextImportParser, AnkiPlainTextImportParser>();
        services.AddScoped<IAnkiApkgImportReader, AnkiApkgImportReader>();
        services.AddScoped<OpenAiInterviewCoach>();
        services.AddSingleton<YouTubeCaptionsService>();

        services.AddHttpClient(DictionaryLookupService.HttpClientName, (sp, client) =>
        {
            var optionsMonitor = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<DictionaryApiOptions>>();
            var opts = optionsMonitor.Value;
            var baseUrl = string.IsNullOrWhiteSpace(opts.BaseUrl)
                ? "https://freedictionaryapi.com/"
                : opts.BaseUrl.Trim();
            if (!baseUrl.EndsWith('/'))
                baseUrl += "/";
            client.BaseAddress = new Uri(baseUrl);
            client.Timeout = TimeSpan.FromSeconds(Math.Clamp(opts.TimeoutSeconds, 5, 60));
        });

        services.AddHttpClient(
            OpenAiInterviewCoach.HttpClientName,
            client =>
            {
                client.Timeout = TimeSpan.FromSeconds(90);
            });

        services.AddHttpClient(
            YouTubeCaptionsService.HttpClientName,
            client =>
            {
                client.Timeout = TimeSpan.FromSeconds(60);
            });

        services.AddScoped<IDictionaryLookupService, DictionaryLookupService>();

        return services;
    }
}
