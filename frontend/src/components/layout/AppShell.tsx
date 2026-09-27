import type { ReactNode } from 'react'
import {
  BookOpen,
  Clapperboard,
  Layers,
  ListTree,
  Mic,
  Search,
  Settings,
} from 'lucide-react'
import { ThemeSelector } from '../ThemeSelector'

export type AppScreen = 'workspace' | 'deck' | 'videos' | 'theory' | 'verbs' | 'interview'

type AppShellProps = {
  screen: AppScreen
  onScreenChange: (screen: AppScreen) => void
  deckCount: number
  onOpenSettings: () => void
  children: ReactNode
}

function Brand() {
  return (
    <div className="brand-lockup">
      <div className="brand-mark">
        <span>DE</span>
      </div>
      <span className="brand-name">DemoEnglish</span>
    </div>
  )
}

export function AppShell({
  screen,
  onScreenChange,
  deckCount,
  onOpenSettings,
  children,
}: AppShellProps) {
  const nav: { id: AppScreen; label: string; icon: typeof Search }[] = [
    { id: 'workspace', label: 'Workspace', icon: Search },
    { id: 'deck', label: 'Deck', icon: Layers },
    { id: 'theory', label: 'Theory', icon: BookOpen },
    { id: 'verbs', label: 'Verbs', icon: ListTree },
    { id: 'videos', label: 'Videos', icon: Clapperboard },
    { id: 'interview', label: 'Interview', icon: Mic },
  ]

  return (
    <div className={`app-shell ${screen === 'interview' ? 'app-shell-interview' : ''}`}>
      <aside className="side-rail">
        <Brand />
        <nav className="main-nav" aria-label="Primary navigation">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${screen === item.id ? 'active' : ''}`}
                onClick={() => onScreenChange(item.id)}
              >
                <Icon size={20} strokeWidth={1.8} aria-hidden />
                <span>{item.label}</span>
                {item.id === 'deck' && deckCount > 0 ? (
                  <span className="nav-badge">{deckCount > 99 ? '99+' : deckCount}</span>
                ) : null}
              </button>
            )
          })}
        </nav>
        <div className="rail-bottom">
          <div className="daily">
            <span className="daily-kicker">YOUR DECK</span>
            <strong>
              {deckCount === 0 ? 'No cards yet' : `${deckCount} card${deckCount === 1 ? '' : 's'}`}
            </strong>
            <div className="progress">
              <span style={{ width: deckCount === 0 ? '0%' : '68%' }} />
            </div>
            <small>{deckCount === 0 ? 'Import or look up a word' : 'Open Deck to study'}</small>
          </div>
          <ThemeSelector compact />
          <button type="button" className="nav-item" onClick={onOpenSettings}>
            <Settings size={20} strokeWidth={1.8} aria-hidden />
            <span>Settings</span>
          </button>
          <div className="profile">
            <span className="avatar">
              <BookOpen size={14} strokeWidth={2} aria-hidden />
            </span>
            <span>
              <strong>Tech English</strong>
              <small>Personal practice lab</small>
            </span>
          </div>
        </div>
      </aside>

      <div className="mobile-top">
        <Brand />
        <button type="button" className="button button-ghost" aria-label="Settings" onClick={onOpenSettings}>
          <Settings size={20} strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      <main className="main-content">{children}</main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={screen === item.id ? 'active' : ''}
              onClick={() => onScreenChange(item.id)}
            >
              <Icon size={21} strokeWidth={1.8} aria-hidden />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
