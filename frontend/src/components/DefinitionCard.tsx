import { ChevronDown, ChevronUp, Volume2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { buildSongSearchLinks } from '../lib/externalSongLinks'
import { SpeakTextButton } from './SpeakTextButton'
import type { WordDefinitionDto } from '../types/dictionary'

type DefinitionCardProps = {
  definition: WordDefinitionDto
  onAddToAnki?: (definition: WordDefinitionDto) => void
}

export function DefinitionCard({ definition, onAddToAnki }: DefinitionCardProps) {
  const [hidden, setHidden] = useState(false)
  const [added, setAdded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const definitionTextRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    setHidden(false)
    setAdded(false)
  }, [definition.word])

  const readAloudKey = useMemo(
    () => `${definition.word}\n${definition.primaryDefinition}`,
    [definition.word, definition.primaryDefinition],
  )

  const songLinks = useMemo(() => buildSongSearchLinks(definition.word), [definition.word])

  const playAudio = () => {
    const el = audioRef.current
    if (!el || !definition.audioUrl) return
    void el.play().catch(() => {
      /* autoplay policies — user already clicked */
    })
  }

  if (hidden) {
    return (
      <article className="definition-card definition-card-collapsed" aria-expanded={false}>
        <div className="definition-main">
          <div>
            <span className="word-type">RESULT</span>
            <h2>{definition.word}</h2>
          </div>
          <button type="button" className="button button-secondary" onClick={() => setHidden(false)}>
            <ChevronDown size={16} aria-hidden /> Show
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="definition-card" aria-expanded>
      {definition.audioUrl ? (
        <audio ref={audioRef} src={definition.audioUrl} preload="none" className="hidden" />
      ) : null}

      <div className="word-meta">
        {definition.partOfSpeech ? (
          <span className="word-type">{definition.partOfSpeech.toUpperCase()}</span>
        ) : (
          <span className="word-type">DEFINITION</span>
        )}
        <span className="word-topic">TECH ENGLISH</span>
        <button type="button" className="button button-ghost definition-hide" onClick={() => setHidden(true)}>
          <ChevronUp size={16} aria-hidden /> Hide
        </button>
      </div>

      <div className="definition-main">
        <div>
          <h2>{definition.word}</h2>
          {definition.phoneticText ? (
            <button type="button" className="pronunciation" onClick={definition.audioUrl ? playAudio : undefined}>
              {definition.audioUrl ? <Volume2 size={17} aria-hidden /> : null}
              {definition.phoneticText}
            </button>
          ) : definition.audioUrl ? (
            <button type="button" className="pronunciation" onClick={playAudio}>
              <Volume2 size={17} aria-hidden /> Play audio
            </button>
          ) : null}
        </div>
        {onAddToAnki ? (
          <button
            type="button"
            className={`button ${added ? 'button-secondary' : 'button-primary'}`}
            onClick={() => {
              onAddToAnki(definition)
              setAdded(true)
            }}
          >
            {added ? 'Added to deck' : 'Add to deck'}
          </button>
        ) : null}
      </div>

      <p className="definition" ref={definitionTextRef}>
        {definition.primaryDefinition}
      </p>
      <div className="definition-speak">
        <SpeakTextButton
          text={definition.primaryDefinition}
          resetSignal={readAloudKey}
          selectionScopeRef={definitionTextRef}
        />
      </div>

      {songLinks.length > 0 ? (
        <p className="example">
          <span>SONGS (EXTERNAL)</span>
          {songLinks.map((link, i) => (
            <span key={link.label}>
              {i > 0 ? ' · ' : ''}
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </span>
          ))}
        </p>
      ) : null}
    </article>
  )
}
