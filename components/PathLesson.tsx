"use client";

import { useSearchParams } from "next/navigation";
import type { Lesson } from "@/lib/lessons";
import { foundationGerForLesson, foundationRoadHref, vocabularyGerForLesson } from "@/lib/learningPaths";
import { vocabularySentenceLesson } from "@/lib/wordSentences";
import { FieldLesson } from "./FieldLesson";
import { LessonPlayer } from "./LessonPlayer";

/** The same saved lesson ID can be practiced as numbers or in a sentence. */
export function PathLesson({ lesson }: { lesson: Lesson }) {
  const searchParams = useSearchParams();
  const foundationGer = foundationGerForLesson(lesson.id);
  if (foundationGer && searchParams.get("path") === "foundations") return <LessonPlayer
    key={`foundations-${lesson.id}`}
    lessonId={lesson.id}
    lessonTitle={lesson.id === "money" ? "Larger numbers" : undefined}
    backHref={foundationRoadHref(lesson.id)}
    continueHref={foundationRoadHref()}
  />;
  const ger = vocabularyGerForLesson(lesson.id)!;
  return <FieldLesson
    key={`vocabulary-${lesson.id}`}
    lesson={vocabularySentenceLesson({ ...lesson, ger: ger.id, subtitle: ger.name, note: { text: ger.note, source: "Summer camp · Familiar phrases in new sentences" } })}
    cluster="everyday"
    path="vocabulary"
  />;
}
