#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import fg from "fast-glob";

/**
 * PII scan (advisory by default).
 * - Scans markdown for common PII patterns (emails, phones).
 * - Exits 0 by default; set PII_ENFORCE=1 to fail build.
 *
 * Usage:
 *   node scripts/pii-scan.mjs
 */

const repoRoot = process.cwd();
const enforce = process.env.PII_ENFORCE === "1" || process.env.PII_ENFORCE === "true";

const targets = [
  "kb/**/*.md",
  "architecture/specs/**/*.md",
  "ops/**/*.md"
];

const ignore = ["**/node_modules/**", "**/.git/**", "docs/**", "manifests/**"];

const patterns = [
  { name: "email", re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  // very loose UK-ish phone/intl phone
  { name: "phone", re: /(?:\+?\d[\d\s().-]{8,}\d)/g }
];

function scanLine(line) {
  const hits = [];
  for (const p of patterns) {
    p.re.lastIndex = 0;
    let m;
    while ((m = p.re.exec(line)) !== null) {
      hits.push({ type: p.name, value: m[0] });
    }
  }
  return hits;
}

async function main() {
  const files = await fg(targets, { cwd: repoRoot, dot: true, onlyFiles: true, ignore });
  const findings = [];

  for (const rel of files.sort()) {
    const abs = path.join(repoRoot, rel);
    const raw = await fs.readFile(abs, "utf8");
    const lines = raw.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const hits = scanLine(lines[i]);
      for (const h of hits) {
        findings.push({ file: rel, line: i + 1, ...h });
      }
    }
  }

  if (findings.length) {
    console.log(`PII scan findings: ${findings.length}\n`);
    for (const f of findings.slice(0, 200)) {
      console.log(`- ${f.file}:${f.line} [${f.type}] ${f.value}`);
    }
    if (findings.length > 200) console.log(`... (${findings.length - 200} more omitted)`);
    if (enforce) {
      console.error("\nPII_ENFORCE is enabled: failing build.");
      process.exit(1);
    } else {
      console.log("\nAdvisory mode: PII scan does not fail builds (set PII_ENFORCE=1 to enforce).");
      process.exit(0);
    }
  }

  console.log("PII scan: no findings.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
