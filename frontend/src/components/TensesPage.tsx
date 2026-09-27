import { useMemo, useState } from 'react'
import { Clock3, Play, Search } from 'lucide-react'
import { MarkdownFormula, MarkdownLite } from './MarkdownLite'
import { ContentsIndex } from './ContentsIndex'
import {
  verbTenseTheoryBlocks,
  verbTenseTheoryExtra,
  verbTenseTheoryFeaturedVideo,
  type TenseTheoryYoutube,
} from '../data/verbTenseTheory'
import { youtubeThumbnailUrl, youtubeWatchUrl } from '../lib/youtubeEmbed'
import { useYoutubePlayer } from './YoutubeFloatingPlayer'

function matchesQuery(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function TenseVideoChip({ video }: { video: TenseTheoryYoutube & { label?: string } }) {
  const { openPlayer, active } = useYoutubePlayer()
  const title = video.label?.trim() || 'YouTube lesson'
  const isActive = active?.videoId === video.videoId

  return (
    <div className={`theory-video-chip${isActive ? ' is-active' : ''}`}>
      <button
        type="button"
        className="theory-video-play"
        onClick={() => openPlayer({ videoId: video.videoId, title })}
        aria-label={`Play: ${title}`}
      >
        <img src={youtubeThumbnailUrl(video.videoId)} alt="" loading="lazy" decoding="async" />
        <span className="theory-video-play-icon" aria-hidden>
          <Play size={16} strokeWidth={2} fill="currentColor" />
        </span>
      </button>
      <div className="theory-video-meta">
        <button type="button" className="theory-video-title" onClick={() => openPlayer({ videoId: video.videoId, title })}>
          {title}
        </button>
        <a href={youtubeWatchUrl(video.videoId)} target="_blank" rel="noopener noreferrer">
          Open on YouTube
        </a>
      </div>
    </div>
  )
}

export function TensesPage() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const blocks = useMemo(() => {
    if (!q) return verbTenseTheoryBlocks
    return verbTenseTheoryBlocks.filter((b) =>
      matchesQuery(
        [b.title, b.formula, b.usage, b.example, b.youtube.label ?? ''].join('\n'),
        q,
      ),
    )
  }, [q])

  const extras = useMemo(() => {
    if (!q) return verbTenseTheoryExtra
    return verbTenseTheoryExtra.filter((x) =>
      matchesQuery([x.title, x.body, x.youtube?.label ?? ''].join('\n'), q),
    )
  }, [q])

  const showOverview =
    !q ||
    matchesQuery([verbTenseTheoryFeaturedVideo.label, 'overview', 'all tenses'].join(' '), q)

  const empty = !showOverview && blocks.length === 0 && extras.length === 0

  const indexItems = useMemo(() => {
    const items: { id: string; label: string }[] = []
    if (showOverview) items.push({ id: 'tense-overview', label: 'All tenses overview' })
    for (const b of blocks) items.push({ id: `tense-${b.id}`, label: b.title.replace(/\*/g, '') })
    for (const x of extras) items.push({ id: `tense-extra-${slugify(x.title)}`, label: x.title })
    return items
  }, [showOverview, blocks, extras])

  return (
    <div className="tenses-page page">
      <header className="page-topbar">
        <span className="eyebrow">VERB TENSES</span>
        <span className="date-label">
          {verbTenseTheoryBlocks.length} formulas · videos included
        </span>
      </header>

      <section className="theory-hero">
        <div>
          <h1>
            Tense formulas<span className="accent-dot">.</span>
          </h1>
          <p>Each tense with its formula, use, example, and related lesson video.</p>
        </div>
        <div className="theory-hero-icon" aria-hidden>
          <Clock3 size={28} strokeWidth={1.8} />
        </div>
      </section>

      <label className="theory-search">
        <Search size={18} strokeWidth={1.8} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tense (e.g. present perfect, passive, will…)"
          aria-label="Search tense formulas"
        />
      </label>

      {empty ? (
        <p className="theory-empty">No results for “{query.trim()}”.</p>
      ) : (
        <div className="theory-sections">
          <ContentsIndex title="Tenses index" items={indexItems} />

          {showOverview ? (
            <section className="theory-card theory-card-featured" id="tense-overview">
              <span className="eyebrow">OVERVIEW</span>
              <h2>All tenses</h2>
              <p className="theory-ref-note">Start here for a full walkthrough of the main English tenses.</p>
              <TenseVideoChip video={verbTenseTheoryFeaturedVideo} />
            </section>
          ) : null}

          {blocks.map((b) => (
            <section key={b.id} className="theory-card" id={`tense-${b.id}`}>
              <h2>
                <MarkdownLite text={b.title} />
              </h2>
              <div className="theory-formula">
                <MarkdownFormula text={b.formula} />
              </div>
              <p className="theory-use">
                <span>Use:</span> <MarkdownLite text={b.usage} />
              </p>
              <p className="theory-eg">
                <span>e.g.</span> <MarkdownLite text={b.example} />
              </p>
              <TenseVideoChip video={b.youtube} />
            </section>
          ))}

          {extras.length > 0 ? (
            <div className="theory-extras">
              <h2 className="theory-extras-title">More patterns</h2>
              {extras.map((x) => (
                <section
                  key={x.title}
                  id={`tense-extra-${slugify(x.title)}`}
                  className="theory-card theory-card-extra"
                >
                  <h3>{x.title}</h3>
                  <div className="theory-extra-body">
                    {x.body
                      .trim()
                      .split('\n')
                      .filter((line) => line.trim().length > 0)
                      .map((line, li) => (
                        <p key={li}>
                          <MarkdownLite text={line} />
                        </p>
                      ))}
                  </div>
                  {x.youtube ? <TenseVideoChip video={x.youtube} /> : null}
                </section>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
