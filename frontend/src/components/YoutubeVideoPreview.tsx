import { useState } from 'react'
import { ExternalLink, Play } from 'lucide-react'
import { youtubeEmbedUrl, youtubeThumbnailUrl, youtubeWatchUrl } from '../lib/youtubeEmbed'

type YoutubeVideoPreviewProps = {
  videoId: string
  title: string
  hint?: string
  category?: string
  className?: string
}

/** YouTube-style card: thumbnail grid cell, click to play embed. */
export function YoutubeVideoPreview({
  videoId,
  title,
  hint,
  category,
  className = '',
}: YoutubeVideoPreviewProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <article className={`yt-preview ${className}`.trim()}>
      <div className="yt-preview-media">
        {playing ? (
          <iframe
            className="yt-preview-iframe"
            src={`${youtubeEmbedUrl(videoId)}&autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            className="yt-preview-thumb"
            onClick={() => setPlaying(true)}
            aria-label={`Play preview: ${title}`}
          >
            <img src={youtubeThumbnailUrl(videoId)} alt="" loading="lazy" decoding="async" />
            <span className="yt-preview-play" aria-hidden>
              <Play size={20} strokeWidth={2} fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <div className="yt-preview-meta">
        <a
          href={youtubeWatchUrl(videoId)}
          target="_blank"
          rel="noopener noreferrer"
          className="yt-preview-title"
        >
          {title}
        </a>
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
