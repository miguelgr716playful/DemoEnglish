import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Download, FileUp, MessageSquare, Search, Trash2 } from 'lucide-react'
import { exportAnkiPlainText, importAnkiPlainText, sampleAnkiDownloadUrl } from '../api/ankiClient'
import { extractMediaEmbedsInOrder } from '../lib/ankiCardLayout'
import { importInterviewCsvFromFile } from '../lib/interviewCsvImport'
import { ApkgMediaStore } from '../lib/apkgMedia'
import type { AnkiCard } from '../types/anki'
import { AnkiCardDetailModal, baseWordLabel } from './AnkiCardDetailModal'

type AnkiDeckPanelProps = {
  cards: AnkiCard[]
  onCardsChange: (cards: AnkiCard[]) => void
}

function mediaFilenamesForCard(card: AnkiCard): string[] {
  return extractMediaEmbedsInOrder(`${card.front}\n${card.back}`).map((e) => e.filename)
}

export function AnkiDeckPanel({ cards, onCardsChange }: AnkiDeckPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const interviewCsvInputRef = useRef<HTMLInputElement | null>(null)
  const mediaStoreRef = useRef<ApkgMediaStore | null>(null)
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [mediaUrls, setMediaUrls] = useState<Map<string, string>>(() => new Map())
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [listSearch, setListSearch] = useState('')

  const { deckOrdinalByIndex, sortedDeckIndices } = useMemo(() => {
    const order = cards
      .map((c, i) => ({ i, label: baseWordLabel(c.front).toLowerCase() }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
    const map = new Map<number, number>()
    order.forEach((x, pos) => map.set(x.i, pos + 1))
    return {
      deckOrdinalByIndex: map,
      sortedDeckIndices: order.map((x) => x.i),
    }
  }, [cards])

  const nextCardIndexInAzOrder = useMemo(() => {
    if (selectedIndex === null) return null
    const pos = sortedDeckIndices.indexOf(selectedIndex)
    if (pos < 0 || pos >= sortedDeckIndices.length - 1) return null
    return sortedDeckIndices[pos + 1]
  }, [selectedIndex, sortedDeckIndices])

  const prevCardIndexInAzOrder = useMemo(() => {
    if (selectedIndex === null) return null
    const pos = sortedDeckIndices.indexOf(selectedIndex)
    if (pos <= 0) return null
    return sortedDeckIndices[pos - 1]
  }, [selectedIndex, sortedDeckIndices])

  const goToNextCardInAzOrder = useCallback(() => {
    if (nextCardIndexInAzOrder === null) return
    setSelectedIndex(nextCardIndexInAzOrder)
  }, [nextCardIndexInAzOrder])

  const goToPrevCardInAzOrder = useCallback(() => {
    if (prevCardIndexInAzOrder === null) return
    setSelectedIndex(prevCardIndexInAzOrder)
  }, [prevCardIndexInAzOrder])

  const listRows = useMemo(() => {
    const q = listSearch.trim().toLowerCase()
    const indexed = cards.map((c, originalIndex) => ({ card: c, originalIndex }))
    const filtered = q
      ? indexed.filter(({ card }) => {
          const label = baseWordLabel(card.front).toLowerCase()
          return (
            label.includes(q) ||
            card.front.toLowerCase().includes(q) ||
            card.back.toLowerCase().includes(q)
          )
        })
      : indexed
    return [...filtered].sort((a, b) =>
      baseWordLabel(a.card.front).localeCompare(baseWordLabel(b.card.front), undefined, {
        sensitivity: 'base',
      }),
    )
  }, [cards, listSearch])

  useEffect(
    () => () => {
      mediaStoreRef.current?.dispose()
      mediaStoreRef.current = null
    },
    [],
  )

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= cards.length) setSelectedIndex(null)
  }, [cards.length, selectedIndex])

  useEffect(() => {
    if (selectedIndex === null) return
    const c = cards[selectedIndex]
    if (!c) {
      setSelectedIndex(null)
      return
    }
    const q = listSearch.trim().toLowerCase()
    if (!q) return
    const label = baseWordLabel(c.front).toLowerCase()
    const match =
      label.includes(q) || c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q)
    if (!match) setSelectedIndex(null)
  }, [listSearch, selectedIndex, cards])

  // Decode [sound:] / [img:] from the open card only (and lightly prefetch next/prev in A–Z order).
  useEffect(() => {
    if (selectedIndex === null) return
    const card = cards[selectedIndex]
    const store = mediaStoreRef.current
    if (!card || !store) return

    let cancelled = false
    const names = mediaFilenamesForCard(card)
    const neighborNames: string[] = []
    const pos = sortedDeckIndices.indexOf(selectedIndex)
    if (pos >= 0) {
      const nextIdx = sortedDeckIndices[pos + 1]
      const prevIdx = sortedDeckIndices[pos - 1]
      if (nextIdx != null && cards[nextIdx]) neighborNames.push(...mediaFilenamesForCard(cards[nextIdx]))
      if (prevIdx != null && cards[prevIdx]) neighborNames.push(...mediaFilenamesForCard(cards[prevIdx]))
    }

    void (async () => {
      try {
        const urls = await store.ensureMany([...names, ...neighborNames])
        if (!cancelled) setMediaUrls(urls)
      } catch {
        /* keep previous decoded URLs if a single card decode fails */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedIndex, cards, sortedDeckIndices])

  const applyImportFromFile = useCallback(
    async (file: File, mode: 'append' | 'replace'): Promise<string> => {
      const result = await importAnkiPlainText(file)
      const mapped: AnkiCard[] = result.cards.map((c) => ({
        front: c.front,
        back: c.back,
        sourceLine: c.sourceLine,
      }))
      onCardsChange(mode === 'replace' ? mapped : [...cards, ...mapped])

      const isApkg = file.name.toLowerCase().endsWith('.apkg')
      if (mode === 'replace' || isApkg) {
        mediaStoreRef.current?.dispose()
        mediaStoreRef.current = null
        setMediaUrls(new Map())
      }
      if (isApkg) {
        // Index the ZIP + media map only; blob URLs are created when a card is opened.
        mediaStoreRef.current = await ApkgMediaStore.open(file)
      }

      return result.warnings.length
        ? `Imported ${mapped.length} card(s). ${result.warnings.join(' ')}`
        : `Imported ${mapped.length} card(s).`
    },
    [cards, onCardsChange],
  )

  const preloadApkgUrl = import.meta.env.VITE_PRELOAD_APKG_URL?.trim()
  const preloadRan = useRef(false)

  useEffect(() => {
    if (!preloadApkgUrl || preloadRan.current) return
    preloadRan.current = true
    void (async () => {
      // Do not toggle `busy` here — preload can take a long time on Wi‑Fi/phone and would
      // block manual Anki import/export until it finishes or fails.
      setMessage(null)
      try {
        const res = await fetch(preloadApkgUrl)
        if (!res.ok) {
          throw new Error(
            `Preload failed (${res.status}). Check DEMOENGLISH_PRELOAD_APKG_PATH and that you use vite dev/preview.`,
          )
        }
        const blob = await res.blob()
        const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
        const looksZip = blob.size >= 22 && head[0] === 0x50 && head[1] === 0x4b
        if (!looksZip) {
          const preview =
            blob.size > 0 && blob.size < 4000 ? (await blob.text()).replace(/\s+/g, ' ').slice(0, 200) : ''
          throw new Error(
            `Preload response is not a valid .apkg (expected ZIP “PK…” header). ${preview ? `Body starts with: ${preview}` : ''} Set DEMOENGLISH_PRELOAD_APKG_PATH in frontend/.env.development and restart \`npm run dev\`.`,
          )
        }
        const dispo = res.headers.get('Content-Disposition')
        const fromHeader = dispo?.match(/filename="([^"]+)"/)?.[1]
        const fileName = fromHeader?.trim() || 'preloaded.apkg'
        const file = new File(
          [blob],
          fileName.toLowerCase().endsWith('.apkg') ? fileName : `${fileName}.apkg`,
          { type: 'application/octet-stream' },
        )
        const msg = await applyImportFromFile(file, 'replace')
        setMessage(`${msg} Preloaded from local disk (dev).`)
      } catch (err) {
        preloadRan.current = false
        setMessage(err instanceof Error ? err.message : 'Preload failed.')
      }
    })()
  }, [preloadApkgUrl, applyImportFromFile])

  const onInterviewCsvSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      setMessage(null)
      setBusy(true)
      try {
        const result = await importInterviewCsvFromFile(file)
        const mapped = result.cards
        if (mapped.length === 0) {
          setMessage(result.warnings.join(' ') || 'No cards imported.')
          return
        }
        onCardsChange(importMode === 'replace' ? mapped : [...cards, ...mapped])
        setMessage(
          result.warnings.length
            ? `Interview prep: imported ${mapped.length} Q&A card(s). ${result.warnings.join(' ')}`
            : `Interview prep: imported ${mapped.length} Q&A card(s). Open a card — Part 1 = question, Part 2 = answer.`,
        )
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Interview CSV import failed.')
      } finally {
        setBusy(false)
      }
    },
    [cards, importMode, onCardsChange],
  )

  const onFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      setMessage(null)
      setBusy(true)
      try {
        const msg = await applyImportFromFile(file, importMode)
        setMessage(msg)
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Import failed.')
      } finally {
        setBusy(false)
      }
    },
    [applyImportFromFile, importMode],
  )

  const onExport = useCallback(async () => {
    if (cards.length === 0) return
    setMessage(null)
    setBusy(true)
    try {
      const blob = await exportAnkiPlainText(cards)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'anki-export.txt'
      a.click()
      URL.revokeObjectURL(url)
      setMessage('Download started (UTF-8 tab-separated, ready for Anki → Import).')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Export failed.')
    } finally {
      setBusy(false)
    }
  }, [cards])

  const removeAt = (index: number) => {
    onCardsChange(cards.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    onCardsChange([])
    setSelectedIndex(null)
    setListSearch('')
    setMessage(null)
    mediaStoreRef.current?.dispose()
    mediaStoreRef.current = null
    setMediaUrls(new Map())
  }

  return (
    <>
      <header className="page-topbar">
        <span className="eyebrow">ANKI DECK</span>
        <span className="date-label">{cards.length} total cards</span>
      </header>

      <section className="deck-title">
        <div>
          <h1>
            Your working vocabulary<span className="accent-dot">.</span>
          </h1>
          <p>Keep the list light. Put your attention on one word at a time.</p>
        </div>
        {cards.length > 0 ? (
          <button
            type="button"
            className="button button-primary"
            onClick={() => setSelectedIndex(sortedDeckIndices[0] ?? 0)}
          >
            Study first card
          </button>
        ) : null}
      </section>

      <section className="deck-stats">
        <div>
          <span>{cards.length}</span>
          <small>TOTAL</small>
        </div>
        <div>
          <span>{listRows.length}</span>
          <small>VISIBLE</small>
        </div>
        <div>
          <span>{importMode === 'replace' ? 'Replace' : 'Append'}</span>
          <small>IMPORT MODE</small>
        </div>
        <div>
          <span>A–Z</span>
          <small>SORT</small>
        </div>
      </section>

      <section className="deck-toolbar">
        <div className="list-search">
          <Search size={18} strokeWidth={1.8} aria-hidden />
          <input
            className="text-input"
            type="search"
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            placeholder={cards.length ? `Search ${cards.length} words…` : 'Search…'}
            autoComplete="off"
            aria-label="Search deck"
          />
        </div>
        <div className="deck-actions">
          <label className={`button button-secondary ${busy ? 'is-disabled' : ''}`}>
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              disabled={busy}
              onChange={(e) => void onFileSelected(e)}
            />
            <FileUp size={16} aria-hidden />
            <span className="desktop-only">Import</span>
          </label>
          <label className={`button button-ghost ${busy ? 'is-disabled' : ''}`}>
            <input
              ref={interviewCsvInputRef}
              type="file"
              accept=".csv"
              className="sr-only"
              disabled={busy}
              onChange={(e) => void onInterviewCsvSelected(e)}
            />
            <MessageSquare size={16} aria-hidden />
            <span className="desktop-only">Interview CSV</span>
          </label>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => void onExport()}
            disabled={busy || cards.length === 0}
            aria-label="Export for Anki"
          >
            <Download size={16} aria-hidden />
            <span className="desktop-only">Export</span>
          </button>
          <button
            type="button"
            className="button button-ghost"
            onClick={clearAll}
            disabled={busy || cards.length === 0}
            aria-label="Clear deck"
          >
            <Trash2 size={16} aria-hidden />
          </button>
        </div>
      </section>

      <div className="deck-meta-row">
        <label className="import-mode">
          <span>On import</span>
          <select
            value={importMode}
            onChange={(e) => setImportMode(e.target.value as 'append' | 'replace')}
            disabled={busy}
          >
            <option value="append">Append</option>
            <option value="replace">Replace list</option>
          </select>
        </label>
        <a href={sampleAnkiDownloadUrl()} download className="sample-link">
          Sample .txt
        </a>
      </div>

      {message ? <p className="ui-alert">{message}</p> : null}

      {cards.length > 0 ? (
        <>
          <section className="word-list">
            <div className="list-header">
              <span>WORD</span>
              <span>SOURCE</span>
              <span></span>
              <span></span>
            </div>
            {listRows.length === 0 ? (
              <p className="list-empty">No cards match your search.</p>
            ) : (
              listRows.map(({ card: c, originalIndex: i }) => (
                <button
                  key={`anki-${i}`}
                  type="button"
                  className="word-row"
                  onClick={() => setSelectedIndex(i)}
                  aria-label={`Open card: ${baseWordLabel(c.front)}`}
                >
                  <span className="word-cell">
                    <strong>{baseWordLabel(c.front)}</strong>
                    <small>Card {deckOrdinalByIndex.get(i) ?? i + 1}</small>
                  </span>
                  <span className="status">{c.kind ?? 'note'}</span>
                  <span className="due" />
                  <ChevronRight size={18} strokeWidth={1.8} aria-hidden />
                </button>
              ))
            )}
          </section>
          <div className="list-footer">
            <span>
              Showing {listRows.length} of {cards.length} cards
            </span>
            <span>Sorted A–Z</span>
          </div>
        </>
      ) : (
        <p className="list-empty">No cards yet — import a file or add words from Workspace.</p>
      )}

      {selectedIndex !== null && cards[selectedIndex] ? (
        <AnkiCardDetailModal
          card={cards[selectedIndex]}
          cardIndex={selectedIndex}
          deckOrdinal={deckOrdinalByIndex.get(selectedIndex)}
          totalCards={cards.length}
          mediaUrls={mediaUrls}
          onClose={() => setSelectedIndex(null)}
          onRemove={() => {
            const i = selectedIndex
            removeAt(i)
            setSelectedIndex(null)
          }}
          hasNextCard={nextCardIndexInAzOrder !== null}
          onNextCard={goToNextCardInAzOrder}
          hasPrevCard={prevCardIndexInAzOrder !== null}
          onPrevCard={goToPrevCardInAzOrder}
        />
      ) : null}
    </>
  )
}
