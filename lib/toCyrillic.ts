// Writes a Latin-letter name in Mongolian Cyrillic, the way it would be spelled by sound.
// It's an approximation; a Mongolian friend may spell it a little differently.
const PAIRS: [string, string][] = [
  ["shch", "щ"], ["sh", "ш"], ["ch", "ч"], ["kh", "х"], ["zh", "ж"], ["ts", "ц"],
  ["ya", "я"], ["yu", "ю"], ["yo", "ё"], ["ye", "е"], ["ph", "ф"], ["th", "т"],
  ["oo", "у"], ["ee", "и"], ["ck", "к"], ["qu", "кв"],
];
const SINGLE: Record<string, string> = {
  a: "а", b: "б", c: "к", d: "д", e: "э", f: "ф", g: "г", h: "х", i: "и", j: "ж", k: "к",
  l: "л", m: "м", n: "н", o: "о", p: "п", q: "к", r: "р", s: "с", t: "т", u: "у", v: "в",
  w: "в", x: "кс", y: "й", z: "з",
};

export function toCyrillic(name: string) {
  const src = name.trim();
  let out = "";
  let i = 0;
  while (i < src.length) {
    const rest = src.slice(i).toLowerCase();
    const upper = src[i] !== src[i].toLowerCase();
    let piece = "";
    let len = 1;
    const pair = PAIRS.find(([lat]) => rest.startsWith(lat));
    if (pair) {
      piece = pair[1];
      len = pair[0].length;
    } else if (rest[0] === "c" && "eiy".includes(rest[1] ?? "")) {
      piece = "с"; // "ce", "ci" sound like s
    } else if (rest[0] === "y" && /[aeiou]/.test(rest[1] ?? "") === false && i > 0) {
      piece = "и"; // "Amy" → "Эми"
    } else if (rest[0] === "h" && i > 0 && /[aeiou]/.test(src[i - 1].toLowerCase()) && !/[aeiou]/.test(rest[1] ?? "")) {
      piece = ""; // silent h after a vowel: "Sarah" → "Сара", "John" → "Жон"
    } else if (rest[0] === "e" && i > 0 && /[a-z]/.test(src[i - 1].toLowerCase()) && !/[a-z]/.test(rest[1] ?? "")) {
      piece = ""; // silent final e: "Kate" → "Кейт" is too clever; just drop it
    } else {
      piece = SINGLE[rest[0]] ?? src[i];
    }
    out += upper && piece ? piece[0].toUpperCase() + piece.slice(1) : piece;
    i += len;
  }
  return out;
}
