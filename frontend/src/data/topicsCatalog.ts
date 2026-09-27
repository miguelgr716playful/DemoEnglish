import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  CloudSun,
  Dumbbell,
  HeartPulse,
  Palmtree,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react'
import type { TopicPhrase, TopicTable } from './weatherEnglish'
import { weatherPhrases, weatherTables } from './weatherEnglish'
import { vacationPhrases, vacationTables } from './vacationsEnglish'
import {
  foodPhrases,
  foodTables,
  healthPhrases,
  healthTables,
  shoppingPhrases,
  shoppingTables,
  sportsPhrases,
  sportsTables,
  workPhrases,
  workTables,
} from './extraTopicsEnglish'

export type TopicId =
  | 'weather'
  | 'vacations'
  | 'food'
  | 'shopping'
  | 'health'
  | 'work'
  | 'sports'

export type TopicDefinition = {
  id: TopicId
  title: string
  caption: string
  Icon: LucideIcon
  tables: TopicTable[]
  phrases: TopicPhrase[]
  searchPlaceholder: string
  heroImage?: string
  heroImageAlt?: string
}

export const topicCatalog: TopicDefinition[] = [
  {
    id: 'weather',
    title: 'Weather',
    caption: 'Forecasts, small talk, and what to wear',
    Icon: CloudSun,
    tables: weatherTables,
    phrases: weatherPhrases,
    searchPlaceholder: 'Search weather (e.g. rainy, forecast…)',
    heroImage: '/topics/weather-hero.png',
    heroImageAlt: 'Sky with sun, clouds, and light rain',
  },
  {
    id: 'vacations',
    title: 'Vacations',
    caption: 'Trips, hotels, airports, and time off',
    Icon: Palmtree,
    tables: vacationTables,
    phrases: vacationPhrases,
    searchPlaceholder: 'Search travel (e.g. hotel, flight, PTO…)',
    heroImage: '/topics/vacations-hero.png',
    heroImageAlt: 'Travel suitcase on a coastal terrace',
  },
  {
    id: 'food',
    title: 'Food',
    caption: 'Restaurants, ordering, and meals',
    Icon: UtensilsCrossed,
    tables: foodTables,
    phrases: foodPhrases,
    searchPlaceholder: 'Search food (e.g. menu, bill, spicy…)',
  },
  {
    id: 'shopping',
    title: 'Shopping',
    caption: 'Stores, sizes, sales, and refunds',
    Icon: ShoppingBag,
    tables: shoppingTables,
    phrases: shoppingPhrases,
    searchPlaceholder: 'Search shopping (e.g. size, refund…)',
  },
  {
    id: 'health',
    title: 'Health',
    caption: 'Symptoms, pharmacy, and appointments',
    Icon: HeartPulse,
    tables: healthTables,
    phrases: healthPhrases,
    searchPlaceholder: 'Search health (e.g. fever, pharmacy…)',
  },
  {
    id: 'work',
    title: 'Work',
    caption: 'Meetings, deadlines, and office English',
    Icon: Briefcase,
    tables: workTables,
    phrases: workPhrases,
    searchPlaceholder: 'Search work (e.g. standup, deadline…)',
  },
  {
    id: 'sports',
    title: 'Sports',
    caption: 'Games, scores, and gym talk',
    Icon: Dumbbell,
    tables: sportsTables,
    phrases: sportsPhrases,
    searchPlaceholder: 'Search sports (e.g. match, score, gym…)',
  },
]

export function getTopic(id: string): TopicDefinition | undefined {
  return topicCatalog.find((t) => t.id === id)
}
