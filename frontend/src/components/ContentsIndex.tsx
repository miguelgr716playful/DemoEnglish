type IndexItem = {
  id: string
  label: string
}

type ContentsIndexProps = {
  title?: string
  items: IndexItem[]
}

/** Jump links to on-page tables / sections. */
export function ContentsIndex({ title = 'Index', items }: ContentsIndexProps) {
  if (items.length === 0) return null

  return (
    <nav className="contents-index" aria-label={title}>
      <h2 className="theory-extras-title">{title}</h2>
      <ol className="contents-index-list">
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>
              <span className="contents-index-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="contents-index-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
