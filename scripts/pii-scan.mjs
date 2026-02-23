#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import fg from "fast-glob";

/**
 * PII scan (advisory by default).
 * - Scans markdown for common PII patterns (emails, phones).
 * - Strips code spans and fenced blocks to reduce false positives.
 * - Supports pii:ignore comments for line-level suppression.
 * - Maintains an allowlist of known-safe patterns.
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

// Allowlist: known-safe patterns that match PII regex but are not real PII
const allowlist = [
  /example\.com/i,           // common placeholder domain
  /test@test\.com/i,         // test placeholder email
  /\[\w+@\w+\.com\]/,        // emails in square brackets (likely placeholders)
  /^\d{4}-\d{2}-\d{2}$/      // YYYY-MM-DD dates; a very common false positive from phone regex
];

const patterns = [
  { name: "email", re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  // very loose UK-ish phone/intl phone
  { name: "phone", re: /(?:\+?\d[\d\s().-]{8,}\d)/g }
];

function stripCodeSpans(line) {
  // Replace inline code spans with spaces to preserve line length
  return line.replace(/`[^`\n]+`/g, (s) => "`" + " ".repeat(s.length - 2) + "`");
}

function stripFencedBlocks(content) {
  // Replace triple-backtick or triple-tilde fenced blocks with blank lines
  return content.replace(/```[\s\S]*?```/g, (block) => {
    const lineCount = (block.match(/\n/g) || []).length;
    return "\n".repeat(lineCount);
  }).replace(/~~~[\s\S]*?~~~/g, (block) => {
    const lineCount = (block.match(/\n/g) || []).length;
    return "\n".repeat(lineCount);
  });
}

function isAllowedPattern(value) {
  for (const pattern of allowlist) {
    if (pattern.test(value)) return true;
  }
  return false;
}

function scanLine(line, lineNum, allLines) {
  // Check for pii:ignore comment on this line
  if (line.includes("pii:ignore")) return [];

  // Strip code spans from the scanned line
  const stripped = stripCodeSpans(line);
  const hits = [];
  for (const p of patterns) {
    p.re.lastIndex = 0;
    let m;
    while ((m = p.re.exec(stripped)) !== null) {
      const value = m[0];
      if (!isAllowedPattern(value)) {
        hits.push({ type: p.name, value });
      }
    }
  }
  return hits;
}

async function main() {
  const files = await fg(targets, { cwd: repoRoot, dot: true, onlyFiles: true, ignore });
  const findings = [];
  const suppressedCount = { total: 0, ignored: 0, allowlisted: 0 };

  for (const rel of files.sort()) {
    const abs = path.join(repoRoot, rel);
    const raw = await fs.readFile(abs, "utf8");

    // Strip fenced code blocks first
    const noFences = stripFencedBlocks(raw);
    const lines = noFences.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const hits = scanLine(lines[i], i + 1, lines);
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
      console.log("To suppress a finding, add 'pii:ignore' comment on that line.");
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
