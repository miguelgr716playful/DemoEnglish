import { getApiBase } from './apiOrigin'

export type YoutubeCaptionLineDto = {
  text: string
  offset: number
  duration: number
  lang?: string | null
}

export class YoutubeCaptionsError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'YoutubeCaptionsError'
    this.status = status
  }
}

/** Official YouTube Data API captions via DemoEnglish API (OAuth; owned videos only). */
export async function fetchYoutubeCaptionsFromApi(
  videoId: string,
  lang = 'en',
): Promise<YoutubeCaptionLineDto[]> {
  const id = encodeURIComponent(videoId.trim())
  const qs = new URLSearchParams({ lang })
  const response = await fetch(`${getApiBase().replace(/\/+$/, '')}/api/youtube/captions/${id}?${qs}`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = (await response.json()) as { detail?: string; title?: string }
      detail = body.detail ?? body.title ?? detail
    } catch {
      /* ignore */
    }
    throw new YoutubeCaptionsError(detail, response.status)
  }

  const body = (await response.json()) as { lines?: YoutubeCaptionLineDto[] }
  return body.lines ?? []
}
