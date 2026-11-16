"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, Languages, Lightbulb, MapPin, MessageCircle, RotateCcw, Sparkles, Star, Target, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ClusterId } from "@/lib/curriculum";
import { buildFieldChallenges, challengeAnswer, CHAPTERS, MISSIONS, type Challenge } from "@/lib/fieldLessons";
import type { Lesson } from "@/lib/lessons";
import { LEARNING_PATHS, vocabularyRoadHref, type LearningPathId } from "@/lib/learningPaths";
import { WORD_SENTENCES, summerSource } from "@/lib/wordSentences";
import { finishLesson } from "@/lib/progress";
import { transliterate } from "@/lib/translit";
import { Loading } from "./Loading";
import { TextSizeControl } from "./Nav";
import { GerIllustration, Knot } from "./LessonOrnaments";
import { useReduced } from "./useDecode";
import { Speak } from "./Speak";
import { useLearner } from "./useLearner";
import styles from "./lesson.module.css";

type Attempt = { queue: Challenge[]; index: number; correct: number; firstTry: number };

function Celebration({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return <div className={styles.celebration} aria-hidden="true">
    {Array.from({ length: 10 }, (_, i) => {
      const angle = i * Math.PI / 5;
      return <motion.span key={i} initial={{ x: 0, y: 0, opacity: 0, scale: .3 }} animate={{ x: Math.cos(angle) * (75 + i % 3 * 24), y: Math.sin(angle) * 65 - 24, opacity: [0, 1, 1, 0], scale: [0, 1.2, .8], rotate: i * 36 }} transition={{ duration: .8, delay: i % 3 * .035, ease: "easeOut" }}><Sparkles size={i % 2 ? 10 : 15} /></motion.span>;
    })}
  </div>;
}

function AnswerFeedback({ correct, item, onContinue }: { correct: boolean; item: Challenge["item"]; onContinue: () => void }) {
  const reduced = useReduced();
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
    buttonRef.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "instant" : "smooth" });
  }, [reduced]);
  return <motion.div className={styles.feedback} data-correct={correct} role="status" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>
    {correct && <Celebration reduced={reduced} />}
    <motion.span className={styles.feedbackIcon} aria-hidden="true" initial={reduced ? false : { scale: .5, rotate: correct ? -25 : 0 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 340, damping: 15 }}>
      {correct ? <Check size={24} strokeWidth={3} /> : <Lightbulb size={24} />}
    </motion.span>
    <div>
      <h3 lang="mn">{correct ? "Сайн байна!" : "Дахиад оролдоорой"}</h3>
      <small>{correct ? "Well done. You’ve got it!" : "You’re learning. We’ll practice this one again."}</small>
      <p lang="mn">{item.show}</p><small>{item.meaning}</small>
      <Speak text={item.show} label="Listen to the sentence" />
    </div>
    <button ref={buttonRef} type="button" className={styles.primary} onClick={onContinue}>Continue <ArrowRight size={17} /></button>
  </motion.div>;
}

