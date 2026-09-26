import JSZip from 'jszip'

function mimeForFilename(filename: string): string {
  const ext = filename.split(/[#?]/)[0]?.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'mp3') return 'audio/mpeg'
  if (ext === 'ogg' || ext === 'oga') return 'audio/ogg'
  if (ext === 'wav') return 'audio/wav'
  if (ext === 'm4a' || ext === 'aac') return 'audio/mp4'
  if (ext === 'opus') return 'audio/opus'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'svg') return 'image/svg+xml'
  if (ext === 'bmp') return 'image/bmp'
  if (ext === 'avif') return 'image/avif'
  return 'application/octet-stream'
}

async function fileStartsWithZipMagic(file: File): Promise<boolean> {
  if (file.size < 4) return false
  const b = new Uint8Array(await file.slice(0, 4).arrayBuffer())
  return b[0] === 0x50 && b[1] === 0x4b // "PK" — ZIP / .apkg
}

function findZipEntry(zip: JSZip, id: string): JSZip.JSZipObject | null {
  let fileEntry = zip.file(id)
  if (fileEntry) return fileEntry
  const matchPath = Object.keys(zip.files).find(
    (p) => !zip.files[p].dir && (p === id || p.replace(/\\/g, '/').endsWith(`/${id}`)),
  )
  return matchPath ? zip.file(matchPath) : null
}

/**
 * Opens an .apkg once and expands media files only when requested (per card),
 * instead of decoding every sound/image into blob URLs at import time.
 */
export class ApkgMediaStore {
  private zip: JSZip | null
  /** Logical Anki media name → zip entry id (from the `media` JSON map). */
  private readonly entryIdByLogical = new Map<string, string>()
  private readonly urlCache = new Map<string, string>()
  private readonly inflight = new Map<string, Promise<string | undefined>>()

  private constructor(zip: JSZip, mapping: Record<string, string>) {
    this.zip = zip
    for (const [id, filename] of Object.entries(mapping)) {
      if (typeof filename === 'string' && filename.trim()) {
        this.entryIdByLogical.set(filename, id)
      }
    }
  }

  static async open(apkgFile: File): Promise<ApkgMediaStore> {
    if (!apkgFile.name.toLowerCase().endsWith('.apkg')) {
      return new ApkgMediaStore(new JSZip(), {})
    }

    if (!(await fileStartsWithZipMagic(apkgFile))) {
      throw new Error(
        'This file is not a valid .apkg ZIP (missing PK header). The download may be an HTML/text error instead of the package — check Vite preload (DEMOENGLISH_PRELOAD_APKG_PATH) or your network.',
      )
    }

    let zip: JSZip
    try {
      zip = await JSZip.loadAsync(apkgFile)
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e)
      throw new Error(
        `Could not open as ZIP (.apkg): ${detail}. If you use dev preload, ensure DEMOENGLISH_PRELOAD_APKG_PATH points to a real file and run Vite from the frontend folder (or keep .env next to vite.config.ts).`,
      )
    }

    let mediaEntry = zip.file('media')
    if (!mediaEntry) {
      const path = Object.keys(zip.files).find(
        (p) => !zip.files[p].dir && p.replace(/\\/g, '/').split('/').pop()?.toLowerCase() === 'media',
      )
      if (path) mediaEntry = zip.file(path)
    }

    let mapping: Record<string, string> = {}
    if (mediaEntry) {
      try {
        mapping = JSON.parse(await mediaEntry.async('string')) as Record<string, string>
      } catch {
        mapping = {}
      }
    }

    return new ApkgMediaStore(zip, mapping)
  }

  /** Snapshot of URLs already decoded (for React state / components that read a Map). */
  snapshotUrls(): Map<string, string> {
    return new Map(this.urlCache)
  }

  async ensure(logicalName: string): Promise<string | undefined> {
    const key = logicalName.trim()
    if (!key || !this.zip) return undefined

    const cached = findApkgMediaUrl(key, this.urlCache)
    if (cached) return cached

    const existing = this.inflight.get(key)
    if (existing) return existing

    const task = this.decodeOne(key)
    this.inflight.set(key, task)
    try {
      return await task
    } finally {
      this.inflight.delete(key)
    }
  }

  async ensureMany(names: Iterable<string>): Promise<Map<string, string>> {
    const unique = [...new Set([...names].map((n) => n.trim()).filter(Boolean))]
    await Promise.all(unique.map((n) => this.ensure(n)))
    return this.snapshotUrls()
  }

  dispose(): void {
    revokeMediaUrls(this.urlCache)
    this.urlCache.clear()
    this.entryIdByLogical.clear()
    this.inflight.clear()
    this.zip = null
  }

  private resolveEntryId(logicalName: string): string | undefined {
    if (this.entryIdByLogical.has(logicalName)) return this.entryIdByLogical.get(logicalName)
    const tl = logicalName.toLowerCase()
    for (const [name, id] of this.entryIdByLogical) {
      if (name.toLowerCase() === tl) return id
    }
    const seg = logicalName.split(/[/\\]/).pop()
    if (!seg) return undefined
    if (this.entryIdByLogical.has(seg)) return this.entryIdByLogical.get(seg)
    const sl = seg.toLowerCase()
    for (const [name, id] of this.entryIdByLogical) {
      const kb = name.split(/[/\\]/).pop()
      if (kb?.toLowerCase() === sl) return id
    }
    return undefined
  }

  private async decodeOne(logicalName: string): Promise<string | undefined> {
    const zip = this.zip
    if (!zip) return undefined

    const entryId = this.resolveEntryId(logicalName)
    if (!entryId) return undefined

    const fileEntry = findZipEntry(zip, entryId)
    if (!fileEntry) return undefined

    const blob = await fileEntry.async('blob')
    const mime = mimeForFilename(logicalName)
    const typed = blob.type && blob.type !== 'application/octet-stream' ? blob : new Blob([blob], { type: mime })
    const url = URL.createObjectURL(typed)
    const canonical =
      [...this.entryIdByLogical.entries()].find(([, id]) => id === entryId)?.[0] ?? logicalName
    const prev = this.urlCache.get(canonical)
    if (prev) URL.revokeObjectURL(prev)
    this.urlCache.set(canonical, url)
    return url
  }
}

/** Resolves a logical media filename (from <c>[sound:…]</c> / <c>[img:…]</c> or Anki <c>src</c>) to a blob URL from the package. */
export function findApkgMediaUrl(logicalName: string, map: ReadonlyMap<string, string>): string | undefined {
  const t = logicalName.trim()
  if (map.has(t)) return map.get(t)
  const tl = t.toLowerCase()
  for (const [k, v] of map) {
    if (k.toLowerCase() === tl) return v
  }
  const seg = t.split(/[/\\]/).pop()
  if (!seg) return undefined
  if (map.has(seg)) return map.get(seg)
  const sl = seg.toLowerCase()
  for (const [k, v] of map) {
    const kb = k.split(/[/\\]/).pop()
    if (kb?.toLowerCase() === sl) return v
  }
  return undefined
}

export function revokeMediaUrls(map: ReadonlyMap<string, string>): void {
  for (const u of map.values()) URL.revokeObjectURL(u)
}
