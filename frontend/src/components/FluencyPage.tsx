import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AudioLines,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Sparkles,
} from 'lucide-react'
import {
  expandDrills,
  fluencyChunks,
  fluencyModes,
  shadowLines,
  speakDurations,
  speakPrompts,
  type FluencyModeId,
} from '../data/fluencyPractice'
import { HighlightedText, type SpeechWordRange } from './HighlightedText'
import { SpeakTextButton } from './SpeakTextButton'

function useCountdown(seconds: number, running: boolean, onDone: () => void) {
  const [left, setLeft] = useState(seconds)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    setLeft(seconds)
  }, [seconds])

  useEffect(() => {
    if (!running) return
    setLeft(seconds)
    const id = window.setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id)
          onDoneRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, seconds])

  return left
}

export function FluencyPage() {
  const [mode, setMode] = useState<FluencyModeId>('shadow')
  const [shadowIndex, setShadowIndex] = useState(0)
  const [speakIndex, setSpeakIndex] = useState(0)
  const [duration, setDuration] = useState<(typeof speakDurations)[number]>(45)
  const [timerOn, setTimerOn] = useState(false)
  const [chunkIndex, setChunkIndex] = useState(0)
  const [expandIndex, setExpandIndex] = useState(0)
  const [expandStep, setExpandStep] = useState(0)
  const [wordRange, setWordRange] = useState<SpeechWordRange | null>(null)
  const textRef = useRef<HTMLDivElement | null>(null)

  const shadow = shadowLines[shadowIndex]!
  const speak = speakPrompts[speakIndex]!
  const chunk = fluencyChunks[chunkIndex]!
  const expand = expandDrills[expandIndex]!
  const expandText = expand.steps[expandStep] ?? expand.steps[0]!

  const speakKey = useMemo(() => {
    if (mode === 'shadow') return `shadow:${shadow.id}`
    if (mode === 'chunks') return `chunk:${chunk.id}`
    if (mode === 'expand') return `expand:${expand.id}:${expandStep}`
    return `speak:${speak.id}`
  }, [mode, shadow.id, chunk.id, expand.id, expandStep, speak.id])

  useEffect(() => {
    setWordRange(null)
  }, [speakKey, mode])

  useEffect(() => {
    setTimerOn(false)
  }, [speakIndex, duration])

  const left = useCountdown(duration, timerOn, () => setTimerOn(false))

  const activeText =
    mode === 'shadow'
      ? shadow.text
      : mode === 'chunks'
        ? `${chunk.phrase} ${chunk.example}`
        : mode === 'expand'
          ? expandText
          : speak.starters.join(' ')

  const go = (dir: -1 | 1, length: number, index: number, setIndex: (n: number) => void) => {
    setIndex((index + dir + length) % length)
  }

  return (
    <div className="fluency-page page">
      <header className="page-topbar">
        <span className="eyebrow">SPEAKING FLOW</span>
        <span className="date-label">Shadow · timer · chunks</span>
      </header>

      <section className="topic-hero">
        <div>
          <h1>
            Fluency<span className="accent-dot">.</span>
          </h1>
          <p>
            Train continuous speech: shadow a model line, keep talking against a timer, and reuse
            ready-made chunks so you don’t freeze.
          </p>
        </div>
        <div className="topic-hero-icon" aria-hidden>
          <AudioLines size={28} strokeWidth={1.8} />
        </div>
      </section>

      <div className="fluency-modes" role="tablist" aria-label="Fluency mode">
        {fluencyModes.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={mode === m.id ? 'active' : ''}
            onClick={() => setMode(m.id)}
          >
            <strong>{m.label}</strong>
            <span>{m.caption}</span>
          </button>
        ))}
      </div>

      {mode === 'shadow' ? (
        <section className="fluency-card">
          <div className="fluency-card-top">
            <span className="fluency-tag">{shadow.topic}</span>
            <span className="fluency-progress">
              {shadowIndex + 1} / {shadowLines.length}
            </span>
          </div>
          <div className="fluency-script" ref={textRef}>
            <HighlightedText text={shadow.text} range={wordRange} />
          </div>
          <p className="fluency-tip">
            <Sparkles size={14} aria-hidden /> {shadow.tip}
          </p>
          <div className="fluency-actions">
            <SpeakTextButton
              text={shadow.text}
              resetSignal={speakKey}
              selectionScopeRef={textRef}
              onWordRangeChange={setWordRange}
            />
            <button
              type="button"
              className="button button-secondary"
              onClick={() => go(-1, shadowLines.length, shadowIndex, setShadowIndex)}
              aria-label="Previous line"
            >
              <ChevronLeft size={16} aria-hidden /> Prev
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => go(1, shadowLines.length, shadowIndex, setShadowIndex)}
            >
              Next <ChevronRight size={16} aria-hidden />
            </button>
          </div>
          <ol className="fluency-steps">
            <li>Press <strong>Read text</strong> and listen once.</li>
            <li>Play again and speak along (shadow) at the same time.</li>
            <li>Then say it alone — same rhythm, no pausing mid-chunk.</li>
          </ol>
        </section>
      ) : null}

      {mode === 'speak' ? (
        <section className="fluency-card">
          <div className="fluency-card-top">
            <span className="fluency-tag">{speak.title}</span>
            <span className="fluency-progress">
              {speakIndex + 1} / {speakPrompts.length}
            </span>
          </div>
          <h2 className="fluency-prompt">{speak.prompt}</h2>
          <div className="fluency-starters">
            <span>If you freeze, start with:</span>
            <ul>
              {speak.starters.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="fluency-timer-row">
            <div className="fluency-durations" role="group" aria-label="Duration">
              {speakDurations.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={duration === d ? 'active' : ''}
                  onClick={() => setDuration(d)}
                  disabled={timerOn}
                >
                  {d}s
                </button>
              ))}
            </div>
            <div className={`fluency-timer${timerOn ? ' is-live' : ''}${left === 0 && !timerOn ? ' is-done' : ''}`}>
              <Clock3 size={18} aria-hidden />
              <strong>{timerOn || left === 0 ? left : duration}s</strong>
            </div>
            <button
              type="button"
              className={`button ${timerOn ? 'button-secondary' : 'button-primary'}`}
              onClick={() => setTimerOn((v) => !v)}
            >
              {timerOn ? 'Stop' : left === 0 ? 'Restart' : 'Start talking'}
            </button>
          </div>
          <p className="fluency-tip">
            <Sparkles size={14} aria-hidden /> Goal: don’t stop. Use fillers like “let me think…” and add
            one example before time ends.
          </p>
          <div className="fluency-actions">
            <SpeakTextButton text={activeText} resetSignal={speakKey} onWordRangeChange={setWordRange} />
            <button
              type="button"
              className="button button-secondary"
              onClick={() => go(-1, speakPrompts.length, speakIndex, setSpeakIndex)}
            >
              <ChevronLeft size={16} aria-hidden /> Prev
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => go(1, speakPrompts.length, speakIndex, setSpeakIndex)}
            >
              Next <ChevronRight size={16} aria-hidden />
            </button>
          </div>
        </section>
      ) : null}

      {mode === 'chunks' ? (
        <section className="fluency-card">
          <div className="fluency-card-top">
            <span className="fluency-tag">Conversation glue</span>
            <span className="fluency-progress">
              {chunkIndex + 1} / {fluencyChunks.length}
            </span>
          </div>
          <h2 className="fluency-chunk-phrase">
            <HighlightedText
              text={chunk.phrase}
              range={wordRange && wordRange.start < chunk.phrase.length ? wordRange : null}
            />
          </h2>
          <p className="fluency-chunk-use">{chunk.use}</p>
          <div className="fluency-script" ref={textRef}>
            <HighlightedText text={chunk.example} range={wordRange} />
          </div>
          <div className="fluency-actions">
            <SpeakTextButton
              text={`${chunk.phrase} ${chunk.example}`}
              resetSignal={speakKey}
              selectionScopeRef={textRef}
              onWordRangeChange={setWordRange}
            />
            <button
              type="button"
              className="button button-secondary"
              onClick={() => go(-1, fluencyChunks.length, chunkIndex, setChunkIndex)}
            >
              <ChevronLeft size={16} aria-hidden /> Prev
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => go(1, fluencyChunks.length, chunkIndex, setChunkIndex)}
            >
              Next <ChevronRight size={16} aria-hidden />
            </button>
          </div>
          <p className="fluency-tip">
            <Sparkles size={14} aria-hidden /> Say the phrase 3 times, then invent your own example out
            loud.
          </p>
          <div className="fluency-chunk-grid">
            {fluencyChunks.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={`fluency-chunk-pill${i === chunkIndex ? ' active' : ''}`}
                onClick={() => setChunkIndex(i)}
              >
                {c.phrase.replace(/…$/, '')}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {mode === 'expand' ? (
        <section className="fluency-card">
          <div className="fluency-card-top">
            <span className="fluency-tag">
              Step {expandStep + 1} / {expand.steps.length}
            </span>
            <span className="fluency-progress">
              Drill {expandIndex + 1} / {expandDrills.length}
            </span>
          </div>
          <div className="fluency-script fluency-expand-script" ref={textRef}>
            <HighlightedText text={expandText} range={wordRange} />
          </div>
          <div className="fluency-expand-track" aria-hidden>
            {expand.steps.map((_, i) => (
              <span key={i} className={i <= expandStep ? 'on' : ''} />
            ))}
          </div>
          <div className="fluency-actions">
            <SpeakTextButton
              text={expandText}
              resetSignal={speakKey}
              selectionScopeRef={textRef}
              onWordRangeChange={setWordRange}
            />
            <button
              type="button"
              className="button button-secondary"
              disabled={expandStep === 0}
              onClick={() => setExpandStep((s) => Math.max(0, s - 1))}
            >
              Shorter
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                if (expandStep < expand.steps.length - 1) setExpandStep((s) => s + 1)
                else {
                  setExpandIndex((i) => (i + 1) % expandDrills.length)
                  setExpandStep(0)
                }
              }}
            >
              {expandStep < expand.steps.length - 1 ? (
                <>
                  Longer <ChevronRight size={16} aria-hidden />
                </>
              ) : (
                <>
                  Next drill <ChevronRight size={16} aria-hidden />
                </>
              )}
            </button>
          </div>
          <p className="fluency-tip">
            <Sparkles size={14} aria-hidden /> Say each step aloud before expanding. Fluency grows when
            you add detail without stopping.
          </p>
        </section>
      ) : null}

      {timerOn ? (
        <div className="fluency-live-hint" role="status">
          <Loader2 className="vocab-spin" size={14} aria-hidden /> Keep talking — don’t aim for perfect
          grammar.
        </div>
      ) : null}
    </div>
  )
}
