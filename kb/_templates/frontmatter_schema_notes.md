---
title: "KB Frontmatter Schema Documentation"
version: "v2026-02-22"
date: "2026-02-22"
sensitivity: "internal"
pii: false
status: "active"
canonical: false
source_attachment_ids:
  - "none"
next_review_due: "2027-02-22"
x_author: "KB Admin Team"
x_note: "Reference documentation; canonical:false because it documents schema rather than being governed content"
---

# KB Frontmatter Schema Documentation

## Purpose

This schema ensures consistent metadata across all KB documents in `benoit-alt/town-kb`, enabling automated validation via GitHub Actions, search, and governance. Enforced by `.github/workflows/kb-validation.yml` per SPEC-001D.

## Schema Split by Path

**This consolidation uses split schema (Option A):**

- **`/kb/canonical/**` and `/architecture/specs/**`:** Use 8-field global schema (see below)
- **`/ops/**` SOPs and operational procedures:** Use SPEC-001D extended schema (doc_type, venue_scope, approval_chain, etc.)
- **`/kb/_templates/**` reference docs:** Use 8-field schema with `canonical: false`

### Where the validator reads schemas

- Path map: `scripts/frontmatter-path-map.json`
- Global schema (8-field): `scripts/frontmatter-schemas/global_8_field.schema.json`
- Ops schema (extended): `scripts/frontmatter-schemas/ops_extended.schema.json`
- Validator script: `scripts/validate-frontmatter.mjs`


CI must validate each path against its designated schema.

## Required Fields (8-Field Global Schema)

All documents in `/kb/canonical/` and `/architecture/specs/` **must** include these fields exactly:

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
---
```

### Field Definitions

- **`title`** (string): Human-readable document title
- **`version`** (string): Version using format `vYYYY-MM-DD` (e.g., `v2026-02-22`)
- **`date`** (string): ISO 8601 date `YYYY-MM-DD`
- **`sensitivity`** (enum): `public_internal`, `internal`, or `restricted`
- **`pii`** (boolean): `true` if contains PII; `false` otherwise
- **`status`** (enum): `draft`, `active`, `deprecated`, or `archived`
- **`canonical`** (boolean): `true` for authoritative docs; `false` for drafts/audit/supporting/templates
- **`source_attachment_ids`** (array): Provenance tracking (filenames or stable IDs)

## Optional Review Fields

Documents may optionally include review scheduling fields:

```yaml
next_review_due: "YYYY-MM-DD"     # When the document should be reviewed next (canonical scheduling field)
last_reviewed: "YYYY-MM-DD"       # When the document was last reviewed (read-only indicator)
```

- Use `next_review_due` as the primary scheduling field for stale-document checks.
- Set `last_reviewed` only when a document is formally reviewed.

## Optional Extended Metadata

If you need additional fields (author, tags, retention_class), **prefix them with `x_`** to avoid conflicts:

```yaml
x_author: "Author Name"
x_tags: ["tag1", "tag2"]
x_retention_class: "corporate_7y_policy"
x_retention_expiry: "2033-02-22"
```

## Hard Rules

1. **All 8 required fields must be present** (title, version, date, sensitivity, pii, status, canonical, source_attachment_ids)
2. **`canonical: true` only for authoritative KB docs** (drafts/audit/supporting/templates must use `false`)
3. **`pii: true` not allowed in `/kb/canonical/`** unless explicitly approved (enforced by `scripts/pii-scan.mjs`)
4. **`source_attachment_ids` mandatory** (use `["none"]` only for templates or if genuinely no source)
5. **Optional fields must use `x_` prefix** (e.g., `x_author`, not `author`)
6. **Templates in `/kb/_templates/` must use `canonical: false`**

## Validation

GitHub Actions validates on every commit to `main`:

```yaml
# Example workflow step (see .github/workflows/kb-validation.yml)
- name: Validate frontmatter schema (8-field for KB/specs)
  run: node scripts/validate-frontmatter.mjs --schema global-8field --files './kb/**/*.md' './architecture/**/*.md'

- name: Validate frontmatter schema (SPEC-001D for ops)
  run: node scripts/validate-frontmatter.mjs --schema spec-001d --files './ops/**/*.md'
```

CI fails if:
- Any required field missing
- Field type incorrect
- `canonical: true` + `pii: true` in `/kb/canonical/`
- `source_attachment_ids` empty or omitted (except templates with `["none"]`)
- Non-`x_` prefixed custom fields present
- Wrong schema applied to wrong path

## Common Errors

1. **Missing `source_attachment_ids`:** Add `["none"]` for templates; actual docs must list sources
2. **`canonical: true` + `pii: true`:** Move to SharePoint `town/ComplianceEvidence-Restricted/`
3. **Invalid date format:** Use `YYYY-MM-DD` only
4. **Custom field without `x_` prefix:** Rename to `x_fieldname`
5. **Typo in required field name:** Schema validation catches; check GitHub Actions error
6. **Template with `canonical: true`:** Templates are reference materials, not governed content; use `canonical: false`

## CI Integration

GitHub Actions (`.github/workflows/kb-validation.yml`) runs:
- `markdownlint` (formatting)
- `frontmatter-schema` validation (path-aware: 8-field vs SPEC-001D)
- `scripts/pii-scan.mjs` (PII detection)
- `link-check` (internal references)

All checks must pass before merge to `main` (branch protection enforced).

## Retention Notice

Schema documentation subject to 7-year retention as operational governance artifact (retention class: `corporate_7y_policy`, expires 2033-02-22).
