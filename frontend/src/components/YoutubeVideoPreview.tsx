import { ExternalLink, Play } from 'lucide-react'
import { youtubeThumbnailUrl, youtubeWatchUrl } from '../lib/youtubeEmbed'
import { useYoutubePlayer } from './YoutubeFloatingPlayer'

type YoutubeVideoPreviewProps = {
  videoId: string
  title: string
  hint?: string
  category?: string
  className?: string
}

/** YouTube-style card: thumbnail opens the floating adaptive player. */
export function YoutubeVideoPreview({
  videoId,
  title,
  hint,
  category,
  className = '',
}: YoutubeVideoPreviewProps) {
  const { openPlayer, active } = useYoutubePlayer()
  const isActive = active?.videoId === videoId

  return (
    <article className={`yt-preview${isActive ? ' is-playing' : ''} ${className}`.trim()}>
      <div className="yt-preview-media">
        <button
          type="button"
          className="yt-preview-thumb"
          onClick={() => openPlayer({ videoId, title })}
          aria-label={`Play: ${title}`}
          aria-pressed={isActive}
        >
          <img src={youtubeThumbnailUrl(videoId)} alt="" loading="lazy" decoding="async" />
          <span className="yt-preview-play" aria-hidden>
            <Play size={20} strokeWidth={2} fill="currentColor" />
          </span>
        </button>
      </div>
      <div className="yt-preview-meta">
        <button type="button" className="yt-preview-title" onClick={() => openPlayer({ videoId, title })}>
          {title}
        </button>
        {category ? <span className="yt-preview-channel">{category}</span> : null}
        {hint ? <small>{hint}</small> : null}
        <a href={youtubeWatchUrl(videoId)} target="_blank" rel="noopener noreferrer" className="yt-preview-open">
          Open on YouTube
          <ExternalLink size={12} strokeWidth={2} aria-hidden />
        </a>
      </div>
    </article>
  )
}
