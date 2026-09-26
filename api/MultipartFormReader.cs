using System.Buffers;
using System.Globalization;
using Microsoft.Azure.Functions.Worker.Http;

namespace DemoEnglish.Functions;

/// <summary>Minimal multipart reader for field name "file" (Azure Functions HttpRequestData).</summary>
internal static class MultipartFormReader
{
    /// <summary>
    /// Uploaded payload. Prefer a temp-file-backed stream for large parts so the .apkg
    /// is not held entirely in a second <see cref="MemoryStream"/>.
    /// </summary>
    internal sealed class UploadedFile : IAsyncDisposable
    {
        private readonly string? _tempPath;

        public UploadedFile(string fileName, Stream file, string? tempPath = null)
        {
            FileName = fileName;
            File = file;
            _tempPath = tempPath;
        }

        public string FileName { get; }
        public Stream File { get; }

        public async ValueTask DisposeAsync()
        {
            await File.DisposeAsync().ConfigureAwait(false);
            if (_tempPath is null) return;
            try
            {
                if (System.IO.File.Exists(_tempPath))
                    System.IO.File.Delete(_tempPath);
            }
            catch
            {
                /* best-effort cleanup */
            }
        }
    }

    public static async Task<UploadedFile> ReadAsync(
        HttpRequestData request,
        long maxBytes,
        CancellationToken cancellationToken)
    {
        if (!request.Headers.TryGetValues("Content-Type", out var values))
            return new UploadedFile("", new MemoryStream());

        var contentType = values.FirstOrDefault() ?? "";
        var boundary = GetBoundary(contentType);
        if (string.IsNullOrEmpty(boundary))
            return new UploadedFile("", new MemoryStream());

        await using var limited = new MemoryStream();
        await CopyLimitedAsync(request.Body, limited, maxBytes + 4096, cancellationToken).ConfigureAwait(false);
        return ParseMultipart(limited.ToArray(), boundary);
    }

    private static string? GetBoundary(string contentType)
    {
        const string key = "boundary=";
        var idx = contentType.IndexOf(key, StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return null;
        var boundary = contentType[(idx + key.Length)..].Trim().Trim('"');
        return string.IsNullOrEmpty(boundary) ? null : boundary;
    }

    private static UploadedFile ParseMultipart(byte[] data, string boundary)
    {
        var boundaryBytes = System.Text.Encoding.UTF8.GetBytes("--" + boundary);
        var parts = SplitByBoundary(data, boundaryBytes);
        foreach (var part in parts)
        {
            var headerEnd = IndexOf(part, "\r\n\r\n"u8.ToArray());
            if (headerEnd < 0) continue;
            var headerText = System.Text.Encoding.UTF8.GetString(part, 0, headerEnd);
            if (!headerText.Contains("name=\"file\"", StringComparison.OrdinalIgnoreCase) &&
                !headerText.Contains("name=file", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var fileName = "upload.bin";
            var fnIdx = headerText.IndexOf("filename=", StringComparison.OrdinalIgnoreCase);
            if (fnIdx >= 0)
            {
                var raw = headerText[(fnIdx + "filename=".Length)..].Trim();
                if (raw.StartsWith('"'))
                {
                    var end = raw.IndexOf('"', 1);
                    fileName = end > 1 ? raw[1..end] : raw.Trim('"');
                }
                else
                {
                    var end = raw.IndexOfAny([';', '\r', '\n']);
                    fileName = (end >= 0 ? raw[..end] : raw).Trim();
                }
            }

            var contentStart = headerEnd + 4;
            var contentLen = part.Length - contentStart;
            if (contentLen >= 2 && part[contentStart + contentLen - 2] == (byte)'\r' &&
                part[contentStart + contentLen - 1] == (byte)'\n')
            {
                contentLen -= 2;
            }

            contentLen = Math.Max(0, contentLen);

            // Spill the file part to disk; small text uploads stay in memory.
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            if (ext == ".apkg" || contentLen > 1_048_576)
            {
                var tempPath = Path.Combine(
                    Path.GetTempPath(),
                    "demoenglish-upload-" + Guid.NewGuid().ToString("n") + (ext.Length > 0 ? ext : ".bin"));
                using (var write = new FileStream(
                           tempPath,
                           FileMode.CreateNew,
                           FileAccess.Write,
                           FileShare.None,
                           1024 * 80,
                           FileOptions.SequentialScan))
                {
                    write.Write(part, contentStart, contentLen);
                }

                var read = new FileStream(
                    tempPath,
                    FileMode.Open,
                    FileAccess.Read,
                    FileShare.Read,
                    1024 * 80,
                    FileOptions.Asynchronous | FileOptions.SequentialScan);
                return new UploadedFile(fileName, read, tempPath);
            }

            var ms = new MemoryStream(contentLen);
            ms.Write(part, contentStart, contentLen);
            ms.Position = 0;
            return new UploadedFile(fileName, ms);
        }

        return new UploadedFile("", new MemoryStream());
    }

    private static List<byte[]> SplitByBoundary(byte[] data, byte[] boundary)
    {
        var parts = new List<byte[]>();
        var start = IndexOf(data, boundary);
        while (start >= 0)
        {
            var after = start + boundary.Length;
            if (after + 1 < data.Length && data[after] == (byte)'-' && data[after + 1] == (byte)'-')
                break;
            if (after + 1 < data.Length && data[after] == (byte)'\r' && data[after + 1] == (byte)'\n')
                after += 2;

            var next = IndexOf(data, boundary, after);
            if (next < 0) break;
            var len = next - after;
            if (len >= 2 && data[after + len - 2] == (byte)'\r' && data[after + len - 1] == (byte)'\n')
                len -= 2;
            var slice = new byte[len];
            Buffer.BlockCopy(data, after, slice, 0, len);
            parts.Add(slice);
            start = next;
        }

        return parts;
    }

    private static int IndexOf(byte[] haystack, byte[] needle, int start = 0)
    {
        if (needle.Length == 0 || haystack.Length < needle.Length) return -1;
        for (var i = start; i <= haystack.Length - needle.Length; i++)
        {
            var ok = true;
            for (var j = 0; j < needle.Length; j++)
            {
                if (haystack[i + j] != needle[j])
                {
                    ok = false;
                    break;
                }
            }

            if (ok) return i;
        }

        return -1;
    }

    private static async Task CopyLimitedAsync(
        Stream source,
        Stream destination,
        long maxBytes,
        CancellationToken cancellationToken)
    {
        var buffer = ArrayPool<byte>.Shared.Rent(81920);
        try
        {
            long total = 0;
            int read;
            while ((read = await source.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken)
                       .ConfigureAwait(false)) > 0)
            {
                total += read;
                if (total > maxBytes)
                    throw new InvalidOperationException(
                        string.Create(CultureInfo.InvariantCulture, $"Upload exceeds {maxBytes} bytes."));
                await destination.WriteAsync(buffer.AsMemory(0, read), cancellationToken).ConfigureAwait(false);
            }
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer);
        }
    }
}
