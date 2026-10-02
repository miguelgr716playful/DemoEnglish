import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Search, Volume2, Square, type LucideIcon } from 'lucide-react'
import {
  parseStoredRate,
  resolveVoiceForPlayback,
  supportsSpeechSynthesis,
  TTS_SETTINGS_CHANGED_EVENT,
} from '../lib/ttsSettings'
import {
  topicPhraseBlob,
  topicTableBlob,
  type TopicPhrase,
  type TopicTable,
} from '../data/weatherEnglish'
import { ContentsIndex } from './ContentsIndex'
import { SpokenGuidePanel } from './SpokenGuidePanel'

function matchesQuery(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q)
}

function SpeakPhraseButton({ text }: { text: string }) {
  const supported = useMemo(() => supportsSpeechSynthesis(), [])
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (!supported) return
    const onSettings = () => {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
    window.addEventListener(TTS_SETTINGS_CHANGED_EVENT, onSettings)
    return () => {
      window.removeEventListener(TTS_SETTINGS_CHANGED_EVENT, onSettings)
      window.speechSynthesis.cancel()
    }
  }, [supported])

  if (!supported) return null

  return (
    <button
      type="button"
      className={`topic-speak${speaking ? ' is-on' : ''}`}
      aria-label={speaking ? 'Stop' : 'Listen'}
      onClick={() => {
        if (speaking) {
          window.speechSynthesis.cancel()
          setSpeaking(false)
          return
        }
        const voice = resolveVoiceForPlayback()
        const utterance = new SpeechSynthesisUtterance(text)
        if (voice) utterance.voice = voice
        utterance.lang = voice?.lang ?? 'en-US'
        utterance.rate = parseStoredRate()
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
        setSpeaking(true)
      }}
    >
      {speaking ? <Square size={14} fill="currentColor" aria-hidden /> : <Volume2 size={14} aria-hidden />}
    </button>
  )
}

type TopicLearningPageProps = {
  eyebrow: string
  title: string
  subtitle: string
  Icon: LucideIcon
  tables: TopicTable[]
  phrases: TopicPhrase[]
  searchPlaceholder: string
  heroImage?: string
  heroImageAlt?: string
  spokenGuide?: string
  extra?: ReactNode
}

export function TopicLearningPage({
  eyebrow,
  title,
  subtitle,
  Icon,
  tables,
  phrases,
  searchPlaceholder,
  heroImage,
  heroImageAlt = '',
  spokenGuide,
  extra,
}: TopicLearningPageProps) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const visibleTables = useMemo(() => {
    if (!q) return tables
    return tables.filter((t) => matchesQuery(topicTableBlob(t), q))
  }, [q, tables])

  const visiblePhrases = useMemo(() => {
    if (!q) return phrases
    return phrases.filter((p) => matchesQuery(topicPhraseBlob(p), q))
  }, [q, phrases])

  const guideVisible = Boolean(spokenGuide && (!q || spokenGuide.toLowerCase().includes(q)))
  const empty = !guideVisible && visibleTables.length === 0 && visiblePhrases.length === 0

  return (
    <div className="topic-page page">
      <header className="page-topbar">
        <span className="eyebrow">{eyebrow}</span>
        <span className="date-label">
          {tables.length} tables · {phrases.length} phrases
        </span>
      </header>

      <section className="topic-hero">
        <div>
          <h1>
            {title}
            <span className="accent-dot">.</span>
          </h1>
          <p>{subtitle}</p>
        </div>
        <div className="topic-hero-icon" aria-hidden>
          <Icon size={28} strokeWidth={1.8} />
        </div>
      </section>

      {heroImage ? (
        <figure className="topic-hero-media">
          <img src={heroImage} alt={heroImageAlt} loading="eager" decoding="async" />
        </figure>
      ) : null}

      <label className="topic-search">
        <Search size={18} strokeWidth={1.8} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search this topic"
        />
      </label>

      {extra}

      {guideVisible && spokenGuide ? (
        <SpokenGuidePanel title={`How to use ${title}`} text={spokenGuide} />
      ) : null}

      {empty ? (
        <p className="topic-empty">No results for “{query.trim()}”.</p>
      ) : (
        <div className="topic-sections">
          {visibleTables.length > 0 ? (
            <div className="theory-ref-block">
              <ContentsIndex
                title="Tables index"
                items={visibleTables.map((t) => ({ id: `topic-table-${t.id}`, label: t.title }))}
              />
              <h2 className="theory-extras-title">Vocabulary</h2>
              <div className="theory-ref-grid">
                {visibleTables.map((table) => (
                  <section key={table.id} id={`topic-table-${table.id}`} className="theory-card theory-ref-card">
                    {table.image ? (
                      <div className="topic-card-media">
                        <img src={table.image} alt={table.imageAlt ?? ''} loading="lazy" decoding="async" />
                      </div>
                    ) : null}
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
                ))}
              </div>
            </div>
          ) : null}

          {visiblePhrases.length > 0 ? (
            <div className="topic-phrases-block" id="topic-phrases">
              <h2 className="theory-extras-title">Useful phrases</h2>
              <ul className="topic-phrases">
                {visiblePhrases.map((p) => (
                  <li key={p.id} className="topic-phrase">
                    <div className="topic-phrase-text">
                      <strong>{p.en}</strong>
                      {p.tip ? <small>{p.tip}</small> : null}
                    </div>
                    <SpeakPhraseButton text={p.en} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
