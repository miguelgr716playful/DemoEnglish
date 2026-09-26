namespace DemoEnglish.Functions;

/// <summary>SWA / Functions upload ceiling (platform is far below the Kestrel 10 GiB API).</summary>
internal static class FunctionUploadLimits
{
    public const long MaxMultipartBytes = 100L * 1024 * 1024; // 100 MiB
}
