import { useState } from 'react'
import { ArrowLeft, Images, LayoutGrid } from 'lucide-react'
import { getTopic, topicCatalog, type TopicId } from '../data/topicsCatalog'
import { TopicLearningPage } from './TopicLearningPage'
import { VocabularyPracticePage } from './VocabularyPracticePage'

type HubSelection = TopicId | 'vocabulary'

function TopicsHub({ onSelect }: { onSelect: (id: HubSelection) => void }) {
  return (
    <div className="topics-page page">
      <header className="page-topbar">
        <span className="eyebrow">EVERYDAY ENGLISH</span>
        <span className="date-label">{topicCatalog.length + 1} topics</span>
      </header>

      <section className="topic-hero">
        <div>
          <h1>
            Topics<span className="accent-dot">.</span>
          </h1>
          <p>Weather, travel, food, image vocabulary practice, and more.</p>
        </div>
        <div className="topic-hero-icon" aria-hidden>
          <LayoutGrid size={28} strokeWidth={1.8} />
        </div>
      </section>

      <ul className="topics-list">
        <li>
          <button type="button" className="topics-list-item" onClick={() => onSelect('vocabulary')}>
            <span className="topics-list-icon" aria-hidden>
              <Images size={22} strokeWidth={1.7} />
            </span>
            <span className="topics-list-text">
              <strong>Vocabulary</strong>
              <small>Public photos + study &amp; quiz practice</small>
            </span>
          </button>
        </li>
        {topicCatalog.map((topic) => {
          const Icon = topic.Icon
          return (
            <li key={topic.id}>
              <button type="button" className="topics-list-item" onClick={() => onSelect(topic.id)}>
                <span className="topics-list-icon" aria-hidden>
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <span className="topics-list-text">
                  <strong>{topic.title}</strong>
                  <small>{topic.caption}</small>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function TopicsFlow() {
  const [selection, setSelection] = useState<HubSelection | null>(null)

  if (!selection) {
    return <TopicsHub onSelect={setSelection} />
  }

  if (selection === 'vocabulary') {
    return <VocabularyPracticePage onBack={() => setSelection(null)} />
  }

  const topic = getTopic(selection)
  if (!topic) {
    return <TopicsHub onSelect={setSelection} />
  }

  const Icon = topic.Icon

  return (
    <div className="topics-detail">
      <div className="topics-back-bar page">
        <button type="button" className="topics-back" onClick={() => setSelection(null)}>
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          Topics
        </button>
      </div>
      <TopicLearningPage
        eyebrow="TOPIC"
        title={topic.title}
        subtitle={topic.caption}
        Icon={Icon}
        tables={topic.tables}
        phrases={topic.phrases}
        searchPlaceholder={topic.searchPlaceholder}
        heroImage={topic.heroImage}
        heroImageAlt={topic.heroImageAlt}
        spokenGuide={topic.spokenGuide}
      />
    </div>
  )
}
