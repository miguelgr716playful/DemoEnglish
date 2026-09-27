import {
  curatedEnglishVideoTopics,
  type CuratedVideoPick,
  type CuratedVideoTopic,
} from './curatedEnglishVideos'
import {
  verbTenseTheoryBlocks,
  verbTenseTheoryExtra,
  verbTenseTheoryFeaturedVideo,
} from './verbTenseTheory'

export type VideoLibraryPick = CuratedVideoPick

export type VideoLibraryCategory = CuratedVideoTopic

function dedupePicks(picks: VideoLibraryPick[]): VideoLibraryPick[] {
  const seen = new Set<string>()
  const out: VideoLibraryPick[] = []
  for (const pick of picks) {
    if (seen.has(pick.videoId)) continue
    seen.add(pick.videoId)
    out.push(pick)
  }
  return out
}

/** All curated + tense-theory YouTube lessons, grouped for the Videos screen. */
export function buildVideoLibrary(): VideoLibraryCategory[] {
  const tensePicks: VideoLibraryPick[] = [
    {
      videoId: verbTenseTheoryFeaturedVideo.videoId,
      title: verbTenseTheoryFeaturedVideo.label,
      hint: 'Overview of the main English verb tenses.',
    },
    ...verbTenseTheoryBlocks.map((b) => ({
      videoId: b.youtube.videoId,
      title: b.youtube.label?.trim() || `${b.title} — video lesson`,
      hint: b.title,
    })),
    ...verbTenseTheoryExtra
      .filter((x) => x.youtube)
      .map((x) => ({
        videoId: x.youtube!.videoId,
        title: x.youtube!.label?.trim() || x.title,
        hint: x.title,
      })),
  ]

  return [
    ...curatedEnglishVideoTopics,
    {
      id: 'verb-tenses',
      heading: 'Verb tenses & grammar',
      description:
        'Lessons linked from tense theory: overview, each tense, modals, passive, and conditionals.',
      picks: dedupePicks(tensePicks),
    },
  ]
}

export const videoLibraryCategories: VideoLibraryCategory[] = buildVideoLibrary()

export function countLibraryVideos(categories: VideoLibraryCategory[] = videoLibraryCategories): number {
  const ids = new Set<string>()
  for (const c of categories) {
    for (const p of c.picks) ids.add(p.videoId)
  }
  return ids.size
}
