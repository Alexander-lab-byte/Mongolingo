import pronunciations from "@/lib/pronunciations.json";

const recordings: Record<string, string> = pronunciations;

// All lesson speech is generated and checked in ahead of time, so playback
// does not depend on the availability of an external speech service.
export async function GET(request: Request) {
  const text = new URL(request.url).searchParams.get("text")?.trim();
  if (!text || text.length > 600 || !Object.hasOwn(recordings, text)) {
    return Response.json({ error: "Choose a lesson letter, word or sentence." }, { status: 400 });
  }
  return new Response(null, { status: 307, headers: {
    Location: new URL(recordings[text], request.url).href,
    "Cache-Control": "public, max-age=604800, immutable",
    "X-Content-Type-Options": "nosniff",
  } });
}
