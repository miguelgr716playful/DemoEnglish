import { CloudSun } from 'lucide-react'
import { weatherPhrases, weatherTables } from '../data/weatherEnglish'
import { weatherSpokenGuide } from '../data/weatherSpokenGuide'
import { TopicLearningPage } from './TopicLearningPage'

export function WeatherPage() {
  return (
    <TopicLearningPage
      eyebrow="EVERYDAY ENGLISH"
      title="Weather"
      subtitle="Small talk, forecasts, and what to say when it’s boiling, pouring, or freezing."
      Icon={CloudSun}
      tables={weatherTables}
      phrases={weatherPhrases}
      searchPlaceholder="Search weather (e.g. rainy, forecast, umbrella…)"
      heroImage="/topics/weather-hero.png"
      heroImageAlt="Sky with sun, clouds, and light rain over a city skyline"
      spokenGuide={weatherSpokenGuide}
    />
  )
}