function Activity({ challenge, mission, retry, position, total, onContinue }: {
  challenge: Challenge;
  mission: (typeof MISSIONS)[string];
  retry: boolean;
  position: number;
  total: number;
  onContinue: (correct: boolean) => void;
}) {
  const reduced = useReduced();
  const [selected, setSelected] = useState<number[]>([]);
  const [response, setResponse] = useState<string | null>(null);
  const { choices, kind, item } = challenge;
  const answer = challengeAnswer(challenge);
  const correct = response === answer;

  function selectWord(index: number) {
    setSelected((words) => words.includes(index) ? words.filter((word) => word !== index) : [...words, index]);
  }

  return (
    <section className={styles.activity} data-kind={kind} aria-labelledby="activity-heading">
      <div className={styles.questionMeta}>
        <p className={styles.eyebrow}>{retry ? <RotateCcw size={15} /> : kind === "reply" ? <MessageCircle size={15} /> : <Languages size={15} />}
          {retry ? "Another little practice" : kind === "reply" ? "In the situation" : kind === "order" ? "Build a sentence" : kind === "sentence" ? "Choose the Mongolian sentence" : challenge.context ? "Understand a sentence" : "Read and match"}</p>
        <span>{retry ? "Review round" : `${position} / ${total}`}</span>
      </div>
      <h2 id="activity-heading">
        {kind === "reply" ? mission.goal : kind === "order" ? "Put the words in order" : kind === "sentence" ? "How do you say this in Mongolian?" : challenge.context ? "What does this sentence mean?" : "What does this mean?"}
      </h2>
      {kind === "reply" && <p className={styles.sceneLine}>{mission.scene}</p>}
      {challenge.context && kind !== "reply" && <p className={styles.sceneLine}>{kind === "meaning" ? "Read the complete sentence and match its meaning. It uses a familiar summer-camp phrase." : challenge.context.scene}</p>}
      {challenge.context && <Link className={styles.sourceLesson} href={`/learn/${challenge.context.lessonId}`}><BookOpen size={13} /> From summer camp: {challenge.context.title}</Link>}
      {kind === "meaning" && <><p className={styles.promptPhrase} lang="mn">{item.show}</p><Speak text={item.show} /></>}
      {kind === "sentence" && <p className={styles.promptPhrase}>{item.meaning}</p>}
      {kind === "order" && <>
        <p className={styles.sceneLine}>{item.meaning}</p>
        <div className={styles.sentence} role="group" aria-label="Your sentence" data-result={response === null ? undefined : correct ? "correct" : "incorrect"}>
          {selected.length === 0 && <span>Tap the words in order</span>}
          {selected.map((index) => <motion.button layout={reduced ? false : "position"} initial={reduced ? false : { opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : .18 }} type="button" key={index} disabled={response !== null} onClick={() => selectWord(index)} aria-label={`Remove ${choices[index]}`} lang="mn">{choices[index]}</motion.button>)}
        </div>
        <div className={styles.wordBank} role="group" aria-label="Word bank">
          {choices.map((word, index) => <button type="button" key={index} disabled={response !== null || selected.includes(index)} onClick={() => selectWord(index)} lang="mn">{word}</button>)}
        </div>
        {response === null && <button className={styles.primary} type="button" disabled={selected.length !== choices.length} onClick={() => setResponse(selected.map((index) => choices[index]).join(" "))}>Check sentence <Check size={18} /></button>}
      </>}
      {kind !== "order" && <div className={styles.answers}>
        {choices.map((choice, index) => (
          <button key={choice} type="button" lang={kind === "reply" || kind === "sentence" ? "mn" : undefined} disabled={response !== null} onClick={() => setResponse(choice)} data-answer={response === null ? undefined : choice === answer ? "correct" : choice === response ? "incorrect" : undefined}>
            <span className={styles.answerLetter} aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{choice}</span>
            {response !== null && choice === answer && <Check size={19} aria-label="Correct answer" />}
            {response !== null && choice === response && !correct && <X size={19} aria-label="Incorrect answer" />}
          </button>
        ))}
      </div>}
      {response !== null && <AnswerFeedback correct={correct} item={item} onContinue={() => onContinue(correct)} />}
    </section>
  );
}

