#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import fg from "fast-glob";

/**
 * Local link checker.
 * - Verifies relative links in markdown point to existing files.
 * - Ignores http(s), mailto, and pure anchors (#...).
 *
 * Usage:
 *   node scripts/link-check.mjs
 */

const repoRoot = process.cwd();
const targets = ["kb/**/*.md", "architecture/specs/**/*.md", "ops/**/*.md", "docs/**/*.md"];
const ignore = ["**/node_modules/**", "**/.git/**", "manifests/**"];

const linkRe = /\[[^\]]*?\]\(([^)]+)\)/g;

function isExternal(href) {
  return /^https?:\/\//i.test(href) || /^mailto:/i.test(href);
}

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function main() {
  const files = await fg(targets, { cwd: repoRoot, dot: true, onlyFiles: true, ignore });
  const errors = [];

  for (const rel of files.sort()) {
    const abs = path.join(repoRoot, rel);
    const raw = await fs.readFile(abs, "utf8");
    // Strip inline code spans so markdown link examples inside backticks
    // (e.g. `[text](url)`) are not false-positived as real relative links.
    const rawStripped = raw.replace(/`[^`\n]+`/g, (s) => "`" + " ".repeat(s.length - 2) + "`");
    let m;
    while ((m = linkRe.exec(rawStripped)) !== null) {
      let href = m[1].trim();
      if (!href || href.startsWith("#") || isExternal(href)) continue;

      // strip title part and anchors
      href = href.split(/\s+/)[0];
      const [pathPart] = href.split("#");
      if (!pathPart) continue;

      // ignore links with protocols other than http(s) and mailto
      if (/^[a-z]+:\/\//i.test(pathPart)) continue;

      const targetAbs = path.resolve(path.dirname(abs), pathPart);
      const exists = await fileExists(targetAbs);
      if (!exists) errors.push({ file: rel, link: href });
    }
  }

  if (errors.length) {
    console.error(`Link check failed: ${errors.length} broken local link(s)\n`);
    for (const e of errors.slice(0, 200)) console.error(`- ${e.file}: ${e.link}`);
    if (errors.length > 200) console.error(`... (${errors.length - 200} more omitted)`);
    process.exit(1);
  }

  console.log(`Link check passed: ${files.length} file(s) scanned.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
