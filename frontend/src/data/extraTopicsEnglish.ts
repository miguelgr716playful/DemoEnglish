/** Extra everyday-English topics (food, shopping, health, work, sports). */

import type { TopicPhrase, TopicTable } from './weatherEnglish'

export const foodTables: TopicTable[] = [
  {
    id: 'meals',
    title: 'Meals & places',
    headers: ['Word', 'Meaning'],
    rows: [
      ['breakfast / lunch / dinner', 'morning / midday / evening meal'],
      ['snack', 'small food between meals'],
      ['takeaway / takeout', 'food to go'],
      ['restaurant / cafe', 'sit-down places'],
      ['menu / bill / check', 'list of dishes / payment'],
      ['reservation / book a table', 'reserve a seat'],
      ['starter / main / dessert', 'courses'],
      ['spicy / bland / filling', 'taste / how heavy'],
    ],
    tags: ['food', 'meal', 'restaurant', 'menu'],
  },
  {
    id: 'ordering',
    title: 'Ordering food',
    headers: ['Phrase', 'Use'],
    rows: [
      ["I'd like the pasta, please.", 'order'],
      ['Could I get this without onions?', 'change order'],
      ['Is this dish vegetarian?', 'allergy / diet'],
      ['Can we have the bill, please?', 'pay'],
      ['Does this come with fries?', 'side'],
      ["I'm allergic to nuts.", 'allergy'],
    ],
    tags: ['order', 'bill', 'allergic', 'vegetarian'],
  },
]

export const foodPhrases: TopicPhrase[] = [
  { id: 'f1', en: "What's good here?", tip: 'Ask for a recommendation', tags: ['restaurant'] },
  { id: 'f2', en: "I'll have the same, please.", tip: 'Match a friend', tags: ['order'] },
  { id: 'f3', en: 'Could you make it less spicy?', tip: 'Preference', tags: ['spicy'] },
  { id: 'f4', en: "I'm full, thanks — just the bill.", tip: 'Finish', tags: ['bill'] },
]

export const shoppingTables: TopicTable[] = [
  {
    id: 'shop-types',
    title: 'Shops & money',
    headers: ['Word', 'Meaning'],
    rows: [
      ['store / shop', 'place to buy things'],
      ['mall / shopping centre', 'many stores together'],
      ['checkout / till', 'pay point'],
      ['receipt / refund / exchange', 'proof / money back / swap'],
      ['sale / discount / bargain', 'cheaper prices'],
      ['size / fitting room', 'clothes try-on'],
      ['cash / card / contactless', 'payment methods'],
      ['in stock / out of stock', 'available or not'],
    ],
    tags: ['shop', 'sale', 'refund', 'size'],
  },
  {
    id: 'shop-phrases',
    title: 'In the store',
    headers: ['Phrase', 'Use'],
    rows: [
      ["I'm just browsing, thanks.", 'polite decline'],
      ['Do you have this in a medium?', 'size'],
      ['Where are the fitting rooms?', 'try on'],
      ['Can I get a refund without the receipt?', 'problem'],
      ['Is this on sale?', 'price'],
    ],
    tags: ['browsing', 'fitting', 'sale'],
  },
]

export const shoppingPhrases: TopicPhrase[] = [
  { id: 's1', en: "Excuse me, where can I find the chargers?", tip: 'Ask for a section', tags: ['find'] },
  { id: 's2', en: "I'll take it.", tip: 'Buy', tags: ['buy'] },
  { id: 's3', en: 'Do you price-match?', tip: 'Ask about policy', tags: ['price'] },
  { id: 's4', en: "Could I try these on?", tip: 'Clothes', tags: ['fitting'] },
]

