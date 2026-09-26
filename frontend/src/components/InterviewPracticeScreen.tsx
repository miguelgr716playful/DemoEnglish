import { useCallback, useEffect, useState } from 'react'
import {
  Disc3,
  Eraser,
  Loader2,
  Mic,
  Pause,
  Sparkles,
  Square,
  Trash2,
} from 'lucide-react'
import { fetchInterviewSummary, InterviewSummaryError } from '../api/interviewCoachClient'
import { browserAudioRecordingSupported, useBrowserAudioRecorder } from '../lib/useBrowserAudioRecorder'
import { useLiveEnglishDictation } from '../lib/useLiveEnglishDictation'
import { MicPermissionModal } from './MicPermissionModal'

type InterviewPracticeScreenProps = {
  onClose: () => void
}

type TabId = 'transcript' | 'summary'

/** @deprecated Nav uses AppShell; kept for compatibility. */
export function InterviewPracticeMenuButton({ onClick, open }: { onClick: () => void; open: boolean }) {
  return (
    <button type="button" className="button button-secondary" onClick={onClick} aria-expanded={open}>
      Interview
    </button>
  )
}

const MIN_SUMMARY_CHARS = 25

function formatElapsed(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/**
 * Internal interview practice: live English dictation (Web Speech), optional browser audio clip, and AI summary via API + OpenAI.
 */
export function InterviewPracticeScreen({ onClose }: InterviewPracticeScreenProps) {
  const [tab, setTab] = useState<TabId>('transcript')
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const {
    supported,
    unsupportedHint,
    text,
    setText,
    listening,
    error,
    toggleListen,
    stopListening,
    clearText,
    micGateOpen,
    micGateLoading,
    micGateError,
    handleMicGateConfirm,
    closeMicGate,
  } = useLiveEnglishDictation()

  const canRecordAudio = browserAudioRecordingSupported()
  const {
    recording,
    audioUrl,
    recordError,
    elapsedSec,
    startRecording,
    stopRecording,
    clearRecording,
  } = useBrowserAudioRecorder()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (micGateOpen) return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, micGateOpen])

  const runSummary = useCallback(async () => {
    const trimmed = text.trim()
    if (trimmed.length < MIN_SUMMARY_CHARS) {
      setSummaryError(`Add at least ${MIN_SUMMARY_CHARS} characters in the transcript (dictate or type).`)
      setTab('transcript')
      return
    }
    setSummaryError(null)
    setSummaryLoading(true)
    try {
      const next = await fetchInterviewSummary(trimmed)
      setSummary(next)
      setTab('summary')
    } catch (e) {
      const message =
        e instanceof InterviewSummaryError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Could not generate summary.'
      setSummaryError(message)
    } finally {
      setSummaryLoading(false)
    }
  }, [text])

  const active = listening || recording

  return (
    <div
      className={`interview-page ${active ? 'is-recording' : ''}`}
      role="region"
      aria-labelledby="interview-practice-title"
    >
      <header className="interview-header">
        <div>
          <span className="eyebrow">INTERVIEW PRACTICE</span>
          <h2 id="interview-practice-title">Dictate · Record · Summarize</h2>
        </div>
        <div className="question-count">
          Mode <strong>{tab === 'summary' ? 'Summary' : 'Live'}</strong>
        </div>
      </header>

      <div className="focus-area">
        <div className="question-block">
          <span className="eyebrow">YOUR PROMPT</span>
          <h1>Answer as if you were in a technical interview. Take your time.</h1>
          <div className="prompt-meta">
            <span>Suggested: 2–3 minutes</span>
            <button type="button" onClick={() => setTab(tab === 'summary' ? 'transcript' : 'summary')}>
              {tab === 'summary' ? 'Back to transcript' : 'View AI summary'}
            </button>
          </div>
        </div>

        {!supported ? (
          <p className="ui-alert ui-alert-warn interview-inline-alert" role="note">
            {unsupportedHint}
          </p>
        ) : null}

        <div className="recorder">
          <div className={`mic-rings ${active ? 'active' : ''}`}>
            <button
              type="button"
              className="mic-button"
              onClick={() => {
                if (recording) {
                  stopRecording()
                  return
                }
                if (listening) {
                  toggleListen()
                  return
                }
                if (supported) toggleListen()
                else if (canRecordAudio) {
                  stopListening()
                  void startRecording()
                }
              }}
              aria-label={active ? 'Stop' : 'Start dictation'}
              disabled={!supported && !canRecordAudio}
            >
              {active ? <Pause size={32} strokeWidth={1.8} aria-hidden /> : <Mic size={32} strokeWidth={1.8} aria-hidden />}
            </button>
          </div>
          <strong>
            {listening ? 'Listening…' : recording ? 'Recording…' : text.trim() ? 'Answer captured' : 'Start your answer'}
          </strong>
          <span>
            {recording
              ? formatElapsed(elapsedSec)
              : listening
                ? 'Speak clearly — transcript updates live'
                : 'Tap the mic to dictate (or record audio below)'}
          </span>
        </div>

        {tab === 'transcript' ? (
          <div className={`transcript-panel ${text.trim() ? 'has-content' : ''}`}>
            <div className="transcript-head">
              <span className="eyebrow">LIVE TRANSCRIPT</span>
              {listening ? (
                <span className="live-dot">LISTENING</span>
              ) : text.trim() ? (
                <span className="live-dot">CAPTURED</span>
              ) : null}
            </div>
            <textarea
              className="interview-transcript-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={
                supported
                  ? 'Your words will appear here as you speak. You can also type.'
                  : 'Type your practice answer here.'
              }
              spellCheck
            />
            {error ? (
              <p className="ui-alert ui-alert-error" role="alert">
                {error}
              </p>
            ) : null}
            {summaryError ? (
              <p className="ui-alert ui-alert-error" role="alert">
                {summaryError}
              </p>
            ) : null}
            {recordError ? (
              <p className="ui-alert ui-alert-error" role="alert">
                {recordError}
              </p>
            ) : null}
          </div>
        ) : (
          <div className={`transcript-panel ${summary ? 'has-content' : ''}`}>
            <div className="transcript-head">
              <span className="eyebrow">AI SUMMARY</span>
            </div>
            {summary ? (
              <p className="whitespace-pre-wrap">{summary}</p>
            ) : (
              <p className="empty-transcript">
                No summary yet. Generate from your transcript (requires OpenAI key on the API).
              </p>
            )}
            {summaryError ? (
              <p className="ui-alert ui-alert-error" role="alert">
                {summaryError}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <footer className="interview-actions">
        <button type="button" className="button button-ghost" onClick={clearText} disabled={!text}>
          <Eraser size={16} aria-hidden /> Clear
        </button>
        <div className="playback">
          {canRecordAudio ? (
            recording ? (
              <button type="button" className="button button-secondary" onClick={stopRecording}>
                <Square size={16} className="fill-current" aria-hidden /> Stop rec
              </button>
            ) : (
              <button
                type="button"
                className="button button-secondary"
                disabled={listening}
                onClick={() => {
                  stopListening()
                  void startRecording()
                }}
              >
                <Disc3 size={16} aria-hidden /> Record
              </button>
            )
          ) : null}
          {audioUrl ? (
            <>
              <audio controls src={audioUrl} preload="metadata" className="interview-audio" />
              <button type="button" className="button button-ghost" onClick={clearRecording} disabled={recording}>
                <Trash2 size={16} aria-hidden />
              </button>
            </>
          ) : null}
          <button
            type="button"
            className="button button-secondary"
            onClick={() => void runSummary()}
            disabled={summaryLoading || text.trim().length < MIN_SUMMARY_CHARS}
          >
            {summaryLoading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Sparkles size={16} aria-hidden />
            )}
            {summaryLoading ? '…' : 'Summarize'}
          </button>
        </div>
        <button type="button" className="button button-primary" onClick={onClose}>
          Done
        </button>
      </footer>

      {supported ? (
        <MicPermissionModal
          open={micGateOpen}
          onClose={closeMicGate}
          onConfirm={handleMicGateConfirm}
          loading={micGateLoading}
          error={micGateError}
          spacious
        />
      ) : null}
    </div>
  )
}
