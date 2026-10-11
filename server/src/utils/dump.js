import { readFileSync } from 'fs';
const [,, filePath, startLine, endLine] = process.argv;
if (!filePath || !startLine || !endLine) { console.error('Usage: node dump.js <file> <start> <end>'); process.exit(1); }
const s = readFileSync(filePath, 'utf8');
const lines = s.split('\n');
let out = '';
for (let i = Number(startLine); i <= Number(endLine); i++) { out += `=== LINE ${i} ===\n${lines[i-1]}\n\n`; }
console.log(out);
