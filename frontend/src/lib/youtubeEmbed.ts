/** YouTube watch URL (opens in a new tab). */
export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/** Static thumbnail for list/preview cards (hqdefault is reliably available). */
export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

/**
 * Embed URL for iframes. Uses www.youtube.com (not nocookie) and origin so Error 153 is less likely.
 * Pair with referrerPolicy="strict-origin-when-cross-origin" on the iframe.
 */
export function youtubeEmbedUrl(videoId: string, pageOrigin?: string): string {
  const params = new URLSearchParams({ rel: '0' })
  const origin =
    pageOrigin ?? (typeof window !== 'undefined' ? window.location.origin : undefined)
  if (origin) params.set('origin', origin)
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}
