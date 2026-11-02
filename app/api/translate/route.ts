// Free machine translation (MyMemory API, no key needed).
// Good for quick help; checked phrases in the phrasebook are more reliable.

const MAX = 450;

export async function POST(request: Request) {
  let body: { text?: unknown; from?: unknown; to?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const from = body.from === "mn" ? "mn" : "en";
  const to = from === "mn" ? "en" : "mn";
  if (!text) return Response.json({ error: "Type something to translate." }, { status: 400 });
  if (text.length > MAX) return Response.json({ error: `Please keep it under ${MAX} characters.` }, { status: 400 });

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const translated: string | undefined = data?.responseData?.translatedText;
    if (!res.ok || data?.responseStatus !== 200 || !translated) {
      return Response.json({ error: "The translator is busy. Try again in a minute." }, { status: 502 });
    }
    return Response.json({ text: translated, from, to });
  } catch {
    return Response.json({ error: "Can't reach the translator. Check your internet and try again." }, { status: 502 });
  }
}
