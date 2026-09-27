/** Weather English — vocabulary, phrases, and small talk patterns. */

export type TopicTable = {
  id: string
  title: string
  note?: string
  headers: string[]
  rows: string[][]
  tags: string[]
  /** Optional illustration under /public (e.g. /topics/weather-sunny.png). */
  image?: string
  imageAlt?: string
}

export type TopicPhrase = {
  id: string
  en: string
  tip?: string
  tags: string[]
}

export const weatherTables: TopicTable[] = [
  {
    id: 'conditions',
    title: 'Weather conditions',
    note: 'It’s + adjective / noun · What’s the weather like?',
    image: '/topics/weather-sunny.png',
    imageAlt: 'Sunny weather illustration',
    headers: ['Word', 'Meaning', 'Example'],
    rows: [
      ['sunny', 'bright sun', "It's sunny — great for a walk."],
      ['cloudy', 'many clouds', "It's cloudy but dry."],
      ['overcast', 'full grey sky', "It's overcast all day."],
      ['rainy / wet', 'rain', "It's rainy — bring an umbrella."],
      ['drizzle', 'light rain', "There's a light drizzle."],
      ['stormy', 'thunder / strong wind', "It's stormy — stay indoors."],
      ['foggy / misty', 'hard to see', "It's foggy this morning."],
      ['snowy', 'snow', "It's snowy on the hills."],
      ['windy', 'strong wind', "It's windy near the coast."],
      ['humid', 'wet air', "It's humid and sticky."],
      ['dry', 'little moisture', "It's dry and dusty."],
      ['clear', 'no clouds', 'Clear skies tonight.'],
    ],
    tags: ['sunny', 'rain', 'cloudy', 'fog', 'snow', 'wind', 'storm', 'weather'],
  },
  {
    id: 'temperature',
    title: 'Temperature talk',
    note: 'Degrees · feel vs thermometer.',
    headers: ['Phrase', 'Use', 'Example'],
    rows: [
      ["It's boiling / scorching", 'very hot (informal)', "It's boiling outside."],
      ['hot / warm', 'high / pleasant', "It's warm for March."],
      ['mild', 'not extreme', "It's a mild evening."],
      ['cool / chilly', 'a bit cold', "It's chilly — grab a jacket."],
      ['cold / freezing', 'low / very low', "It's freezing this morning."],
      ['below zero', 'negative °C', "It's below zero overnight."],
      ['highs / lows', 'forecast max / min', 'Highs around 28°C.'],
      ['feels like', 'wind chill / humidity', 'It feels like 35.'],
    ],
    tags: ['hot', 'cold', 'temperature', 'degrees', 'freezing', 'boiling', 'chilly'],
  },
  {
    id: 'forecast',
    title: 'Forecast words',
    note: 'News / apps language.',
    image: '/topics/weather-rain.png',
    imageAlt: 'Rainy weather illustration',
    headers: ['Word', 'Meaning'],
    rows: [
      ['forecast', 'prediction of weather'],
      ['outlook', 'expected trend'],
      ['scattered showers', 'rain in some places'],
      ['heavy rain', 'a lot of rain'],
      ['thunderstorm', 'thunder + lightning'],
      ['heatwave', 'period of extreme heat'],
      ['cold snap', 'sudden short cold period'],
      ['uv index', 'sunburn risk'],
      ['visibility', 'how far you can see'],
      ['humidity', 'moisture in the air'],
      ['air quality', 'pollution level'],
      ['pollen count', 'allergy risk'],
    ],
    tags: ['forecast', 'shower', 'thunderstorm', 'heatwave', 'humidity', 'uv'],
  },
  {
    id: 'verbs-weather',
    title: 'Weather verbs',
    note: 'It rains · The sun is shining.',
    headers: ['Pattern', 'Example'],
    rows: [
      ['It + weather verb', "It rains a lot in autumn. / It's raining now."],
      ['The sun + shine', 'The sun is shining.'],
      ['The wind + blow', 'The wind is blowing hard.'],
      ['clear up', 'It should clear up this afternoon.'],
      ['cool down / warm up', "It'll cool down tonight."],
      ['pour (down)', "It's pouring — wait five minutes."],
      ['let up', "The rain won't let up."],
    ],
    tags: ['rain', 'shine', 'blow', 'pour', 'clear up', 'verb'],
  },
  {
    id: 'clothes-weather',
    title: 'Clothes & gear',
    note: 'What to wear / bring.',
    headers: ['Item', 'When'],
    rows: [
      ['umbrella / brolly (UK)', 'rain'],
      ['raincoat / mac (UK)', 'wet weather'],
      ['waterproof jacket', 'rain + wind'],
      ['sunscreen / sunblock', 'strong sun'],
      ['hat / cap', 'sun or cold'],
      ['scarf / gloves', 'cold'],
      ['layers', 'changing temperatures'],
      ['sunglasses', 'bright sun'],
    ],
    tags: ['umbrella', 'coat', 'sunscreen', 'clothes', 'wear'],
  },
]

export const weatherPhrases: TopicPhrase[] = [
  { id: 'w1', en: "What's the weather like today?", tip: 'Classic opener', tags: ['question', 'small talk'] },
  { id: 'w2', en: "How's the weather where you are?", tip: 'Remote / chat', tags: ['question'] },
  { id: 'w3', en: "It's a bit overcast, but it should clear up.", tip: 'Forecast softener', tags: ['cloudy'] },
  { id: 'w4', en: "Don't forget your umbrella — scattered showers this afternoon.", tip: 'Advice', tags: ['rain'] },
  { id: 'w5', en: "It feels colder than it looks because of the wind.", tip: 'feels like', tags: ['wind', 'cold'] },
  { id: 'w6', en: "We're in the middle of a heatwave.", tip: 'News style', tags: ['hot'] },
  { id: 'w7', en: 'Lovely day, isn’t it?', tip: 'Tag question · small talk', tags: ['sunny', 'tag'] },
  { id: 'w8', en: 'Nasty weather for commuting.', tip: 'Complaint (polite)', tags: ['rain', 'commute'] },
  { id: 'w9', en: "I'll WFH if the roads ice over.", tip: 'Work + weather', tags: ['cold', 'work'] },
  { id: 'w10', en: 'The forecast looks mixed — pack layers.', tip: 'Travel tip', tags: ['forecast'] },
  { id: 'w11', en: "Is it still pouring outside?", tip: 'Check before leaving', tags: ['rain'] },
  { id: 'w12', en: 'Perfect weather for a weekend hike.', tip: 'Positive', tags: ['sunny'] },
]

export function topicTableBlob(t: TopicTable): string {
  return [t.title, t.note ?? '', t.headers.join(' '), t.rows.map((r) => r.join(' ')).join(' '), t.tags.join(' ')].join(
    '\n',
  )
}

export function topicPhraseBlob(p: TopicPhrase): string {
  return [p.en, p.tip ?? '', p.tags.join(' ')].join('\n')
}
