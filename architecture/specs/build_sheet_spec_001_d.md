---
title: "Build Sheet — SPEC-001D (KB Governance & CI)"
version: "v2026-02-22"
date: "2026-02-22"
sensitivity: "internal"
pii: true
status: "active"
canonical: true
source_attachment_ids:
  - "build_sheet_spec_001_d.md"
---

# Build Sheet — SPEC-001D (KB Governance & CI)

> **LOCKED NOTE (2026-02-22):** This repo uses **split frontmatter schemas by path** (8-field schema for `/kb/**` + `/architecture/specs/**`; extended schema for `/ops/**`).
> Validation is implemented via `scripts/validate-frontmatter.mjs` (AJV) + `scripts/frontmatter-path-map.json`.
> The schema files live in `scripts/frontmatter-schemas/`.


> Purpose: lock the KB into a **PR-only, CI-gated** workflow so content stays accurate, reviewable, and safe for AI retrieval over time.

---

## Prerequisites (access)

- GitHub
  - **Repo admin** permissions (Settings, Branch Protection, Actions)
  - Ability to create GitHub **Teams** (recommended) and assign CODEOWNERS
- Local (optional)
  - Node.js **20.x**
  - Git client

---

## 1) GitHub Branch Protection Rules (exact settings)

### Click-path

`Repo → Settings → Branches → Branch protection rules → Add rule`

### Rule: `main`

- **Branch name pattern:** `main`

**Protect merges**

- ✅ Require a pull request before merging
  - ✅ Required approvals: **1**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners
  - ✅ Require approval of the most recent push (optional but recommended)

**Quality gates (required status checks)**

- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - Required checks (must match job names in workflows below):
    - `markdownlint`
    - `frontmatter-schema`
    - `pii-lint`
    - `link-check`

**Merge hygiene**

- ✅ Require conversation resolution
- ✅ Require linear history
- ✅ Include administrators
- ❌ Allow force pushes
- ❌ Allow deletions

Optional hardening (enable if available in your plan)

- ✅ Require signed commits
- ✅ Require a merge queue

---

## 2) CODEOWNERS (exact configuration)

### File

Create: `.github/CODEOWNERS`

### Contents (example)

Replace teams/handles with your real GitHub teams/users.

```text
# Global fallback (KB Admin)
*                   @town/kb-admin

# Department ownership
/ops/**             @town/ops
/finance/**         @town/finance
/people/**          @town/people
/security/**        @town/security
/systems/**         @town/systems
/vendors/**         @town/finance @town/ops
/menus/**           @town/ops
/templates/**       @town/kb-admin
/incidents/**       @town/security @town/kb-admin
/training/**        @town/people

# Governance artifacts
/schemas/**         @town/kb-admin
/scripts/**         @town/kb-admin
/.github/**         @town/kb-admin
```

---

## 3) Mandatory YAML frontmatter (schema enforcement)

### Mandatory fields (every `*.md`)

- `title` (string)
- `doc_type` (enum: `SOP`, `vendor_register`, `system_note`, `playbook`, `incident`)
- `venue_scope` (enum: `Town`, `Motorino`, `Both`)
- `department` (enum: `ops`, `finance`, `people`, `security`, `systems`, `menus`)
- `role_owner` (string)
- `approver` (string)
- `last_reviewed` (`YYYY-MM-DD`)
- `next_review_due` (`YYYY-MM-DD`)
- `version` (semver `x.y.z`)
- `status` (enum: `draft`, `active`, `deprecated`)
- `confidentiality` (enum: `public_internal`, `restricted`)
- `tags` (array of strings)
- `systems` (array of strings)
- `dependencies` (array of strings; paths)
- `risk_level` (enum: `low`, `medium`, `high`, `critical`)
- `KPI_impact` (string)
- `change_log` (string)

### PII policy fields

- `pii` (boolean; default `false`)

Rules:

- If `pii: true` → `confidentiality` must be `restricted`
- If `confidentiality: public_internal` → `pii` must be `false`

---

## 4) Repo file scaffolding (create these exact files)

```text
.github/
  workflows/
    lint-and-validate.yml
    stale-review-alert.yml        # optional but recommended
  PULL_REQUEST_TEMPLATE.md
  CODEOWNERS

.markdownlint-cli2.jsonc
.remarkrc.mjs
package.json
schemas/
  frontmatter-schema.json
scripts/
  frontmatter-validate.mjs
  pii-scan.mjs
  link-check.mjs
  stale-review-report.mjs         # for weekly review alerts
  section-size-guard.mjs          # optional
```

