import { Search } from 'lucide-react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function SearchBar({ value, onChange, onSubmit, disabled }: SearchBarProps) {
  return (
    <form
      className="search-box"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      role="search"
      aria-label="Dictionary search"
    >
      <Search size={23} strokeWidth={1.8} aria-hidden />
      <input
        className="text-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a technical word or phrase…"
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        aria-label="Search the technical dictionary"
      />
      <button type="submit" className="button button-primary" disabled={disabled || !value.trim()}>
        {disabled ? 'Searching…' : (
          <>
            Look up <span className="key-hint">↵</span>
          </>
        )}
      </button>
    </form>
  )
}
