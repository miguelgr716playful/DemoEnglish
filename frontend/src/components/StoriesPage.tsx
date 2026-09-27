import { useEffect, useMemo, useRef, useState } from 'react'
import { BookMarked, Loader2, RefreshCw, Search } from 'lucide-react'
import {
  fetchRandomShortStory,
  fetchShortStories,
  storySpeakLayout,
  type ShortStory,
} from '../lib/fetchShortStories'
import { HighlightedText, localSpeechRange, type SpeechWordRange } from './HighlightedText'
import { SpeakTextButton } from './SpeakTextButton'

export function StoriesPage() {
  const [stories, setStories] = useState<ShortStory[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [randomBusy, setRandomBusy] = useState(false)
  const [wordRange, setWordRange] = useState<SpeechWordRange | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetchShortStories()
      .then((list) => {
        if (cancelled) return
        setStories(list)
        setSelectedId((prev) => prev ?? list[0]?.id ?? null)
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not load stories. The free API may be waking up — try again in a moment.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return stories
    return stories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.author.toLowerCase().includes(q) ||
        s.story.toLowerCase().includes(q),
    )
  }, [stories, query])

  const selected = stories.find((s) => s.id === selectedId) ?? filtered[0] ?? null
  const speakLayout = useMemo(() => (selected ? storySpeakLayout(selected) : null), [selected])

  useEffect(() => {
    setWordRange(null)
  }, [selected?.id])

  const loadRandom = async () => {
    setRandomBusy(true)
    setError(null)
    try {
      const story = await fetchRandomShortStory()
      setStories((prev) => (prev.some((s) => s.id === story.id) ? prev : [story, ...prev]))
      setSelectedId(story.id)
      setQuery('')
    } catch {
      setError('Could not load a random story. Try again.')
    } finally {
      setRandomBusy(false)
    }
  }

  const retry = () => {
    setLoading(true)
    setError(null)
    void fetchShortStories()
      .then((list) => {
        setStories(list)
        setSelectedId(list[0]?.id ?? null)
      })
      .catch(() => {
        setError('Could not load stories. The free API may be waking up — try again in a moment.')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="stories-page page">
      <header className="page-topbar">
        <span className="eyebrow">READING PRACTICE</span>
        <span className="date-label">
          {loading ? 'Loading…' : `${stories.length} stories · weather & vacations first`}
        </span>
      </header>

      <section className="topic-hero">
        <div>
          <h1>
            Stories<span className="accent-dot">.</span>
          </h1>
          <p>Short fables from a public API. Read along, then listen with the artificial voice.</p>
        </div>
        <div className="topic-hero-icon" aria-hidden>
          <BookMarked size={28} strokeWidth={1.8} />
        </div>
      </section>

      <div className="stories-toolbar">
        <label className="stories-search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, author, or text…"
            aria-label="Search stories"
          />
        </label>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => void loadRandom()}
          disabled={randomBusy || loading}
        >
          {randomBusy ? <Loader2 className="vocab-spin" size={14} aria-hidden /> : <RefreshCw size={14} aria-hidden />}
          Random story
        </button>
      </div>

      {loading ? (
        <div className="stories-status">
          <Loader2 className="vocab-spin" size={22} aria-hidden />
          <span>Fetching stories… first load can take a bit while the free API wakes up.</span>
        </div>
      ) : null}

      {error ? (
        <div className="stories-status stories-error">
          <span>{error}</span>
          <button type="button" className="button button-primary" onClick={retry}>
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="stories-layout">
          <aside className="stories-list" aria-label="Story list">
            {filtered.length === 0 ? (
              <p className="theory-empty">No stories match your search.</p>
            ) : (
              filtered.map((story) => (
                <button
                  key={story.id}
                  type="button"
                  className={`stories-list-item${story.id === selected?.id ? ' active' : ''}`}
                  onClick={() => setSelectedId(story.id)}
                >
                  <strong>{story.title}</strong>
                  <small>{story.author}</small>
                </button>
              ))
            )}
          </aside>

          {selected && speakLayout ? (
            <article className="stories-reader" aria-live="polite">
              <header className="stories-reader-head">
                <div>
                  <h2>
                    <HighlightedText
                      text={speakLayout.title}
                      range={localSpeechRange(
                        wordRange,
                        speakLayout.offsets.title,
                        speakLayout.title.length,
                      )}
                    />
                  </h2>
                  <p className="stories-author">
                    <HighlightedText
                      text={speakLayout.byline}
                      range={localSpeechRange(
                        wordRange,
                        speakLayout.offsets.byline,
                        speakLayout.byline.length,
                      )}
                    />
                  </p>
                </div>
                <SpeakTextButton
                  text={speakLayout.text}
                  resetSignal={selected.id}
                  selectionScopeRef={bodyRef}
                  onWordRangeChange={setWordRange}
                />
              </header>
              <div className="stories-body" ref={bodyRef}>
                <p className="stories-story-block">
                  <HighlightedText
                    text={speakLayout.story}
                    range={localSpeechRange(
                      wordRange,
                      speakLayout.offsets.story,
                      speakLayout.story.length,
                    )}
                  />
                </p>
                {speakLayout.moralLine && selected.moral ? (
                  <p className="stories-moral">
                    <span>Moral</span>
                    <HighlightedText
                      text={selected.moral}
                      range={localSpeechRange(
                        wordRange,
                        speakLayout.offsets.moral + 'Moral: '.length,
                        selected.moral.length,
                      )}
                    />
                  </p>
                ) : null}
              </div>
            </article>
          ) : (
            <p className="theory-empty">Pick a story to start reading.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
