/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS hook loads TypeScript fixtures in Node. */
// Focused regression checks. Run with: node scripts/verify-town.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...rest);
};
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(outputText, filename);
};
const { CURRICULUM, GERS } = require('../lib/curriculum.ts');
const { MISSIONS, buildFieldChallenges, challengeAnswer } = require('../lib/fieldLessons.ts');
const { TOWN, SITES } = require('../lib/journey.ts');
const { platformHeight } = require('../components/world/villageLife.ts');
const { groundHeight } = require('../components/world/terrain.ts');
const { BASE_LESSONS } = require('../lib/lessons.ts');
const { isFreeLesson, isFreeGer } = require('../lib/plans.ts');
const { DEFAULT_PATH, PATH_ORDER, FOUNDATION_GERS, VOCABULARY_GERS, foundationGerForLesson, foundationLessonHref } = require('../lib/learningPaths.ts');
const { WORD_SENTENCES, vocabularySentenceLesson, summerSource } = require('../lib/wordSentences.ts');
assert.equal(GERS.length, 24);
assert.equal(CURRICULUM.length, 48);
assert.equal(new Set(CURRICULUM.map(l => l.id)).size, 48);
assert.equal(TOWN.length, 34);
assert.equal(DEFAULT_PATH, 'foundations');
assert.equal(PATH_ORDER[0], DEFAULT_PATH);
assert.equal(FOUNDATION_GERS.length, 5);
const foundationIds = FOUNDATION_GERS.flatMap(g => g.lessonIds);
assert.deepEqual(foundationIds, ['friends', 'tricksters', 'shapes1', 'shapes2', 'specials', 'yletters', 'numbers1', 'numbers2', 'money']);
assert.equal(new Set(foundationIds).size, 9);
assert(!foundationIds.includes('hello') && !foundationIds.includes('signs'));
assert.deepEqual(foundationIds.filter(id => BASE_LESSONS.find(l => l.id === id).kind === 'letters'), BASE_LESSONS.filter(l => l.kind === 'letters').map(l => l.id));
for (const id of foundationIds) {
  assert(isFreeLesson(id), 'Foundation lessons must retain main-branch free access');
  assert(foundationGerForLesson(id));
  assert(foundationLessonHref(id).endsWith('?path=foundations'));
}
assert(isFreeGer('greet') && isFreeGer('emergency'));
assert(!isFreeGer('shop'), 'Paid conversation access must retain main-branch rules');
assert.equal(VOCABULARY_GERS.length, 5);
assert.deepEqual(VOCABULARY_GERS.map(g => g.lessonId), BASE_LESSONS.slice(6).map(l => l.id));
assert(TOWN.filter(g => g.path === 'conversation').every(g => g.x <= 0));
assert(TOWN.filter(g => g.path === 'foundations').every(g => g.x > 0));
assert.equal(TOWN.filter(g => g.path === 'foundations').length, 5);
for (let i = 0; i < 5; i++) {
  const basic = TOWN.find(g => g.id === FOUNDATION_GERS[i].id);
  const words = TOWN.find(g => g.id === VOCABULARY_GERS[i].id);
  assert(Math.abs(basic.z - words.z) >= 50, 'Word road should be separate from alphabet/number road');
}
assert.deepEqual(TOWN.filter(g => g.path === 'vocabulary').map(g => g.number), [1, 2, 3, 4, 5]);
for (const stop of VOCABULARY_GERS) {
  const lesson = BASE_LESSONS.find(l => l.id === stop.lessonId);
  const original = JSON.stringify(lesson);
  const practice = vocabularySentenceLesson(lesson);
  assert.deepEqual(practice.items.map(item => item.id), lesson.items.map(item => item.id));
  assert.equal(WORD_SENTENCES[lesson.id].length, lesson.items.length);
  assert.deepEqual(vocabularySentenceLesson(practice), practice, 'Sentence preparation must be idempotent');
  for (const sentence of WORD_SENTENCES[lesson.id]) {
    const source = summerSource(sentence);
    const summerLesson = CURRICULUM.find(l => l.id === source.lessonId);
    assert.equal(GERS.find(g => g.id === summerLesson.ger).cluster, 'everyday');
    assert(summerLesson.items.some(item => item.show === source.phrase));
    assert(sentence.mn.split(/\s+/).length >= 3);
    assert(/[.?!]$/.test(sentence.mn));
    assert(sentence.en.split(/\s+/).length >= 3);
    const item = practice.items.find(i => i.id === sentence.wordId);
    assert.equal(item.word.mn, lesson.items.find(i => i.id === sentence.wordId).show);
  }
  const mission = MISSIONS[lesson.id];
  assert(lesson.items[mission.target]);
  for (let run = 0; run < 100; run++) {
    const questions = buildFieldChallenges(lesson, mission, 'everyday', 'vocabulary');
    assert.equal(questions.length, lesson.items.length);
    assert.deepEqual(questions.map(q => q.item.id).sort(), lesson.items.map(i => i.id).sort());
    assert(questions.some(q => q.kind === 'sentence'));
    assert(questions.some(q => q.kind === 'meaning'));
    assert.equal(questions.filter(q => q.kind === 'order').length, 1);
    assert.equal(questions.at(-1).kind, 'reply');
    for (const question of questions) {
      assert(question.context?.lessonId);
      assert(question.item.show.split(/\s+/).length >= 3);
      if (question.kind === 'order') {
        assert.deepEqual([...question.choices].sort(), question.item.show.split(/\s+/).sort());
        assert.notEqual(question.choices.join(' '), question.item.show);
      } else {
        assert(question.choices.includes(challengeAnswer(question)));
        assert.equal(new Set(question.choices).size, 3);
        assert(question.choices.every(choice => practice.items.some(item => (question.kind === 'meaning' ? item.meaning : item.show) === choice)));
        assert(question.choices.every(choice => choice.split(/\s+/).length >= 3));
      }
    }
  }
  assert.equal(JSON.stringify(lesson), original, 'Keep original word lists and flashcard content intact');
}
assert.equal(Object.values(WORD_SENTENCES).flat().length, 31);
for (let a = 0; a < TOWN.length; a++) for (let b = a + 1; b < TOWN.length; b++) {
  assert(Math.hypot(TOWN[a].x - TOWN[b].x, TOWN[a].z - TOWN[b].z) > 12.5, 'Ger platforms overlap');
}
for (const lesson of CURRICULUM.slice(0, 12)) {
  assert.equal(lesson.items.length, 6, lesson.id);
  assert(lesson.dialogue.length >= 3);
  assert(lesson.note?.source);
  for (const item of lesson.items) {
    assert(/[А-Яа-яӨөҮү]/u.test(item.show), `${lesson.id}: missing Mongolian`);
    assert(item.meaning && item.say);
    assert(!item.show.includes('�'), `${lesson.id}: broken encoding`);
  }
  for (let run = 0; run < 100; run++) {
    const questions = buildFieldChallenges(lesson, MISSIONS[lesson.id], 'everyday');
    assert.equal(questions.length, lesson.items.length);
    assert.equal(new Set(questions.map(q => q.item.id)).size, lesson.items.length);
    assert.equal(questions.at(-1).kind, 'reply');
    for (const question of questions) {
      if (question.kind === 'order') {
        assert.deepEqual([...question.choices].sort(), question.item.show.split(/\s+/).sort());
        assert.notEqual(question.choices.join(' '), question.item.show);
      } else {
        assert(question.choices.includes(challengeAnswer(question)));
        assert.equal(new Set(question.choices).size, 3);
      }
    }
  }
}
for (const ger of TOWN) {
  const x = SITES[0].x + ger.x, z = SITES[0].z + ger.z;
  const top = platformHeight(x, z);
  for (let r = 0; r <= 6.25; r += .25) for (let a = 0; a < Math.PI * 2; a += Math.PI / 64) {
    assert(top > groundHeight(x + Math.cos(a) * r, z + Math.sin(a) * r), `${ger.id}: foundation intersects terrain`);
  }
}
console.log('PASS: five default alphabet/number gers, nine basic lessons, separate word/sentence and conversation roads, 31 preserved sentences, 1,700 practice rounds and 34 raised ger foundations.');
