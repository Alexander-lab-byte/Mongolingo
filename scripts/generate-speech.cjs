/* eslint-disable @typescript-eslint/no-require-imports -- Node build utility loads the TypeScript curriculum. */
// Regenerate the checked-in Mongolian lesson recordings: npm run audio:generate
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const Module = require('node:module');
const ts = require('typescript');
const { EdgeTTS } = require('node-edge-tts');
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
const { LESSONS } = require('../lib/lessons.ts');
const { WORD_SENTENCES } = require('../lib/wordSentences.ts');
const texts = [...new Set([
  ...LESSONS.flatMap(lesson => [
    ...lesson.items.flatMap(item => [item.show, item.word?.mn]),
    ...(lesson.dialogue ?? []).map(line => line.mn),
  ]),
  ...Object.values(WORD_SENTENCES).flat().map(sentence => sentence.mn),
].filter(Boolean).map(text => text.trim()))].sort();
const folder = path.join(root, 'public/audio/mn');
fs.mkdirSync(folder, { recursive: true });
const manifest = {};
let next = 0, finished = 0;

async function record(text) {
  const hash = crypto.createHash('sha256').update('YesuiNeural:-15%:v1:' + text).digest('hex').slice(0, 24);
  const filename = hash + '.mp3';
  const output = path.join(folder, filename);
  if (!fs.existsSync(output) || fs.statSync(output).size < 1000) {
    let failure;
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const chunks = [];
        const voice = new EdgeTTS({ voice: 'mn-MN-YesuiNeural', lang: 'mn-MN', rate: '-15%', timeout: 12000 });
        // The voice needs Щ's alphabet name (toli.gov.mn/r); an isolated Щ is silent.
        const spoken = text === 'Ь' ? 'зөөлний тэмдэг' : text === 'Ъ' ? 'хатуугийн тэмдэг' : text === 'Щ' ? 'ща' : text;
        for await (const chunk of voice.streamAudio(spoken)) if (Buffer.isBuffer(chunk)) chunks.push(chunk);
        const audio = Buffer.concat(chunks);
        if (audio.length < 1000) throw new Error('Empty recording');
        fs.writeFileSync(output, audio);
        failure = undefined;
        break;
      } catch (error) {
        failure = error;
        const delay = /429/.test(error.message) ? Math.min(30000, 5000 * 2 ** attempt) : 500 * (attempt + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    if (failure) throw failure;
  }
  manifest[text] = '/audio/mn/' + filename;
  finished++;
  if (finished % 25 === 0 || finished === texts.length) console.log(`Recorded ${finished}/${texts.length}`);
}

async function worker() {
  while (next < texts.length) await record(texts[next++]);
}
Promise.all([worker(), worker(), worker()]).then(() => {
  const ordered = Object.fromEntries(texts.map(text => [text, manifest[text]]));
  fs.writeFileSync(path.join(root, 'lib/pronunciations.json'), JSON.stringify(ordered, null, 2) + '\n');
  console.log(`Saved ${texts.length} Mongolian recordings and pronunciation manifest.`);
}).catch(error => { console.error('Audio generation failed:', error.message); process.exitCode = 1; });
