import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Check,
  Images,
  Lightbulb,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react'
import {
  getVocabCategory,
  vocabCategories,
  type VocabCategoryId,
  type VocabWord,
} from '../data/vocabImageWords'
import { fetchVocabImage, type VocabImageResult } from '../lib/fetchVocabImage'
import { SpeakTextButton } from './SpeakTextButton'

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function useVocabImage(word: VocabWord | null) {
  const [data, setData] = useState<VocabImageResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!word) {
      setData(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetchVocabImage(word.word, word.wikiTitle)
      .then((result) => {
        if (cancelled) return
        setData(result)
        if (!result) setError('No image found for this word.')
      })
      .catch(() => {
        if (cancelled) return
        setData(null)
        setError('Could not load image.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [word?.word, word?.wikiTitle])

  return { data, loading, error }
}

function VocabImageFrame({
  word,
  loading,
  data,
  error,
  blurred,
}: {
  word: VocabWord
  loading: boolean
  data: VocabImageResult | null
  error: string | null
  blurred?: boolean
}) {
  return (
    <div className={`vocab-image-frame${blurred ? ' is-blurred' : ''}`}>
      {loading ? (
        <div className="vocab-image-status">
          <Loader2 className="vocab-spin" size={22} aria-hidden />
          <span>Loading image…</span>
        </div>
      ) : data ? (
        <>
          <img src={data.imageUrl} alt={blurred ? '' : word.word} loading="lazy" decoding="async" />
          {data.credit ? (
            <a
              className="vocab-image-credit"
              href={data.credit.startsWith('http') ? data.credit : undefined}
              target="_blank"
              rel="noopener noreferrer"
              title={data.credit}
            >
              {data.source === 'wikipedia' ? 'Wikipedia' : 'Openverse'}
            </a>
          ) : null}
        </>
      ) : (
        <div className="vocab-image-status">
          <span>{error ?? 'No image'}</span>
        </div>
      )}
    </div>
  )
}

type Mode = 'browse' | 'quiz'

type VocabularyPracticePageProps = {
  onBack: () => void
}

export function VocabularyPracticePage({ onBack }: VocabularyPracticePageProps) {
  const [categoryId, setCategoryId] = useState<VocabCategoryId>(vocabCategories[0]!.id)
  const [mode, setMode] = useState<Mode>('browse')
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const [deck, setDeck] = useState<VocabWord[]>([])

  const category = getVocabCategory(categoryId) ?? vocabCategories[0]!

  useEffect(() => {
    setDeck(shuffle(category.words))
    setIndex(0)
    setRevealed(false)
    setPicked(null)
    setScore({ right: 0, total: 0 })
  }, [categoryId, mode, category.words])

  const current = deck[index % Math.max(deck.length, 1)] ?? null
  const { data, loading, error } = useVocabImage(current)
  const extractRef = useRef<HTMLParagraphElement | null>(null)
  const speakText = [current?.word, data?.extract].filter(Boolean).join('. ')
  const speakKey = `${current?.word ?? ''}:${index}:${revealed ? 'on' : 'off'}`

  const choices = useMemo(() => {
    if (!current || mode !== 'quiz') return []
    const others = shuffle(category.words.filter((w) => w.word !== current.word)).slice(0, 3)
    return shuffle([current, ...others]).map((w) => w.word)
  }, [current?.word, mode, category.words, index])

  const goNext = () => {
    setRevealed(false)
    setPicked(null)
    setIndex((i) => i + 1)
  }

  const onPick = (option: string) => {
    if (!current || picked) return
    const ok = option === current.word
    setPicked(option)
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }))
    setRevealed(true)
  }

  return (
    <div className="vocab-page page">
      <div className="topics-back-bar" style={{ paddingLeft: 0, marginBottom: 12 }}>
        <button type="button" className="topics-back" onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          Topics
        </button>
      </div>

      <header className="page-topbar">
        <span className="eyebrow">IMAGE VOCABULARY</span>
        <span className="date-label">Wikipedia · Openverse</span>
      </header>

      <section className="topic-hero">
        <div>
          <h1>
            Vocabulary<span className="accent-dot">.</span>
          </h1>
          <p>Learn words with public photos, then practice with a quiz.</p>
        </div>
        <div className="topic-hero-icon" aria-hidden>
          <Images size={28} strokeWidth={1.8} />
        </div>
      </section>

      <div className="vocab-toolbar">
        <label className="vocab-select-wrap">
          <span>Category</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value as VocabCategoryId)}
            aria-label="Vocabulary category"
          >
            {vocabCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <div className="vocab-mode" role="tablist" aria-label="Mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'browse'}
            className={mode === 'browse' ? 'active' : ''}
            onClick={() => setMode('browse')}
          >
            Study
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'quiz'}
            className={mode === 'quiz' ? 'active' : ''}
            onClick={() => setMode('quiz')}
          >
            Practice
          </button>
        </div>
      </div>

      {!current ? (
        <p className="theory-empty">No words in this category.</p>
      ) : (
        <div className="vocab-stage">
          <VocabImageFrame
            word={current}
            loading={loading}
            data={data}
            error={error}
            blurred={mode === 'quiz' && !revealed}
          />

          {mode === 'browse' ? (
            <div className="vocab-browse-meta">
              <h2>{revealed ? current.word : '???'} </h2>
              {current.hint ? (
                <p className="vocab-hint">
                  <Lightbulb size={14} aria-hidden /> {current.hint}
                </p>
              ) : null}
              {revealed && data?.extract ? (
                <p className="vocab-extract" ref={extractRef}>
                  {data.extract}
                </p>
              ) : null}
              {revealed ? (
                <div className="vocab-speak">
                  <SpeakTextButton
                    text={speakText || current.word}
                    resetSignal={speakKey}
                    selectionScopeRef={extractRef}
                  />
                </div>
              ) : null}
              <div className="vocab-actions">
                {!revealed ? (
                  <button type="button" className="button button-primary" onClick={() => setRevealed(true)}>
                    Reveal word
                  </button>
                ) : (
                  <button type="button" className="button button-secondary" onClick={goNext}>
                    Next <RefreshCw size={14} aria-hidden />
                  </button>
                )}
              </div>
              <p className="vocab-progress">
                Card {(index % deck.length) + 1} / {deck.length}
              </p>
            </div>
          ) : (
            <div className="vocab-quiz-meta">
              <div className="vocab-score">
                Score {score.right}/{score.total}
                {score.total > 0 ? ` · ${Math.round((score.right / score.total) * 100)}%` : ''}
              </div>
              <p className="vocab-quiz-prompt">What is this?</p>
              {current.hint && !revealed ? (
                <p className="vocab-hint">
                  <Lightbulb size={14} aria-hidden /> {current.hint}
                </p>
              ) : null}
              <div className="vocab-choices">
                {choices.map((option) => {
                  const isCorrect = option === current.word
                  const show = Boolean(picked)
                  let cls = 'vocab-choice'
                  if (show && isCorrect) cls += ' is-correct'
                  if (show && picked === option && !isCorrect) cls += ' is-wrong'
                  return (
                    <button
                      key={option}
                      type="button"
                      className={cls}
                      disabled={Boolean(picked)}
                      onClick={() => onPick(option)}
                    >
                      {show && isCorrect ? <Check size={16} aria-hidden /> : null}
                      {show && picked === option && !isCorrect ? <X size={16} aria-hidden /> : null}
                      {option}
                    </button>
                  )
                })}
              </div>
              {picked ? (
                <div className="vocab-actions">
                  <button type="button" className="button button-primary" onClick={goNext}>
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
