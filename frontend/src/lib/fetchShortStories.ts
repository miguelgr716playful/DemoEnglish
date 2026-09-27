/** Short stories from https://shortstories-api.onrender.com (no API key). */

import { curatedTopicStories } from '../data/curatedTopicStories'

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
    try {
      const response = await fetch(STORIES_URL, { headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error(`Stories API failed (${response.status})`)
      const data = (await response.json()) as ApiStory[]
      if (!Array.isArray(data) || data.length === 0) throw new Error('No stories returned')
      const stories = data
        .map((item, i) => normalize(item, i))
        .filter((s): s is ShortStory => Boolean(s))
      // Curated learner stories first (weather, vacations, …), then API fables.
      const merged = [
        ...curatedTopicStories,
        ...stories.filter((s) => !curatedTopicStories.some((c) => c.id === s.id)),
      ]
      cachedStories = merged
      return merged
    } catch {
      cachedStories = [...curatedTopicStories]
      return cachedStories
    }
  })().finally(() => {
    inflight = null
  })

  return inflight
}

export async function fetchRandomShortStory(): Promise<ShortStory> {
  const all = await fetchShortStories()
  // Prefer curated stories a bit more often so weather/vacation practice shows up.
  if (curatedTopicStories.length > 0 && Math.random() < 0.35) {
    return curatedTopicStories[Math.floor(Math.random() * curatedTopicStories.length)]!
  }
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
  return all[Math.floor(Math.random() * all.length)]!
}

export function storySpeakText(story: ShortStory): string {
  return storySpeakLayout(story).text
}

/** Same string as TTS, with offsets for word highlighting. */
export function storySpeakLayout(story: ShortStory): {
  text: string
  title: string
  byline: string
  story: string
  moralLine: string
  offsets: { title: number; byline: number; story: number; moral: number }
} {
  const title = story.title
  const byline = `By ${story.author}.`
  const body = story.story
  const moralLine = story.moral ? `Moral: ${story.moral}` : ''
  const parts = [title, byline, body, moralLine].filter(Boolean)
  const text = parts.join('\n\n')
  let cursor = 0
  const offsets = { title: 0, byline: -1, story: -1, moral: -1 }
  const place = (part: string, key: keyof typeof offsets) => {
    if (!part) return
    const at = text.indexOf(part, cursor)
    if (at >= 0) {
      offsets[key] = at
      cursor = at + part.length
    }
  }
  place(title, 'title')
  place(byline, 'byline')
  place(body, 'story')
  place(moralLine, 'moral')
  return { text, title, byline, story: body, moralLine, offsets }
}
