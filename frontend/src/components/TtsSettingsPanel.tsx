import { useEffect, useMemo, useState } from 'react'
import { Volume2 } from 'lucide-react'
import {
  notifyTtsSettingsChanged,
  parseStoredRate,
  pickPreferredEnglishVoice,
  supportsSpeechSynthesis,
  TTS_RATE_STORAGE_KEY,
  TTS_VOICE_STORAGE_KEY,
} from '../lib/ttsSettings'

export function TtsSettingsPanel() {
  const available = useMemo(() => supportsSpeechSynthesis(), [])
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceUri, setVoiceUri] = useState('')
  const [rate, setRate] = useState(1)

  useEffect(() => {
    setRate(parseStoredRate())
  }, [])

  useEffect(() => {
    if (!available) return
    const synth = window.speechSynthesis
    const syncVoices = () => {
      const allVoices = synth.getVoices()
      const englishVoices = allVoices.filter((v) => /^en-/i.test(v.lang))
      const options = englishVoices.length > 0 ? englishVoices : allVoices
      setVoices(options)
      const savedUri = window.localStorage.getItem(TTS_VOICE_STORAGE_KEY) ?? ''
      const saved = savedUri ? options.find((v) => v.voiceURI === savedUri) : null
      const picked = saved ?? pickPreferredEnglishVoice(options)
      const uri = picked?.voiceURI ?? ''
      setVoiceUri(uri)
      if (uri) window.localStorage.setItem(TTS_VOICE_STORAGE_KEY, uri)
    }
    syncVoices()
    synth.addEventListener('voiceschanged', syncVoices)
    return () => synth.removeEventListener('voiceschanged', syncVoices)
  }, [available])

  if (!available) {
    return (
      <div className="tts-panel tts-panel-unavailable">
        Read-aloud (browser voice) is not available in this browser.
      </div>
    )
  }

  return (
    <div className="tts-panel">
      <div className="tts-panel-head">
        <Volume2 size={16} strokeWidth={2} aria-hidden className="tts-panel-icon" />
        <strong>Read aloud</strong>
      </div>
      <p className="tts-panel-lead">
        Applies to read-aloud on dictionary results and study cards (Parts 1 and 2). Uses your browser or system
        voices.
      </p>
      <label className="tts-row">
        <span className="tts-row-label">Voice</span>
        <select
          value={voiceUri}
          title={voices.find((v) => v.voiceURI === voiceUri)?.name}
          onChange={(e) => {
            const next = e.target.value
            setVoiceUri(next)
            window.localStorage.setItem(TTS_VOICE_STORAGE_KEY, next)
            notifyTtsSettingsChanged()
          }}
          className="tts-select"
        >
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </label>
      <label className="tts-row">
        <span className="tts-row-label">Speed</span>
        <div className="tts-speed">
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={rate}
            onChange={(e) => {
              const next = Number(e.target.value)
              setRate(next)
              window.localStorage.setItem(TTS_RATE_STORAGE_KEY, String(next))
              notifyTtsSettingsChanged()
            }}
            className="tts-range"
            aria-valuetext={`${Math.round(rate * 100)} percent`}
          />
          <span className="tts-rate-value">{Math.round(rate * 100)}%</span>
        </div>
      </label>
    </div>
  )
}
