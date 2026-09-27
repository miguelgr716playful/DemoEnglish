import { Palmtree } from 'lucide-react'
import { vacationPhrases, vacationTables } from '../data/vacationsEnglish'
import { TopicLearningPage } from './TopicLearningPage'

export function VacationsPage() {
  return (
    <TopicLearningPage
      eyebrow="EVERYDAY ENGLISH"
      title="Vacations"
      subtitle="Trips, hotels, airports, and how to talk about time off at work."
      Icon={Palmtree}
      tables={vacationTables}
      phrases={vacationPhrases}
      searchPlaceholder="Search travel (e.g. hotel, flight, PTO, passport…)"
    />
  )
}
