import { useEffect } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { getApiSwaggerUrl, shouldShowIosDevSwaggerLink } from '../api/apiOrigin'
import { ThemeSelector } from './ThemeSelector'
import { TtsSettingsPanel } from './TtsSettingsPanel'

type SettingsDialogProps = {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="app-settings-title">
        <header>
          <div>
            <span className="eyebrow">PREFERENCES</span>
            <h2 id="app-settings-title">Settings</h2>
          </div>
          <button type="button" className="button button-ghost" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden />
          </button>
        </header>
        <div className="info-content">
          <p className="settings-lead">Theme, audio, and read-aloud options.</p>
          <ThemeSelector />
          {shouldShowIosDevSwaggerLink() ? (
            <div className="modal-feature">
              <div>
                <strong>API (dev, same Wi‑Fi)</strong>
                <p>Open Swagger on this device using the same address as this page (not localhost).</p>
                <a
                  href={getApiSwaggerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settings-link"
                >
                  Open API Swagger <ExternalLink size={14} aria-hidden />
                </a>
              </div>
            </div>
          ) : null}
          <div className="settings-tts">
            <TtsSettingsPanel />
          </div>
        </div>
        <footer>
          <button type="button" className="button button-primary" onClick={onClose}>
            Done
          </button>
        </footer>
      </section>
    </div>
  )
}

export function SettingsMenuButton({ onClick, open }: { onClick: () => void; open: boolean }) {
  return (
    <button type="button" className="button button-secondary" onClick={onClick} aria-expanded={open}>
      Settings
    </button>
  )
}
