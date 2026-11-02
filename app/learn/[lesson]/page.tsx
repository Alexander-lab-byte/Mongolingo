import { notFound } from "next/navigation";
import { LESSONS, getLesson } from "@/lib/lessons";
import { LessonPlayer } from "@/components/LessonPlayer";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ lesson: l.id }));
}

export default async function LessonPage({ params }: PageProps<"/learn/[lesson]">) {
  const { lesson } = await params;
  if (!getLesson(lesson)) notFound();
  return <LessonPlayer lessonId={lesson} />;
}
