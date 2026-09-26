export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'demoenglish.theme'
export const THEME_CHANGED_EVENT = 'demoenglish:theme-changed'

export function readStoredTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    /* private mode */
  }
  return 'dark'
}

export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function setTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: theme }))
}

export function initThemeFromStorage(): ThemeMode {
  const theme = readStoredTheme()
  applyTheme(theme)
  return theme
}
