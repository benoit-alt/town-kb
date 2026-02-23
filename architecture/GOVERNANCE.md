# KB Governance & CI Requirements

## Overview

This document defines the governance model for the town-kb repository, including required status checks, field conventions, and PII policies.

---

## Required Status Checks (Branch Protection)

To enforce quality standards, configure GitHub branch protection on `main` with the following **required status checks**:

### kb-validation workflow

These checks run on every push and pull request:

- **kb-validation / markdownlint** — Validates markdown formatting (line length, heading structure, lists, etc.)
- **kb-validation / frontmatter-schema** — Validates YAML frontmatter against path-aware JSON schemas
- **kb-validation / pii-lint** — Advisory scan for PII patterns (emails, phones) in markdown
- **kb-validation / link-check** — Validates relative links point to existing files

### spec-gate workflow

These checks run when `architecture/specs/**` files change:

- **spec-gate / validate-specs** — Validates spec structure and required fields

---

## Schema Field Convention

### Canonical Fields (All Paths)

All markdown documents in `kb/`, `architecture/specs/`, and `ops/` must include:

```yaml
title:               string (required, ≥3 chars)
version:             string (required, semantic or vYYYY-MM-DD format)
date:                string (required, YYYY-MM-DD)
sensitivity:         enum (required; public_internal | internal | restricted)
pii:                 boolean (required; true if document includes sensitive identifiers)
status:              enum (required; draft | active | deprecated | archived)
canonical:           boolean (required; true if single source of truth)
source_attachment_ids: array (required; ≥1 item)
```

### Review Fields (Optional, Recommended)

To support periodic review workflows:

```yaml
last_reviewed:       string (optional, YYYY-MM-DD; "last reviewed" date, read-only)
next_review_due:     string (optional, YYYY-MM-DD; canonical scheduling field for stale-document checks)
```

**Guidance:**
- Prefer `next_review_due` as the single source of truth for review scheduling.
- Set `last_reviewed` only when a document is formally reviewed.
- If using both, `next_review_due` should be future-dated and `last_reviewed` should be ≤ today.
- Custom fields may be prefixed with `x_` (e.g., `x_owner`, `x_approver`).

### Operations / SOP Documents (`ops/**`)

Operations-specific schema extends the global fields:

```yaml
doc_type:           enum (SOP | vendor_register | system_note | playbook | incident)
venue_scope:        enum (Town | Motorino | Both)
department:         enum (ops | finance | people | security | systems | menus)
role_owner:         string (minimum 2 chars)
approver:           string (minimum 2 chars)
confidentiality:    enum (public_internal | restricted)
tags:               array of strings
systems:            array of strings
dependencies:       array of strings
risk_level:         enum (low | medium | high | critical)
KPI_impact:         string
change_log:         array of objects { date, author, summary }
```

---

## PII Lint Policy

### Hard Rules

- If `pii: true`, then `sensitivity` must be `internal` or `restricted` (never `public_internal`).
- PII patterns (emails, phone numbers) trigger advisory warnings but do not fail builds by default.
- Set `PII_ENFORCE=1` environment variable to make PII violations fail the build.

### Ergonomics (Reduce False Positives)

The PII scanner:

1. **Strips code spans and fenced blocks** — inline code (` ... `) and fenced code blocks (``` ... ```) are not scanned.
2. **Allowlists known-safe patterns** — e.g., `example.com`, `test@test.com`, YYYY-MM-DD dates.
3. **Supports line-level suppression** — add `pii:ignore` comment on a line to suppress that finding:
   ```markdown
   - Contact: [management@town.restaurant](mailto:management@town.restaurant) pii:ignore
   ```

### Output

PII scan output is actionable:
```
- <file>:<line> [<type>] <value>
```

Example:
```
- architecture/specs/spec_001_c_automation_bridge.md:46 [email] management@town.restaurant
```

---

## CI Workflow Names

- **kb-validation** — Multi-job workflow validating markdown, frontmatter, links, and PII
- **spec-gate** — Workflow validating spec files in `architecture/specs/`

---

## Governance History

- **2026-02-23**: Initial unified schema and check-name pinning. Added review field conventions and PII ergonomics.
