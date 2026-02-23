#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import fg from "fast-glob";
import matter from "gray-matter";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

// fast-glob v3 removed isMatch; use micromatch (transitive dep) instead.
const require = createRequire(import.meta.url);
const micromatch = require("micromatch");

/**
 * Path-aware frontmatter validation.
 * - Uses scripts/frontmatter-path-map.json to map globs -> JSON schema files
 * - Validates YAML frontmatter with AJV
 *
 * Usage:
 *   node scripts/validate-frontmatter.mjs
 */

const repoRoot = process.cwd();
const mapPath = path.join(repoRoot, "scripts", "frontmatter-path-map.json");

const readJson = async (p) => JSON.parse(await fs.readFile(p, "utf8"));

const matchesAny = (filePath, ignoreGlobs) =>
  micromatch.isMatch(filePath, ignoreGlobs, { dot: true });

const normalize = (p) => p.replaceAll("\\", "/");

async function main() {
  const cfg = await readJson(mapPath);
  const rules = cfg.rules ?? [];
  const ignore = cfg.ignore ?? [];

  // Build target file set by expanding each rule's glob.
  const allFiles = new Set();
  for (const rule of rules) {
    const glob = rule.glob;
    if (!glob) continue;
    const hits = await fg(glob, {
      cwd: repoRoot,
      dot: true,
      onlyFiles: true,
      unique: true,
      ignore
    });
    for (const h of hits) allFiles.add(normalize(h));
  }

  // Preload schemas and AJV instances.
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  addFormats(ajv);

  const validators = new Map();
  for (const rule of rules) {
    const schemaRel = rule.schema;
    if (!schemaRel) continue;
    const schemaAbs = path.join(repoRoot, schemaRel);
    if (validators.has(schemaRel)) continue;
    const schema = await readJson(schemaAbs);
    validators.set(schemaRel, ajv.compile(schema));
  }

  const errors = [];

  // Determine schema for each file by first matching rule order.
  for (const rel of [...allFiles].sort()) {
    const relNorm = normalize(rel);
    if (matchesAny(relNorm, ignore)) continue;

    const rule = rules.find((r) => micromatch.isMatch(relNorm, r.glob, { dot: true }));
    if (!rule) continue;

    const schemaRel = rule.schema;
    const validate = validators.get(schemaRel);
    if (!validate) {
      errors.push({ file: relNorm, msg: `No validator loaded for schema: ${schemaRel}` });
      continue;
    }

    const abs = path.join(repoRoot, relNorm);
    const raw = await fs.readFile(abs, "utf8");

    // Ensure YAML frontmatter exists
    const hasFm = raw.startsWith("---\n") || raw.startsWith("---\r\n");
    if (!hasFm) {
      errors.push({ file: relNorm, msg: "Missing YAML frontmatter block (must start with --- on first line)" });
      continue;
    }

    let data;
    try {
      const parsed = matter(raw);
      data = parsed.data;
    } catch (e) {
      errors.push({ file: relNorm, msg: `Failed to parse frontmatter: ${e.message}` });
      continue;
    }

    const ok = validate(data);
    if (!ok) {
      const detail = (validate.errors ?? [])
        .map((er) => `${er.instancePath || "/"} ${er.message}`)
        .join("; ");
      errors.push({ file: relNorm, msg: `Frontmatter schema validation failed (${schemaRel}): ${detail}` });
    }
  }

  if (errors.length) {
    console.error(`Frontmatter validation failed: ${errors.length} issue(s)\n`);
    for (const e of errors) console.error(`- ${e.file}: ${e.msg}`);
    process.exit(1);
  }

  console.log(`Frontmatter validation passed: ${allFiles.size} file(s) checked.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
