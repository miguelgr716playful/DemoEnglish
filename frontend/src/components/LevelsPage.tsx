import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  GraduationCap,
  RotateCcw,
} from 'lucide-react'
import {
  getSchoolLevel,
  levelProgress,
  readCompletedLessons,
  schoolLevels,
  writeCompletedLessons,
  type CefrLevelId,
  type SchoolLesson,
  type SchoolLevel,
} from '../data/schoolCurriculum'
import { HighlightedText, type SpeechWordRange } from './HighlightedText'
import { SpeakTextButton } from './SpeakTextButton'

type View =
  | { kind: 'hub' }
  | { kind: 'level'; levelId: CefrLevelId }
  | { kind: 'lesson'; levelId: CefrLevelId; lessonId: string }

function LessonView({
  level,
  lesson,
  completed,
  onBack,
  onToggleComplete,
}: {
  level: SchoolLevel
  lesson: SchoolLesson
  completed: boolean
  onBack: () => void
  onToggleComplete: () => void
}) {
  const [quizPick, setQuizPick] = useState<Record<number, number | null>>({})
  const [wordRange, setWordRange] = useState<SpeechWordRange | null>(null)
  const dialogueRef = useRef<HTMLPreElement | null>(null)
  const speakKey = `${lesson.id}:dialogue`

  useEffect(() => {
    setQuizPick({})
    setWordRange(null)
  }, [lesson.id])

  const quizScore = useMemo(() => {
    let right = 0
    let answered = 0
    lesson.quiz.forEach((q, i) => {
      const pick = quizPick[i]
      if (pick == null) return
      answered += 1
      if (pick === q.answerIndex) right += 1
    })
    return { right, answered, total: lesson.quiz.length }
  }, [lesson.quiz, quizPick])

  return (
    <div className="school-lesson page">
      <button type="button" className="topics-back" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden />
        {level.label} lessons
      </button>

      <header className="school-lesson-head">
        <div>
          <span className="fluency-tag">
            {level.label} · {lesson.minutes} min
          </span>
          <h1>{lesson.title}</h1>
        </div>
        <button
          type="button"
          className={`button ${completed ? 'button-secondary' : 'button-primary'}`}
          onClick={onToggleComplete}
        >
          {completed ? (
            <>
              <Check size={16} aria-hidden /> Completed
            </>
          ) : (
            'Mark complete'
          )}
        </button>
      </header>

      <section className="school-panel">
        <h2>Goals</h2>
        <ul className="school-goals">
          {lesson.goals.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </section>

      <section className="school-panel">
        <h2>Vocabulary</h2>
        <div className="school-vocab">
          {lesson.vocab.map((v) => (
            <article key={v.word}>
              <strong>{v.word}</strong>
              <span>{v.meaning}</span>
              <p>{v.example}</p>
              <SpeakTextButton text={`${v.word}. ${v.example}`} resetSignal={`${lesson.id}:${v.word}`} />
            </article>
          ))}
        </div>
      </section>

      <section className="school-panel">
        <h2>{lesson.grammarTitle}</h2>
        <p className="school-note">{lesson.grammarNote}</p>
        <ul className="school-examples">
          {lesson.grammarExamples.map((ex) => (
            <li key={ex}>
              <span>{ex}</span>
              <SpeakTextButton text={ex} resetSignal={`${lesson.id}:g:${ex}`} />
            </li>
          ))}
        </ul>
      </section>

      <section className="school-panel">
        <div className="school-panel-row">
          <h2>{lesson.dialogueTitle}</h2>
          <SpeakTextButton
            text={lesson.dialogue}
            resetSignal={speakKey}
            selectionScopeRef={dialogueRef}
            onWordRangeChange={setWordRange}
          />
        </div>
        <pre className="school-dialogue" ref={dialogueRef}>
          <HighlightedText text={lesson.dialogue} range={wordRange} />
        </pre>
      </section>

      <section className="school-panel">
        <h2>Practice</h2>
        <ol className="school-practice">
          {lesson.practice.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </section>

      <section className="school-panel">
        <div className="school-panel-row">
          <h2>Quick check</h2>
          <span className="fluency-progress">
            {quizScore.answered === 0
              ? `${quizScore.total} questions`
              : `${quizScore.right}/${quizScore.answered} correct`}
          </span>
        </div>
        <div className="school-quiz">
          {lesson.quiz.map((q, qi) => {
            const pick = quizPick[qi]
            return (
              <div key={q.question} className="school-quiz-item">
                <p>
                  {qi + 1}. {q.question}
                </p>
                <div className="school-quiz-options">
                  {q.options.map((opt, oi) => {
                    let cls = 'school-quiz-opt'
                    if (pick != null) {
                      if (oi === q.answerIndex) cls += ' is-right'
                      else if (oi === pick) cls += ' is-wrong'
                    }
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={cls}
                        disabled={pick != null}
                        onClick={() => setQuizPick((prev) => ({ ...prev, [qi]: oi }))}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        {quizScore.answered > 0 ? (
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setQuizPick({})}
          >
            <RotateCcw size={14} aria-hidden /> Reset quiz
          </button>
        ) : null}
      </section>
    </div>
  )
}

export function LevelsPage() {
  const [view, setView] = useState<View>({ kind: 'hub' })
  const [completed, setCompleted] = useState<string[]>(() => readCompletedLessons())

  const persist = (ids: string[]) => {
    setCompleted(ids)
    writeCompletedLessons(ids)
  }

  const toggleLesson = (lessonId: string) => {
    persist(
      completed.includes(lessonId)
        ? completed.filter((id) => id !== lessonId)
        : [...completed, lessonId],
    )
  }

  if (view.kind === 'lesson') {
    const level = getSchoolLevel(view.levelId)
    const lesson = level?.lessons.find((l) => l.id === view.lessonId)
    if (!level || !lesson) {
      return (
        <div className="school-page page">
          <p className="theory-empty">Lesson not found.</p>
          <button type="button" className="button button-primary" onClick={() => setView({ kind: 'hub' })}>
            Back to levels
          </button>
        </div>
      )
    }
    return (
      <LessonView
        level={level}
        lesson={lesson}
        completed={completed.includes(lesson.id)}
        onBack={() => setView({ kind: 'level', levelId: level.id })}
        onToggleComplete={() => toggleLesson(lesson.id)}
      />
    )
  }

  if (view.kind === 'level') {
    const level = getSchoolLevel(view.levelId)
    if (!level) {
      return (
        <div className="school-page page">
          <p className="theory-empty">Level not found.</p>
          <button type="button" className="button button-primary" onClick={() => setView({ kind: 'hub' })}>
            Back to levels
          </button>
        </div>
      )
    }
    const prog = levelProgress(level, completed)
    return (
      <div className="school-page page">
        <button type="button" className="topics-back" onClick={() => setView({ kind: 'hub' })}>
          <ArrowLeft size={16} aria-hidden />
          All levels
        </button>

        <header className="school-level-hero" style={{ ['--school-accent' as string]: level.color }}>
          <div>
            <span className="eyebrow">
              {level.label} · {level.cefr}
            </span>
            <h1>
              {level.title}
              <span className="accent-dot">.</span>
            </h1>
            <p>{level.caption}</p>
          </div>
          <div className="school-level-meter" aria-label={`${prog.pct}% complete`}>
            <strong>{prog.pct}%</strong>
            <span>
              {prog.done}/{prog.total} lessons
            </span>
            <div className="school-bar">
              <i style={{ width: `${prog.pct}%` }} />
            </div>
          </div>
        </header>

        <div className="school-lesson-list">
          {level.lessons.map((lesson, index) => {
            const done = completed.includes(lesson.id)
            return (
              <button
                key={lesson.id}
                type="button"
                className={`school-lesson-row${done ? ' is-done' : ''}`}
                onClick={() => setView({ kind: 'lesson', levelId: level.id, lessonId: lesson.id })}
              >
                <span className="school-lesson-num">{index + 1}</span>
                <span className="school-lesson-meta">
                  <strong>{lesson.title}</strong>
                  <small>
                    {lesson.minutes} min · {lesson.goals[0]}
                  </small>
                </span>
                {done ? <Check size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const overallDone = completed.length
  const overallTotal = schoolLevels.reduce((n, l) => n + l.lessons.length, 0)

  return (
    <div className="school-page page">
      <header className="page-topbar">
        <span className="eyebrow">ONLINE SCHOOL</span>
        <span className="date-label">
          {overallDone}/{overallTotal} lessons done
        </span>
      </header>

      <section className="topic-hero">
        <div>
          <h1>
            Levels<span className="accent-dot">.</span>
          </h1>
          <p>
            A guided path from A1 to B2 — vocabulary, grammar, dialogues with audio, practice, and a
            quick check in every lesson.
          </p>
        </div>
        <div className="topic-hero-icon" aria-hidden>
          <GraduationCap size={28} strokeWidth={1.8} />
        </div>
      </section>

      <div className="school-level-grid">
        {schoolLevels.map((level) => {
          const prog = levelProgress(level, completed)
          return (
            <button
              key={level.id}
              type="button"
              className="school-level-card"
              style={{ ['--school-accent' as string]: level.color }}
              onClick={() => setView({ kind: 'level', levelId: level.id })}
            >
              <div className="school-level-card-top">
                <span className="school-cefr">{level.label}</span>
                <span className="school-cefr-name">{level.cefr}</span>
              </div>
              <h2>{level.title}</h2>
              <p>{level.caption}</p>
              <div className="school-bar">
                <i style={{ width: `${prog.pct}%` }} />
              </div>
              <footer>
                <span>
                  {prog.done}/{prog.total} lessons
                </span>
                <ChevronRight size={16} aria-hidden />
              </footer>
            </button>
          )
        })}
      </div>
    </div>
  )
}
