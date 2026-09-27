/** Practice material for spoken fluency (shadowing, free speak, chunks, expand). */

export type FluencyModeId = 'shadow' | 'speak' | 'chunks' | 'expand'

export type ShadowLine = {
  id: string
  topic: string
  text: string
  tip: string
}

export type SpeakPrompt = {
  id: string
  title: string
  prompt: string
  starters: string[]
}

export type FluencyChunk = {
  id: string
  phrase: string
  use: string
  example: string
}

export type ExpandDrill = {
  id: string
  steps: string[]
}

export const fluencyModes: { id: FluencyModeId; label: string; caption: string }[] = [
  { id: 'shadow', label: 'Shadow', caption: 'Listen, then speak with the voice' },
  { id: 'speak', label: 'Speak', caption: 'Keep talking for 30–60 seconds' },
  { id: 'chunks', label: 'Chunks', caption: 'Ready-made phrases for flow' },
  { id: 'expand', label: 'Expand', caption: 'Grow a short idea into a full answer' },
]

export const shadowLines: ShadowLine[] = [
  {
    id: 'sh1',
    topic: 'Daily',
    text: "I've been pretty busy lately, but I'm trying to make more time for English practice.",
    tip: 'Link “pretty busy” smoothly — don’t pause between the words.',
  },
  {
    id: 'sh2',
    topic: 'Opinion',
    text: "To be honest, I think the most important thing is just to keep speaking every day.",
    tip: 'Say “to be honest” as one chunk, then take a tiny breath.',
  },
  {
    id: 'sh3',
    topic: 'Work',
    text: "What we usually do is review the requirements first, and then we start building a small prototype.",
    tip: 'Stress “usually” and “first” — they guide the listener.',
  },
  {
    id: 'sh4',
    topic: 'Story',
    text: "So yesterday I was working on a bug, and it took me longer than I expected to figure it out.",
    tip: 'Use “so” to start naturally, like in real conversation.',
  },
  {
    id: 'sh5',
    topic: 'Clarify',
    text: "What I mean is, even if you make mistakes, people can still understand you.",
    tip: '“What I mean is” buys you time while you organize the idea.',
  },
  {
    id: 'sh6',
    topic: 'Tech',
    text: "I'm not completely sure, but I believe we can fix it by updating the API and testing again.",
    tip: 'Softening phrases (“I’m not completely sure”) sound natural and fluent.',
  },
  {
    id: 'sh7',
    topic: 'Compare',
    text: "On the one hand it's faster, but on the other hand it might be harder to maintain later.",
    tip: 'Practice the pair “on the one hand / on the other hand” until it feels automatic.',
  },
  {
    id: 'sh8',
    topic: 'Plan',
    text: "My plan for this week is to watch one short video a day and then summarize it out loud.",
    tip: 'Keep a steady rhythm — don’t rush the end of the sentence.',
  },
  {
    id: 'sh9',
    topic: 'Agree',
    text: "Yeah, that makes sense. I was thinking the same thing earlier today.",
    tip: 'Short reactions like “yeah, that makes sense” keep conversation flowing.',
  },
  {
    id: 'sh10',
    topic: 'Problem',
    text: "The tricky part is explaining the idea clearly without getting stuck on vocabulary.",
    tip: 'If you get stuck, paraphrase: “the hard part is…” / “what’s difficult is…”',
  },
]

export const speakPrompts: SpeakPrompt[] = [
  {
    id: 'sp1',
    title: 'Your day',
    prompt: 'Describe your day so far — what you did, what you’re doing now, and what’s next.',
    starters: ['So far today…', 'Right now I’m…', 'Later I’m going to…'],
  },
  {
    id: 'sp2',
    title: 'A recent problem',
    prompt: 'Talk about a problem you solved recently. What happened, what you tried, and how it ended.',
    starters: ['The other day…', 'At first…', 'In the end…'],
  },
  {
    id: 'sp3',
    title: 'Learn English',
    prompt: 'Explain how you practice English and what you want to improve next month.',
    starters: ['I’ve been practicing by…', 'What helps me most is…', 'Next month I want to…'],
  },
  {
    id: 'sp4',
    title: 'Favorite tool',
    prompt: 'Describe a tool or app you use for work or study. Why do you like it?',
    starters: ['One tool I use a lot is…', 'The reason I like it is…', 'Without it I would…'],
  },
  {
    id: 'sp5',
    title: 'Give advice',
    prompt: 'A friend wants to become more fluent. Give them three practical tips.',
    starters: ['First of all…', 'Another thing I’d suggest is…', 'And finally…'],
  },
  {
    id: 'sp6',
    title: 'Weekend plan',
    prompt: 'Talk about your ideal weekend. Include morning, afternoon, and evening.',
    starters: ['In the morning I’d…', 'Then in the afternoon…', 'At night…'],
  },
  {
    id: 'sp7',
    title: 'Disagree politely',
    prompt: 'Someone says “grammar is more important than speaking.” Respond and explain your view.',
    starters: ['I see your point, but…', 'I partly agree…', 'From my experience…'],
  },
  {
    id: 'sp8',
    title: 'Teach something',
    prompt: 'Teach a simple concept from your job or hobby as if the listener is a beginner.',
    starters: ['Basically…', 'The key idea is…', 'A simple example is…'],
  },
]

