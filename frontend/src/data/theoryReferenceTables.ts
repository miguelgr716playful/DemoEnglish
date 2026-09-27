/** Compact grammar cheat-sheet tables for the Theory page. */

export type TheoryTableRow = string[]

export type TheoryRefTable = {
  id: string
  title: string
  note?: string
  headers: string[]
  rows: TheoryTableRow[]
  /** Extra keywords so search finds the table. */
  tags: string[]
}

export const theoryReferenceTables: TheoryRefTable[] = [
  {
    id: 'subjects',
    title: 'Subject pronouns',
    note: 'Who does the action — go before the verb.',
    headers: ['Person', 'Singular', 'Plural'],
    rows: [
      ['1st', 'I', 'we'],
      ['2nd', 'you', 'you'],
      ['3rd', 'he / she / it', 'they'],
    ],
    tags: ['subject', 'subjects', 'pronoun', 'pronouns', 'I', 'you', 'he', 'she', 'it', 'we', 'they'],
  },
  {
    id: 'objects',
    title: 'Object pronouns',
    note: 'Receive the action — after the verb or preposition.',
    headers: ['Subject', 'Object', 'Example'],
    rows: [
      ['I', 'me', 'Call me after the deploy.'],
      ['you', 'you', 'I pinged you on Slack.'],
      ['he', 'him', 'Ask him for the API key.'],
      ['she', 'her', 'Send her the report.'],
      ['it', 'it', 'Fix it before standup.'],
      ['we', 'us', 'Join us on the bridge.'],
      ['they', 'them', 'Invite them to the review.'],
    ],
    tags: ['object', 'objects', 'me', 'him', 'her', 'us', 'them', 'pronoun'],
  },
  {
    id: 'possessives',
    title: 'Possessives',
    note: 'Adjective before a noun · pronoun stands alone.',
    headers: ['Subject', 'Adjective', 'Pronoun'],
    rows: [
      ['I', 'my', 'mine'],
      ['you', 'your', 'yours'],
      ['he', 'his', 'his'],
      ['she', 'her', 'hers'],
      ['it', 'its', '—'],
      ['we', 'our', 'ours'],
      ['they', 'their', 'theirs'],
    ],
    tags: ['possessive', 'possessives', 'my', 'your', 'his', 'her', 'our', 'their', 'mine', 'yours'],
  },
  {
    id: 'be',
    title: 'Be — present & past',
    note: 'am / is / are · was / were',
    headers: ['Subject', 'Present', 'Past', 'Negative (present)'],
    rows: [
      ['I', 'am', 'was', "I'm not / am not"],
      ['you / we / they', 'are', 'were', "aren't / are not"],
      ['he / she / it', 'is', 'was', "isn't / is not"],
    ],
    tags: ['be', 'am', 'is', 'are', 'was', 'were', 'auxiliary', 'copula'],
  },
  {
    id: 'do-have',
    title: 'Do & have (helpers)',
    note: 'Questions / negatives · possession or perfect tenses.',
    headers: ['Subject', 'do / does', 'have / has'],
    rows: [
      ['I / you / we / they', 'do', 'have'],
      ['he / she / it', 'does', 'has'],
    ],
    tags: ['do', 'does', 'did', 'have', 'has', 'had', 'auxiliary', 'helper'],
  },
  {
    id: 'wh-words',
    title: 'Question words',
    note: 'Wh- + auxiliary + subject + verb…',
    headers: ['Word', 'Asks about', 'Example'],
    rows: [
      ['Who', 'person (subject)', 'Who owns this repo?'],
      ['Whom', 'person (object, formal)', 'Whom did you invite?'],
      ['Whose', 'possession', 'Whose laptop is this?'],
      ['What', 'thing / action', 'What broke in prod?'],
      ['Which', 'choice', 'Which branch should we merge?'],
      ['Where', 'place', 'Where is the staging URL?'],
      ['When', 'time', 'When is the cutover?'],
      ['Why', 'reason', 'Why did the job fail?'],
      ['How', 'manner / degree', 'How long is the outage?'],
    ],
    tags: ['question', 'questions', 'wh', 'who', 'what', 'where', 'when', 'why', 'how', 'which', 'whose'],
  },
  {
    id: 'time-markers',
    title: 'Time markers (tense hints)',
    note: 'Common signals — not strict rules.',
    headers: ['Often with…', 'Markers'],
    rows: [
      ['Present simple', 'usually, always, every day, on Mondays'],
      ['Present continuous', 'now, right now, currently, at the moment'],
      ['Past simple', 'yesterday, last week, in 2020, ago'],
      ['Present perfect', 'already, yet, just, ever, never, since, for'],
      ['Past continuous', 'while, when (+ short past), at 3 p.m. yesterday'],
      ['Future (will)', 'tomorrow, next week, soon, in an hour'],
      ['Going to', 'tonight, this afternoon, planned / evidence'],
    ],
    tags: ['time', 'markers', 'adverbs', 'already', 'yet', 'since', 'for', 'yesterday', 'tomorrow'],
  },
]

export function theoryTableSearchBlob(table: TheoryRefTable): string {
  return [
    table.title,
    table.note ?? '',
    table.headers.join(' '),
    table.rows.map((r) => r.join(' ')).join(' '),
    table.tags.join(' '),
  ].join('\n')
}
