import { useMemo, useState } from 'react'
import { Clapperboard } from 'lucide-react'
import {
  countLibraryVideos,
  videoLibraryCategories,
  type VideoLibraryCategory,
} from '../data/videoLibrary'
import { YoutubeVideoPreview } from './YoutubeVideoPreview'

const ALL_ID = 'all'

export function VideosPage() {
  const categories = videoLibraryCategories
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? ALL_ID)
  const total = useMemo(() => countLibraryVideos(categories), [categories])

  const visible: VideoLibraryCategory[] =
    activeId === ALL_ID ? categories : categories.filter((c) => c.id === activeId)

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
            Videos by category<span className="accent-dot">.</span>
          </h1>
          <p>Curated YouTube lessons for tech English — preview here or open on YouTube.</p>
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

      <div className="videos-sections">
        {visible.map((topic) => (
          <section key={topic.id} className="videos-section" id={`videos-${topic.id}`}>
            <div className="videos-section-head">
              <span className="eyebrow">{topic.id.replace(/-/g, ' ').toUpperCase()}</span>
              <h2>{topic.heading}</h2>
              <p>{topic.description}</p>
            </div>
            <ul className="videos-grid">
              {topic.picks.map((pick) => (
                <li key={`${topic.id}-${pick.videoId}`}>
                  <YoutubeVideoPreview
                    videoId={pick.videoId}
                    title={pick.title}
                    hint={pick.hint}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
