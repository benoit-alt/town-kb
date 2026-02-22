# Town KB / Second Brain

**Bundle date:** 2026-02-22  
**Generated at (UTC):** 2026-02-22T05:07:03Z

This repository bundle is delivered in **two ZIP parts** so you can unzip them in order:

1. **Part 1 — Repo scaffold + governance tooling + implementation pack**
2. **Part 2 — Architecture specs (SPEC-001 umbrella + A/B/C + SPEC-001D build sheet)**

✅ **How to assemble locally**

- Unzip **Part 1** (creates `town-kb/`)
- Unzip **Part 2** on top of the same folder (adds `architecture/specs/*.md`)

---

## Repository layout (after both parts)

- `kb/`
  - `canonical/` — canonical KB content (placeholder in Part 1)
  - `_templates/` — canonical templates + schema notes
- `architecture/specs/` — SPEC-001 documents (added in Part 2)
- `ops/` — operational SOPs / registers (placeholder)
- `.github/workflows/kb-validation.yml` — CI gates (job names match SPEC-001D build sheet)
- `scripts/` — frontmatter validation, (advisory) PII scan, local link checker
- `docs/implementation_pack/` — KB Consolidation Implementation Pack + fixes (reference material)

---

## CI governance summary

### Status checks (names are exact)

- `markdownlint`
- `frontmatter-schema`
- `pii-lint` (advisory by default; set `PII_ENFORCE=1` to enforce)
- `link-check`

### Frontmatter validation (split schema by path)

- `/kb/**` and `/architecture/specs/**` → `scripts/frontmatter-schemas/global_8_field.schema.json`
- `/ops/**` → `scripts/frontmatter-schemas/ops_extended.schema.json`

Mapping is defined in `scripts/frontmatter-path-map.json`.

---

## Manifests

See `manifests/` for per-part manifests and SHA256 checksums.
