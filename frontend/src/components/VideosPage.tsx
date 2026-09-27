import { useMemo, useState } from 'react'
import { Clapperboard } from 'lucide-react'
import {
  countLibraryVideos,
  videoLibraryCategories,
  type VideoLibraryPick,
} from '../data/videoLibrary'
import { YoutubeVideoPreview } from './YoutubeVideoPreview'

const ALL_ID = 'all'

type FlatPick = VideoLibraryPick & { categoryId: string; categoryHeading: string }

export function VideosPage() {
  const categories = videoLibraryCategories
  const [activeId, setActiveId] = useState<string>(ALL_ID)
  const total = useMemo(() => countLibraryVideos(categories), [categories])

  const flatPicks = useMemo(() => {
    const seen = new Set<string>()
    const out: FlatPick[] = []
    const source =
      activeId === ALL_ID ? categories : categories.filter((c) => c.id === activeId)

    for (const cat of source) {
      for (const pick of cat.picks) {
        if (seen.has(pick.videoId)) continue
        seen.add(pick.videoId)
        out.push({
          ...pick,
          categoryId: cat.id,
          categoryHeading: cat.heading,
        })
      }
    }
    return out
  }, [activeId, categories])

  const sectionLabel =
    activeId === ALL_ID
      ? 'All videos'
      : (categories.find((c) => c.id === activeId)?.heading ?? 'Videos')

  return (
    <div className="videos-page page">
      <header className="page-topbar">
        <span className="eyebrow">LEARNING LIBRARY</span>
        <span className="date-label">
          {total} videos · {categories.length} categories
        </span>
      </header>

      <section className="videos-hero">
        <div>
          <h1>
            Videos<span className="accent-dot">.</span>
          </h1>
          <p>Browse like YouTube — tap a thumbnail to preview, or open the lesson on YouTube.</p>
        </div>
        <div className="videos-hero-icon" aria-hidden>
          <Clapperboard size={28} strokeWidth={1.8} />
        </div>
      </section>

      <nav className="videos-cats" aria-label="Video categories">
        <button
          type="button"
          className={activeId === ALL_ID ? 'active' : ''}
          onClick={() => setActiveId(ALL_ID)}
        >
          All
          <span className="videos-cat-count">{total}</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={activeId === cat.id ? 'active' : ''}
            onClick={() => setActiveId(cat.id)}
          >
            {cat.heading}
            <span className="videos-cat-count">{cat.picks.length}</span>
          </button>
        ))}
      </nav>

      <div className="videos-feed-head">
        <h2>{sectionLabel}</h2>
        <span>
          {flatPicks.length} {flatPicks.length === 1 ? 'video' : 'videos'}
        </span>
      </div>

      <ul className="videos-grid">
        {flatPicks.map((pick) => (
          <li key={`${pick.categoryId}-${pick.videoId}`}>
            <YoutubeVideoPreview
              videoId={pick.videoId}
              title={pick.title}
              hint={pick.hint}
              category={activeId === ALL_ID ? pick.categoryHeading : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
