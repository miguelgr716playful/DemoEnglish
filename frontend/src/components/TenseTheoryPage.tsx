import { useMemo, useState } from 'react'
import { BookOpen, Clock3, Search } from 'lucide-react'
import {
  theoryReferenceTables,
  theoryTableSearchBlob,
  type TheoryRefTable,
} from '../data/theoryReferenceTables'
import { ContentsIndex } from './ContentsIndex'

function matchesQuery(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q)
}

function TheoryRefTableCard({ table }: { table: TheoryRefTable }) {
  return (
    <section className="theory-card theory-ref-card" id={`theory-ref-${table.id}`}>
      <h3>{table.title}</h3>
      {table.note ? <p className="theory-ref-note">{table.note}</p> : null}
      <div className="theory-ref-wrap">
        <table className="theory-ref-table">
          <thead>
            <tr>
              {table.headers.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={`${table.id}-${ri}`}>
                {row.map((cell, ci) => (
                  <td key={`${table.id}-${ri}-${ci}`} className={ci === 0 ? 'theory-ref-key' : undefined}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

type TenseTheoryPageProps = {
  onOpenTenses?: () => void
}

/** Essentials / reference tables only — tense formulas live on Tenses. */
export function TenseTheoryPage({ onOpenTenses }: TenseTheoryPageProps) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const tables = useMemo(() => {
    if (!q) return theoryReferenceTables
    return theoryReferenceTables.filter((t) => matchesQuery(theoryTableSearchBlob(t), q))
  }, [q])

  const indexItems = useMemo(
    () => tables.map((t) => ({ id: `theory-ref-${t.id}`, label: t.title })),
    [tables],
  )

  return (
    <div className="theory-page page">
      <header className="page-topbar">
        <span className="eyebrow">GRAMMAR REFERENCE</span>
        <span className="date-label">{theoryReferenceTables.length} tables</span>
      </header>

      <section className="theory-hero">
        <div>
          <h1>
            Theory<span className="accent-dot">.</span>
          </h1>
          <p>Subjects, helpers, and other essentials. Tense formulas and videos are on the Tenses page.</p>
        </div>
        <div className="theory-hero-icon" aria-hidden>
          <BookOpen size={28} strokeWidth={1.8} />
        </div>
      </section>

      {onOpenTenses ? (
        <aside className="theory-videos-cta">
          <div>
            <strong>Tense formulas + videos</strong>
            <p>Present simple through future perfect, modals, passive, and conditionals — each with a lesson video.</p>
          </div>
          <button type="button" className="button button-secondary" onClick={onOpenTenses}>
            <Clock3 size={16} strokeWidth={1.8} aria-hidden />
            Open Tenses
          </button>
        </aside>
      ) : null}

      <label className="theory-search">
        <Search size={18} strokeWidth={1.8} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search (e.g. subjects, do/does, prepositions…)"
          aria-label="Search grammar tables"
        />
      </label>

      {tables.length === 0 ? (
        <p className="theory-empty">No results for “{query.trim()}”.</p>
      ) : (
        <div className="theory-sections">
          <ContentsIndex title="Tables index" items={indexItems} />
          <div className="theory-ref-block">
            <h2 className="theory-extras-title">Subjects &amp; essentials</h2>
            <div className="theory-ref-grid">
              {tables.map((t) => (
                <TheoryRefTableCard key={t.id} table={t} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