---

## 5) Lint configuration files

### `.markdownlint-cli2.jsonc`

```jsonc
{
  "config": {
    "default": true,
    "MD013": { "line_length": 120 },
    "MD033": false,
    "MD041": false
  },
  "globs": ["**/*.md"],
  "ignores": ["node_modules/**", ".git/**"]
}
```

### `.remarkrc.mjs`

This uses `remark-frontmatter` + `custom AJV validator (scripts/validate-frontmatter.mjs)` in **global pattern mode** (one schema for all `*.md`).

```js
import remarkFrontmatter from 'remark-frontmatter';
import remarkLint from 'remark-lint';
import remarkLintFrontmatterSchema from 'custom AJV validator (scripts/validate-frontmatter.mjs)';

export default {
  plugins: [
    remarkLint,
    remarkFrontmatter,
    [
      remarkLintFrontmatterSchema,
      {
        schemas: {
          './scripts/frontmatter-schemas/ops_extended.schema.json (and global_8_field.schema.json for /kb/** + /architecture/specs/**)': ['**/*.md']
        }
      }
    ]
  ]
};
```

---

## 6) Frontmatter schemas (split by path)

### `scripts/frontmatter-schemas/ops_extended.schema.json (and global_8_field.schema.json for /kb/** + /architecture/specs/**)`

**CORRECTED VERSION** (regex escaping fixed)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": true,
  "required": [
    "title",
    "doc_type",
    "venue_scope",
    "department",
    "role_owner",
    "approver",
    "last_reviewed",
    "next_review_due",
    "version",
    "status",
    "confidentiality",
    "tags",
    "systems",
    "dependencies",
    "risk_level",
    "KPI_impact",
    "change_log"
  ],
  "properties": {
    "title": { "type": "string", "minLength": 3 },
    "doc_type": { "type": "string", "enum": ["SOP", "vendor_register", "system_note", "playbook", "incident"] },
    "venue_scope": { "type": "string", "enum": ["Town", "Motorino", "Both"] },
    "department": { "type": "string", "enum": ["ops", "finance", "people", "security", "systems", "menus"] },
    "role_owner": { "type": "string", "minLength": 2 },
    "approver": { "type": "string", "minLength": 2 },
    "last_reviewed": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
    "next_review_due": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "status": { "type": "string", "enum": ["draft", "active", "deprecated"] },
    "confidentiality": { "type": "string", "enum": ["public_internal", "restricted"] },
    "pii": { "type": "boolean", "default": false },
    "tags": { "type": "array", "items": { "type": "string" } },
    "systems": { "type": "array", "items": { "type": "string" } },
    "dependencies": { "type": "array", "items": { "type": "string" } },
    "risk_level": { "type": "string", "enum": ["low", "medium", "high", "critical"] },
    "KPI_impact": { "type": "string" },
    "change_log": { "type": "string" }
  },
  "allOf": [
    {
      "if": { "properties": { "pii": { "const": true } } },
      "then": { "properties": { "confidentiality": { "const": "restricted" } } }
    },
    {
      "if": { "properties": { "confidentiality": { "const": "public_internal" } } },
      "then": { "properties": { "pii": { "const": false } } }
    }
  ]
}
```

---

## 7) Toolchain: `package.json`

> `custom AJV validator (scripts/validate-frontmatter.mjs)` is **ESM-only**, so we set `"type": "module"`.

```json
{
  "name": "town-kb",
  "private": true,
  "type": "module",
  "devDependencies": {
    "ajv": "^8.0.0",
    "gray-matter": "^4.0.0",
    "remark": "^15.0.0",
    "remark-cli": "^12.0.0",
    "remark-frontmatter": "^5.0.0",
    "remark-lint": "^10.0.0",
    "custom AJV validator (scripts/validate-frontmatter.mjs)": "^3.0.0"
  },
  "scripts": {
    "lint:frontmatter": "remark . --frail",
    "lint:frontmatter:strict": "node scripts/frontmatter-validate.mjs",
    "lint:pii": "node scripts/pii-scan.mjs",
    "lint:links": "node scripts/link-check.mjs"
  }
}
```

---

## 8) CI scripts (exact files)

### `scripts/frontmatter-validate.mjs`

This is the "no frontmatter = fail PR" enforcement layer.

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import Ajv from 'ajv';

const repoRoot = process.cwd();
const schemaPath = path.join(repoRoot, 'schemas', 'frontmatter-schema.json');
const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
const validate = ajv.compile(schema);

const mdFiles = [];
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.isFile() && p.endsWith('.md')) mdFiles.push(p);
  }
}
await walk(repoRoot);

let failed = false;
for (const file of mdFiles) {
  const raw = await fs.readFile(file, 'utf8');
  const rel = path.relative(repoRoot, file);

  if (!raw.startsWith('---')) {
    console.error(`❌ ${rel}: missing YAML frontmatter (file must start with ---)`);
    failed = true;
    continue;
  }

  const fm = matter(raw).data;
  const ok = validate(fm);

  if (!ok) {
    console.error(`❌ ${rel}: frontmatter schema violations:`);
    for (const err of validate.errors ?? []) {
      console.error(`  - ${err.instancePath || '/'} ${err.message}`);
    }
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('✅ frontmatter-validate: OK');
```

