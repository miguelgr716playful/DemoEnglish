/** CEFR-style online school curriculum (A1–B2). */

export type CefrLevelId = 'a1' | 'a2' | 'b1' | 'b2'

export type LessonVocab = {
  word: string
  meaning: string
  example: string
}

export type LessonQuizItem = {
  question: string
  options: string[]
  answerIndex: number
}

export type SchoolLesson = {
  id: string
  title: string
  minutes: number
  goals: string[]
  vocab: LessonVocab[]
  grammarTitle: string
  grammarNote: string
  grammarExamples: string[]
  dialogueTitle: string
  dialogue: string
  practice: string[]
  quiz: LessonQuizItem[]
}

export type SchoolLevel = {
  id: CefrLevelId
  label: string
  cefr: string
  title: string
  caption: string
  color: string
  lessons: SchoolLesson[]
}

export const schoolLevels: SchoolLevel[] = [
  {
    id: 'a1',
    label: 'A1',
    cefr: 'Beginner',
    title: 'First steps',
    caption: 'Greetings, people, daily life, and simple sentences.',
    color: '#34d399',
    lessons: [
      {
        id: 'a1-l1',
        title: 'Hello & introductions',
        minutes: 12,
        goals: ['Greet people', 'Say your name and where you are from', 'Ask simple questions'],
        vocab: [
          { word: 'hello / hi', meaning: 'greeting', example: 'Hi, my name is Ana.' },
          { word: 'nice to meet you', meaning: 'polite when meeting', example: 'Nice to meet you, Tom.' },
          { word: 'from', meaning: 'origin', example: 'I am from Mexico.' },
          { word: 'student / teacher', meaning: 'roles', example: 'I am a student.' },
        ],
        grammarTitle: 'Verb be (I am / you are)',
        grammarNote: 'Use am with I, are with you/we/they, is with he/she/it.',
        grammarExamples: ['I am Marta.', 'You are my classmate.', 'She is from Spain.', 'Are you a teacher?'],
        dialogueTitle: 'First day',
        dialogue:
          'Alex: Hi! My name is Alex. What is your name?\nSam: Hello, Alex. I am Sam. Nice to meet you.\nAlex: Nice to meet you too. Where are you from?\nSam: I am from Canada. And you?\nAlex: I am from Colombia. Are you a student here?\nSam: Yes, I am.',
        practice: [
          'Say your name and country out loud three times.',
          'Ask a friend: “What is your name?” and “Where are you from?”',
        ],
        quiz: [
          {
            question: 'Choose the correct sentence.',
            options: ['I is Ana.', 'I am Ana.', 'I are Ana.'],
            answerIndex: 1,
          },
          {
            question: '“Nice to meet you” is used when you…',
            options: ['say goodbye', 'meet someone new', 'order food'],
            answerIndex: 1,
          },
        ],
      },
      {
        id: 'a1-l2',
        title: 'Numbers, days & time',
        minutes: 14,
        goals: ['Count to 100', 'Say the day and time', 'Talk about schedules'],
        vocab: [
          { word: 'today / tomorrow', meaning: 'days', example: 'Today is Monday.' },
          { word: 'o’clock', meaning: 'exact hour', example: 'It is three o’clock.' },
          { word: 'morning / evening', meaning: 'parts of day', example: 'Good morning!' },
          { word: 'weekend', meaning: 'Saturday–Sunday', example: 'See you on the weekend.' },
        ],
        grammarTitle: 'It is + time / day',
        grammarNote: 'Ask “What time is it?” and “What day is it today?”',
        grammarExamples: ['It is 9:00.', 'It is Tuesday today.', 'My class is at 6 p.m.'],
        dialogueTitle: 'Class time',
        dialogue:
          'Lina: What day is it today?\nOmar: It is Wednesday.\nLina: What time is English class?\nOmar: It is at five o’clock.\nLina: Perfect. See you this evening!',
        practice: [
          'Say today’s day and the current time in English.',
          'Tell three times you do things (wake up, lunch, sleep).',
        ],
        quiz: [
          {
            question: 'How do you ask the time?',
            options: ['What time is it?', 'How many time?', 'What day hour?'],
            answerIndex: 0,
          },
          {
            question: '“It is Monday today.” talks about…',
            options: ['the weather', 'the day', 'food'],
            answerIndex: 1,
          },
        ],
      },
      {
        id: 'a1-l3',
        title: 'Family & describing people',
        minutes: 13,
        goals: ['Name family members', 'Use he/she', 'Describe with simple adjectives'],
        vocab: [
          { word: 'mother / father', meaning: 'parents', example: 'My mother is a nurse.' },
          { word: 'brother / sister', meaning: 'siblings', example: 'I have one brother.' },
          { word: 'tall / short', meaning: 'height', example: 'She is tall.' },
          { word: 'friendly', meaning: 'kind with people', example: 'He is very friendly.' },
        ],
        grammarTitle: 'Have / has + family',
        grammarNote: 'I/you/we/they have · he/she/it has.',
        grammarExamples: ['I have two sisters.', 'She has a brother.', 'Do you have children?'],
        dialogueTitle: 'About family',
        dialogue:
          'Nina: Do you have a big family?\nLeo: Yes. I have two sisters and one brother.\nNina: How old is your brother?\nLeo: He is sixteen. He is tall and funny.\nNina: Nice! My sister is a teacher. She is very friendly.',
        practice: [
          'Describe one family member for 20 seconds.',
          'Answer: “Do you have brothers or sisters?”',
        ],
        quiz: [
          {
            question: 'Correct form:',
            options: ['She have a dog.', 'She has a dog.', 'She haves a dog.'],
            answerIndex: 1,
          },
          {
            question: '“He is tall” describes…',
            options: ['height', 'time', 'food'],
            answerIndex: 0,
          },
        ],
      },
      {
        id: 'a1-l4',
        title: 'Daily routines',
        minutes: 15,
        goals: ['Talk about habits', 'Use present simple', 'Use time expressions'],
        vocab: [
          { word: 'wake up', meaning: 'stop sleeping', example: 'I wake up at 7.' },
          { word: 'go to work / school', meaning: 'commute', example: 'She goes to work by bus.' },
          { word: 'usually', meaning: 'most days', example: 'I usually drink coffee.' },
          { word: 'after that', meaning: 'next', example: 'After that, I study English.' },
        ],
        grammarTitle: 'Present simple (habits)',
        grammarNote: 'Add -s/-es for he/she/it. Use do/does in questions.',
        grammarExamples: ['I work from home.', 'She works in an office.', 'Does he study at night?'],
        dialogueTitle: 'A normal day',
        dialogue:
          'Kai: What time do you wake up?\nMia: I usually wake up at seven. Then I have breakfast.\nKai: Do you work in the morning?\nMia: Yes. I work until lunch. After that, I study English for thirty minutes.',
        practice: [
          'Describe your morning routine in 4 sentences.',
          'Ask and answer: “What do you usually do on Sundays?”',
        ],
        quiz: [
          {
            question: 'Choose the correct sentence.',
            options: ['She go to school.', 'She goes to school.', 'She going to school.'],
            answerIndex: 1,
          },
          {
            question: 'Present simple is best for…',
            options: ['habits', 'actions happening right now only', 'future plans only'],
            answerIndex: 0,
          },
        ],
      },
      {
        id: 'a1-l5',
        title: 'Food & ordering',
        minutes: 12,
        goals: ['Order food politely', 'Talk about likes', 'Use I’d like'],
        vocab: [
          { word: 'menu', meaning: 'list of food', example: 'Can I see the menu?' },
          { word: 'I’d like…', meaning: 'polite want', example: 'I’d like a sandwich, please.' },
          { word: 'water / coffee / tea', meaning: 'drinks', example: 'Tea, please.' },
          { word: 'bill / check', meaning: 'pay', example: 'Can we have the bill?' },
        ],
        grammarTitle: 'I’d like + noun',
        grammarNote: 'Politer than “I want”. Add please.',
        grammarExamples: ['I’d like a salad.', 'I’d like some water, please.', 'Would you like coffee?'],
        dialogueTitle: 'At a café',
        dialogue:
          'Server: Hi! What would you like?\nPat: I’d like a cheese sandwich and a coffee, please.\nServer: Sure. Anything else?\nPat: Just water, please.\nServer: Okay. That’s $9.\nPat: Can I have the bill?',
        practice: [
          'Order breakfast out loud using “I’d like…”.',
          'Say three foods you like and one you don’t like.',
        ],
        quiz: [
          {
            question: 'A polite order is…',
            options: ['Give me pizza.', 'I’d like a pizza, please.', 'Pizza now.'],
            answerIndex: 1,
          },
          {
            question: '“Can I have the bill?” means you want to…',
            options: ['pay', 'cook', 'leave without paying'],
            answerIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'a2',
    label: 'A2',
    cefr: 'Elementary',
    title: 'Everyday English',
    caption: 'Past events, plans, shopping, travel, and opinions.',
    color: '#38bdf8',
    lessons: [
      {
        id: 'a2-l1',
        title: 'Last weekend (past simple)',
        minutes: 15,
        goals: ['Talk about finished actions', 'Use regular/irregular past', 'Ask what someone did'],
        vocab: [
          { word: 'yesterday', meaning: 'the day before today', example: 'Yesterday I stayed home.' },
          { word: 'went / saw / ate', meaning: 'irregular past', example: 'We went to the cinema.' },
          { word: 'fun / boring', meaning: 'opinions', example: 'The movie was fun.' },
          { word: 'all day', meaning: 'the whole day', example: 'It rained all day.' },
        ],
        grammarTitle: 'Past simple',
        grammarNote: 'Regular verbs +ed. Many common verbs are irregular (go→went).',
        grammarExamples: ['I visited my aunt.', 'She didn’t work on Sunday.', 'Did you watch the game?'],
        dialogueTitle: 'Weekend chat',
        dialogue:
          'Eva: What did you do last weekend?\nNoah: I went to the beach and ate tacos.\nEva: Nice! Did you swim?\nNoah: Yes, but only for ten minutes. The water was cold.\nEva: I stayed home and watched a series. It was fun.',
        practice: [
          'Tell 5 things you did yesterday.',
          'Ask a partner three “Did you…?” questions.',
        ],
        quiz: [
          {
            question: 'Past of go:',
            options: ['goed', 'went', 'gone'],
            answerIndex: 1,
          },
          {
            question: 'Correct question:',
            options: ['Did you went out?', 'Did you go out?', 'Do you went out?'],
            answerIndex: 1,
          },
        ],
      },
      {
        id: 'a2-l2',
        title: 'Plans with going to',
        minutes: 14,
        goals: ['Talk about future plans', 'Use going to', 'Invite someone'],
        vocab: [
          { word: 'tonight / next week', meaning: 'future time', example: 'Next week I’m free.' },
          { word: 'invite', meaning: 'ask someone to join', example: 'Can I invite you?' },
          { word: 'busy / free', meaning: 'availability', example: 'I’m busy on Friday.' },
          { word: 'maybe', meaning: 'not sure', example: 'Maybe later.' },
        ],
        grammarTitle: 'be + going to + verb',
        grammarNote: 'For plans and intentions you already have.',
        grammarExamples: ['I’m going to study tonight.', 'Are you going to travel?', 'She isn’t going to come.'],
        dialogueTitle: 'Making plans',
        dialogue:
          'Tara: What are you going to do this Saturday?\nBen: I’m going to visit a museum. Do you want to come?\nTara: I’d love to, but I’m busy in the morning.\nBen: No problem. We’re going to go at 3 p.m.\nTara: Perfect. I’m going to meet you there.',
        practice: [
          'Say three plans for this week with “I’m going to…”.',
          'Invite someone to coffee using going to.',
        ],
        quiz: [
          {
            question: 'Choose the correct plan:',
            options: ['I going to call you.', 'I’m going to call you.', 'I go to calling you.'],
            answerIndex: 1,
          },
          {
            question: '“Going to” is often used for…',
            options: ['finished past stories', 'plans', 'only weather'],
            answerIndex: 1,
          },
        ],
      },
      {
        id: 'a2-l3',
        title: 'Shopping & prices',
        minutes: 13,
        goals: ['Ask for sizes/prices', 'Compare cheap/expensive', 'Return an item politely'],
        vocab: [
          { word: 'size', meaning: 'S/M/L etc.', example: 'Do you have a medium?' },
          { word: 'fit', meaning: 'right size', example: 'It doesn’t fit.' },
          { word: 'discount', meaning: 'lower price', example: 'Is there a discount?' },
          { word: 'receipt', meaning: 'proof of purchase', example: 'Here’s my receipt.' },
        ],
        grammarTitle: 'Comparatives (cheaper / more expensive)',
        grammarNote: 'Short adjectives +er; longer adjectives use more.',
        grammarExamples: ['This bag is cheaper.', 'That jacket is more expensive.', 'These shoes are better.'],
        dialogueTitle: 'In a store',
        dialogue:
          'Clerk: Can I help you?\nRita: Yes. Do you have this shirt in a small?\nClerk: Let me check… Yes. It’s on discount today.\nRita: Great. How much is it?\nClerk: $18.\nRita: Perfect. I’ll take it.',
        practice: [
          'Role-play buying shoes: ask size, price, and color.',
          'Compare two products out loud.',
        ],
        quiz: [
          {
            question: '“It doesn’t fit” means…',
            options: ['wrong size', 'too cheap', 'no color'],
            answerIndex: 0,
          },
          {
            question: 'Comparative of expensive:',
            options: ['expensiver', 'more expensive', 'most expensive always'],
            answerIndex: 1,
          },
        ],
      },
      {
        id: 'a2-l4',
        title: 'Travel basics',
        minutes: 15,
        goals: ['Check in / ask for directions', 'Talk about transport', 'Handle small travel problems'],
        vocab: [
          { word: 'boarding pass', meaning: 'ticket to board', example: 'Here’s my boarding pass.' },
          { word: 'gate / platform', meaning: 'where you leave', example: 'Which gate is it?' },
          { word: 'delay', meaning: 'late departure', example: 'The flight is delayed.' },
          { word: 'How do I get to…?', meaning: 'ask directions', example: 'How do I get to the museum?' },
        ],
        grammarTitle: 'Can / could for requests',
        grammarNote: 'Could is a bit more polite than can.',
        grammarExamples: ['Can you help me?', 'Could you repeat that?', 'Could I have a map?'],
        dialogueTitle: 'At the airport',
        dialogue:
          'Agent: Good morning. Passport and booking, please.\nJon: Here you are. Could you tell me the gate?\nAgent: Gate B12. Boarding starts at 2:40.\nJon: Thanks. Is the flight on time?\nAgent: There’s a short delay, about twenty minutes.',
        practice: [
          'Ask for directions to a hotel and a station.',
          'Explain a delayed flight in 3 sentences.',
        ],
        quiz: [
          {
            question: 'A polite request:',
            options: ['Repeat!', 'Could you repeat that?', 'You repeat now.'],
            answerIndex: 1,
          },
          {
            question: 'A delay means the trip is…',
            options: ['early', 'late', 'cancelled always'],
            answerIndex: 1,
          },
        ],
      },
      {
        id: 'a2-l5',
        title: 'Opinions & preferences',
        minutes: 12,
        goals: ['Say what you like/prefer', 'Agree and disagree politely', 'Give a short reason'],
        vocab: [
          { word: 'I think…', meaning: 'opinion', example: 'I think it’s useful.' },
          { word: 'prefer', meaning: 'like more', example: 'I prefer tea.' },
          { word: 'agree / disagree', meaning: 'same/different view', example: 'I agree with you.' },
          { word: 'because', meaning: 'reason', example: 'Because it’s faster.' },
        ],
        grammarTitle: 'I think / I prefer / because',
        grammarNote: 'Opinion + reason keeps conversation natural.',
        grammarExamples: ['I prefer mornings because I’m more productive.', 'I don’t think that’s true.'],
        dialogueTitle: 'Movie night',
        dialogue:
          'Sara: Do you want to watch a comedy or a documentary?\nMike: I prefer comedies because I want to relax.\nSara: I think documentaries are interesting, but okay.\nMike: We can watch a short documentary first, then a comedy.\nSara: Deal!',
        practice: [
          'Give opinions about two apps you use.',
          'Disagree politely with: “English is only grammar.”',
        ],
        quiz: [
          {
            question: 'Best opener for an opinion:',
            options: ['I think…', 'I am think…', 'Thinking me…'],
            answerIndex: 0,
          },
          {
            question: '“I prefer tea” means…',
            options: ['you hate tea', 'you like tea more than something else', 'you never drink tea'],
            answerIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'b1',
    label: 'B1',
    cefr: 'Intermediate',
    title: 'Real conversations',
    caption: 'Experiences, advice, work English, and clearer storytelling.',
    color: '#fbbf24',
    lessons: [
      {
        id: 'b1-l1',
        title: 'Present perfect experiences',
        minutes: 16,
        goals: ['Talk about life experiences', 'Use ever/never/already/yet', 'Contrast with past simple'],
        vocab: [
          { word: 'Have you ever…?', meaning: 'life experience', example: 'Have you ever flown alone?' },
          { word: 'already / yet', meaning: 'timing', example: 'I haven’t finished yet.' },
          { word: 'so far', meaning: 'until now', example: 'So far, so good.' },
          { word: 'recently', meaning: 'not long ago', example: 'I recently changed jobs.' },
        ],
        grammarTitle: 'Present perfect vs past simple',
        grammarNote: 'Present perfect = experience/result now. Past simple = finished time (yesterday, in 2019).',
        grammarExamples: [
          'I have visited Japan.',
          'I visited Japan in 2022.',
          'Have you ever worked remotely?',
        ],
        dialogueTitle: 'New city',
        dialogue:
          'Chris: Have you ever lived in another country?\nDana: Yes. I lived in Germany for a year. Have you?\nChris: Not yet, but I’ve traveled a lot.\nDana: Where have you been recently?\nChris: I’ve just come back from Portugal. It was amazing.',
        practice: [
          'Answer five “Have you ever…?” questions out loud.',
          'Tell one experience with present perfect + one detail in past simple.',
        ],
        quiz: [
          {
            question: 'Correct:',
            options: ['I have seen that movie yesterday.', 'I saw that movie yesterday.', 'I seen that movie yesterday.'],
            answerIndex: 1,
          },
          {
            question: '“Have you ever…?” asks about…',
            options: ['a life experience', 'only tomorrow', 'the weather only'],
            answerIndex: 0,
          },
        ],
      },
      {
        id: 'b1-l2',
        title: 'Giving advice',
        minutes: 14,
        goals: ['Use should / shouldn’t', 'Give practical tips', 'Sound supportive'],
        vocab: [
          { word: 'should', meaning: 'good idea', example: 'You should rest.' },
          { word: 'If I were you…', meaning: 'advice phrase', example: 'If I were you, I’d ask.' },
          { word: 'tip', meaning: 'small advice', example: 'Here’s a tip.' },
          { word: 'improve', meaning: 'get better', example: 'This will improve your speaking.' },
        ],
        grammarTitle: 'should + base verb',
        grammarNote: 'Advice, not obligation. For stronger rules use must/have to.',
        grammarExamples: ['You should practice daily.', 'You shouldn’t translate every word.', 'What should I do?'],
        dialogueTitle: 'Speaking fear',
        dialogue:
          'Maya: I freeze when I speak English in meetings.\nOmar: You should prepare two sentences before the call.\nMaya: That helps. Anything else?\nOmar: If I were you, I’d also record a one-minute summary after work.\nMaya: Good tip. I’ll try that this week.',
        practice: [
          'Give advice to someone who wants fluency (3 tips).',
          'Respond to: “I always forget vocabulary.”',
        ],
        quiz: [
          {
            question: 'Advice form:',
            options: ['You should to sleep more.', 'You should sleep more.', 'You should sleeping more.'],
            answerIndex: 1,
          },
          {
            question: '“If I were you” is used to…',
            options: ['give advice', 'talk about weather', 'order food'],
            answerIndex: 0,
          },
        ],
      },
      {
        id: 'b1-l3',
        title: 'Work & study English',
        minutes: 15,
        goals: ['Describe your role', 'Talk about tasks and deadlines', 'Handle polite emails orally'],
        vocab: [
          { word: 'deadline', meaning: 'due date', example: 'The deadline is Friday.' },
          { word: 'update', meaning: 'status news', example: 'Can I give a quick update?' },
          { word: 'priority', meaning: 'most important', example: 'That’s our priority.' },
          { word: 'follow up', meaning: 'check again later', example: 'I’ll follow up tomorrow.' },
        ],
        grammarTitle: 'I need to / I’m working on',
        grammarNote: 'Present continuous for current projects; need to for obligations.',
        grammarExamples: [
          'I’m working on the report.',
          'I need to finish it today.',
          'Could you send me an update?',
        ],
        dialogueTitle: 'Stand-up style',
        dialogue:
          'Lead: Any updates?\nRae: I’m working on the login bug. I’ve fixed part of it, but I need more tests.\nLead: What’s the priority today?\nRae: Finishing the fix before the deadline.\nLead: Great. Please follow up after lunch.',
        practice: [
          'Give a 30-second work/study update.',
          'Politely ask a teammate for help with a deadline.',
        ],
        quiz: [
          {
            question: 'A deadline is…',
            options: ['a due date', 'a vacation', 'a restaurant'],
            answerIndex: 0,
          },
          {
            question: 'Best status line:',
            options: ['I working the bug.', 'I’m working on the bug.', 'I works on the bug.'],
            answerIndex: 1,
          },
        ],
      },
      {
        id: 'b1-l4',
        title: 'Tell a short story',
        minutes: 16,
        goals: ['Use sequence words', 'Add detail without stopping', 'End with a result/feeling'],
        vocab: [
          { word: 'First / Then / After that / Finally', meaning: 'sequence', example: 'First, I arrived late.' },
          { word: 'suddenly', meaning: 'unexpected', example: 'Suddenly it started raining.' },
          { word: 'in the end', meaning: 'result', example: 'In the end, everything was fine.' },
          { word: 'embarrassing / relieved', meaning: 'feelings', example: 'I felt relieved.' },
        ],
        grammarTitle: 'Narrative past + connectors',
        grammarNote: 'Keep past simple for main events; add time markers for clarity.',
        grammarExamples: [
          'First I missed the bus. Then I took a taxi. In the end I arrived on time.',
        ],
        dialogueTitle: 'A small disaster',
        dialogue:
          'Kim: Tell me what happened yesterday.\nAlex: First, I left my laptop at home. Then I went back, and suddenly it started pouring.\nKim: Oh no.\nAlex: After that I was totally wet, but in the end my teammate shared her notes. I felt relieved.',
        practice: [
          'Tell a 45-second true story with First/Then/Finally.',
          'Retell a story from the Stories section in your own words.',
        ],
        quiz: [
          {
            question: 'Best sequence starter:',
            options: ['First…', 'Finish…', 'Deadline…'],
            answerIndex: 0,
          },
          {
            question: '“In the end” usually introduces…',
            options: ['the result', 'the beginning', 'a menu'],
            answerIndex: 0,
          },
        ],
      },
      {
        id: 'b1-l5',
        title: 'Agree, disagree & negotiate',
        minutes: 14,
        goals: ['Stay polite when you disagree', 'Offer alternatives', 'Reach a simple agreement'],
        vocab: [
          { word: 'I see your point', meaning: 'I understand you', example: 'I see your point, but…' },
          { word: 'How about…?', meaning: 'suggest', example: 'How about Friday?' },
          { word: 'compromise', meaning: 'middle solution', example: 'Let’s find a compromise.' },
          { word: 'fair enough', meaning: 'I accept that', example: 'Fair enough.' },
        ],
        grammarTitle: 'Softening language',
        grammarNote: 'Use but/however + alternative. Avoid sounding absolute.',
        grammarExamples: [
          'I partly agree.',
          'That’s true, however we need more time.',
          'How about we try a smaller version first?',
        ],
        dialogueTitle: 'Choosing a tool',
        dialogue:
          'Lee: I think we should switch tools this week.\nSam: I see your point, but it’s risky before the release.\nLee: How about we test it on one feature only?\nSam: That could work. Let’s compromise and review on Thursday.\nLee: Fair enough.',
        practice: [
          'Disagree politely with a strong opinion (30 seconds).',
          'Propose a compromise for a weekend plan conflict.',
        ],
        quiz: [
          {
            question: 'A soft disagreement starts with…',
            options: ['You’re wrong.', 'I see your point, but…', 'No.'],
            answerIndex: 1,
          },
          {
            question: '“How about…?” is used to…',
            options: ['suggest', 'insult', 'order food only'],
            answerIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'b2',
    label: 'B2',
    cefr: 'Upper-intermediate',
    title: 'Clear & flexible',
    caption: 'Nuance, hypotheses, meetings, and fluent explanations.',
    color: '#fb7185',
    lessons: [
      {
        id: 'b2-l1',
        title: 'Hypotheticals (if / would)',
        minutes: 16,
        goals: ['Talk about unreal present situations', 'Give hypothetical advice', 'Sound natural with would'],
        vocab: [
          { word: 'If I had…', meaning: 'unreal condition', example: 'If I had more time, I’d travel.' },
          { word: 'suppose / imagine', meaning: 'hypothetical', example: 'Suppose we delayed the launch…' },
          { word: 'otherwise', meaning: 'if not', example: 'Hurry, otherwise we’ll be late.' },
          { word: 'in that case', meaning: 'then', example: 'In that case, let’s wait.' },
        ],
        grammarTitle: 'Second conditional',
        grammarNote: 'If + past, would + base verb — for unreal or unlikely now/future.',
        grammarExamples: [
          'If I were fluent, I’d apply for that role.',
          'What would you do if the server went down?',
        ],
        dialogueTitle: 'Career chat',
        dialogue:
          'Nora: If you could change one thing about your job, what would it be?\nVic: I’d spend less time in meetings. If we had clearer agendas, we’d finish faster.\nNora: Same. Suppose we tried a 15-minute stand-up only?\nVic: In that case, I’d be much happier.',
        practice: [
          'Answer: “If you lived abroad, what would you miss?”',
          'Give hypothetical advice to a nervous speaker.',
        ],
        quiz: [
          {
            question: 'Correct second conditional:',
            options: [
              'If I am you, I will study more.',
              'If I were you, I would study more.',
              'If I would be you, I study more.',
            ],
            answerIndex: 1,
          },
          {
            question: 'Second conditional often talks about…',
            options: ['unreal/unlikely situations', 'only yesterday facts', 'menu prices'],
            answerIndex: 0,
          },
        ],
      },
      {
        id: 'b2-l2',
        title: 'Meetings that flow',
        minutes: 15,
        goals: ['Interrupt politely', 'Clarify meaning', 'Summarize decisions'],
        vocab: [
          { word: 'Sorry to interrupt…', meaning: 'polite cut-in', example: 'Sorry to interrupt—quick question.' },
          { word: 'Just to clarify…', meaning: 'make clear', example: 'Just to clarify, is Friday final?' },
          { word: 'action item', meaning: 'task from meeting', example: 'My action item is the draft.' },
          { word: 'takeaway', meaning: 'key conclusion', example: 'The takeaway is we ship Monday.' },
        ],
        grammarTitle: 'Discourse markers for control',
        grammarNote: 'Markers buy time and structure: so, basically, in short, going back to…',
        grammarExamples: [
          'So, where were we?',
          'Basically, we have two options.',
          'In short, we need more tests.',
        ],
        dialogueTitle: 'Product sync',
        dialogue:
          'Host: We need to choose a date.\nAva: Sorry to interrupt—just to clarify, are we talking public launch or internal?\nHost: Internal first.\nAva: Got it. So my action item is the checklist.\nHost: Perfect. Takeaway: internal on Tuesday, public later.',
        practice: [
          'Role-play interrupting to clarify a deadline.',
          'Summarize a meeting in 3 sentences using takeaway/action item.',
        ],
        quiz: [
          {
            question: 'An action item is…',
            options: ['a task someone must do', 'a random joke', 'a boarding pass'],
            answerIndex: 0,
          },
          {
            question: '“Just to clarify…” helps you…',
            options: ['confirm meaning', 'end the job', 'order coffee'],
            answerIndex: 0,
          },
        ],
      },
      {
        id: 'b2-l3',
        title: 'Explain a complex idea simply',
        minutes: 16,
        goals: ['Break ideas into steps', 'Use analogies', 'Check listener understanding'],
        vocab: [
          { word: 'basically / in simple terms', meaning: 'simplify', example: 'Basically, it’s a shortcut.' },
          { word: 'for instance', meaning: 'example', example: 'For instance, caching.' },
          { word: 'tradeoff', meaning: 'cost vs benefit', example: 'There’s a tradeoff with speed.' },
          { word: 'Does that make sense?', meaning: 'check understanding', example: 'Does that make sense so far?' },
        ],
        grammarTitle: 'Cause / result language',
        grammarNote: 'because / so / which means / as a result — connect ideas clearly.',
        grammarExamples: [
          'We cache data so pages load faster.',
          'It’s stricter, which means fewer errors.',
        ],
        dialogueTitle: 'Explaining to a teammate',
        dialogue:
          'Jun: Can you explain the bug in simple terms?\nPri: Basically, the app saves an old value. For instance, after logout it still shows the previous user.\nJun: So the tradeoff is speed versus correctness?\nPri: Exactly. As a result, we need a clearer refresh step. Does that make sense?\nJun: Yes—thanks.',
        practice: [
          'Explain your job or a hobby to a beginner in 1 minute.',
          'Use “basically”, one example, and “does that make sense?”',
        ],
        quiz: [
          {
            question: '“In simple terms” is used to…',
            options: ['simplify an explanation', 'make it harder', 'end a flight'],
            answerIndex: 0,
          },
          {
            question: 'A tradeoff means…',
            options: ['a balance of pros and cons', 'a free gift', 'a vacation'],
            answerIndex: 0,
          },
        ],
      },
      {
        id: 'b2-l4',
        title: 'Persuasion & recommendations',
        minutes: 15,
        goals: ['Recommend with reasons', 'Acknowledge concerns', 'Close with a clear ask'],
        vocab: [
          { word: 'I’d recommend…', meaning: 'suggestion', example: 'I’d recommend starting smaller.' },
          { word: 'worth', meaning: 'valuable enough', example: 'It’s worth trying.' },
          { word: 'concern', meaning: 'worry', example: 'My main concern is time.' },
          { word: 'on balance', meaning: 'overall', example: 'On balance, it’s a good idea.' },
        ],
        grammarTitle: 'Hedging for credibility',
        grammarNote: 'Phrases like tend to / might / on balance sound careful and fluent.',
        grammarExamples: [
          'This approach tends to reduce errors.',
          'It might take longer at first.',
          'On balance, I still recommend it.',
        ],
        dialogueTitle: 'Pitching a change',
        dialogue:
          'Dana: I’d recommend we add a short rehearsal before interviews.\nLee: My concern is time.\nDana: Fair. It might take twenty minutes, but it tends to improve answers a lot.\nLee: On balance, that sounds worth it.\nDana: Great—can we try it this week?',
        practice: [
          'Recommend an English habit to a friend with 2 reasons.',
          'Acknowledge one concern, then keep your recommendation.',
        ],
        quiz: [
          {
            question: 'A clear recommendation:',
            options: ['I’d recommend practicing aloud.', 'Recommend I practicing.', 'I recommending practice.'],
            answerIndex: 0,
          },
          {
            question: '“On balance” means…',
            options: ['overall / all things considered', 'immediately', 'never'],
            answerIndex: 0,
          },
        ],
      },
      {
        id: 'b2-l5',
        title: 'Fluent recovery when you get stuck',
        minutes: 14,
        goals: ['Buy time', 'Paraphrase', 'Keep speaking after mistakes'],
        vocab: [
          { word: 'Let me rephrase that…', meaning: 'say again better', example: 'Let me rephrase that…' },
          { word: 'What I mean is…', meaning: 'clarify', example: 'What I mean is we need tests.' },
          { word: 'I’m looking for the word…', meaning: 'tip-of-tongue', example: 'I’m looking for the word for…' },
          { word: 'anyway', meaning: 'move on', example: 'Anyway, back to the plan.' },
        ],
        grammarTitle: 'Repair strategies',
        grammarNote: 'Fluency ≠ zero mistakes. Repair quickly and continue.',
        grammarExamples: [
          'Sorry—let me rephrase that.',
          'The… what’s the word… the deadline, right.',
          'Anyway, the point is we can ship Friday.',
        ],
        dialogueTitle: 'Almost stuck',
        dialogue:
          'Host: Why should we delay?\nRemy: Because the… I’m looking for the word… the dependency isn’t ready.\nHost: You mean the payment service?\nRemy: Yes—let me rephrase that. What I mean is we shouldn’t launch until it’s stable. Anyway, we can still prepare the docs.',
        practice: [
          'Speak 40 seconds on any topic; force one rephrase mid-way.',
          'Practice: “I’m looking for the word…” then paraphrase.',
        ],
        quiz: [
          {
            question: 'Best recovery phrase:',
            options: ['Let me rephrase that…', 'I fail English.', 'Stop talking.'],
            answerIndex: 0,
          },
          {
            question: '“What I mean is…” helps you…',
            options: ['clarify after a messy sentence', 'order food', 'end the course'],
            answerIndex: 0,
          },
        ],
      },
    ],
  },
]

export const LEVELS_PROGRESS_KEY = 'demoenglish.school.progress'

export function getSchoolLevel(id: string): SchoolLevel | undefined {
  return schoolLevels.find((l) => l.id === id)
}

export function getSchoolLesson(levelId: string, lessonId: string): SchoolLesson | undefined {
  return getSchoolLevel(levelId)?.lessons.find((l) => l.id === lessonId)
}

export function readCompletedLessons(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LEVELS_PROGRESS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function writeCompletedLessons(ids: string[]): void {
  window.localStorage.setItem(LEVELS_PROGRESS_KEY, JSON.stringify([...new Set(ids)]))
}

export function levelProgress(level: SchoolLevel, completed: string[]): { done: number; total: number; pct: number } {
  const total = level.lessons.length
  const done = level.lessons.filter((l) => completed.includes(l.id)).length
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}