export const fluencyChunks: FluencyChunk[] = [
  {
    id: 'c1',
    phrase: 'What I mean is…',
    use: 'Clarify or rephrase',
    example: 'What I mean is, we need more time to test it.',
  },
  {
    id: 'c2',
    phrase: 'The thing is…',
    use: 'Introduce the real point',
    example: 'The thing is, we don’t have enough data yet.',
  },
  {
    id: 'c3',
    phrase: 'Let me think for a second…',
    use: 'Buy time without freezing',
    example: 'Let me think for a second… okay, here’s my idea.',
  },
  {
    id: 'c4',
    phrase: 'As I was saying…',
    use: 'Return after an interruption',
    example: 'As I was saying, the deadline is Friday.',
  },
  {
    id: 'c5',
    phrase: 'For example…',
    use: 'Add a concrete detail',
    example: 'For example, I practice by summarizing videos.',
  },
  {
    id: 'c6',
    phrase: 'In other words…',
    use: 'Say it more simply',
    example: 'In other words, we should start smaller.',
  },
  {
    id: 'c7',
    phrase: 'That reminds me…',
    use: 'Connect to a related idea',
    example: 'That reminds me of a bug we had last month.',
  },
  {
    id: 'c8',
    phrase: 'To be honest…',
    use: 'Share a candid opinion',
    example: 'To be honest, I need more speaking practice.',
  },
  {
    id: 'c9',
    phrase: 'On top of that…',
    use: 'Add another reason',
    example: 'On top of that, it’s easier to remember later.',
  },
  {
    id: 'c10',
    phrase: 'At the end of the day…',
    use: 'Give your bottom line',
    example: 'At the end of the day, communication matters most.',
  },
  {
    id: 'c11',
    phrase: 'I’m not 100% sure, but…',
    use: 'Answer without freezing',
    example: 'I’m not 100% sure, but I think it depends on the user.',
  },
  {
    id: 'c12',
    phrase: 'Does that make sense?',
    use: 'Check understanding',
    example: 'So we’d ship a prototype first. Does that make sense?',
  },
]

export const expandDrills: ExpandDrill[] = [
  {
    id: 'ex1',
    steps: [
      'I study English.',
      'I study English every evening.',
      'I study English every evening after work.',
      'I study English every evening after work because I want to speak more confidently in meetings.',
    ],
  },
  {
    id: 'ex2',
    steps: [
      'I fixed a bug.',
      'I fixed a difficult bug yesterday.',
      'I fixed a difficult bug yesterday in the payment service.',
      'I fixed a difficult bug yesterday in the payment service by checking the logs and writing a small test.',
    ],
  },
  {
    id: 'ex3',
    steps: [
      'I like this app.',
      'I like this app for vocabulary practice.',
      'I like this app for vocabulary practice because the images help me remember words.',
      'I like this app for vocabulary practice because the images help me remember words, and I can also listen to the explanations.',
    ],
  },
  {
    id: 'ex4',
    steps: [
      'We need a plan.',
      'We need a clear plan for the release.',
      'We need a clear plan for the release next month.',
      'We need a clear plan for the release next month so the whole team knows what to prioritize.',
    ],
  },
  {
    id: 'ex5',
    steps: [
      'I’m nervous.',
      'I’m a bit nervous about speaking.',
      'I’m a bit nervous about speaking in English with strangers.',
      'I’m a bit nervous about speaking in English with strangers, but I improve every time I try.',
    ],
  },
  {
    id: 'ex6',
    steps: [
      'It was hard.',
      'It was hard at the beginning.',
      'It was hard at the beginning to keep a daily habit.',
      'It was hard at the beginning to keep a daily habit, so I started with just five minutes of speaking out loud.',
    ],
  },
]

export const speakDurations = [30, 45, 60] as const
