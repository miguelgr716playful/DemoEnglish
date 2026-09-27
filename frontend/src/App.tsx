import { useCallback, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clapperboard,
  Layers,
  List,
  Sparkles,
} from 'lucide-react'
import { fetchWordDefinition } from './api/dictionaryClient'
import { translateToEnglish } from './api/translatorClient'
import { AnkiDeckPanel } from './components/AnkiDeckPanel'
import { AppShell, type AppScreen } from './components/layout/AppShell'
import { VerbTensePracticeDialog } from './components/VerbTensePracticeDialog'
import { DefinitionCard } from './components/DefinitionCard'
import { SearchBar } from './components/SearchBar'
import { InterviewPracticeScreen } from './components/InterviewPracticeScreen'
import { SettingsDialog } from './components/SettingsDialog'
import { VideosPage } from './components/VideosPage'
import { TenseTheoryPage } from './components/TenseTheoryPage'
import { VerbListsPage } from './components/VerbListsPage'
import { YoutubePlayerProvider } from './components/YoutubeFloatingPlayer'
import { DictionaryRequestError, type WordDefinitionDto } from './types/dictionary'
import type { AnkiCard } from './types/anki'

function buildAnkiBackFromDefinition(d: WordDefinitionDto): string {
  const lines = [
    d.partOfSpeech ? `(${d.partOfSpeech})` : null,
    d.phoneticText ? `IPA: ${d.phoneticText}` : null,
    '',
    d.primaryDefinition,
  ].filter((line) => line != null && line.length > 0) as string[]
  return lines.join('\n')
}

function hasSpanishIndicators(text: string): boolean {
  const normalized = text.toLowerCase()
  if (/[áéíóúñü¡¿]/i.test(normalized)) return true
  const commonSpanishWords = /\b(el|la|los|las|de|que|y|en|un|una|es|con|por|para|fin|semana)\b/
  return commonSpanishWords.test(normalized)
}

const TOOLS = [
  { label: 'Verb tenses', caption: 'Quick practice', icon: Sparkles, open: 'verbPractice' as const },
  { label: 'Tense theory', caption: 'Reference', icon: BookOpen, open: 'tenseTheory' as const },
  { label: 'Verb lists', caption: 'Irregular & forms', icon: List, open: 'verbLists' as const },
  { label: 'Videos', caption: 'By category', icon: Clapperboard, open: 'videos' as const },
]

