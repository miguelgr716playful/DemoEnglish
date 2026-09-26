using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker.Http;

namespace DemoEnglish.Functions;

internal static class HttpJson
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    public static async Task<HttpResponseData> JsonAsync<T>(
        HttpRequestData request,
        HttpStatusCode status,
        T body)
    {
        var response = request.CreateResponse(status);
        response.Headers.Add("Content-Type", "application/json; charset=utf-8");
        await response.WriteStringAsync(JsonSerializer.Serialize(body, Options)).ConfigureAwait(false);
        return response;
    }

    public static Task<HttpResponseData> ProblemAsync(
        HttpRequestData request,
        HttpStatusCode status,
        string title,
        string detail) =>
        JsonAsync(
            request,
            status,
            new
            {
                title,
                detail,
                status = (int)status,
            });
}
