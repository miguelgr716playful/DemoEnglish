import { useEffect, useMemo, useState } from 'react'
import { CheckSquare, ListTree, Search, Square, Volume2 } from 'lucide-react'
import { commonVerbsPrincipalParts, type CommonVerbRow } from '../data/commonVerbsEnglish'
import { irregularVerbsEnglish, type IrregularVerbRow } from '../data/irregularVerbsEnglish'
import { techExampleForVerb } from '../data/verbTechExamples'
import {
  parseStoredRate,
  resolveVoiceForPlayback,
  supportsSpeechSynthesis,
  TTS_SETTINGS_CHANGED_EVENT,
} from '../lib/ttsSettings'
import type { AnkiCard } from '../types/anki'

type TabId = 'common' | 'irregular'

type VerbListsPageProps = {
  onAddToDeck: (cards: AnkiCard[]) => void
}

function SpeakVerbButton({ base, example }: { base: string; example: string }) {
  const supported = useMemo(() => supportsSpeechSynthesis(), [])
  const [speaking, setSpeaking] = useState(false)
  const spoken = `${base}. ${example}`

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
      className={`verbs-speak${speaking ? ' is-on' : ''}`}
      aria-label={speaking ? `Stop reading ${base}` : `Hear ${base}`}
      aria-pressed={speaking}
      onClick={() => {
        if (speaking) {
          window.speechSynthesis.cancel()
          setSpeaking(false)
          return
        }
        const voice = resolveVoiceForPlayback()
        const utterance = new SpeechSynthesisUtterance(spoken)
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
      {speaking ? <Square size={14} strokeWidth={2} fill="currentColor" aria-hidden /> : <Volume2 size={14} strokeWidth={2} aria-hidden />}
    </button>
  )
}

function cardFromCommon(row: CommonVerbRow): AnkiCard {
  const example = techExampleForVerb(row.base)
  return {
    front: row.base,
    back: [
      `3rd: ${row.sg3}`,
      `Past: ${row.past}`,
      `Participle: ${row.participle}`,
      `-ing: ${row.ing}`,
      '',
      `Tech: ${example}`,
    ].join('\n'),
    kind: 'vocabulary',
  }
}

function cardFromIrregular(row: IrregularVerbRow): AnkiCard {
  const example = techExampleForVerb(row.base)
  return {
    front: row.base,
    back: [`Past: ${row.past}`, `Participle: ${row.participle}`, '', `Tech: ${example}`].join('\n'),
    kind: 'vocabulary',
  }
}

function matchesVerb(parts: string[], q: string): boolean {
  const needle = q.toLowerCase()
  return parts.some((p) => p.toLowerCase().includes(needle))
}

export function VerbListsPage({ onAddToDeck }: VerbListsPageProps) {
  const [tab, setTab] = useState<TabId>('common')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [flash, setFlash] = useState<string | null>(null)

  const q = query.trim()

  const commonRows = useMemo(() => {
    if (!q) return commonVerbsPrincipalParts
    return commonVerbsPrincipalParts.filter((r) =>
      matchesVerb([r.base, r.sg3, r.past, r.participle, r.ing, techExampleForVerb(r.base)], q),
    )
  }, [q])

  const irregularRows = useMemo(() => {
    if (!q) return irregularVerbsEnglish
    return irregularVerbsEnglish.filter((r) =>
      matchesVerb([r.base, r.past, r.participle, techExampleForVerb(r.base)], q),
    )
  }, [q])

  const visibleKeys = useMemo(() => {
    if (tab === 'common') return commonRows.map((r) => `c:${r.base}`)
    return irregularRows.map((r) => `i:${r.base}`)
  }, [tab, commonRows, irregularRows])

  const selectedVisible = visibleKeys.filter((k) => selected.has(k))

  useEffect(() => {
    setSelected(new Set())
    setFlash(null)
  }, [tab])

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectAllVisible = () => setSelected(new Set(visibleKeys))
  const clearSelection = () => setSelected(new Set())

  const addCards = (cards: AnkiCard[]) => {
    if (cards.length === 0) return
    onAddToDeck(cards)
    setFlash(`Added ${cards.length} card${cards.length === 1 ? '' : 's'} to your deck.`)
  }

  const addSelected = () => {
    const cards: AnkiCard[] = []
    for (const key of selected) {
      if (key.startsWith('c:')) {
        const row = commonVerbsPrincipalParts.find((r) => r.base === key.slice(2))
        if (row) cards.push(cardFromCommon(row))
      } else if (key.startsWith('i:')) {
        const row = irregularVerbsEnglish.find((r) => r.base === key.slice(2))
        if (row) cards.push(cardFromIrregular(row))
      }
    }
    addCards(cards)
  }

  const addAllVisible = () => {
    if (tab === 'common') addCards(commonRows.map(cardFromCommon))
    else addCards(irregularRows.map(cardFromIrregular))
  }

  return (
    <div className="verbs-page page">
      <header className="page-topbar">
        <span className="eyebrow">VERB REFERENCE</span>
        <span className="date-label">
          {commonVerbsPrincipalParts.length} common · {irregularVerbsEnglish.length} irregular
        </span>
      </header>

      <section className="verbs-hero">
        <div>
          <h1>
            Verb lists<span className="accent-dot">.</span>
          </h1>
          <p>Filter, listen, and add selected verbs to your deck with a tech example.</p>
        </div>
        <div className="verbs-hero-icon" aria-hidden>
          <ListTree size={28} strokeWidth={1.8} />
        </div>
      </section>

      <div className="verbs-toolbar">
        <label className="verbs-search">
          <Search size={18} strokeWidth={1.8} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter verbs…"
            aria-label="Filter verbs"
          />
        </label>
        <div className="verbs-tabs" role="tablist" aria-label="List type">
          <button type="button" role="tab" aria-selected={tab === 'common'} className={tab === 'common' ? 'active' : ''} onClick={() => setTab('common')}>
            Common
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'irregular'}
            className={tab === 'irregular' ? 'active' : ''}
            onClick={() => setTab('irregular')}
          >
            Irregular
          </button>
        </div>
      </div>

      <div className="verbs-actions">
        <button type="button" className="button button-secondary" onClick={selectAllVisible} disabled={visibleKeys.length === 0}>
          <CheckSquare size={16} aria-hidden />
          Select all
        </button>
        <button type="button" className="button button-ghost" onClick={clearSelection} disabled={selected.size === 0}>
          Clear
        </button>
        <button type="button" className="button button-secondary" onClick={addSelected} disabled={selectedVisible.length === 0}>
          Add selected ({selectedVisible.length})
        </button>
        <button type="button" className="button button-primary" onClick={addAllVisible} disabled={visibleKeys.length === 0}>
          Add all visible ({visibleKeys.length})
        </button>
      </div>

      {flash ? (
        <p className="verbs-flash" role="status">
          {flash}
        </p>
      ) : null}

      {tab === 'common' ? (
        <div className="verbs-table-wrap">
          <table className="verbs-table">
            <thead>
              <tr>
                <th scope="col" className="verbs-check-col">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col">Base</th>
                <th scope="col">3rd</th>
                <th scope="col">Past</th>
                <th scope="col">Participle</th>
                <th scope="col">-ing</th>
                <th scope="col">Tech example</th>
                <th scope="col">
                  <span className="sr-only">Listen</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {commonRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="verbs-empty">
                    No verbs match your filter.
                  </td>
                </tr>
              ) : (
                commonRows.map((row) => {
                  const key = `c:${row.base}`
                  const example = techExampleForVerb(row.base)
                  const checked = selected.has(key)
                  return (
                    <tr key={row.base} className={checked ? 'is-selected' : ''}>
                      <td>
                        <input type="checkbox" checked={checked} onChange={() => toggle(key)} aria-label={`Select ${row.base}`} />
                      </td>
                      <td className="verbs-base">{row.base}</td>
                      <td className="verbs-mono">{row.sg3}</td>
                      <td className="verbs-mono">{row.past}</td>
                      <td className="verbs-mono">{row.participle}</td>
                      <td className="verbs-mono">{row.ing}</td>
                      <td className="verbs-example">{example}</td>
                      <td>
                        <SpeakVerbButton base={row.base} example={example} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="verbs-table-wrap">
          <table className="verbs-table">
            <thead>
              <tr>
                <th scope="col" className="verbs-check-col">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col">Infinitive</th>
                <th scope="col">Past</th>
                <th scope="col">Participle</th>
                <th scope="col">Tech example</th>
                <th scope="col">
                  <span className="sr-only">Listen</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {irregularRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="verbs-empty">
                    No verbs match your filter.
                  </td>
                </tr>
              ) : (
                irregularRows.map((row) => {
                  const key = `i:${row.base}`
                  const example = techExampleForVerb(row.base)
                  const checked = selected.has(key)
                  return (
                    <tr key={row.base} className={checked ? 'is-selected' : ''}>
                      <td>
                        <input type="checkbox" checked={checked} onChange={() => toggle(key)} aria-label={`Select ${row.base}`} />
                      </td>
                      <td className="verbs-base">{row.base}</td>
                      <td className="verbs-mono">{row.past}</td>
                      <td className="verbs-mono">{row.participle}</td>
                      <td className="verbs-example">{example}</td>
                      <td>
                        <SpeakVerbButton base={row.base} example={example} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
