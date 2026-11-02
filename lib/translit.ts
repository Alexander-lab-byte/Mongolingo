// Mongolian Cyrillic → Latin letters, so learners can say a word before they can read it.
// Based on the common romanization used on signs and passports (MNS 5217), simplified.
const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "ye", ё: "yo", ж: "j", з: "z", и: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", ө: "ö", п: "p", р: "r", с: "s", т: "t", у: "u",
  ү: "ü", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "i",
  э: "e", ю: "yu", я: "ya",
};

export function transliterate(text: string) {
  let out = "";
  for (const ch of text) {
    const lower = ch.toLowerCase();
    const t = MAP[lower];
    if (t === undefined) {
      out += ch;
    } else if (ch !== lower && t) {
      out += t[0].toUpperCase() + t.slice(1);
    } else {
      out += t;
    }
  }
  return out;
}

export const hasCyrillic = (s: string) => /[Ѐ-ӿ]/.test(s);
