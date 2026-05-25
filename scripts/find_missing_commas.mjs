import fs from 'fs';

const lines = fs.readFileSync(new URL('../src/i18n/resources.js', import.meta.url), 'utf8').split(/\r?\n/);

const isCommentLine = (line) => {
  const t = line.trim();
  return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*');
};

const isPropLine = (line) => {
  return /^\s*([\w$-]+|'.*'|".*")\s*:\s*/.test(line);
};

const results = [];

for (let i = 0; i < lines.length - 1; i += 1) {
  const line = lines[i];
  const t = line.trim();
  if (!t || isCommentLine(line)) continue;

  const endsWithComma = /,\s*$/.test(t);
  const endsWithColon = /:\s*$/.test(t);
  if (endsWithComma || endsWithColon) continue;

  const endsWithValue = /[}\])'\"]/.test(t);
  if (!endsWithValue) continue;

  let j = i + 1;
  while (j < lines.length && (!lines[j].trim() || isCommentLine(lines[j]))) j += 1;
  if (j >= lines.length) continue;

  if (isPropLine(lines[j])) {
    results.push({ line: i + 1, next: j + 1, text: lines[i], nextText: lines[j] });
  }
}

if (results.length === 0) {
  console.log('No obvious missing commas found.');
} else {
  results.slice(0, 20).forEach((r) => {
    console.log(`${r.line} -> ${r.next}: ${r.text.trim()} || ${r.nextText.trim()}`);
  });
  if (results.length > 20) console.log(`... ${results.length - 20} more`);
}