### `scripts/pii-scan.mjs`

This implements the PII linting gate:

- Fails if PII appears in `confidentiality: public_internal`
- Fails if PII appears in `confidentiality: restricted` but `pii: true` is missing

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const repoRoot = process.cwd();

// Patterns: tuned to reduce false positives. Expand as your needs evolve.
const patterns = [
  { name: 'email', re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { name: 'uk_postcode', re: /\b([A-Z]{1,2}\d{1,2}[A-Z]?)\s*\d[A-Z]{2}\b/gi },
  // UK mobile-focused.
  { name: 'uk_phone', re: /(\+44\s?7\d{3}|07\d{3})\s?\d{3}\s?\d{3}\b/g },
  // Passport: require context keyword to avoid flagging random numbers.
  { name: 'passport_context', re: /(passport\s*(no\.?|number)?\s*[:#-]?\s*\d{9})/gi }
];

const mdFiles = [];
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.isFile() && p.endsWith('.md')) mdFiles.push(p);
  }
}
await walk(repoRoot);

let failed = false;
for (const file of mdFiles) {
  const rel = path.relative(repoRoot, file);
  const raw = await fs.readFile(file, 'utf8');
  const { data: fm, content } = matter(raw);

  const confidentiality = fm.confidentiality;
  const piiFlag = Boolean(fm.pii);

  const hits = [];
  for (const ptn of patterns) {
    if (ptn.re.test(content)) hits.push(ptn.name);
    ptn.re.lastIndex = 0;
  }
  if (hits.length === 0) continue;

  if (confidentiality === 'public_internal') {
    console.error(`❌ PII found in public_internal doc: ${rel} (hits: ${hits.join(', ')})`);
    failed = true;
    continue;
  }

  if (confidentiality === 'restricted' && !piiFlag) {
    console.error(`❌ PII found but pii flag missing: ${rel} (set pii: true) (hits: ${hits.join(', ')})`);
    failed = true;
    continue;
  }
}

if (failed) process.exit(1);
console.log('✅ pii-scan: OK');
```

### `scripts/link-check.mjs`

Minimal internal link checker.

```js
import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const mdFiles = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.isFile() && p.endsWith('.md')) mdFiles.push(p);
  }
}
await walk(repoRoot);

const existing = new Set(mdFiles.map(f => path.normalize(path.relative(repoRoot, f))));
const linkRe = /\[[^\]]+\]\(([^)]+)\)/g;

