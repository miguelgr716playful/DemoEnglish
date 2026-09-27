import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, GripHorizontal, X } from 'lucide-react'
import { youtubeEmbedUrl, youtubeWatchUrl } from '../lib/youtubeEmbed'

export type YoutubePlayerTarget = {
  videoId: string
  title: string
}

type YoutubePlayerContextValue = {
  openPlayer: (target: YoutubePlayerTarget) => void
  closePlayer: () => void
  active: YoutubePlayerTarget | null
}

const YoutubePlayerContext = createContext<YoutubePlayerContextValue | null>(null)

const ASPECT = 16 / 9
const MIN_W = 280
const PAD = 16

function clampPlayerSize(preferredW: number, vw: number, vh: number) {
  const maxW = Math.max(MIN_W, vw - PAD * 2)
  const maxH = Math.max(MIN_W / ASPECT, vh - PAD * 2 - 48)
  let w = Math.min(preferredW, maxW)
  let h = w / ASPECT
  if (h > maxH) {
    h = maxH
    w = h * ASPECT
  }
  if (w < MIN_W) {
    w = Math.min(MIN_W, maxW)
    h = w / ASPECT
  }
  return { w: Math.round(w), h: Math.round(h) }
}

function defaultPlacement(vw: number, vh: number) {
  const preferred = Math.min(720, vw * 0.55)
  const { w, h } = clampPlayerSize(preferred, vw, vh)
  return {
    x: Math.round(Math.max(PAD, vw - w - PAD)),
    y: Math.round(Math.max(PAD, vh - h - 64)),
    w,
    h,
  }
}

function YoutubeFloatingPlayerSurface({
  target,
  onClose,
}: {
  target: YoutubePlayerTarget
  onClose: () => void
}) {
  const shellRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ ox: number; oy: number; x: number; y: number } | null>(null)
  const resizeRef = useRef<{ ox: number; ow: number; oh: number } | null>(null)
  const [box, setBox] = useState(() =>
    typeof window !== 'undefined'
      ? defaultPlacement(window.innerWidth, window.innerHeight)
      : { x: 40, y: 40, w: 640, h: 360 },
  )
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const fit = () => {
      setBox((prev) => {
        const { w, h } = clampPlayerSize(prev.w, window.innerWidth, window.innerHeight)
        const maxX = Math.max(PAD, window.innerWidth - w - PAD)
        const maxY = Math.max(PAD, window.innerHeight - h - 48)
        return {
          w,
          h,
          x: Math.min(Math.max(PAD, prev.x), maxX),
          y: Math.min(Math.max(PAD, prev.y), maxY),
        }
      })
    }
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragRef.current) {
        const d = dragRef.current
        const nx = d.x + (e.clientX - d.ox)
        const ny = d.y + (e.clientY - d.oy)
        const maxX = Math.max(PAD, window.innerWidth - box.w - PAD)
        const maxY = Math.max(PAD, window.innerHeight - box.h - 48)
        setBox((prev) => ({
          ...prev,
          x: Math.min(Math.max(PAD, nx), maxX),
          y: Math.min(Math.max(PAD, ny), maxY),
        }))
      } else if (resizeRef.current) {
        const r = resizeRef.current
        const dw = e.clientX - r.ox
        const preferred = r.ow + dw
        const { w, h } = clampPlayerSize(preferred, window.innerWidth, window.innerHeight)
        setBox((prev) => {
          const maxX = Math.max(PAD, window.innerWidth - w - PAD)
          const maxY = Math.max(PAD, window.innerHeight - h - 48)
          return {
            w,
            h,
            x: Math.min(prev.x, maxX),
            y: Math.min(prev.y, maxY),
          }
        })
      }
    }
    const onUp = () => {
      dragRef.current = null
      resizeRef.current = null
      setDragging(false)
      setResizing(false)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [box.w, box.h])

  const embedSrc = useMemo(
    () => `${youtubeEmbedUrl(target.videoId)}&autoplay=1`,
    [target.videoId],
  )

  return createPortal(
    <div
      ref={shellRef}
      className={`yt-float${dragging || resizing ? ' is-busy' : ''}`}
      style={{
        left: box.x,
        top: box.y,
        width: box.w,
      }}
      role="dialog"
      aria-label={`Playing: ${target.title}`}
    >
      <header
        className="yt-float-bar"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button, a')) return
          dragRef.current = { ox: e.clientX, oy: e.clientY, x: box.x, y: box.y }
          setDragging(true)
          ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
        }}
      >
        <GripHorizontal size={16} strokeWidth={2} aria-hidden className="yt-float-grip" />
        <p className="yt-float-title">{target.title}</p>
        <a
          href={youtubeWatchUrl(target.videoId)}
          target="_blank"
          rel="noopener noreferrer"
          className="yt-float-link"
          title="Open on YouTube"
        >
          <ExternalLink size={14} strokeWidth={2} aria-hidden />
        </a>
        <button type="button" className="yt-float-close" onClick={onClose} aria-label="Close player">
          <X size={16} strokeWidth={2} aria-hidden />
        </button>
      </header>
      <div className="yt-float-stage" style={{ height: box.h }}>
        <iframe
          className="yt-float-iframe"
          src={embedSrc}
          title={target.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <button
        type="button"
        className="yt-float-resize"
        aria-label="Resize player"
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          resizeRef.current = { ox: e.clientX, ow: box.w, oh: box.h }
          setResizing(true)
        }}
      />
    </div>,
    document.body,
  )
}

export function YoutubePlayerProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<YoutubePlayerTarget | null>(null)
  const openPlayer = useCallback((target: YoutubePlayerTarget) => {
    setActive(target)
  }, [])
  const closePlayer = useCallback(() => setActive(null), [])
  const value = useMemo(
    () => ({ openPlayer, closePlayer, active }),
    [openPlayer, closePlayer, active],
  )

  return (
    <YoutubePlayerContext.Provider value={value}>
      {children}
      {active ? <YoutubeFloatingPlayerSurface target={active} onClose={closePlayer} /> : null}
    </YoutubePlayerContext.Provider>
  )
}

export function useYoutubePlayer() {
  const ctx = useContext(YoutubePlayerContext)
  if (!ctx) {
    throw new Error('useYoutubePlayer must be used within YoutubePlayerProvider')
  }
  return ctx
}