export const healthTables: TopicTable[] = [
  {
    id: 'symptoms',
    title: 'Symptoms & care',
    headers: ['Word', 'Meaning'],
    rows: [
      ['fever / cough / sore throat', 'common symptoms'],
      ['headache / stomachache', 'pain locations'],
      ['dizzy / nauseous / exhausted', 'how you feel'],
      ['pharmacy / prescription', 'medicine place / doctor order'],
      ['appointment / GP / ER', 'visit / doctor / emergency'],
      ['allergy / vaccine / checkup', 'health admin'],
    ],
    tags: ['health', 'fever', 'pharmacy', 'appointment'],
  },
  {
    id: 'health-phrases',
    title: 'At the doctor / pharmacy',
    headers: ['Phrase', 'Use'],
    rows: [
      ["I've had a fever since yesterday.", 'explain'],
      ["I'm allergic to penicillin.", 'important'],
      ['How often should I take this?', 'medicine'],
      ["I'd like to book an appointment.", 'schedule'],
    ],
    tags: ['doctor', 'medicine', 'allergic'],
  },
]

export const healthPhrases: TopicPhrase[] = [
  { id: 'h1', en: "I don't feel well — I might call in sick.", tip: 'Work', tags: ['sick'] },
  { id: 'h2', en: 'Is this contagious?', tip: 'Ask', tags: ['illness'] },
  { id: 'h3', en: 'Could I get something for a headache?', tip: 'Pharmacy', tags: ['pharmacy'] },
]

export const workTables: TopicTable[] = [
  {
    id: 'work-routine',
    title: 'Work & meetings',
    headers: ['Word', 'Meaning'],
    rows: [
      ['standup / sync / 1:1', 'meeting types'],
      ['deadline / backlog / sprint', 'delivery words'],
      ['OOO / PTO / on-call', 'availability'],
      ['handoff / follow-up / action item', 'next steps'],
      ['blocker / dependency', 'what stops progress'],
      ['remote / hybrid / onsite', 'where you work'],
    ],
    tags: ['work', 'meeting', 'deadline', 'ooo'],
  },
  {
    id: 'work-phrases',
    title: 'Office English',
    headers: ['Phrase', 'Use'],
    rows: [
      ["I'll ping you after the standup.", 'follow-up'],
      ["I'm blocked on the API key.", 'blocker'],
      ['Can we push the deadline to Friday?', 'negotiate'],
      ["Let's take this offline.", 'end debate in meeting'],
    ],
    tags: ['standup', 'deadline', 'offline'],
  },
]

export const workPhrases: TopicPhrase[] = [
  { id: 'wk1', en: "Sorry, I'm in back-to-backs until 3.", tip: 'Busy calendar', tags: ['meeting'] },
  { id: 'wk2', en: "I'll send a recap after the call.", tip: 'Promise', tags: ['recap'] },
  { id: 'wk3', en: 'Who owns this ticket?', tip: 'Ownership', tags: ['ticket'] },
]

export const sportsTables: TopicTable[] = [
  {
    id: 'sports-basics',
    title: 'Sports basics',
    headers: ['Word', 'Meaning'],
    rows: [
      ['match / game / tournament', 'events'],
      ['team / coach / fan', 'people'],
      ['score / win / lose / draw', 'results'],
      ['workout / gym / warm-up', 'training'],
      ['injury / bench / substitute', 'players / health'],
    ],
    tags: ['sport', 'match', 'score', 'gym'],
  },
  {
    id: 'sports-phrases',
    title: 'Talking about sports',
    headers: ['Phrase', 'Use'],
    rows: [
      ['Did you catch the game last night?', 'small talk'],
      ['What was the final score?', 'result'],
      ["I'm going for a run after work.", 'plans'],
      ["She's really competitive.", 'opinion'],
    ],
    tags: ['game', 'score', 'run'],
  },
]

export const sportsPhrases: TopicPhrase[] = [
  { id: 'sp1', en: 'Who are you rooting for?', tip: 'Support a team', tags: ['fan'] },
  { id: 'sp2', en: "That was a close match.", tip: 'Comment', tags: ['match'] },
  { id: 'sp3', en: "I skipped the gym this week.", tip: 'Honesty', tags: ['gym'] },
]