let failed = false;
for (const file of mdFiles) {
  const rel = path.normalize(path.relative(repoRoot, file));
  const raw = await fs.readFile(file, 'utf8');
  let m;
  while ((m = linkRe.exec(raw))) {
    const target = m[1];
    if (target.startsWith('http') || target.startsWith('mailto:')) continue;
    if (target.startsWith('#')) continue;

    const clean = target.split('#')[0].replace(/^\//, '');
    if (!clean) continue;

    const resolved = path.normalize(path.join(path.dirname(rel), clean));
    if (!existing.has(resolved)) {
      console.error(`❌ Broken link in ${rel}: ${target} (resolved: ${resolved})`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('✅ link-check: OK');
```

### `scripts/stale-review-report.mjs`

**NEW SCRIPT** (referenced in workflows but previously missing)

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const repoRoot = process.cwd();
const mdFiles = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.isFile() && p.endsWith('.md')) mdFiles.push(p);
  }
}
await walk(repoRoot);

const today = new Date();
const stale = [];

for (const file of mdFiles) {
  const raw = await fs.readFile(file, 'utf8');
  const { data: fm } = matter(raw);
  
  if (!fm.next_review_due) continue;
  
  const nextReview = new Date(fm.next_review_due);
  
  if (nextReview < today) {
    const daysOverdue = Math.floor((today - nextReview) / (1000 * 60 * 60 * 24));
    stale.push({
      file: path.relative(repoRoot, file),
      owner: fm.role_owner || 'unknown',
      approver: fm.approver || 'unknown',
      next_review_due: fm.next_review_due,
      days_overdue: daysOverdue
    });
  }
}

if (stale.length > 0) {
  console.log('⚠️  Stale review report:');
  console.table(stale);
  console.log(`\n${stale.length} document(s) require review update.`);
  process.exit(1);
} else {
  console.log('✅ All documents have current reviews');
}
```

---

## 9) GitHub Actions workflows (exact YAML)

### `.github/workflows/lint-and-validate.yml`

```yaml
name: lint-and-validate

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  markdownlint:
    name: markdownlint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: markdownlint-cli2
        uses: DavidAnson/markdownlint-cli2-action@v22
        with:
          globs: '**/*.md'

  frontmatter-schema:
    name: frontmatter-schema
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      # 1) custom AJV validator (scripts/validate-frontmatter.mjs) checks YAML against scripts/frontmatter-schemas/ops_extended.schema.json (and global_8_field.schema.json for /kb/** + /architecture/specs/**)
      - run: npm run lint:frontmatter
      # 2) strict requirement that frontmatter exists on every markdown file
      - run: npm run lint:frontmatter:strict

  pii-lint:
    name: pii-lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint:pii

  link-check:
    name: link-check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint:links
```

### `.github/workflows/stale-review-alert.yml` (optional, recommended)

```yaml
name: stale-review-alert

on:
  schedule:
    - cron: '0 7 * * 1'  # Mondays 07:00 (UTC)
  workflow_dispatch:

jobs:
  stale-review-alert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: node scripts/stale-review-report.mjs
```

---

## 10) Acceptance Tests (drills)

### Governance drills

1) **Branch protection drill**
   - Attempt direct push to `main` → blocked.
2) **PR review drill**
   - Open PR with passing checks but **no approval** → merge blocked.
3) **CODEOWNERS drill**
   - Modify `/finance/**` doc → PR requires @town/finance approval.

### Schema / frontmatter drills

4) **Missing frontmatter drill**
   - Add a `.md` file with no `---` → `frontmatter-schema` job fails.
5) **Missing required field drill**
   - Remove `role_owner` from frontmatter → `frontmatter-schema` fails.
6) **Enum violation drill**
   - Set `doc_type: SOPP` → `frontmatter-schema` fails.
7) **Date format drill**
   - Set `last_reviewed: 2026-2-22` (wrong format) → `frontmatter-schema` fails.
   - Set `last_reviewed: 2026-02-22` (correct format) → passes.
8) **Version format drill**
   - Set `version: 1.0` (wrong format) → `frontmatter-schema` fails.
   - Set `version: 1.0.0` (correct semver) → passes.

### PII linting drills

9) **PII in public_internal drill**
   - Add UK mobile / email / UK postcode into a `confidentiality: public_internal` SOP → `pii-lint` fails.
10) **Restricted but untagged drill**
    - Add an email address into a `confidentiality: restricted` doc but keep `pii: false` → `pii-lint` fails.
    - Set `pii: true` → passes.

### Link integrity drills

11) **Broken link drill**
    - Add `[See SOP](./missing-file.md)` → `link-check` fails.
12) **Anchor-only link drill**
    - Add `[See section](#anchor)` → `link-check` passes (anchors are skipped).

### Stale review drills

13) **Stale review detection drill**
    - Set `next_review_due: 2025-12-01` (past date) → weekly workflow reports stale document.
14) **Current review drill**
    - Set `next_review_due: 2026-06-01` (future date) → weekly workflow passes.

---

## Sign-off package (what contractors hand back)

- Screenshots/video proof of each drill above
- Export of branch protection settings (screenshots of Settings → Branches)
- Copy of:
  - `.github/workflows/*.yml`
  - `.remarkrc.mjs`, `.markdownlint-cli2.jsonc`
  - `scripts/frontmatter-schemas/ops_extended.schema.json (and global_8_field.schema.json for /kb/** + /architecture/specs/**)`
  - `scripts/*.mjs` (all four scripts)
- Sample PR URL showing:
  - status checks required
  - CODEOWNER review requirement
  - blocked merge until checks + approval complete
- Confirmation of npm package versions installed and tested