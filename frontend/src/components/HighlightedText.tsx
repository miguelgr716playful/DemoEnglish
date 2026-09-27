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

/** Expand a word range to the full line (newline), or sentence if the line is huge. */
export function expandToLineRange(text: string, range: SpeechWordRange): SpeechWordRange {
  const start = Math.min(Math.max(range.start, 0), text.length)
  const end = Math.min(Math.max(range.end, start), text.length)

  let lineStart = start
  while (lineStart > 0 && text[lineStart - 1] !== '\n') lineStart -= 1
  let lineEnd = end
  while (lineEnd < text.length && text[lineEnd] !== '\n') lineEnd += 1

  // Soft-wrapped prose often has no newlines — use sentence bounds instead of the whole block.
  if (lineEnd - lineStart > 160) {
    let sentStart = start
    while (sentStart > lineStart && !/[.!?。！？]/u.test(text[sentStart - 1]!)) sentStart -= 1
    while (sentStart < end && /\s/u.test(text[sentStart]!)) sentStart += 1
    let sentEnd = end
    while (sentEnd < lineEnd && !/[.!?。！？]/u.test(text[sentEnd - 1]!)) sentEnd += 1
    return { start: sentStart, end: Math.max(sentEnd, end) }
  }

  return { start: lineStart, end: lineEnd }
}

type HighlightedTextProps = {
  text: string
  range: SpeechWordRange | null
  className?: string
}

/** Renders plain text with the active TTS line shaded and the word marked. */
export function HighlightedText({ text, range, className }: HighlightedTextProps) {
  if (!text) return null
  if (!range || range.start < 0 || range.end <= range.start || range.start >= text.length) {
    return <span className={className}>{text}</span>
  }

  const wordStart = Math.min(range.start, text.length)
  const wordEnd = Math.min(range.end, text.length)
  const line = expandToLineRange(text, { start: wordStart, end: wordEnd })
  const localWordStart = Math.max(wordStart, line.start)
  const localWordEnd = Math.min(wordEnd, line.end)

  return (
    <span className={className}>
      {text.slice(0, line.start)}
      <mark className="tts-line-highlight">
        {text.slice(line.start, localWordStart)}
        <span className="tts-word-highlight">{text.slice(localWordStart, localWordEnd)}</span>
        {text.slice(localWordEnd, line.end)}
      </mark>
      {text.slice(line.end)}
    </span>
  )
}
