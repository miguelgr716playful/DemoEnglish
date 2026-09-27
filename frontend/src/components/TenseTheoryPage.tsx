import { useMemo, useState } from 'react'
import { Clapperboard, GraduationCap, Search } from 'lucide-react'
import { MarkdownFormula, MarkdownLite } from './MarkdownLite'
import { verbTenseTheoryBlocks, verbTenseTheoryExtra } from '../data/verbTenseTheory'
import {
  theoryReferenceTables,
  theoryTableSearchBlob,
  type TheoryRefTable,
} from '../data/theoryReferenceTables'
import { ContentsIndex } from './ContentsIndex'

function matchesQuery(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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
  onOpenVideos?: () => void
}

export function TenseTheoryPage({ onOpenVideos }: TenseTheoryPageProps) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const blocks = useMemo(() => {
    if (!q) return verbTenseTheoryBlocks
    return verbTenseTheoryBlocks.filter((b) =>
      matchesQuery([b.title, b.formula, b.usage, b.example].join('\n'), q),
    )
  }, [q])

  const extras = useMemo(() => {
    if (!q) return verbTenseTheoryExtra
    return verbTenseTheoryExtra.filter((x) => matchesQuery([x.title, x.body].join('\n'), q))
  }, [q])

  const tables = useMemo(() => {
    if (!q) return theoryReferenceTables
    return theoryReferenceTables.filter((t) => matchesQuery(theoryTableSearchBlob(t), q))
  }, [q])

  const empty = blocks.length === 0 && extras.length === 0 && tables.length === 0

  const indexItems = useMemo(() => {
    const items: { id: string; label: string }[] = []
    for (const t of tables) items.push({ id: `theory-ref-${t.id}`, label: t.title })
    for (const b of blocks) items.push({ id: `theory-${b.id}`, label: b.title.replace(/\*/g, '') })
    for (const x of extras) items.push({ id: `theory-extra-${slugify(x.title)}`, label: x.title })
    return items
  }, [tables, blocks, extras])

  return (
    <div className="theory-page page">
      <header className="page-topbar">
        <span className="eyebrow">GRAMMAR REFERENCE</span>
        <span className="date-label">
          {verbTenseTheoryBlocks.length} tenses · {theoryReferenceTables.length} tables
        </span>
      </header>

      <section className="theory-hero">
        <div>
          <h1>
            Tense formulas<span className="accent-dot">.</span>
          </h1>
          <p>Quick reference — subjects, helpers, and verb tense formulas. Videos live in the Videos page.</p>
        </div>
        <div className="theory-hero-icon" aria-hidden>
          <GraduationCap size={28} strokeWidth={1.8} />
        </div>
      </section>

      {onOpenVideos ? (
        <aside className="theory-videos-cta">
          <div>
            <strong>Tense lesson videos</strong>
            <p>Watch overview and per-tense lessons in Videos → Verb tenses &amp; grammar.</p>
          </div>
          <button type="button" className="button button-secondary" onClick={onOpenVideos}>
            <Clapperboard size={16} strokeWidth={1.8} aria-hidden />
            Open Videos
          </button>
        </aside>
      ) : null}

      <label className="theory-search">
        <Search size={18} strokeWidth={1.8} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search (e.g. subjects, present perfect, do/does…)"
          aria-label="Search grammar reference"
        />
      </label>

      {empty ? (
        <p className="theory-empty">No results for “{query.trim()}”.</p>
      ) : (
        <div className="theory-sections">
          <ContentsIndex title="Tables & sections index" items={indexItems} />

          {tables.length > 0 ? (
            <div className="theory-ref-block">
              <h2 className="theory-extras-title">Subjects &amp; essentials</h2>
              <div className="theory-ref-grid">
                {tables.map((t) => (
                  <TheoryRefTableCard key={t.id} table={t} />
                ))}
              </div>
            </div>
          ) : null}

          {blocks.length > 0 ? (
            <div className="theory-tenses-block">
              <h2 className="theory-extras-title">Tense formulas</h2>
              {blocks.map((b) => (
                <section key={b.id} className="theory-card" id={`theory-${b.id}`}>
                  <h2>
                    <MarkdownLite text={b.title} />
                  </h2>
                  <div className="theory-formula">
                    <MarkdownFormula text={b.formula} />
                  </div>
                  <p className="theory-use">
                    <span>Use:</span> <MarkdownLite text={b.usage} />
                  </p>
                  <p className="theory-eg">
                    <span>e.g.</span> <MarkdownLite text={b.example} />
                  </p>
                </section>
              ))}
            </div>
          ) : null}

          {extras.length > 0 ? (
            <div className="theory-extras">
              <h2 className="theory-extras-title">More patterns</h2>
              {extras.map((x) => (
                <section
                  key={x.title}
                  id={`theory-extra-${slugify(x.title)}`}
                  className="theory-card theory-card-extra"
                >
                  <h3>{x.title}</h3>
                  <div className="theory-extra-body">
                    {x.body
                      .trim()
                      .split('\n')
                      .filter((line) => line.trim().length > 0)
                      .map((line, li) => (
                        <p key={li}>
                          <MarkdownLite text={line} />
                        </p>
                      ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
