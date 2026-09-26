import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import {
  readStoredTheme,
  setTheme,
  THEME_CHANGED_EVENT,
  type ThemeMode,
} from '../lib/themeSettings'

type ThemeSelectorProps = {
  /** Compact control for the side rail / mobile top. */
  compact?: boolean
}

export function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredTheme())

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ThemeMode>).detail
      if (detail === 'light' || detail === 'dark') setThemeState(detail)
    }
    window.addEventListener(THEME_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(THEME_CHANGED_EVENT, onChange)
  }, [])

  const choose = (next: ThemeMode) => {
    setThemeState(next)
    setTheme(next)
  }

  if (compact) {
    const next = theme === 'dark' ? 'light' : 'dark'
    return (
      <button
        type="button"
        className="nav-item"
        onClick={() => choose(next)}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <Sun size={20} strokeWidth={1.8} aria-hidden /> : <Moon size={20} strokeWidth={1.8} aria-hidden />}
        <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
      </button>
    )
  }

  return (
    <div className="theme-selector" role="group" aria-label="Color theme">
      <span className="theme-selector-label">
        <strong>Appearance</strong>
        <small>Light or dark interface</small>
      </span>
      <div className="theme-segmented">
        <button
          type="button"
          className={theme === 'light' ? 'active' : ''}
          onClick={() => choose('light')}
          aria-pressed={theme === 'light'}
        >
          <Sun size={15} strokeWidth={1.8} aria-hidden />
          Light
        </button>
        <button
          type="button"
          className={theme === 'dark' ? 'active' : ''}
          onClick={() => choose('dark')}
          aria-pressed={theme === 'dark'}
        >
          <Moon size={15} strokeWidth={1.8} aria-hidden />
          Dark
        </button>
      </div>
    </div>
  )
}
