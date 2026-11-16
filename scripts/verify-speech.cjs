/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS hook loads the TypeScript route in Node. */
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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  module._compile(outputText, filename);
};
const { LESSONS } = require('../lib/lessons.ts');
const { WORD_SENTENCES } = require('../lib/wordSentences.ts');
const manifest = require('../lib/pronunciations.json');
const { GET } = require('../app/api/speech/route.ts');
const allText = new Set([
  ...LESSONS.flatMap(lesson => [...lesson.items.flatMap(item => [item.show, item.word?.mn]), ...(lesson.dialogue ?? []).map(line => line.mn)]),
  ...Object.values(WORD_SENTENCES).flat().map(sentence => sentence.mn),
].filter(Boolean).map(text => text.trim()));

(async () => {
  const files = new Set();
  for (const text of allText) {
    const src = manifest[text];
    assert.match(src ?? '', /^\/audio\/mn\/[a-f0-9]{24}\.mp3$/, `Missing recording: ${text}`);
    assert(!files.has(src), 'Different phrases should have their own recordings');
    files.add(src);
    const audio = fs.readFileSync(path.join(root, 'public', src));
    assert(audio.length > 1000, `Empty recording: ${text}`);
    assert(audio.subarray(0, 3).toString() === 'ID3' || audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0, 'Expected an MP3 header');
    const response = await GET(new Request('http://localhost/api/speech?text=' + encodeURIComponent(text)));
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get('Location')).pathname, src);
  }
  for (const input of ['', 'not curriculum text', '__proto__', 'constructor', 'А'.repeat(601)]) {
    assert.equal((await GET(new Request('http://localhost/api/speech?text=' + encodeURIComponent(input)))).status, 400);
  }
  assert.equal((await GET(new Request('http://localhost/api/speech'))).status, 400);
  console.log(`PASS: ${allText.size} curriculum recordings, MP3 files, playback redirects and invalid-input handling.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
