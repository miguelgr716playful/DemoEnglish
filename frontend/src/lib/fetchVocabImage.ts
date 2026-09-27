/** Public APIs for vocabulary images (no API key). */

export type VocabImageResult = {
  imageUrl: string
  source: 'wikipedia' | 'openverse'
  credit?: string
  extract?: string
}

const memory = new Map<string, VocabImageResult | null>()

function wikiTitleFromWord(word: string, wikiTitle?: string): string {
  return (wikiTitle ?? word).trim()
}

async function fetchWikipediaSummary(title: string): Promise<VocabImageResult | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) return null
  const data = (await response.json()) as {
    title?: string
    extract?: string
    thumbnail?: { source?: string }
    originalimage?: { source?: string }
    content_urls?: { desktop?: { page?: string } }
  }
  const imageUrl = data.originalimage?.source ?? data.thumbnail?.source
  if (!imageUrl) return null
  return {
    imageUrl,
    source: 'wikipedia',
    credit: data.content_urls?.desktop?.page ?? `Wikipedia: ${data.title ?? title}`,
    extract: data.extract,
  }
}

async function fetchOpenverseImage(query: string): Promise<VocabImageResult | null> {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=5&license_type=commercial,modification`
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) return null
  const data = (await response.json()) as {
    results?: Array<{ url?: string; thumbnail?: string; title?: string; foreign_landing_url?: string }>
  }
  const hit = data.results?.find((r) => r.url || r.thumbnail)
  if (!hit) return null
  const imageUrl = hit.thumbnail || hit.url
  if (!imageUrl) return null
  return {
    imageUrl,
    source: 'openverse',
    credit: hit.foreign_landing_url ?? hit.title ?? 'Openverse',
  }
}

/** Resolve a public image for a vocabulary word (Wikipedia first, Openverse fallback). */
export async function fetchVocabImage(word: string, wikiTitle?: string): Promise<VocabImageResult | null> {
  const key = wikiTitleFromWord(word, wikiTitle).toLowerCase()
  if (memory.has(key)) return memory.get(key) ?? null

  try {
    const fromWiki = await fetchWikipediaSummary(wikiTitleFromWord(word, wikiTitle))
    if (fromWiki) {
      memory.set(key, fromWiki)
      return fromWiki
    }
    const fromOpenverse = await fetchOpenverseImage(word.replace(/\s*\(.*\)\s*/g, '').trim())
    memory.set(key, fromOpenverse)
    return fromOpenverse
  } catch {
    memory.set(key, null)
    return null
  }
}
