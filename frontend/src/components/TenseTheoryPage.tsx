import { useMemo, useState } from 'react'
import { GraduationCap, Play, Search } from 'lucide-react'
import { MarkdownFormula, MarkdownLite } from './MarkdownLite'
import {
  verbTenseTheoryBlocks,
  verbTenseTheoryExtra,
  verbTenseTheoryFeaturedVideo,
  type TenseTheoryYoutube,
} from '../data/verbTenseTheory'
import {
  theoryReferenceTables,
  theoryTableSearchBlob,
  type TheoryRefTable,
} from '../data/theoryReferenceTables'
import { youtubeThumbnailUrl, youtubeWatchUrl } from '../lib/youtubeEmbed'
import { useYoutubePlayer } from './YoutubeFloatingPlayer'

function matchesQuery(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q)
}

function TheoryVideoChip({ video }: { video: TenseTheoryYoutube & { label?: string } }) {
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

function TheoryRefTableCard({ table }: { table: TheoryRefTable }) {
  return (
    <section className="theory-card theory-ref-card" id={`theory-ref-${table.id}`}>
      <h3>{table.title}</h3>
      {table.note ? <p className="theory-ref-note">{table.note}</p> : null}
      <div className="theory-ref-wrap">
        <table className="theory-ref-table">
          <thead>
            <tr>
              {table.headers.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={`${table.id}-${ri}`}>
                {row.map((cell, ci) => (
                  <td key={`${table.id}-${ri}-${ci}`} className={ci === 0 ? 'theory-ref-key' : undefined}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function TenseTheoryPage() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const blocks = useMemo(() => {
    if (!q) return verbTenseTheoryBlocks
    return verbTenseTheoryBlocks.filter((b) =>
      matchesQuery([b.title, b.formula, b.usage, b.example, b.youtube.label ?? ''].join('\n'), q),
    )
  }, [q])

  const extras = useMemo(() => {
    if (!q) return verbTenseTheoryExtra
    return verbTenseTheoryExtra.filter((x) =>
      matchesQuery([x.title, x.body, x.youtube?.label ?? ''].join('\n'), q),
    )
  }, [q])

  const tables = useMemo(() => {
    if (!q) return theoryReferenceTables
    return theoryReferenceTables.filter((t) => matchesQuery(theoryTableSearchBlob(t), q))
  }, [q])

  const showFeatured =
    !q ||
    matchesQuery(
      [verbTenseTheoryFeaturedVideo.label, 'overview', 'all tenses'].join(' '),
      q,
    )

  const empty = !showFeatured && blocks.length === 0 && extras.length === 0 && tables.length === 0

  return (
    <div className="theory-page page">
      <header className="page-topbar">
        <span className="eyebrow">GRAMMAR REFERENCE</span>
        <span className="date-label">
          {verbTenseTheoryBlocks.length} tenses · {theoryReferenceTables.length} tables
        </span>
      </header>

      <section className="theory-hero">
        <div>
          <h1>
            Tense formulas<span className="accent-dot">.</span>
          </h1>
          <p>Quick reference — subjects, helpers, and verb tense formulas. Search anything.</p>
        </div>
        <div className="theory-hero-icon" aria-hidden>
          <GraduationCap size={28} strokeWidth={1.8} />
        </div>
      </section>

      <label className="theory-search">
        <Search size={18} strokeWidth={1.8} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search (e.g. subjects, present perfect, do/does…)"
          aria-label="Search grammar reference"
        />
      </label>

      {empty ? (
        <p className="theory-empty">No results for “{query.trim()}”.</p>
      ) : (
        <div className="theory-sections">
          {tables.length > 0 ? (
            <div className="theory-ref-block">
              <h2 className="theory-extras-title">Subjects &amp; essentials</h2>
              <div className="theory-ref-grid">
                {tables.map((t) => (
                  <TheoryRefTableCard key={t.id} table={t} />
                ))}
              </div>
            </div>
          ) : null}

          {showFeatured ? (
            <section className="theory-card theory-card-featured">
              <span className="eyebrow">OVERVIEW</span>
              <h2>All tenses</h2>
              <TheoryVideoChip video={verbTenseTheoryFeaturedVideo} />
            </section>
          ) : null}

          {blocks.map((b) => (
            <section key={b.id} className="theory-card" id={`theory-${b.id}`}>
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
              <TheoryVideoChip video={b.youtube} />
            </section>
          ))}

          {extras.length > 0 ? (
            <div className="theory-extras">
              <h2 className="theory-extras-title">More patterns</h2>
              {extras.map((x) => (
                <section key={x.title} className="theory-card theory-card-extra">
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
                  {x.youtube ? <TheoryVideoChip video={x.youtube} /> : null}
                </section>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
