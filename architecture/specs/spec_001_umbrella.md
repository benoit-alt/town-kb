---
title: "SPEC-001-Second-Brain-MVP"
version: "v2026-02-22"
date: "2026-02-22"
sensitivity: "internal"
pii: true
status: "active"
canonical: true
source_attachment_ids:
  - "spec_001_umbrella.md"
---
# SPEC-001-Second-Brain-MVP

## Background

Town Restaurant Group operates two premium London venues (Town + Motorino) and already maintains a small, versioned internal knowledge base (10 canonical markdown files) with a monthly/quarterly review cadence and explicit governance gates (e.g., PII linting and access control for restricted content).

A Feb 2026 audit/rebuild resolved several "system of record" conflicts (e.g., HopsHQ replacing MarketMan; Stafflex replacing Planday; Tenzo/ApprovalMax/Toast live), but surfaced a set of operational risks and evidence gaps that must be closed to reduce compliance exposure and enable reliable automation (e.g., Motorino CS01 overdue; PSC anomaly; no HVAC PPM; AutoEntry status unverified; email domain security gaps).

The intent of this spec is to define an implementable MVP "Second Brain" that:

- Strengthens KB governance (so the KB is safe, current, and AI-readable).
- Stabilises the critical POS→analytics→inventory data chain (so KPI outputs are trustworthy).
- Bridges Google Workspace operations with Microsoft 365/SharePoint governance for daily reporting and controls.

**Decision:** SPEC-001 is the *umbrella master spec* (vision, shared architecture, shared data model, shared RACI and governance). Execution is split into child specs (SPEC-001A/B/C/D) so legal/compliance, operations data hygiene, and technical automation can progress in parallel without blocking one another.

## Requirements

### Must (MVP)

- **Umbrella spec + child-spec execution model**
  - SPEC-001 defines the unified vision, shared data model, shared security model, and shared RACI.
  - Child specs define sprint-ready delivery with independent owners, dependencies, and acceptance criteria.
- **Single accountable approver**
  - The **General Manager** is the single accountable approver for SPEC-001 (system design + operational fit). Evidence artifacts for specialist areas remain owned by their domain owners (e.g., Company Secretary for filings).

### Must (MVP): Compliance + operations controls

- **Regulatory/compliance risk closure**
  - Track and drive closure of **Motorino London Ltd CS01 overdue** (critical) and **Town PSC anomaly** (high) with explicit owners, due dates, and evidence artifacts stored in the KB / SharePoint ComplianceTasks list.
- **Operational safety / maintenance control**
  - Establish and document an HVAC **PPM agreement** status for Chapman Ventilation and store contract metadata + renewal reminders in the KB.
- **Knowledge Base governance hardening**
  - Preserve doc_id permanence and versioning rules; enforce review cadences; enforce PII lint gate and access control for restricted files via CI checks + PR workflow.
- **Data integrity first (Toast↔Tenzo↔HopsHQ)**
  - Complete a repeatable PLU/recipe/UoM stabilisation process and produce a reconciliation report artifact before trusting GP/variance automation.
- **Automation MVP (cross-platform bridge)**
  - Daily sales/covers/flags captured into SharePoint (as the governed store) and pushed to Google Chat/Gmail as an operational summary.
  - Failure handling (idempotency, retries, dead-letter/quarantine) and human escalation path.

### Should

- **Close evidence gaps from Feb 2026 audit**
  - Confirm AutoEntry operational status with Wenodo; verify AIM Troncmasters contact; schedule Workable utilisation review; verify First Aid / Fire Marshal expiry dates.
- **Email domain hardening**
  - Remediate weak DMARC / missing DKIM for town.restaurant and document the controls/runbook in the KB.

### Could

- AI-assisted workflows: weekly variance triage, menu engineering, vendor OSINT monitoring, manager handover summaries (all gated as "draft" until human sign-off).

### Won't (for SPEC-001 MVP)

- Real-time forecasting/optimisation ML, multi-venue expansion beyond Town + Motorino, or any automation that touches PCI card data.

## Method

### Timezone Policy

All scheduled automations use **Europe/London** timezone (observes BST).

**Critical transitions:**
- GMT → BST (last Sunday in March): automations shift 1 hour earlier UTC
- BST → GMT (last Sunday in October): automations shift 1 hour later UTC

**Action:** Review automation schedules in September/March each year.

**Affected systems:**
- Power Automate flows (SPEC-001A)
- Make.com scenarios (SPEC-001C)
- GitHub Actions workflows (SPEC-001D - runs on UTC, but alert timing may need adjustment)

### Child specs (execution tracks)

SPEC-001 is the umbrella master. Delivery is decomposed into sprintable child specs with minimal coupling.

**Delivery order (decision):** Start with **SPEC-001A** to close existential compliance risks and establish the evidence-tracking pattern. Then progress **SPEC-001B** and **SPEC-001C** in parallel. **SPEC-001D** supports all tracks (governance/CI) and can be delivered incrementally alongside them.

- **SPEC-001A — Compliance & Evidence (Companies House + H&S/PPM)**
  - Scope: CS01 closure, PSC anomaly resolution, PPM agreement capture, evidence repository + reminders.
  - Exit criteria: evidence artifacts logged; ComplianceTasks list live; monthly compliance review ritual; PPM renewal reminders operational.
  
- **SPEC-001B — Data Integrity (Toast → Tenzo → HopsHQ)**
  - Scope: PLU mapping coverage, recipe linkage, UoM conflict elimination, reconciliation report.
  - Exit criteria: KPI gates met (e.g., unmapped PLUs = 0 for top items; UoM conflicts = 0); stock count cadence established (Sunday 22:00–23:30).

