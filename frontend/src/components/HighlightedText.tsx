/** Char range within a spoken string (inclusive start, exclusive end). */
export type SpeechWordRange = { start: number; end: number }

/** Map a range from a full spoken string into a local substring. */
export function localSpeechRange(
  range: SpeechWordRange | null,
  offset: number,
  length: number,
): SpeechWordRange | null {
  if (!range || length <= 0) return null
  const start = Math.max(range.start, offset)
  const end = Math.min(range.end, offset + length)
  if (start >= end) return null
  return { start: start - offset, end: end - offset }
}

/** Estimate word end when SpeechSynthesisEvent.charLength is missing. */
export function speechWordEnd(text: string, charIndex: number): number {
  if (charIndex < 0 || charIndex >= text.length) return Math.max(charIndex, 0)
  let end = charIndex
  while (end < text.length && !/\s/u.test(text[end]!)) end += 1
  return end > charIndex ? end : Math.min(charIndex + 1, text.length)
}

type HighlightedTextProps = {
  text: string
  range: SpeechWordRange | null
  className?: string
}

/** Renders plain text with the active TTS word wrapped in a mark. */
export function HighlightedText({ text, range, className }: HighlightedTextProps) {
  if (!text) return null
  if (!range || range.start < 0 || range.end <= range.start || range.start >= text.length) {
    return <span className={className}>{text}</span>
  }
  const start = Math.min(range.start, text.length)
  const end = Math.min(range.end, text.length)
  return (
    <span className={className}>
      {text.slice(0, start)}
      <mark className="tts-word-highlight">{text.slice(start, end)}</mark>
      {text.slice(end)}
    </span>
  )
}