export function FieldLesson({ lesson, cluster, path = "conversation" }: { lesson: Lesson; cluster: ClusterId; path?: LearningPathId }) {
  const { progress, ready, update } = useLearner();
  const reduced = useReduced();
  const mission = MISSIONS[lesson.id];
  const chapter = CHAPTERS[cluster];
  const vocabulary = path === "vocabulary";
  const backHref = vocabulary ? vocabularyRoadHref(lesson.id) : "/learn";
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [finished, setFinished] = useState<{ firstTry: number; review: boolean } | null>(null);
  const [translations, setTranslations] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const submitted = useRef(false);
  const question = attempt?.queue[attempt.index];
  const review = progress?.completed.includes(lesson.id);
  const count = lesson.items.length;
  const step = attempt?.index;
  const inActivity = step !== undefined;
  const complete = finished !== null;

  useEffect(() => {
    if (inActivity || complete) contentRef.current?.focus();
  }, [inActivity, step, complete]);

  if (!ready || !progress) return <Loading />;

  function start() {
    setAttempt({ queue: buildFieldChallenges(lesson, mission, cluster, vocabulary ? "vocabulary" : "phrases"), index: 0, correct: 0, firstTry: 0 });
  }

  function leave() {
    if (!submitted.current) return;
    submitted.current = false;
    setFinished(null);
    setAttempt(null);
    setReviewing(false);
    setTranslations(false);
  }

  function next(correct: boolean) {
    if (!attempt || !question || !progress || submitted.current) return;
    const firstTry = attempt.firstTry + Number(correct && attempt.index < count);
    const correctCount = attempt.correct + Number(correct);
    const queue = correct ? attempt.queue : [...attempt.queue, question];

    if (attempt.index + 1 < queue.length) {
      setAttempt({ queue, index: attempt.index + 1, correct: correctCount, firstTry });
      return;
    }

    submitted.current = true;
    setFinished({ firstTry, review: Boolean(review) });
    void update(finishLesson(progress, lesson.id, firstTry, count));
  }

  return (
    <div className={styles.shell} style={{ "--accent": chapter.color, "--chapter-ink": chapter.ink, "--chapter-surface": chapter.surface } as React.CSSProperties}>
      <header className={styles.lessonHeader}>
        <div className={styles.headerInner}>
          <Link href={backHref} onNavigate={leave} className={styles.back} aria-label="Back to ger town"><ArrowLeft size={18} /><span>{vocabulary ? "Word road" : "Ger town"}</span></Link>
          <div className={styles.lessonProgress}><span>{finished ? "Complete" : attempt ? `${attempt.correct} / ${count} solved` : "Lesson preview"}</span><progress value={finished ? count : attempt?.correct ?? 0} max={count} aria-label="Lesson progress" /></div>
          <TextSizeControl />
        </div>
      </header>

      <main className={styles.lessonMain}>
        <header className={styles.lessonIntro} data-practicing={inActivity || complete}>
          <Knot className={styles.heroKnot} />
          <GerIllustration className={styles.heroArt} />
          <p className={styles.eyebrow}><MapPin size={16} /> {vocabulary ? LEARNING_PATHS.vocabulary.title : chapter.title} <span aria-hidden> / </span> {lesson.subtitle}</p>
          <h1>{lesson.title}</h1>
          <div className={styles.introMeta}><span><BookOpen size={14} /> {count} useful {vocabulary ? "sentences" : "phrases"}</span><span><MessageCircle size={14} /> {vocabulary ? "Practice with summer-camp phrases" : "One real conversation"}</span></div>
        </header>

        <div ref={contentRef} tabIndex={-1} className={styles.lessonContent}>
          {inActivity && !complete && <div className={styles.practiceTrail} aria-hidden="true">{Array.from({ length: count }, (_, i) => <span key={i} data-state={i < (attempt?.correct ?? 0) ? "done" : i === attempt?.correct ? "current" : "waiting"}>{i < (attempt?.correct ?? 0) && <Check />}</span>)}</div>}
          <AnimatePresence mode="wait" initial={false}>
          {finished ? (
            <motion.section key="finished" className={styles.finish} initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
              <Celebration reduced={reduced} />
              <Knot className={styles.finishKnot} />
              <motion.div className={styles.finishMark} initial={reduced ? false : { scale: .4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 12 }}><Star size={32} /></motion.div>
              <p className={styles.eyebrow} lang="mn">Баяр хүргэе! · Congratulations</p>
              <h2>{finished.review ? "Review complete" : "Lesson complete"}</h2>
              <p>{finished.firstTry} of {count} correct on the first try · {10 + finished.firstTry} stars earned</p>
              <Link className={styles.primary} href={vocabulary ? vocabularyRoadHref() : "/learn"} onNavigate={leave}>{vocabulary ? "Continue on the word road" : "Back to ger town"} <ArrowRight size={18} /></Link>
            </motion.section>
          ) : question && attempt ? (
            <motion.div key={`question-${attempt.index}`} initial={reduced ? false : { opacity: 0, x: 18, y: 6 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={reduced ? undefined : { opacity: 0, x: -14, y: -3 }} transition={{ duration: reduced ? 0 : .2, ease: "easeOut" }}>
              <Activity challenge={question} mission={mission} retry={attempt.index >= count} position={attempt.index + 1} total={count} onContinue={next} />
            </motion.div>
          ) : (
            <motion.div key="preview" exit={reduced ? undefined : { opacity: 0, y: -8 }} transition={{ duration: reduced ? 0 : .15 }}>
              <section className={styles.brief}>
                <div className={styles.briefIcon} aria-hidden>{lesson.emoji}</div>
                <div>
                  <p className={styles.eyebrow}><Target size={15} /> Your mission</p>
                  <h2>{mission.goal}</h2>
                  <p>{mission.scene}</p>
                </div>
                <button type="button" className={styles.primary} onClick={start}>{review ? "Start review" : "Start practice"} <ArrowRight size={18} /></button>
              </section>

              {review && !reviewing ? (
                <button type="button" className={styles.inlineButton} onClick={() => setReviewing(true)}><BookOpen size={17} /> Review the phrases first</button>
              ) : (
                <div className={styles.reference} data-chapter={cluster}>
                  <section className={styles.phrases} aria-labelledby="phrase-heading">
                    <div className={styles.sectionLabel}><h2 id="phrase-heading"><BookOpen size={17} /> {vocabulary ? "Sentences to practice" : "Phrases to use"}</h2><span lang="mn">{vocabulary ? "Өгүүлбэр" : "Үг хэллэг"}</span></div>
                    <ul>{lesson.items.map((item) => (
                      <li key={item.id}>
                        <div>
                          <p lang="mn">{item.show}</p><small>{item.say}</small><span>{item.meaning}</span>
                          {vocabulary && item.word && <span className={styles.wordTag}>Uses <strong lang="mn">{item.word.mn}</strong> · {item.word.en}</span>}
                          {vocabulary && WORD_SENTENCES[lesson.id]?.find(sentence => sentence.wordId === item.id)?.formNote && <small className={styles.formNote}>{item.trick}</small>}
                          {vocabulary && (() => {
                            const sentence = WORD_SENTENCES[lesson.id]?.find(entry => entry.wordId === item.id);
                            const source = sentence && summerSource(sentence);
                            return source && <Link className={styles.sourceLesson} href={`/learn/${source.lessonId}`}>Summer camp · {source.title}<span lang="mn">{source.phrase}</span></Link>;
                          })()}
                        </div>
                        <Speak text={item.show} />
                      </li>
                    ))}</ul>
                  </section>
                  <div className={styles.context}>
                    {lesson.note && <aside className={styles.cultureNote}><Knot className={styles.noteKnot} /><h2><Sparkles size={17} /> A little local knowledge</h2><p>{lesson.note.text}</p><small>{lesson.note.source}</small></aside>}
                    {lesson.dialogue && <section className={styles.dialogue} aria-labelledby="dialogue-heading">
                      <h2 id="dialogue-heading"><MessageCircle size={17} /> Try the conversation</h2>
                      <button type="button" className={styles.inlineButton} aria-pressed={translations} onClick={() => setTranslations((visible) => !visible)}><Languages size={16} /> {translations ? "Hide translations" : "Show translations"}</button>
                      <ol>{lesson.dialogue.map((line, index) => (
                        <li key={index}><p lang="mn">{line.mn}</p><small>{transliterate(line.mn).toLowerCase()}</small>{translations && <span>{line.en}</span>}<Speak text={line.mn} /></li>
                      ))}</ol>
                    </section>}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
