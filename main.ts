// The Best Meal You Ever Had — make.fun entry
// One sentence about the best meal ever had: my grandmother's
// pork-and-chive dumplings at a Chengdu night market, broth scalding
// my tongue, steam fogging my glasses — a taste that still feels
// like the only home I have ever needed.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

// The memory, held as one sentence built from its three beats.
interface SentenceParts {
  dish: string;
  moment: string;
  aftertaste: string;
}

const PARTS: SentenceParts = {
  dish: "My grandmother's pork-and-chive dumplings at the Chengdu night market",
  moment: "— broth scalding my tongue, steam fogging my glasses —",
  aftertaste: "still taste like the only home I have ever needed.",
};

function assembleSentence(parts: SentenceParts): string {
  return [parts.dish, parts.moment, parts.aftertaste].join(" ");
}

function countSentences(text: string): number {
  // A sentence ends on a terminal period; the em-dash asides carry none.
  return (text.match(/\.(?=\s|$)/g) ?? []).length;
}

interface GateReport {
  ok: boolean;
  chars: number;
  lines: number;
  sentences: number;
  reason: string;
}

function validateEntry(text: string): GateReport {
  const chars = [...text].length;
  const lines = text.split("\n").length;
  const sentences = countSentences(text);
  if (chars < 1 || chars > 200) return { ok: false, chars, lines, sentences, reason: "length out of 1-200" };
  if (lines !== 1) return { ok: false, chars, lines, sentences, reason: "not a single line" };
  if (sentences !== 1) return { ok: false, chars, lines, sentences, reason: "not exactly one sentence" };
  if (text.trim().length === 0) return { ok: false, chars, lines, sentences, reason: "blank" };
  return { ok: true, chars, lines, sentences, reason: "passes" };
}

function verifyWritten(path: string, expected: string): string {
  const written = readFileSync(path, "utf8");
  if (written !== expected) throw new Error("written entry differs from built entry");
  return createHash("sha256").update(written, "utf8").digest("hex");
}

const ENTRY = assembleSentence(PARTS);
const gate = validateEntry(ENTRY);
if (!gate.ok) {
  console.error(`gate fails: ${gate.reason} (${gate.chars} characters, ${gate.lines} lines, ${gate.sentences} sentences)`);
  process.exit(1);
}
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = `${outDir}/entry.txt`;
writeFileSync(outPath, ENTRY, "utf8");
const sha = verifyWritten(outPath, ENTRY);
console.log(`gate passes: ${gate.chars} characters, ${gate.lines} line, ${gate.sentences} sentence, sha256 ${sha}`);
console.log(`wrote ${outPath}`);
console.log(`verified: ${JSON.stringify(ENTRY)}`);
