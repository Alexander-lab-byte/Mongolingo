import { notFound } from "next/navigation";
import { LESSONS, getLesson } from "@/lib/lessons";
import { LessonPlayer } from "@/components/LessonPlayer";
import { FieldLesson } from "@/components/FieldLesson";
import { GERS } from "@/lib/curriculum";
import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { vocabularyGerForLesson } from "@/lib/learningPaths";
import { vocabularySentenceLesson } from "@/lib/wordSentences";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ lesson: l.id }));
}

export default function LessonPage({ params }: PageProps<"/learn/[lesson]">) {
  return <Suspense fallback={<Loading />}><LessonContent params={params} /></Suspense>;
}

async function LessonContent({ params }: Pick<PageProps<"/learn/[lesson]">, "params">) {
  const { lesson } = await params;
  const entry = getLesson(lesson);
  if (!entry) notFound();
  const vocabularyGer = vocabularyGerForLesson(lesson);
  if (vocabularyGer) return <FieldLesson
    key={lesson}
    lesson={vocabularySentenceLesson({ ...entry, ger: vocabularyGer.id, subtitle: vocabularyGer.name, note: { text: vocabularyGer.note, source: "Summer camp · Familiar phrases in new sentences" } })}
    cluster="everyday"
    path="vocabulary"
  />;
  const ger = entry.ger && GERS.find((stop) => stop.id === entry.ger);
  return ger ? <FieldLesson key={lesson} lesson={entry} cluster={ger.cluster} /> : <LessonPlayer key={lesson} lessonId={lesson} />;
}
