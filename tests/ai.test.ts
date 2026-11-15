// Run with `npx tsx --test tests/*.test.ts`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseJson, parseRoleplay } from "../lib/ai";

test("parseRoleplay reads the MN/SAY/EN/TIP lines", () => {
  const r = parseRoleplay("MN: Хаашаа явах вэ?\nSAY: khaashaa yavakh ve?\nEN: Where are you going?\nTIP: Say «Сүхбаатарын талбай руу».");
  assert.equal(r.mn, "Хаашаа явах вэ?");
  assert.equal(r.en, "Where are you going?");
  assert.ok(r.tip?.startsWith("Say"));
});

test("parseRoleplay leaves tip empty when there is none", () => {
  assert.equal(parseRoleplay("MN: Сайн уу\nSAY: sain uu\nEN: Hi").tip, undefined);
});

test("parseJson finds JSON even with words around it", () => {
  assert.deepEqual(parseJson<{ a: number }>('Here you go: {"a": 1} hope it helps'), { a: 1 });
  assert.equal(parseJson("no json here"), null);
  assert.equal(parseJson(undefined), null);
});
