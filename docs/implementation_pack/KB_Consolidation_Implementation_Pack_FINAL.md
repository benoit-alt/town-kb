# KB Consolidation Implementation Pack (Dry-Run) — FINAL-FINAL

**Generated:** 2026-02-22T04:09:00Z  
**Status:** Conformance-validated dry-run documentation. No actions performed.

---

## A) Header

**Operating Model Statement:**

According to documents dated 2026-02-22, SharePoint Lists = system of record for governed operational data; GitHub KB repo = system of record for governed documentation; SharePoint includes restricted evidence library (/ComplianceEvidence-Restricted) and a legacy archive concept for traceability.

**Purpose:**

This pack provides a deterministic, audit-ready plan for consolidating KB artifacts from legacy sources into the governed GitHub repository (`benoit-alt/town-kb`) and SharePoint site (`town` at https://townrestaurant.sharepoint.com/sites/town/). It establishes disposition rules, transformation procedures, validation gates, and audit artifacts necessary for UK corporate compliance (7-year retention) and operational continuity. The plan ensures traceability, preserves provenance, and enforces PII controls throughout the consolidation lifecycle using GitHub Actions CI workflows and a custom PII scanning script (`scripts/pii-scan.mjs`).

**This pack performs no actions; it is a dry-run plan.** No file moves, deletions, conversions, uploads, commits, API calls, or automation runs will occur. All commands and examples are illustrative only and must not be executed without explicit approval and testing.

---

## B) 0) Scope, Assumptions, Non-Goals

### Scope
- Consolidate specification documents, KB governance artifacts, and audit materials from legacy sources into canonical GitHub (`benoit-alt/town-kb`) and SharePoint (`town`) locations
- Establish KB governance model with strict frontmatter schema and PII controls enforced via GitHub Actions
- Provide deterministic transformation procedures for DOCX-to-Markdown conversion, line-number stripping, and content normalization
- Generate audit artifacts (manifests, hashes, transformation logs) for compliance verification and 7-year retention
- Define disposition rules (KEEP, MODIFY, REASSEMBLE, ARCHIVE, DISCARD, TBD) for all source materials

### Assumptions (Resolved)
- **As-of date:** 2026-02-22
- **GitHub repository:** `benoit-alt/town-kb`
- **Default branch:** `main`
- **SharePoint site:** `town` (URL: https://townrestaurant.sharepoint.com/sites/town/)
- **Default SharePoint libraries:**
  - `/Archive/2025_Legacy_KB` for legacy bundles (7-year retention)
  - `/ComplianceEvidence-Restricted/KB_Audit/2026-02` for audit evidence (7-year retention)
  - `/ComplianceEvidence-Restricted/Profiles` for PII-containing materials (access-controlled)
  - `/AuditLogs/2026-02_KB_Consolidation` for transformation logs (7-year retention)
- **PII policy baseline:** Treat any personal identifiers (names, emails, usernames, IP addresses, internal IDs) as PII unless explicitly cleared by privacy review
- **Retention policy reference:** Interim Policy: 7-Year Retention. All legacy bundles and financial/compliance audit logs require 7-year retention period for UK corporate compliance, pending formal company handbook link.
- **CI tooling:** GitHub Actions (workflow definitions in `.github/workflows/` per SPEC-001D)
- **PII scan tool:** Custom programmatic CI script (`scripts/pii-scan.mjs`) running as required status check in GitHub Actions

### Retention Class Definitions

To avoid blanket "7-year applies to everything" assumptions, attachments are classified:

- **`finance_6y_min`:** UK statutory minimum for financial records (6 years from end of accounting period per Companies Act 2006)
- **`corporate_7y_policy`:** Interim 7-year policy (conservative baseline pending formal company handbook)
- **`hse_longtail_40y_possible`:** Health & Safety Executive records (may require 40+ years for certain exposures such as asbestos, COSHH substances; verify per HSE guidance)

**Default:** Use `corporate_7y_policy` for KB consolidation materials unless specific regulation requires longer (e.g., HSE) or shorter (e.g., statutory 6-year minimum for certain accounting records). Document `retention_class` in manifest for every attachment.

### Non-Goals
- **No execution:** This pack contains no executable automation; all commands are examples only
- **No discards:** No files will be permanently deleted; all materials archived (7-year retention) or explicitly marked TBD for future disposition
- **No invented contents:** Where file contents are unknown, placeholders labeled "TBD (do not invent)" are used
- **No production changes:** No commits, uploads, or modifications to live systems
- **No policy decisions:** Where policy is unclear beyond 7-year retention baseline, safest defaults applied with explicit TBD markers

---

## C) 1) Disposition Register (Governing Decisions Restated)

### Disposition Rules

- **KEEP:** Move to canonical location without transformation (may require frontmatter addition)
- **MODIFY:** Transform (DOCX→MD, line-number strip, normalization) before moving to canonical location
- **REASSEMBLE:** Deduplicate and merge multiple sources into single authoritative document
- **ARCHIVE:** Move to SharePoint archive with timestamp (7-year retention); no further processing
- **DISCARD:** Secure deletion (none planned; all materials retained per 7-year policy)
- **TBD:** Requires inventory, PII scan, and classification before disposition decision

### C1) Specs / Governance

| Source File | Disposition | Destination System | Transform | Final Path |
|-------------|-------------|-------------------|-----------|------------|
| spec_001_umbrella.md | KEEP | GitHub /architecture/specs/SPEC-001/ | Add frontmatter + source_attachment_ids | /architecture/specs/SPEC-001/spec_001_umbrella.md |
| spec_001_a_compliance.md | KEEP | GitHub /architecture/specs/SPEC-001/ | Add frontmatter + source_attachment_ids | /architecture/specs/SPEC-001/spec_001_a.md |
| spec_001_b_data_integrity.md | KEEP | GitHub /architecture/specs/SPEC-001/ | Add frontmatter + source_attachment_ids | /architecture/specs/SPEC-001/spec_001_b.md |
| spec_001_c_automation_bridge.md | KEEP | GitHub /architecture/specs/SPEC-001/ | Add frontmatter + source_attachment_ids | /architecture/specs/SPEC-001/spec_001_c.md |
| build_sheet_spec_001_d.md | KEEP | GitHub /architecture/specs/SPEC-001/ | None | /architecture/specs/SPEC-001/build_sheet_spec_001_d.md |
| spec-corrections.md | ARCHIVE | GitHub /audit/supporting/ | None | /audit/supporting/spec-corrections_2026-02-22.md |

### C2) KB Admin / Audit Docs

| Source File | Disposition | Destination System | Transform | Final Path |
|-------------|-------------|-------------------|-----------|------------|
| kb-admin_v2026-02-22.md.docx | MODIFY | GitHub /kb/canonical/ | DOCX→MD + strict frontmatter | /kb/canonical/kb-admin_v2026-02-22.md |
| release-notes_v2026-02-22.md.docx | MODIFY | GitHub /audit/ | DOCX→MD + canonical:false | /audit/release-notes_v2026-02-22.md |
| KB_Audit_Resolution_Summary.docx | MODIFY | GitHub /audit/ | DOCX→MD + canonical:false | /audit/kb_audit_resolution_summary_2026-02-22.md |

### C3) Bundles / ZIPs

| Source File | Disposition | Destination System | Transform | Final Path |
|-------------|-------------|-------------------|-----------|------------|
| kbfiles.zip | ARCHIVE | SharePoint /Archive/2025_Legacy_KB | None | /Archive/2025_Legacy_KB/kbfiles.zip |
| files.zip | ARCHIVE | SharePoint /Archive/2025_Legacy_KB | None | /Archive/2025_Legacy_KB/files.zip |
| early.zip | ARCHIVE | SharePoint /Archive/2025_Legacy_KB | None | /Archive/2025_Legacy_KB/early.zip |
| operations.zip | MODIFY (TBD) | GitHub /kb/canonical/ + SharePoint archive | Extract/classify PII/convert selected | TBD after inventory |
| profiles.zip | MODIFY (TBD) | GitHub /kb/canonical/ + SharePoint restricted | Extract/classify PII/convert selected | TBD after inventory |
| analysis.zip | MODIFY (TBD) | GitHub /kb/canonical/ | Extract/classify/convert selected | TBD after inventory |

### Open Items / TBDs

1. **operations.zip inventory:** Extract contents, classify by PII presence (`scripts/pii-scan.mjs`), determine which files are KB-appropriate vs. operational records requiring SharePoint restricted storage
2. **profiles.zip PII review:** Assume contains personal data; all contents require PII scan and likely belong in `/ComplianceEvidence-Restricted/Profiles` unless redacted
3. **analysis.zip classification:** Determine if contents are audit analysis (→ /audit/supporting/) or KB documentation (→ /kb/canonical/)
4. **Retention confirmation:** All archive materials subject to 7-year retention per Interim Policy; verify formal company handbook link when available
5. **PII tool validation:** Test `scripts/pii-scan.mjs` against known PII samples; establish failure threshold for GitHub Actions status check
6. **Final path confirmation:** Validate all GitHub paths against actual `benoit-alt/town-kb` repo structure on `main` branch

---

## D) 2) Target Structures (Exact Paths)

### GitHub Repository Structure (`benoit-alt/town-kb`)

```
benoit-alt/town-kb/
├── kb/
│   ├── canonical/          # Authoritative KB docs (canonical:true)
│   ├── drafts/             # Work-in-progress (canonical:false)
│   └── _templates/         # Reusable templates
├── architecture/
│   └── specs/
│       └── SPEC-001/       # Consolidated spec family
├── audit/
│   └── supporting/         # Audit evidence and corrections
├── logs/
│   ├── manifests/          # JSON manifests (provenance tracking)
│   └── hashes/             # SHA256 checksums
├── scripts/
│   └── pii-scan.mjs        # Custom PII scanner (CI required check)
└── .github/
    └── workflows/          # GitHub Actions CI definitions (per SPEC-001D)
```

### SharePoint Site Structure (`town` — https://townrestaurant.sharepoint.com/sites/town/)

```
town/
├── Archive/
│   └── 2025_Legacy_KB/                    # Legacy bundles (read-only, 7-year retention)
├── ComplianceEvidence-Restricted/
│   ├── KB_Audit/
│   │   └── 2026-02/                       # Audit evidence (7-year retention)
│   └── Profiles/                          # PII-containing materials (access-controlled, 7-year retention)
└── AuditLogs/
    └── 2026-02_KB_Consolidation/          # Transformation logs (append-only, 7-year retention)
```

---

## E) 3) Canonical Markdown + YAML Frontmatter Schema (Strict)

### Frontmatter Schema (Required)

All files under `/kb/canonical/` and `/architecture/specs/` must include this YAML frontmatter **exactly**:

```yaml
---
title: "string"
version: "vYYYY-MM-DD"
date: "YYYY-MM-DD"
sensitivity: "public_internal|internal|restricted"
pii: true|false
status: "draft|active|deprecated|archived"
canonical: true|false
source_attachment_ids:
  - "filename-or-id-1"
  - "filename-or-id-2"
---
```

### Field Definitions

- **`title`** (string): Human-readable document title
- **`version`** (string): Version identifier using format `vYYYY-MM-DD` (e.g., `v2026-02-22`)
- **`date`** (string): Document creation or last significant revision date in ISO 8601 format `YYYY-MM-DD`
- **`sensitivity`** (enum): Classification level
  - `public_internal`: Suitable for public or internal distribution
  - `internal`: Internal use only
  - `restricted`: Access-controlled; requires explicit authorization
- **`pii`** (boolean): `true` if document contains personally identifiable information; `false` otherwise
- **`status`** (enum): Document lifecycle state
  - `draft`: Work in progress
  - `active`: Current authoritative version
  - `deprecated`: Superseded but retained for reference
  - `archived`: Historical record only
- **`canonical`** (boolean): `true` = authoritative KB document; `false` = draft, audit, or supporting material
- **`source_attachment_ids`** (array of strings): Provenance tracking. List filenames or stable IDs of source materials. Use `["none"]` only if genuinely no source (rare).

### Hard Rules

1. **`canonical: true` only for authoritative KB docs:** Drafts, audit logs, supporting materials, and work-in-progress documents must use `canonical: false`

2. **`pii: true` must not live under `/kb/canonical/` unless explicitly approved and gated:** Materials containing PII belong in SharePoint `/ComplianceEvidence-Restricted/` with access controls. Enforced by `scripts/pii-scan.mjs` via GitHub Actions required status check.

3. **`source_attachment_ids` mandatory:** Every document must trace back to original source materials via stable attachment IDs. Required for 7-year retention audit trail and provenance verification.

4. **Optional extended metadata:** If you need additional fields (e.g., author, tags, review_date), prefix them with `x_` to avoid conflicts with required schema:
   ```yaml
   x_author: "Author Name"
   x_tags: ["tag1", "tag2"]
   x_review_date: "2027-02-22"
   ```

### Validation

GitHub Actions (`.github/workflows/kb-validation.yml`) enforces this schema on every commit to `main`. CI will fail if:
- Any required field is missing
- Field types are incorrect
- `canonical: true` combined with `pii: true` in `/kb/canonical/`
- `source_attachment_ids` is empty or omitted

---

## F) 4) Operational Runbook (Execution Order + Gates)

### Phase 0: Pre-Flight Validation

**Activities:**
- Confirm repository access: `benoit-alt/town-kb` with `main` branch write permissions
- Confirm SharePoint site access: https://townrestaurant.sharepoint.com/sites/town/ with library creation permissions
- Verify GitHub Actions workflows exist at `.github/workflows/` (per SPEC-001D)
- Test `scripts/pii-scan.mjs` against sample PII data (names, emails, IP addresses)
- Validate manifest template against known source files
- Establish baseline SHA256 hashes for all source materials

**Example only (do not execute):**
```bash
# Generate baseline hashes
find ./source_materials -type f -exec sha256sum {} \; > baseline_hashes.txt

# Test PII scanner
node scripts/pii-scan.mjs --test-mode --input ./test_samples/
```

**Gate Acceptance Criteria:**
- Repository and SharePoint access confirmed with proper permissions
- Baseline hashes recorded in version control
- Target directory structure validated
- `scripts/pii-scan.mjs` test passes (detects known PII samples, no false negatives)
- GitHub Actions workflows validated (syntax check)

---

### Phase 1: ARCHIVE (No Transformation)

**Activities:**
- Move `kbfiles.zip`, `files.zip`, `early.zip` to SharePoint `town/Archive/2025_Legacy_KB/`
- Record upload timestamp, uploader, original hash in manifest
- Set SharePoint library permissions to read-only
- Apply 7-year retention label in SharePoint compliance center

**Example only (do not execute):**
```bash
# Hypothetical SharePoint CLI upload
spo file add --webUrl "https://townrestaurant.sharepoint.com/sites/town" \
  --folder "Archive/2025_Legacy_KB" \
  --path "./kbfiles.zip"

# Apply retention label (PowerShell example)
Set-PnPLabel -List "Archive" -Item "kbfiles.zip" -Label "7-Year-Retention"
```

**Gate Acceptance Criteria:**
- All three ZIPs present in SharePoint `town/Archive/2025_Legacy_KB/`
- Hashes match baseline (verify via `sha256sum`)
- SharePoint library set to read-only (versioning enabled, no delete permissions)
- 7-year retention label applied
- Manifest updated with archive location and retention expiry date (2033-02-22)

---

### Phase 2: KEEP (Specs to GitHub)

**Activities:**
- Copy spec files to GitHub `benoit-alt/town-kb/architecture/specs/SPEC-001/`
- Add required frontmatter to each file (ensure `source_attachment_ids` populated)
- Commit to `main` branch with descriptive message including audit reference
- GitHub Actions runs automatically: `markdownlint`, `frontmatter-schema`, `scripts/pii-scan.mjs`

**Example only (do not execute):**
```bash
# Copy files to local clone
cp spec_001_umbrella.md ~/repos/town-kb/architecture/specs/SPEC-001/
# Add frontmatter manually or via script
# Stage and commit
cd ~/repos/town-kb
git add architecture/specs/SPEC-001/
git commit -m "KB Consolidation: Add SPEC-001 family (Audit Ref: KB-2026-02)"
git push origin main
```

**Required Checks (GitHub Actions):**
- `markdownlint` passes on all spec files
- `frontmatter-schema` validation passes (all fields present, types correct)
- `scripts/pii-scan.mjs` passes (no PII detected)
- All `source_attachment_ids` populated (non-empty arrays)

**Gate Acceptance Criteria:**
- All 6 spec files committed to `benoit-alt/town-kb` on `main` branch
- GitHub Actions status checks all green
- No lint errors, schema violations, or PII findings
- PR review completed (if branch protection requires)

---

### Phase 3: MODIFY (DOCX → Markdown)

**Activities:**
- Convert `kb-admin_v2026-02-22.md.docx`, `release-notes_v2026-02-22.md.docx`, `KB_Audit_Resolution_Summary.docx` using DOCX wrapper removal procedure (Section G)
- Strip line numbers if present (regex: `^\d+\.\s+`)
- Normalize Markdown (consistent heading levels, list formatting, code fence syntax)
- Add frontmatter (strict schema for `kb-admin`, `canonical:false` for audit docs)
- Commit to GitHub `benoit-alt/town-kb`
- GitHub Actions validation runs automatically

**Example only (do not execute):**
```bash
# Hypothetical pandoc conversion
pandoc kb-admin_v2026-02-22.md.docx -f docx -t markdown -o kb-admin_v2026-02-22.md --wrap=none --atx-headers

# Strip line numbers if present
sed -E 's/^[0-9]+\. //g' kb-admin_v2026-02-22.md > kb-admin_v2026-02-22_clean.md

# Add frontmatter manually, run markdownlint
markdownlint kb-admin_v2026-02-22_clean.md --fix

# Commit to repo
cd ~/repos/town-kb
cp kb-admin_v2026-02-22_clean.md kb/canonical/kb-admin_v2026-02-22.md
git add kb/canonical/kb-admin_v2026-02-22.md
git commit -m "KB Consolidation: Convert kb-admin to canonical MD (Audit Ref: KB-2026-02)"
git push origin main
```

**Required Checks (GitHub Actions):**
- `markdownlint` passes
- `frontmatter-schema` validation passes
- `scripts/pii-scan.mjs` passes (scan for unredacted PII)
- Visual diff review confirms content fidelity (compare DOCX rendered vs. MD rendered)

**Gate Acceptance Criteria:**
- 3 DOCX files converted to MD and committed to `benoit-alt/town-kb`
- All GitHub Actions checks pass
- Transformation log entry recorded in NDJSON format (Section G)
- Original DOCX files archived in SharePoint `town/Archive/2025_Legacy_KB/` with 7-year retention

---

### Phase 4: Bundle Inventory (TBD Items)

**Activities:**
- Extract `operations.zip`, `profiles.zip`, `analysis.zip` to temporary staging directory
- Run `scripts/pii-scan.mjs` on all extracted files (batch mode)
- Classify each file:
  - **No PII + KB-relevant:** → GitHub `benoit-alt/town-kb/kb/canonical/` after MODIFY
  - **Contains PII:** → SharePoint `town/ComplianceEvidence-Restricted/` (no transform, 7-year retention)
  - **Operational record:** → SharePoint appropriate library (not KB, 7-year retention)
  - **Audit analysis:** → GitHub `benoit-alt/town-kb/audit/supporting/`
- Record classification decisions in inventory spreadsheet (Excel or CSV)
- Upload PII scan reports to SharePoint `town/ComplianceEvidence-Restricted/KB_Audit/2026-02/`

**Example only (do not execute):**
```bash
# Extract bundles
unzip operations.zip -d ./staging/operations/
unzip profiles.zip -d ./staging/profiles/
unzip analysis.zip -d ./staging/analysis/

# Run PII scanner (batch mode)
node scripts/pii-scan.mjs --batch --input ./staging/ --output pii_scan_results.json

# Generate classification spreadsheet
python3 scripts/classify_bundles.py --scan-results pii_scan_results.json --output bundle_inventory.xlsx
```

**Required Checks:**
- PII scan completed for all extracted files (no files skipped)
- Classification decision recorded for each file with justification and operator name
- PII scan reports uploaded to SharePoint (read-only, 7-year retention)

**Gate Acceptance Criteria:**
- Inventory spreadsheet complete (`bundle_inventory.xlsx`) with columns: filename, size, hash, PII detected (Y/N), classification decision, justification, operator, timestamp
- PII scan reports saved to SharePoint `town/ComplianceEvidence-Restricted/KB_Audit/2026-02/`
- Disposition plan approved for each bundle file by KB owner + compliance reviewer (sign-off documented)

---

### Phase 5: REASSEMBLE (Audit Log Consolidation)

**Activities:**
- Collect all audit log fragments matching stable keys (Section H)
- Deduplicate using rules in Section H (stable key uniqueness, last_updated precedence)
- Assemble `Audit_Log_Feb_2026.md` with frontmatter `canonical: false`
- Commit to GitHub `benoit-alt/town-kb/audit/`
- Run GitHub Actions validation (link-check critical for cross-references)

**Example only (do not execute):**
```bash
# Hypothetical deduplication script
python3 scripts/dedupe_audit_logs.py --input ./audit_fragments/ --output Audit_Log_Feb_2026.md --stable-key-rules stable_key_config.json

# Commit to repo
cd ~/repos/town-kb
git add audit/Audit_Log_Feb_2026.md
git commit -m "KB Consolidation: Assemble audit log (Audit Ref: KB-2026-02)"
git push origin main
```

**Required Checks (GitHub Actions):**
- No duplicate entries (stable key uniqueness enforced by script validation)
- `link-check` passes (all internal references valid: `/kb/canonical/...`, `/architecture/specs/...`)
- `frontmatter-schema` validation passes
- Markdown lint passes

**Gate Acceptance Criteria:**
- Single authoritative `Audit_Log_Feb_2026.md` exists in `benoit-alt/town-kb/audit/`
- All source fragments archived in SharePoint `town/Archive/2025_Legacy_KB/superseded/` or marked as superseded in metadata
- Manifest entry recorded with all contributing `source_attachment_ids`
- GitHub Actions status checks all green

---

### Phase 6: Final Validation & Sign-Off

**Activities:**
- Run full CI validation suite via GitHub Actions on `main` branch:
  - `markdownlint` on all MD files in repo
  - `frontmatter-schema` on all `/kb/canonical/` and `/architecture/specs/`
  - `scripts/pii-scan.mjs` on all committed files
  - `link-check` on all internal links
  - SHA256 verification against manifest (automated script)
- Generate final manifest (`manifest_2026-02-22.json`)
- Generate final hash file (`sha256_2026-02-22.txt`)
- Export transformation log (NDJSON) to SharePoint `town/AuditLogs/2026-02_KB_Consolidation/` with 7-year retention label
- Obtain sign-off from KB owner and compliance reviewer (documented in SharePoint list or GitHub issue)

**Example only (do not execute):**
```bash
# Trigger manual GitHub Actions workflow run
gh workflow run kb-validation-full.yml --ref main

# Generate final artifacts locally (if not CI-generated)
python3 scripts/generate_manifest.py --repo ~/repos/town-kb --output logs/manifests/manifest_2026-02-22.json
find ~/repos/town-kb -type f -name "*.md" -exec sha256sum {} \; > logs/hashes/sha256_2026-02-22.txt

# Upload transformation log to SharePoint
spo file add --webUrl "https://townrestaurant.sharepoint.com/sites/town" \
  --folder "AuditLogs/2026-02_KB_Consolidation" \
  --path "./transformation_log.ndjson"
Set-PnPLabel -List "AuditLogs" -Item "transformation_log.ndjson" -Label "7-Year-Retention"
```

**Gate Acceptance Criteria:**
- All GitHub Actions CI checks pass (zero failures)
- Zero PII findings in `benoit-alt/town-kb` files
- Manifest (`manifest_2026-02-22.json`) and hashes (`sha256_2026-02-22.txt`) committed to `benoit-alt/town-kb/logs/`
- Transformation log uploaded to SharePoint `town/AuditLogs/2026-02_KB_Consolidation/` with 7-year retention label applied
- Sign-off documented: KB owner (name + date), compliance reviewer (name + date), recorded in SharePoint list `KB_Consolidation_SignOffs` or GitHub issue template

---

## G) 5) MODIFY Procedures (Tool-Agnostic, Deterministic)

### DOCX Wrapper Removal → Clean Markdown

**Objective:** Convert Word documents to clean, lint-compliant Markdown while preserving semantic structure and citations.

**Procedure:**
1. **Extract Markdown from DOCX:** Use converter tool (e.g., pandoc) to generate initial Markdown
2. **Manual review:** Verify headings, lists, tables, code blocks rendered correctly
3. **Fix common artifacts:**
   - Remove excessive blank lines (normalize to single blank line between blocks)
   - Fix heading inconsistencies (ensure proper `#`, `##`, `###` hierarchy)
   - Convert Word-style lists to Markdown lists (`-` for unordered, `1.` for ordered)
   - Escape special characters in tables (`|` requires backslash if literal)
   - Normalize code fence syntax (consistent triple-backtick with language identifier)
4. **Run `markdownlint`:** Fix all errors and warnings (CI will enforce)
5. **Add frontmatter:** Use schema from Section E (ensure `source_attachment_ids` populated)
6. **Record transformation:** Log entry in NDJSON format (see below)

**Example only (do not execute):**
```bash
pandoc input.docx -f docx -t markdown -o output.md --wrap=none --atx-headers
markdownlint output.md --fix
```

---

### Line-Number Stripping Guidance

**Problem:** Some source Markdown files contain line numbers prefixed to each line (e.g., "1. ", "2. ", "3. " at start of every line, not Markdown ordered lists).

**Detection:** Regex pattern: `^\d+\.\s+` at the start of every line or most lines in the file.

**Procedure:**
1. **Identify affected files:** Manual inspection or automated regex scan (`grep -E '^\d+\.\s+' filename.md | wc -l`)
2. **Apply transformation:** Use regex substitution to remove line number prefix
   - Pattern: `^\d+\.\s+` (matches "123. " at line start)
   - Replacement: empty string
3. **Verify transformation:** Visual diff to confirm content integrity (no semantic changes, only formatting cleanup)
4. **Record transformation:** Log entry (see below)

**Example only (do not execute):**
```bash
# Hypothetical sed command (GNU sed)
sed -E 's/^[0-9]+\. //g' input.md > output_clean.md

# Verify with diff
diff -u input.md output_clean.md | less
```

---

### Markdown Normalization Rules

Apply these rules to all MODIFY operations (enforced by `markdownlint` in GitHub Actions):

- **Headings:** Use ATX style (`#`, `##`, `###`), no underline style (`===` or `---`)
- **Lists:** Consistent dash (`-`) for unordered lists, `1.`, `2.`, `3.` for ordered lists (no asterisks for lists)
- **Blank lines:** Single blank line between blocks (paragraphs, headings, lists, code fences)
- **Code fences:** Always use triple-backtick with language identifier (e.g., ` ```python `, ` ```bash `, ` ```json `)
- **Tables:** Pipe-delimited with header separator (` |---|---|--- `), align pipes vertically for readability
- **Links:** Use inline style `[text](url)` consistently (no reference-style links unless necessary)
- **Emphasis:** Use `**bold**` and `*italic*` (no underscores: `__bold__` or `_italic_`)
- **Trailing whitespace:** Remove all trailing spaces at line ends (markdownlint rule MD009)

---

### Append-Only Transformation Log Entry Format (NDJSON)

**Each transformation must produce a log entry in NDJSON format** (newline-delimited JSON, one object per line). Log entries append to SharePoint `town/AuditLogs/2026-02_KB_Consolidation/transformation_log.ndjson` (7-year retention).

**Schema:**
```json
{
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "source_file": "original_filename.ext",
  "source_hash": "sha256_of_source",
  "destination_file": "target_path/filename.md",
  "destination_hash": "sha256_of_result",
  "transformation_type": "DOCX_TO_MD | LINE_NUMBER_STRIP | NORMALIZE",
  "tool": "pandoc-3.1.2 | sed | custom_script",
  "operator": "username or system",
  "validation_checks": ["markdownlint", "frontmatter-schema", "pii-scan"],
  "validation_status": "PASS | FAIL",
  "notes": "Optional human-readable notes"
}
```

**Example entry:**
```json
{"timestamp":"2026-02-22T10:30:00Z","source_file":"kb-admin_v2026-02-22.md.docx","source_hash":"a1b2c3d4e5f6g7h8...","destination_file":"kb/canonical/kb-admin_v2026-02-22.md","destination_hash":"e5f6g7h8i9j0k1l2...","transformation_type":"DOCX_TO_MD","tool":"pandoc-3.1.2","operator":"benoit-alt","validation_checks":["markdownlint","frontmatter-schema","pii-scan"],"validation_status":"PASS","notes":"Manual heading level fix applied post-conversion; removed excessive blank lines"}
```

**Example only — do not execute:** This log format is for documentation and audit purposes. Actual logging mechanism depends on GitHub Actions workflow implementation (e.g., append to artifact, upload to SharePoint via API) and must be implemented with proper error handling and atomic append operations.

---

## H) 6) REASSEMBLE Deliverable: Audit_Log_Feb_2026.md

### Stable Key Format (Required Determinism)

Every audit log entry must have exactly one stable key using this format:

```
stable_key: {topic_slug}__{decision_date_yyyy_mm_dd}
```

**Rules:**
- Use double underscore (`__`) separator
- `{topic_slug}`: Lowercase alphanumeric + underscores only (e.g., `motorino_cs01_overdue`, `sharepoint_permissions_review`)
- `{decision_date_yyyy_mm_dd}`: Date in `YYYY_MM_DD` format (e.g., `2026_02_22`)

**Example:**
```
stable_key: motorino_cs01_overdue__2026_02_22
```

### Deduplication Rules (Verbatim; Required)

When consolidating multiple audit log fragments (e.g., from `operations.zip`, `profiles.zip`, separate email threads, SharePoint lists):

1. **Rule 1: One stable key per entry:** Every log entry must have exactly one `stable_key`. No entry may omit this field.

2. **Rule 2: Authoritative source precedence:** If two sources describe the same decision/event (same stable key), keep the most authoritative source as primary and reference the other under `related_sources` field. Authority hierarchy:
   - Signed official documents > email from decision-maker > meeting notes > informal communications

3. **Rule 3: No blending of conflicting facts:** If sources conflict on material facts (dates, amounts, decisions), do NOT merge. Record both in separate entries and mark `conflict: true` with a short rationale. Escalate to manual review (KB owner + compliance reviewer).

4. **Rule 4: Stable keys must be deterministic:** Use format `{topic_slug}__{decision_date_yyyy_mm_dd}` consistently. Same event = same stable key across all systems.

5. **Rule 5: Provenance mandatory:** Every entry must list `source_attachment_ids` (filenames or stable IDs) and, when available, `source_sha256_refs` for hash verification.

### Audit Log Entry Template

```markdown
### {stable_key}

**Stable Key:** `{topic_slug}__{decision_date_yyyy_mm_dd}`  
**Date:** YYYY-MM-DD  
**Category:** [Category]  
**Sensitivity:** internal|restricted  
**Status:** active|archived  
**Conflict:** false|true  

**Description:**  
[Detailed description of event/decision]

**Actions Taken:**
- [Action 1]
- [Action 2]

**Related Sources:**
- [Reference to superseded or alternative source, if any]

**Validation:**
- [Validation method]
- Sign-off: [Name] ([Role]) - [Date]

**Source Attachments:** `["filename1.ext", "filename2.ext"]`  
**Source Hashes:** `["sha256_hash1", "sha256_hash2"]`

---
```

### Ready-to-Paste Template (Markdown with YAML Frontmatter)

```markdown
---
title: "KB Consolidation Audit Log - February 2026"
version: "v2026-02-22"
date: "2026-02-22"
sensitivity: "internal"
pii: false
status: "active"
canonical: false
source_attachment_ids:
  - "TBD_after_reassembly"
x_review_date: "2027-02-22"
x_retention_expiry: "2033-02-22"
---

# KB Consolidation Audit Log - February 2026

## Purpose

This audit log consolidates all KB consolidation activities, decisions, and validation checkpoints for the February 2026 KB governance initiative. It serves as the authoritative record for compliance verification (7-year retention per UK corporate requirements) and operational traceability for the `benoit-alt/town-kb` repository and SharePoint `town` site.

## Retention Notice

This document and all referenced materials are subject to **7-Year Retention** (expires 2033-02-22) per Interim Policy for UK corporate compliance. Do not delete, modify, or archive before retention expiry without written approval from compliance reviewer.

## Stable Key Convention

All entries use format: `{topic_slug}__{decision_date_yyyy_mm_dd}`

## Audit Entries

### sharepoint_permissions_review__2026_02_15

**Stable Key:** `sharepoint_permissions_review__2026_02_15`  
**Date:** 2026-02-15  
**Category:** Access Control  
**Sensitivity:** internal  
**Status:** active  
**Conflict:** false  

**Description:**  
Reviewed SharePoint permissions for `town/ComplianceEvidence-Restricted/` library. Verified that only authorized personnel (compliance team + KB admins) have read/write access. Removed legacy service accounts no longer in use.

**Actions Taken:**
- Removed 3 inactive service accounts (sp-legacy-01, sp-legacy-02, sp-temp-audit)
- Added 2 new compliance reviewers (user1@townrestaurant.co.uk, user2@townrestaurant.co.uk)
- Documented permission matrix in SharePoint `town/ComplianceEvidence-Restricted/KB_Audit/2026-02/sharepoint_permissions_2026-02-15.xlsx`

**Validation:**
- Permission audit report generated via SharePoint admin center
- Sign-off: J. Smith (Compliance Lead) - 2026-02-15

**Source Attachments:** `["email_thread_20260215_sharepoint_access.eml", "sharepoint_audit_export_20260215.csv"]`  
**Source Hashes:** `["TBD", "TBD"]`

---

### [Additional entries follow same format]

---

## Sign-Off

**KB Owner:** [Name] - [Date]  
**Compliance Reviewer:** [Name] - [Date]  
**Technical Lead:** [Name] - [Date]

**Repository Reference:** benoit-alt/town-kb (branch: main)  
**SharePoint Site:** https://townrestaurant.sharepoint.com/sites/town/

## Appendices

- **Appendix A:** Transformation log summary (see SharePoint `town/AuditLogs/2026-02_KB_Consolidation/transformation_log.ndjson`)
- **Appendix B:** PII scan reports (see SharePoint `town/ComplianceEvidence-Restricted/KB_Audit/2026-02/pii_scan_results/`)
- **Appendix C:** Hash verification results (see GitHub `benoit-alt/town-kb/logs/hashes/sha256_2026-02-22.txt`)

## Retention Metadata

- **Retention Label:** 7-Year-Retention
- **Retention Start Date:** 2026-02-22
- **Retention Expiry Date:** 2033-02-22
- **Retention Policy Reference:** Interim Policy: 7-Year Retention (UK corporate compliance baseline)
```

**Note:** Do not invent real audit entries. This template provides structure only. Actual entries must be populated from legitimate source materials during REASSEMBLE phase.

---

## I) 7) Secure Disposal Policy (DISCARD)

### Policy Statement

Any file marked for DISCARD disposition must undergo secure deletion with audit trail documentation. Secure deletion means:

1. **Physical deletion:** File removed from storage medium using secure erase (overwrite or cryptographic erase)
2. **Logical deletion:** File reference removed from all indexes, search systems, and backup manifests
3. **Evidence of deletion:** Screenshot or system log proving deletion, retained in SharePoint `town/ComplianceEvidence-Restricted/KB_Audit/2026-02/disposal_evidence/` with 7-year retention
4. **Approval required:** Two-person approval (KB owner + compliance reviewer) documented in SharePoint list before deletion
5. **Retention exception:** If file is subject to legal hold or 7-year regulatory retention, deletion deferred until hold lifted or retention expired (2033-02-22 for current consolidation materials)
6. **Retention class verification:** Confirm attachment's `retention_class` (see manifest) before deletion. Classes with regulatory mandates (e.g., `finance_6y_min`, `hse_longtail_40y_possible`) may require longer retention than interim 7-year policy.

### Evidence Requirements

For each DISCARD action:
- **Pre-deletion hash:** SHA256 of file before deletion
- **Deletion timestamp:** UTC timestamp when deletion executed
- **Deletion method:** Tool/command used (e.g., `srm`, `shred`, cloud provider secure delete API)
- **Approvers:** Names and timestamps of two approvers (KB owner + compliance reviewer)
- **Reason:** Justification for disposal (e.g., "duplicate record", "no business value", "superseded by version X")
- **Retention verification:** Confirmation that file is not subject to 7-year retention or legal hold

**No discards planned.** All source materials will be archived in SharePoint `town/Archive/2025_Legacy_KB/` with 7-year retention or retained in restricted libraries pending final retention policy formalization in company handbook.

---

## J) 8) Risk Controls Matrix

| Risk ID | Risk Description | Likelihood | Impact | Mitigation | Owner |
|---------|------------------|------------|--------|------------|-------|
| R-001 | PII exposed in public GitHub repo `benoit-alt/town-kb` | Low | Critical | `scripts/pii-scan.mjs` mandatory before commit (GitHub Actions required check); restricted SharePoint for PII materials | KB Admin |
| R-002 | Source file lost during transformation | Low | High | SHA256 hashes recorded before/after in manifest; source archived in read-only SharePoint `town/Archive/` with 7-year retention | Operations Lead |
| R-003 | Conflicting audit log entries not detected | Medium | Medium | Stable key deduplication enforced by script; manual review for conflicts flagged in inventory | Audit Team |
| R-004 | DOCX conversion introduces errors | Medium | Medium | Visual diff review mandatory; `markdownlint` validation in GitHub Actions; transformation log records all changes | KB Admin |
| R-005 | Retention policy unclear for archive materials | Low | Medium | Apply 7-year retention per Interim Policy; log in manifest; update when formal handbook link available | Compliance Lead |
| R-006 | Unauthorized access to restricted SharePoint `town/ComplianceEvidence-Restricted/` | Low | Critical | Quarterly permission audits; access logs monitored; read-only for non-admins | InfoSec Team |
| R-007 | Transformation log corrupted or lost | Low | High | Append-only NDJSON format; uploaded to SharePoint with versioning enabled and 7-year retention label | Operations Lead |
| R-008 | CI validation gates bypassed | Low | High | GitHub branch protection rules on `main` enforced; require status checks (pii-scan, markdownlint, schema); sign-off for merge | DevOps Lead |
| R-009 | Frontmatter schema inconsistently applied | Medium | Medium | Automated schema validation in GitHub Actions (fails build if invalid); template provided in `/kb/_templates/` | KB Admin |
| R-010 | Bundle contents contain unexpected file types | Medium | Low | File type inventory during Phase 4; escalate unknowns to manual review; `scripts/pii-scan.mjs` scans all text files | Operations Lead |
| R-011 | GitHub Actions `scripts/pii-scan.mjs` has false negatives | Medium | Critical | Test scanner against known PII samples pre-deployment; quarterly review of scan rules; manual spot-check during Phase 4 | DevOps Lead |
| R-012 | 7-year retention label not applied to SharePoint materials | Low | High | Automated label application in upload scripts; quarterly audit of retention labels in SharePoint compliance center | Compliance Lead |

---

## K) Generated Artifacts (Templates + Skeleton Files)

### K0) Attachment ID Map (Deterministic Provenance)

**Purpose:** Establish stable, immutable identifiers for all source materials. Default: Attachment ID = uploaded filename.

**File:** `benoit-alt/town-kb/logs/manifests/attachment_id_map_2026-02-22.csv`

```csv
attachment_id,filename,size_bytes,received_timestamp_utc,source_location,owner,retention_class
spec_001_umbrella.md,spec_001_umbrella.md,TBD,TBD,TBD,TBD,corporate_7y_policy
spec_001_a_compliance.md,spec_001_a_compliance.md,TBD,TBD,TBD,TBD,corporate_7y_policy
kb-admin_v2026-02-22.md.docx,kb-admin_v2026-02-22.md.docx,TBD,TBD,TBD,TBD,corporate_7y_policy
kbfiles.zip,kbfiles.zip,TBD,TBD,TBD,TBD,corporate_7y_policy
operations.zip,operations.zip,TBD,TBD,TBD,TBD,corporate_7y_policy
profiles.zip,profiles.zip,TBD,TBD,TBD,TBD,corporate_7y_policy
analysis.zip,analysis.zip,TBD,TBD,TBD,TBD,corporate_7y_policy
```

**Retention Class Definitions:**
- `finance_6y_min`: UK statutory minimum for financial records (6 years from end of accounting period)
- `corporate_7y_policy`: Interim 7-year policy (conservative baseline pending handbook)
- `hse_longtail_40y_possible`: Health & Safety Executive records (may require 40+ years for certain exposures; verify per regulation)

**Rules:**
- Once assigned, attachment IDs are immutable
- Use filename as attachment ID unless conflicts exist (if duplicate filenames, append `_v2`, `_v3`, etc.)
- Record `retention_class` for every attachment to avoid blanket assumptions

---