function App() {
  const [screen, setScreen] = useState<AppScreen>('workspace')
  const [query, setQuery] = useState('')
  const [definition, setDefinition] = useState<WordDefinitionDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ankiCards, setAnkiCards] = useState<AnkiCard[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [verbPracticeOpen, setVerbPracticeOpen] = useState(false)

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(
        new Date(),
      ),
    [],
  )

  const runSearch = useCallback(async () => {
    const trimmedQuery = query.trim()
    setError(null)
    setLoading(true)
    try {
      const result = await fetchWordDefinition(trimmedQuery)
      setDefinition(result)
    } catch (e) {
      if (e instanceof DictionaryRequestError && hasSpanishIndicators(trimmedQuery)) {
        try {
          const translatedText = await translateToEnglish(trimmedQuery)
          setDefinition({
            word: trimmedQuery,
            phoneticText: null,
            audioUrl: null,
            primaryDefinition: translatedText,
            partOfSpeech: 'translation',
          })
          setError(null)
        } catch (translationIssue) {
          setDefinition(null)
          const message =
            translationIssue instanceof Error
              ? translationIssue.message
              : 'Translation failed. Please try again.'
          setError(message)
        }
      } else {
        setDefinition(null)
        if (e instanceof DictionaryRequestError) {
          setError(e.message)
        } else {
          setError('Something went wrong. Please try again.')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [query])

  const addDefinitionToAnki = useCallback((d: WordDefinitionDto) => {
    setAnkiCards((prev) => [
      ...prev,
      { front: d.word, back: buildAnkiBackFromDefinition(d), kind: 'vocabulary' },
    ])
  }, [])

  const addCardsToDeck = useCallback((cards: AnkiCard[]) => {
    setAnkiCards((prev) => [...prev, ...cards])
  }, [])

  const openTool = (id: (typeof TOOLS)[number]['open']) => {
    if (id === 'verbPractice') setVerbPracticeOpen(true)
    if (id === 'tenseTheory') setScreen('theory')
    if (id === 'verbLists') setScreen('verbs')
    if (id === 'videos') setScreen('videos')
  }

  return (
    <YoutubePlayerProvider>
      <AppShell
        screen={screen}
        onScreenChange={setScreen}
        deckCount={ankiCards.length}
        onOpenSettings={() => setSettingsOpen(true)}
      >
        {screen === 'workspace' ? (
          <div className="workspace page">
            <header className="page-topbar">
              <span className="eyebrow">PERSONAL LANGUAGE LAB</span>
              <span className="date-label">{dateLabel}</span>
            </header>

            <section className="hero">
              <div>
                <span className="hero-kicker">TECH ENGLISH, BUILT FOR PRACTICE</span>
                <h1>
                  Words for the work
                  <br />
                  you actually do<span className="accent-dot">.</span>
                </h1>
                <p>Look up tech English. Build a deck. Practice interviews.</p>
              </div>
              <button
                type="button"
                className="deck-orbit"
                onClick={() => setScreen('deck')}
                aria-label="Open your deck"
              >
                <span className="orbit-count">{ankiCards.length}</span>
                <span>WORDS IN DECK</span>
                <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
              </button>
            </section>

            <section className="lookup-section">
              <SearchBar
                value={query}
                onChange={(v) => {
                  setQuery(v)
                  setError(null)
                }}
                onSubmit={() => void runSearch()}
                disabled={loading}
              />
              <div className="search-hints">
                <span>Try:</span>
                {['idempotent', 'throughput', 'race condition'].map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => {
                      setQuery(hint)
                      setError(null)
                    }}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </section>

            {error ? (
              <div className="ui-alert ui-alert-error" role="alert">
                {error}
              </div>
            ) : null}

            {definition && !loading ? (
              <DefinitionCard definition={definition} onAddToAnki={addDefinitionToAnki} />
            ) : null}

            {!definition && !loading ? (
              <section className="continue-row">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">CONTINUE</span>
                    <h2>Pick up where you left off</h2>
                  </div>
                  <button type="button" className="button button-ghost" onClick={() => setScreen('deck')}>
                    View deck <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
                  </button>
                </div>
                <button type="button" className="continue-card" onClick={() => setScreen('deck')}>
                  <div className="continue-icon">
                    <Layers size={26} strokeWidth={1.8} aria-hidden />
                  </div>
                  <div>
                    <span>YOUR DECK</span>
                    <strong>
                      {ankiCards.length === 0
                        ? 'Import a deck or add words from lookup'
                        : `${ankiCards.length} cards ready`}
                    </strong>
                    <small>
                      {ankiCards.length === 0
                        ? 'Supports .apkg, text, and interview CSV'
                        : 'Open Deck to search, study, and export'}
                    </small>
                  </div>
                  <div className="continue-progress">
                    <span>{ankiCards.length}</span>
                    <div className="progress">
                      <span style={{ width: ankiCards.length === 0 ? '8%' : '68%' }} />
                    </div>
                  </div>
                  <ChevronRight size={20} strokeWidth={1.8} aria-hidden />
                </button>
              </section>
            ) : null}

            <section className="tool-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">TOOLKIT</span>
                  <h2>Train a specific skill</h2>
                </div>
              </div>
              <div className="tool-grid">
                {TOOLS.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <button
                      type="button"
                      className="tool-item"
                      key={tool.label}
                      onClick={() => openTool(tool.open)}
                    >
                      <span className="tool-icon">
                        <Icon size={18} strokeWidth={1.8} aria-hidden />
                      </span>
                      <span>
                        <strong>{tool.label}</strong>
                        <small>{tool.caption}</small>
                      </span>
                      <ChevronRight size={18} strokeWidth={1.8} aria-hidden />
                    </button>
                  )
                })}
              </div>
            </section>
          </div>
        ) : null}

        {screen === 'deck' ? (
          <div className="deck-page page">
            <AnkiDeckPanel cards={ankiCards} onCardsChange={setAnkiCards} />
          </div>
        ) : null}

        {screen === 'videos' ? <VideosPage /> : null}

        {screen === 'theory' ? <TenseTheoryPage /> : null}

        {screen === 'verbs' ? <VerbListsPage onAddToDeck={addCardsToDeck} /> : null}

        {screen === 'interview' ? <InterviewPracticeScreen onClose={() => setScreen('workspace')} /> : null}
      </AppShell>

      <VerbTensePracticeDialog open={verbPracticeOpen} onClose={() => setVerbPracticeOpen(false)} />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </YoutubePlayerProvider>
  )
}

export default App
