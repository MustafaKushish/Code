// Prüft, ob jeder deutsche Text der Kunden-Website in en/tr/ar übersetzt ist.
// Aufruf: npm run i18n:check            → Liste fehlender und unbenutzter Einträge, Fehlercode bei Lücken
//         npm run i18n:check -- --dump  → alle deutschen Schlüssel als JSON (Vorlage für neue Sprachen)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { REPAIR_DATA, CATEGORY_LABELS } from '../src/data/repairData.ts';
import { UNIFIED_STEPS } from '../src/utils/orderStatus.ts';

const ROOT = join(import.meta.dirname, '..');
const SRC = join(ROOT, 'src');
// Der Werkstatt-Manager ist bewusst nur deutsch
const SKIP_DIRS = new Set([join(SRC, 'manager'), join(SRC, 'i18n')]);
const LANGS = ['en', 'tr', 'ar'] as const;

// Meldungen, die der Worker bzw. die Status-Abfrage auf Deutsch liefert und die übersetzt angezeigt werden
const SERVER_MESSAGES = [
  'Zu viele Versuche. Bitte in 15 Minuten erneut probieren.',
  'Bitte Auftragsnummer und die letzten 4 Ziffern der Telefonnummer angeben.',
  'Auftrag nicht gefunden. Bitte Auftragsnummer und Telefonziffern prüfen.',
  'Status-Server nicht erreichbar. Bitte später erneut versuchen.',
];

function walk(dir: string): string[] {
  if (SKIP_DIRS.has(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.(ts|tsx)$/.test(name) ? [p] : [];
  });
}

function unescapeJs(s: string): string {
  return s.replace(/\\(n|t|'|"|\\)/g, (_, c: string) => ({ n: '\n', t: '\t' })[c as 'n' | 't'] ?? c);
}

const keys = new Map<string, string>(); // Schlüssel → Fundort
const CALL = /\b(?:t|msg)\(\s*(?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)")/g;

for (const file of walk(SRC)) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(CALL)) {
    const key = unescapeJs(m[1] ?? m[2]);
    if (key.trim()) keys.set(key, relative(ROOT, file));
  }
}

for (const faults of Object.values(REPAIR_DATA)) {
  for (const f of faults) {
    for (const s of [f.title, f.desc, f.time, f.compare, f.crossSell, ...f.steps]) {
      if (s) keys.set(s, 'src/data/repairData.ts');
    }
  }
}
for (const c of Object.values(CATEGORY_LABELS)) keys.set(c.label, 'src/data/repairData.ts');
for (const s of UNIFIED_STEPS) {
  keys.set(s.label, 'src/utils/orderStatus.ts');
  keys.set(s.defaultStatusText, 'src/utils/orderStatus.ts');
}
for (const s of SERVER_MESSAGES) keys.set(s, 'worker/src/index.ts');

if (process.argv.includes('--dump')) {
  console.log(JSON.stringify(Object.fromEntries([...keys.keys()].map((k) => [k, ''])), null, 2));
  process.exit(0);
}

let missingTotal = 0;
for (const lang of LANGS) {
  const dict = JSON.parse(readFileSync(join(SRC, 'i18n', 'locales', `${lang}.json`), 'utf8')) as Record<string, string>;
  const missing = [...keys.keys()].filter((k) => !dict[k]?.trim());
  const unused = Object.keys(dict).filter((k) => !keys.has(k));
  const badVars = Object.entries(dict).filter(([k, v]) => {
    const want = (k.match(/\{\w+\}/g) || []).sort().join();
    return keys.has(k) && (v.match(/\{\w+\}/g) || []).sort().join() !== want;
  });
  missingTotal += missing.length + badVars.length;
  console.log(`${lang}: ${keys.size - missing.length}/${keys.size} übersetzt`);
  for (const k of missing) console.log(`  fehlt: ${JSON.stringify(k).slice(0, 110)}  (${keys.get(k)})`);
  for (const [k] of badVars) console.log(`  Platzhalter passen nicht: ${JSON.stringify(k).slice(0, 110)}`);
  for (const k of unused) console.log(`  unbenutzt: ${JSON.stringify(k).slice(0, 110)}`);
}

process.exit(missingTotal ? 1 : 0);
