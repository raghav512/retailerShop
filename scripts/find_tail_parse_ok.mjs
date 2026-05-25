import fs from 'fs';
import parser from '@babel/parser';

const lines = fs.readFileSync(new URL('../src/i18n/resources.js', import.meta.url), 'utf8').split(/\r?\n/);

const canParse = (count) => {
  const code = lines.slice(0, count).join('\n');
  try {
    parser.parse(code, { sourceType: 'module' });
    return true;
  } catch {
    return false;
  }
};

let lo = 1;
let hi = lines.length;
let lastGood = null;

while (lo <= hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (canParse(mid)) {
    lastGood = mid;
    lo = mid + 1;
  } else {
    hi = mid - 1;
  }
}

if (lastGood === null) {
  console.log('No prefix parses without errors.');
  process.exit(0);
}

console.log(`Last parsable line: ${lastGood}`);
console.log(lines.slice(Math.max(0, lastGood - 3), lastGood + 2).join('\n'));
