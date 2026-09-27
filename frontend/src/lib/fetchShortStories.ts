/** Short stories from https://shortstories-api.onrender.com (no API key). */

export type ShortStory = {
  id: string
  title: string
  author: string
  story: string
  moral: string
}

type ApiStory = {
  _id?: string
  title?: string
  author?: string
  story?: string
  moral?: string
}

const STORIES_URL = 'https://shortstories-api.onrender.com/stories'
const RANDOM_URL = 'https://shortstories-api.onrender.com/'

let cachedStories: ShortStory[] | null = null
let inflight: Promise<ShortStory[]> | null = null

function normalize(raw: ApiStory, index = 0): ShortStory | null {
  const title = raw.title?.trim()
  const story = raw.story?.trim()
  if (!title || !story) return null
  return {
    id: raw._id?.trim() || `story-${index}-${title.toLowerCase().replace(/\s+/g, '-')}`,
    title,
    author: raw.author?.trim() || 'Unknown',
    story,
    moral: raw.moral?.trim() || '',
  }
}

export async function fetchShortStories(): Promise<ShortStory[]> {
  if (cachedStories) return cachedStories
  if (inflight) return inflight

  inflight = (async () => {
    const response = await fetch(STORIES_URL, { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`Stories API failed (${response.status})`)
    const data = (await response.json()) as ApiStory[]
    if (!Array.isArray(data) || data.length === 0) throw new Error('No stories returned')
    const stories = data
      .map((item, i) => normalize(item, i))
      .filter((s): s is ShortStory => Boolean(s))
    cachedStories = stories
    return stories
  })().finally(() => {
    inflight = null
  })

  return inflight
}

export async function fetchRandomShortStory(): Promise<ShortStory> {
  try {
    const response = await fetch(RANDOM_URL, { headers: { Accept: 'application/json' } })
    if (response.ok) {
      const data = (await response.json()) as ApiStory
      const story = normalize(data)
      if (story) return story
    }
  } catch {
    /* fall through to list */
  }
  const all = await fetchShortStories()
  return all[Math.floor(Math.random() * all.length)]!
}

export function storySpeakText(story: ShortStory): string {
  const parts = [
    story.title,
    `By ${story.author}.`,
    story.story,
    story.moral ? `Moral: ${story.moral}` : '',
  ]
  return parts.filter(Boolean).join('\n\n')
}
