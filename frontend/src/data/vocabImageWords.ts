/** Curated vocabulary for image-based practice (Wikipedia summary thumbnails). */

export type VocabCategoryId = 'animals' | 'food' | 'objects' | 'places' | 'nature' | 'transport'

export type VocabWord = {
  /** Display / answer word */
  word: string
  /** Wikipedia page title if different from word */
  wikiTitle?: string
  hint?: string
}

export type VocabCategory = {
  id: VocabCategoryId
  title: string
  caption: string
  words: VocabWord[]
}

export const vocabCategories: VocabCategory[] = [
  {
    id: 'animals',
    title: 'Animals',
    caption: 'Common animals',
    words: [
      { word: 'dog', hint: 'pet that barks' },
      { word: 'cat', hint: 'pet that meows' },
      { word: 'bird', hint: 'has feathers' },
      { word: 'horse', hint: 'you can ride it' },
      { word: 'fish', hint: 'lives in water' },
      { word: 'elephant', hint: 'very large, trunk' },
      { word: 'lion', hint: 'big cat, mane' },
      { word: 'tiger', hint: 'striped big cat' },
      { word: 'bear', hint: 'large forest animal' },
      { word: 'rabbit', hint: 'long ears' },
      { word: 'butterfly', hint: 'insect with colorful wings' },
      { word: 'penguin', hint: 'bird that cannot fly well' },
    ],
  },
  {
    id: 'food',
    title: 'Food',
    caption: 'Things you eat & drink',
    words: [
      { word: 'apple', hint: 'red or green fruit' },
      { word: 'banana', hint: 'yellow fruit' },
      { word: 'bread', hint: 'baked loaf' },
      { word: 'cheese', hint: 'dairy product' },
      { word: 'egg', hint: 'from a chicken' },
      { word: 'rice', hint: 'common grain' },
      { word: 'pizza', hint: 'Italian flatbread meal' },
      { word: 'coffee', hint: 'hot drink' },
      { word: 'orange (fruit)', wikiTitle: 'Orange (fruit)', hint: 'citrus fruit' },
      { word: 'strawberry', hint: 'red berry' },
      { word: 'tomato', hint: 'red, used in salads' },
      { word: 'carrot', hint: 'orange vegetable' },
    ],
  },
  {
    id: 'objects',
    title: 'Objects',
    caption: 'Everyday things',
    words: [
      { word: 'book', hint: 'pages to read' },
      { word: 'chair', hint: 'you sit on it' },
      { word: 'table', hint: 'furniture with a flat top' },
      { word: 'phone', wikiTitle: 'Telephone', hint: 'device to call people' },
      { word: 'computer', hint: 'laptop or desktop' },
      { word: 'key', wikiTitle: 'Key (lock)', hint: 'opens a lock' },
      { word: 'watch', wikiTitle: 'Watch', hint: 'tells time on your wrist' },
      { word: 'backpack', hint: 'bag for your back' },
      { word: 'umbrella', hint: 'for rain' },
      { word: 'scissors', hint: 'cut paper' },
      { word: 'bottle', hint: 'holds liquid' },
      { word: 'lamp', hint: 'gives light' },
    ],
  },
  {
    id: 'places',
    title: 'Places',
    caption: 'Where things happen',
    words: [
      { word: 'school', hint: 'place for students' },
      { word: 'hospital', hint: 'place for medical care' },
      { word: 'airport', hint: 'planes take off here' },
      { word: 'library', hint: 'borrow books' },
      { word: 'museum', hint: 'art and history exhibits' },
      { word: 'park', wikiTitle: 'Park', hint: 'green public space' },
      { word: 'beach', hint: 'sand and sea' },
      { word: 'bridge', hint: 'crosses a river' },
      { word: 'kitchen', hint: 'cook here' },
      { word: 'supermarket', hint: 'buy groceries' },
      { word: 'restaurant', hint: 'eat out' },
      { word: 'stadium', hint: 'sports events' },
    ],
  },
  {
    id: 'nature',
    title: 'Nature',
    caption: 'Outdoors & weather things',
    words: [
      { word: 'tree', hint: 'has leaves and trunk' },
      { word: 'flower', hint: 'colorful plant part' },
      { word: 'mountain', hint: 'very high land' },
      { word: 'river', hint: 'flowing water' },
      { word: 'ocean', hint: 'huge body of salt water' },
      { word: 'cloud', hint: 'in the sky' },
      { word: 'rainbow', hint: 'colors after rain' },
      { word: 'sun', wikiTitle: 'Sun', hint: 'star that lights Earth' },
      { word: 'moon', wikiTitle: 'Moon', hint: 'seen at night' },
      { word: 'forest', hint: 'many trees' },
      { word: 'island', hint: 'land in water' },
      { word: 'volcano', hint: 'can erupt' },
    ],
  },
  {
    id: 'transport',
    title: 'Transport',
    caption: 'Ways to travel',
    words: [
      { word: 'car', hint: 'road vehicle' },
      { word: 'bus', hint: 'public road transport' },
      { word: 'train', hint: 'runs on tracks' },
      { word: 'airplane', wikiTitle: 'Airplane', hint: 'flies in the sky' },
      { word: 'bicycle', hint: 'two wheels, pedals' },
      { word: 'motorcycle', hint: 'two wheels, engine' },
      { word: 'boat', hint: 'on water' },
      { word: 'helicopter', hint: 'rotors, flies' },
      { word: 'subway', wikiTitle: 'Rapid transit', hint: 'underground train' },
      { word: 'taxi', hint: 'pay for a ride' },
      { word: 'truck', hint: 'carries cargo' },
      { word: 'scooter', hint: 'small two-wheeler' },
    ],
  },
]

export function getVocabCategory(id: string): VocabCategory | undefined {
  return vocabCategories.find((c) => c.id === id)
}
