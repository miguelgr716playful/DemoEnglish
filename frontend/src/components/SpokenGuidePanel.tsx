import { useEffect, useMemo, useRef, useState } from 'react'
import { Square, Volume2 } from 'lucide-react'
import {
  parseStoredRate,
  resolveVoiceForPlayback,
  supportsSpeechSynthesis,
  TTS_SETTINGS_CHANGED_EVENT,
} from '../lib/ttsSettings'
import { HighlightedText, speechWordEnd, type SpeechWordRange } from './HighlightedText'

function nextChunk(text: string, start: number, max = 280): { start: number; end: number } {
  const limit = Math.min(start + max, text.length)
  if (limit >= text.length) return { start, end: text.length }
  const windowText = text.slice(start, limit)
  let cut = -1
  for (let i = windowText.length - 1; i >= 40; i -= 1) {
    const ch = windowText[i]
    if (ch === '.' || ch === '!' || ch === '?') {
      cut = i
      break
    }
  }
  return { start, end: cut >= 40 ? start + cut + 1 : limit }
}

type SpokenGuidePanelProps = {
  title: string
  text: string
}

export function SpokenGuidePanel({ title, text }: SpokenGuidePanelProps) {
  const supported = useMemo(() => supportsSpeechSynthesis(), [])
  const [speaking, setSpeaking] = useState(false)
  const [wordRange, setWordRange] = useState<SpeechWordRange | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const generation = useRef(0)

  const stop = () => {
    generation.current += 1
    if (supportsSpeechSynthesis()) window.speechSynthesis.cancel()
    setSpeaking(false)
    setWordRange(null)
  }

  useEffect(() => {
    if (!supported) return
    const onSettings = () => stop()
    window.addEventListener(TTS_SETTINGS_CHANGED_EVENT, onSettings)
    return () => {
      window.removeEventListener(TTS_SETTINGS_CHANGED_EVENT, onSettings)
      generation.current += 1
      window.speechSynthesis.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stop is stable enough for unmount/settings
  }, [supported])

  useEffect(() => {
    const box = bodyRef.current
    const mark = box?.querySelector('.tts-word-highlight')
    if (!box || !mark) return
    const markRect = mark.getBoundingClientRect()
    const boxRect = box.getBoundingClientRect()
    if (markRect.top < boxRect.top) box.scrollTop -= boxRect.top - markRect.top
    else if (markRect.bottom > boxRect.bottom) box.scrollTop += markRect.bottom - boxRect.bottom
  }, [wordRange])

  const speakFrom = (startIndex: number, token: number) => {
    if (generation.current !== token || startIndex >= text.length) {
      if (generation.current === token) {
        setSpeaking(false)
        setWordRange(null)
      }
      return
    }
    const chunk = nextChunk(text, startIndex)
    const slice = text.slice(chunk.start, chunk.end)
    if (!slice.trim()) {
      speakFrom(chunk.end, token)
      return
    }
    const voice = resolveVoiceForPlayback()
    const utterance = new SpeechSynthesisUtterance(slice)
    if (voice) utterance.voice = voice
    utterance.lang = voice?.lang ?? 'en-US'
    utterance.rate = parseStoredRate()
    utterance.pitch = 1
    utterance.onboundary = (event) => {
      if (generation.current !== token || event.name !== 'word') return
      const localStart = event.charIndex
      const reported = (event as SpeechSynthesisEvent & { charLength?: number }).charLength
      const localEnd =
        typeof reported === 'number' && reported > 0 ? localStart + reported : speechWordEnd(slice, localStart)
      setWordRange({ start: chunk.start + localStart, end: chunk.start + localEnd })
    }
    utterance.onend = () => {
      if (generation.current !== token) return
      speakFrom(chunk.end, token)
    }
    utterance.onerror = () => {
      if (generation.current !== token) return
      setSpeaking(false)
      setWordRange(null)
    }
    window.speechSynthesis.speak(utterance)
  }

  return (
    <section className="school-panel topic-guide" id="topic-how-to" aria-labelledby="topic-how-to-title">
      <div className="school-panel-row">
        <div>
          <h2 id="topic-how-to-title">{title}</h2>
          <p className="topic-guide-note">Scroll inside this box to read it. Press Read aloud and follow along.</p>
        </div>
        {supported ? (
          <button
            type="button"
            className={`topic-guide-speak${speaking ? ' is-on' : ''}`}
            aria-pressed={speaking}
            onClick={() => {
              if (speaking) {
                stop()
                return
              }
              const token = generation.current + 1
              generation.current = token
              window.speechSynthesis.cancel()
              setWordRange(null)
              setSpeaking(true)
              speakFrom(0, token)
            }}
          >
            {speaking ? <Square size={14} fill="currentColor" aria-hidden /> : <Volume2 size={14} aria-hidden />}
            {speaking ? 'Stop' : 'Read aloud'}
          </button>
        ) : null}
      </div>
      <div className="topic-guide-body" ref={bodyRef}>
        <HighlightedText className="topic-guide-text" text={text} range={wordRange} />
      </div>
    </section>
  )
}
