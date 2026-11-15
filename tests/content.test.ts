// Checks every lesson can be played: run with `npx tsx --test tests/content.test.ts`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { LESSONS } from "../lib/lessons";
import { PACKS, PACK_LESSONS } from "../lib/packs";
import { hasCyrillic } from "../lib/translit";

test("at least 100 topic-pack lessons, 5 per pack", () => {
  assert.ok(PACK_LESSONS.length >= 100, `only ${PACK_LESSONS.length}`);
  for (const p of PACKS) assert.equal(p.lessons.length, 5, p.id);
});

test("lesson ids are unique across the whole app", () => {
  const ids = LESSONS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("every pack lesson has 5 items with Cyrillic, pronunciation and meaning", () => {
  for (const l of PACK_LESSONS) {
    assert.equal(l.items.length, 5, l.id);
    for (const it of l.items) {
      assert.ok(hasCyrillic(it.show), `${l.id}: ${it.show}`);
      assert.ok(it.say.length > 0 && !hasCyrillic(it.say), `${l.id}: say ${it.say}`);
      assert.ok(it.meaning && it.meaning.length > 0, `${l.id}: meaning`);
    }
  }
});

test("no lesson repeats the same text or meaning twice (the quiz needs distinct answers)", () => {
  for (const l of PACK_LESSONS) {
    assert.equal(new Set(l.items.map((i) => i.show)).size, 5, `${l.id} text`);
    assert.equal(new Set(l.items.map((i) => i.meaning)).size, 5, `${l.id} meaning`);
  }
});