- **SPEC-001C — Automation Bridge (Tenzo → SharePoint → Google Chat/Gmail)**
  - Scope: daily ingestion + reporting, idempotency, alerting, runbooks.
  - Exit criteria: ≥99% successful daily runs; alerting + escalation proven in drills; Tenzo SLA documented and monitored; backfill procedure validated.

- **SPEC-001D — KB Governance & CI**
  - Scope: PR-only workflow, schema/lint checks, PII gate enforcement, access control patterns.
  - Exit criteria: CI gates enforced; 0 violations; monthly review cadence operational; stale review alerts functional.

### Shared architecture principles

**System of record decisions:**
- **SharePoint Lists** = governed operational data (DailySales, ComplianceTasks, AutomationRunLog)
- **GitHub KB repo** = governed documentation + runbooks (markdown with frontmatter)
- **Google Chat/Gmail** = notification channels only (no system of record)

**Cross-platform bridges:**
- Power Automate: SharePoint ↔ Google Chat webhooks (escalations)
- Make.com: Gmail/Tenzo ↔ SharePoint (daily ingestion)

**Security model:**
- PII identification + confidentiality tagging in KB frontmatter
- Library-level ACLs in SharePoint (not item-level)
- Private Google Chat spaces with explicit membership lists
- Secrets vault: Make.com connection storage (not plaintext in KB)

**Governance RACI:**
- **General Manager (GM)**: Accountable for overall system design and operational adoption
- **Company Secretary**: Responsible for Companies House compliance evidence
- **Operations Director**: Responsible for daily KPI review and escalation response
- **Finance Lead**: Responsible for P&L reconciliation and variance investigation
- **Head Chefs (both venues)**: Consulted on recipe/stock processes; Informed of daily variance
- **IT/Systems lead**: Responsible for automation reliability and runbook maintenance

### Shared data model

**SharePoint site structure:**
```
SecondBrain (site)
├── ComplianceTasks (list)
├── DailySales (list)
├── AutomationRunLog (list)
├── AutomationDeadLetter (list)
├── ComplianceEvidence (library - internal)
├── ComplianceEvidence-Restricted (library - restricted ACL)
└── Exports-Reconciliation (library)
    ├── Raw/
    ├── Reports/
    └── Quarantine/
```

**KB repository structure:**
```
town-kb/
├── ops/               (department-owned)
├── finance/           (department-owned)
├── systems/           (department-owned)
├── vendors/           (cross-department)
├── schemas/           (governance artifacts)
├── scripts/           (CI scripts)
└── .github/
    ├── workflows/
    └── CODEOWNERS
```

**Naming conventions:**
- SharePoint task_id: `CT-YYYY-NNN` (ComplianceTasks)
- SharePoint business_key: `VENUE|YYYY-MM-DD` (DailySales)
- Automation run_id: UUID v4
- KB doc_id: `{department}-{type}-{nnn}` (in frontmatter)

## Implementation

**Phase 1 (Week 1–2): Foundation + Critical Compliance**
- SPEC-001A M1–M3: SharePoint setup + CS01/PSC tracking + evidence structure
- SPEC-001D initial: GitHub branch protection + frontmatter schema

**Phase 2 (Week 2–3): Data Integrity + Automation**
- SPEC-001B B1–B3: Export formats + reconciliation report + stock count cadence
- SPEC-001C C1–C2: SharePoint lists + DailySalesIngest + Tenzo SLA confirmation

**Phase 3 (Week 3–4): Hardening + Operationalisation**
- SPEC-001A M4: PPM renewal workflow + monthly export
- SPEC-001B B4–B5: Automated variance ingestion + 7-day trust proof
- SPEC-001C C3–C4: WeeklyReconLink + threshold flags + backfill validation
- SPEC-001D complete: All CI gates + stale review alerts

**Rollback procedures:**
- SPEC-001A: Revert to manual compliance spreadsheet tracking (pre-SharePoint state)
- SPEC-001B: Continue using manual stock counts; pause automated variance reporting
- SPEC-001C: Revert to manual Tenzo dashboard checks; disable Make.com scenarios
- SPEC-001D: Temporarily disable required status checks; allow direct commits to `main`

## Milestones

- **Week 1:** SPEC-001A ComplianceTasks live; SPEC-001D branch protection enforced
- **Week 2:** SPEC-001B first reconciliation report; SPEC-001C first successful daily ingest
- **Week 3:** SPEC-001A monthly snapshot; SPEC-001B variance ingestion; SPEC-001C backfill tested
- **Week 4:** All specs at operational maturity; 7-day parallel validation complete

## Gathering Results

**Compliance & Risk (SPEC-001A):**
- 0 Critical overdue tasks >7 days
- 100% evidence completeness on closed tasks
- PPM renewal reminders functional

**Data Integrity (SPEC-001B):**
- PLU mapping 100% for top revenue items
- Recipe linkage ≥95%
- UoM conflicts = 0
- Weekly stock count cadence operational (Sunday 22:00–23:30)

**Automation Reliability (SPEC-001C):**
- Daily run success ≥99%
- 0 duplicate DailySales rows
- Tenzo SLA documented and monitored
- Backfill procedure validated

**Governance (SPEC-001D):**
- CI gates enforced (0 violations)
- Stale review alerts operational
- Monthly KB review cadence active

**Cross-cutting:**
- Weekly review rituals established and attended
- Runbooks documented and tested in drills
- Timezone transitions reviewed (Sept/Mar)
- Rollback procedures validated

## Need Professional Help in Developing Your Architecture?

Please contact me at [sammuti.com](https://sammuti.com) :)