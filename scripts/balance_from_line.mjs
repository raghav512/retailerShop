import fs from 'fs';

const startLine = Number(process.argv[2] || 1);
const lines = fs.readFileSync(new URL('../src/i18n/resources.js', import.meta.url), 'utf8').split(/\r?\n/);
const input = lines.slice(startLine - 1).join('\n');

let balance = 0;
let inSingle = false;
let inDouble = false;
let inTemplate = false;
let inLineComment = false;
let inBlockComment = false;
let escaped = false;

for (let i = 0; i < input.length; i += 1) {
  const ch = input[i];
  const next = input[i + 1];

  if (ch === '\n') {
    inLineComment = false;
    escaped = false;
    continue;
  }

  if (inLineComment) continue;

  if (inBlockComment) {
    if (ch === '*' && next === '/') {
      inBlockComment = false;
      i += 1;
    }
    continue;
  }

  if (inSingle || inDouble || inTemplate) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (inSingle && ch === "'") inSingle = false;
    else if (inDouble && ch === '"') inDouble = false;
    else if (inTemplate && ch === '`') inTemplate = false;
    continue;
  }

  if (ch === '/' && next === '/') {
    inLineComment = true;
    i += 1;
    continue;
  }
  if (ch === '/' && next === '*') {
    inBlockComment = true;
    i += 1;
    continue;
  }

  if (ch === "'") {
    inSingle = true;
    continue;
  }
  if (ch === '"') {
    inDouble = true;
    continue;
  }
  if (ch === '`') {
    inTemplate = true;
    continue;
  }

  if (ch === '{') balance += 1;
  if (ch === '}') balance -= 1;
}

console.log(`Brace balance from line ${startLine}: ${balance}`);
