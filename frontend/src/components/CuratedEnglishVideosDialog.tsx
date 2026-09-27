import { useEffect } from 'react'
import { ChevronDown, ListVideo, X } from 'lucide-react'
import { curatedEnglishVideoTopics } from '../data/curatedEnglishVideos'
import { YoutubeVideoPreview } from './YoutubeVideoPreview'

type CuratedEnglishVideosDialogProps = {
  open: boolean
  onClose: () => void
}

export function CuratedEnglishVideosDialog({ open, onClose }: CuratedEnglishVideosDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]"
        aria-label="Close video picks"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="curated-videos-dialog-title"
        className="relative z-[101] flex max-h-[min(90dvh,52rem)] w-full max-w-2xl flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <ListVideo className="size-5" aria-hidden />
            </span>
            <div>
              <h2
                id="curated-videos-dialog-title"
                className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
              >
                English video picks
              </h2>
              <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Curated YouTube lessons — preview in the app or open on YouTube.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {curatedEnglishVideoTopics.map((topic) => (
            <details
              key={topic.id}
              className="group rounded-xl border border-slate-200 bg-slate-50/90 dark:border-slate-700 dark:bg-slate-950/60"
            >
              <summary className="flex cursor-pointer list-none items-start gap-2 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
                <ChevronDown
                  className="mt-0.5 size-4 shrink-0 text-slate-400 transition group-open:rotate-180 dark:text-slate-500"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{topic.heading}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">{topic.description}</p>
                </div>
              </summary>
              <ul className="grid gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-700 sm:grid-cols-2">
                {topic.picks.map((pick) => (
                  <li key={`${topic.id}-${pick.videoId}`}>
                    <YoutubeVideoPreview videoId={pick.videoId} title={pick.title} hint={pick.hint} />
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CuratedVideosMenuButton({ onClick, open }: { onClick: () => void; open: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      <ListVideo className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
      Learning videos
    </button>
  )
}
