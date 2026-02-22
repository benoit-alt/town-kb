---
title: "SPEC-001C-Automation-Bridge"
version: "v2026-02-22"
date: "2026-02-22"
sensitivity: "internal"
pii: true
status: "active"
canonical: true
source_attachment_ids:
  - "spec_001_c_automation_bridge.md"
---
# SPEC-001C-Automation-Bridge

## Background

SPEC-001C delivers the "daily operational heartbeat" by moving trusted daily KPI outputs from Tenzo into governed SharePoint Lists and broadcasting concise summaries into Google Chat/Gmail.

This track intentionally uses **Tenzo as the ETL/reporting layer** (rather than calling Toast APIs directly) to:

- Reduce automation brittleness (no OAuth/pagination/JSON complexity inside Make.com).
- Keep daily sales numbers aligned with the same sales feed that powers HopsHQ (Toast → Tenzo → HopsHQ).

## Requirements

### Must

- **DailySales ingestion (governed store)**
  - For each venue, ingest daily KPIs for the prior trading day into SharePoint List `DailySales`.
  - Writes are idempotent (safe to re-run without duplicates).

- **Tenzo report standardisation (contract)**
  - Standardise on a **single "Daily Snapshot" CSV attachment per venue** (one flat table including Net Sales, Covers, Voids, Comps, Discounts, Labour Hours).
  - Any header/format drift must trigger DeadLetter + escalation (no silent partial writes).

- **Tenzo Report SLA (contractual)**
  - **Expected delivery time:** 05:00–05:30 Europe/London
  - **Cutoff for escalation:** 07:30
  - **Mitigation:** If report not received by 07:30:
    1. DeadLetter(MissingReport) created
    2. GM alerted via email
    3. Manual backfill procedure initiated
    4. Tenzo CSM notified if issue persists >1 day

- **Daily operational summary (restricted)**
  - Post a concise daily message into Google Chat `#daily-ops` **restricted to management only**.
  - Send a matching email summary to **management@town.restaurant** (GM, Ops Director, Finance Lead included).

- **Google Chat Space: #daily-ops**
  - **Membership (locked):**
    - General Manager (GM)
    - Operations Director
    - Finance Lead
    - Head Chef (Town)
    - Head Chef (Motorino)
    - Bar Manager (on-duty rotation)
    - Floor Manager (on-duty rotation)
  - **Access control:** Private space, invite-only
  - **Purpose:** Daily KPI summary + operational alerts (non-sensitive)
  - **PII:** None permitted

- **Reliability controls**
  - Run logging with a `run_id` and a persisted RunLog record.
  - Retries for transient failures.
  - Dead-letter / quarantine for bad inputs (e.g., malformed CSV, schema mismatch).
  - Escalation when expected data is missing (e.g., Tenzo report not received by cutoff).

- **Security**
  - No sensitive personal data in `DailySales` or Chat.
  - Least-privilege credentials; secrets never stored in plaintext in KB.

### Should

- **Monday morning reconciliation link**
  - Post a link to the latest SPEC-001B Reconciliation Report into `#daily-ops` every Monday morning.

- **Threshold flagging**
  - If KPIs breach thresholds (e.g., voids spike, covers drop), include a "Flags" section in the daily message.

### Could

- Add a lightweight web UI (SharePoint views + conditional formatting) for managers.
- Add a "Backfill" mode for re-running a specific date range.

### Won't (in 001C)

- Real-time streaming.
- Direct Toast API integration.

## Method

### System of record

- **SharePoint Lists** are the governed record for DailySales and automation run logs.
- Google Chat/Gmail are notification channels only.

### SharePoint Lists

#### 1) DailySales

Add the following extra columns to support idempotency and lineage:

| Field | Type | Notes |
|---|---|---|
| business_key | Single line text | `VENUE|YYYY-MM-DD` — **Enforce unique values = Yes** |
| venue | Choice | Town / Motorino |
| business_date | Date | Trading date |
| gross_sales | Currency/Number | From Tenzo export |
| net_sales | Currency/Number | From Tenzo export |
| covers | Number | From Tenzo/OpenTable depending on Tenzo config |
| avg_spend | Currency/Number | computed or provided |
| voids | Currency/Number | optional |
| comps | Currency/Number | optional |
| discounts | Currency/Number | optional |
| labour_hours | Number | optional |
| labour_pct | Number | optional |
| flags_json | Multiple lines text | JSON array of flags |
| source | Single line text | `tenzo-email-report` |
| source_file_name | Single line text | attachment file name |
| source_message_id | Single line text | Gmail message id |
| source_run_id | Single line text | links to RunLog |

Index columns used for lookups:
- business_key (unique)
- business_date
- venue

#### 2) AutomationRunLog

| Field | Type | Notes |
|---|---|---|
| run_id | Single line text | UUID |
| scenario | Choice | DailySalesIngest / WeeklyReconLink |
| started_at | DateTime | |
| finished_at | DateTime | |
| status | Choice | Success / Partial / Failed |
| venue | Choice | optional |
| business_date | Date | optional |
| records_written | Number | |
| warnings | Multiple lines | |
| error_summary | Multiple lines | |
| diagnostics_link | Hyperlink | Make run URL |

#### 3) AutomationDeadLetter

| Field | Type | Notes |
|---|---|---|
| deadletter_id | Single line text | UUID |
| run_id | Single line text | |
| reason | Choice | MissingReport / ParseError / SchemaMismatch / Auth / Other |
| payload_link | Hyperlink | stored attachment blob or SharePoint file |
| created_at | DateTime | |
| status | Choice | New / Investigating / Resolved |
| owner | Person/Group | |

### Data source: Tenzo email reports (single CSV per venue)

**Report contract (decision):** one CSV attachment per venue per day, containing all required metrics in one flat table.

- Action: Tenzo CSM to create a custom dashboard/report view (e.g., "Town Group Daily End-of-Day") for each venue and schedule it to email as a single CSV.
- Inboxes/aliases (one per venue):
  - Town: `alerts+Townrestaurant@gotenzo.com`
  - Motorino: `alerts+motorino@gotenzo.com`

**Minimum required columns (canonical names):**

- `business_date` (YYYY-MM-DD)
- `net_sales`
- `gross_sales` (optional but preferred)
- `covers`
- `voids_value` (or `voids`)
- `comps`
- `discounts`
- `labour_hours`
- `labour_pct` (optional)

**Schema drift control:**

- Compute a simple header signature (e.g., join(sorted(headers))) and compare to the expected signature.
- If mismatch: quarantine attachment + DeadLetter(SchemaMismatch) + alert GM.

### Make.com scenarios

#### Scenario A — DailySalesIngest (daily, Europe/London)

**Trigger:** Scheduler (every day 06:30 Europe/London)

**Note on timing:** Assumes Tenzo reports arrive 05:00–05:30 Europe/London. Cutoff for escalation: 07:30.

0) **Run initialisation**
   - Generate `run_id` (UUID).
   - Write AutomationRunLog(started_at, scenario=DailySalesIngest).

1) **Gmail: Search emails (per venue alias)**
   - Strategy: search each venue alias mailbox for the most recent Tenzo report.
   - Suggested query template (adjust subject keyword once confirmed):
     - `newer_than:2d has:attachment filename:csv ("Daily End-of-Day" OR "Daily Snapshot" OR "Town Group Daily End-of-Day")`
   - Select the newest matching email per venue.

2) **Attachment handling**
   - Expect **exactly one CSV** attachment.
   - If 0 attachments → DeadLetter(MissingReport).
   - If >1 CSV attachments → DeadLetter(SchemaMismatch) (forces humans to fix the report shape).

3) **CSV: Parse**
   - Convert to text, parse CSV.
   - Validate required columns present.
   - Validate `business_date` parseable.

4) **Map + Normalise**
   - Determine `venue` from mailbox/alias.
   - Determine `business_date` from CSV field.
   - Compute `business_key = venue|business_date`.
   - Normalise number formats (commas, currency symbols).
   - Create `flags_json` from threshold rules.

5) **Idempotent SharePoint write (DailySales)**
   - Attempt Create Item.
   - If business_key uniqueness violation:
     - Find existing item by business_key and Update Item.
   - Always write lineage fields:
     - `source_message_id`, `source_file_name`, `source_run_id`.

6) **Post to Google Chat `#daily-ops` (management-only)**
   - Incoming webhook.
   - Thread by `business_date` (threadKey = `daily-ops|YYYY-MM-DD`).
   - Post message with both venues + flags + SharePoint view link.

7) **Send email summary to `management@town.restaurant`**
   - Same content as Chat.

8) **Run finalisation**
   - Update AutomationRunLog(finished_at, status, records_written, warnings, diagnostics_link).

**Cutoffs + escalation:**

- If a venue report is still missing by 07:30:
  - DeadLetter(MissingReport) created.
  - GM alerted via email.
  - Tenzo CSM notified if issue persists >1 day.

#### Scenario B — WeeklyReconLink (weekly)

**Trigger:** Scheduler (Mondays 08:15 Europe/London)

1) Locate latest Reconciliation Report in SharePoint Exports folder.
2) Post link into `#daily-ops`.
3) Log run.

### Message format (Chat/Gmail)

Example:

- `📊 Daily Summary — YYYY-MM-DD`
- `Town: Net £X | Covers Y | Avg £Z | Voids £V`
- `Motorino: Net £X | Covers Y | Avg £Z | Voids £V`
- `Flags: ⚠️ covers down 15% vs 7d avg; ⚠️ voids spike`
- `Links: DailySales view | RunLog`

### Failure handling

- **Missing report:** if Tenzo email not received by 07:30, alert GM + DeadLetter.
- **Parse errors:** quarantine attachment into SharePoint folder and create DeadLetter.
- **Write errors:** retry 3 times with exponential backoff; if still failing, alert and DeadLetter.

## Implementation

1) Confirm Tenzo email reports are configured (per venue) and include required columns.
2) Confirm Tenzo report SLA with CSM (expected delivery 05:00–05:30).
3) Create SharePoint lists: DailySales, AutomationRunLog, AutomationDeadLetter.
4) Add `business_key` column and enable **Enforce unique values**.
5) Create Google Chat spaces:
   - `#daily-ops` (**management-only**) — GM, Ops Director, Finance Lead, Head Chefs (both venues), Bar Managers, duty Floor Managers.
   - `#ops-compliance` (leadership/private) — used by SPEC-001A.
   - Generate Incoming Webhook URLs and store in Make.com connection vault.

6) Create/confirm email distribution list:
   - `management@town.restaurant` includes GM, Ops Director, Finance Lead (and any other senior recipients).
7) Build Make.com Scenario A (DailySalesIngest) with test emails.
8) Build Make.com Scenario B (WeeklyReconLink).
9) Run 7-day parallel period; validate DailySales matches Tenzo dashboard.
10) Document runbooks in KB (internal):
    - "What to do if the report doesn't arrive"
    - "How to backfill a day"
    - "How to rotate webhook URLs / credentials"

## Operational Runbooks

### Backfill Procedure (re-run a specific date)

**When to use:** Tenzo report was missing/malformed; need to re-ingest after issue resolved.

**Steps:**

1. Log into Make.com workspace
2. Navigate to Scenario C1 (DailySalesIngest)
3. Click "Run once" (manual trigger)
4. Before execution, temporarily modify Gmail search query:
   - Change `newer_than:2d` to `newer_than:14d`
   - Add `subject:"YYYY-MM-DD"` to target specific date
5. Execute scenario manually
6. Verify in DailySales list that:
   - Existing record was **updated** (not duplicated)
   - `source_run_id` shows new run_id
   - All KPI fields populated correctly
7. Revert Gmail search query to production state
8. Document in AutomationRunLog notes: "Manual backfill for [date] - [reason]"
9. Notify GM that backfill is complete

**Troubleshooting:**
- If business_key uniqueness violation occurs during manual re-run → Expected behavior (update, not duplicate)
- If CSV still malformed → Check Tenzo dashboard for data availability; contact Tenzo CSM

### Missing Report Escalation

**Automated steps (06:30–07:30):**
1. Scenario runs at 06:30, searches for report
2. If not found, retries every 15 minutes until 07:30
3. At 07:30 cutoff, creates DeadLetter(MissingReport)
4. Sends alert email to GM

**Manual steps (GM receives alert):**
1. Check Tenzo dashboard directly for data availability
2. If data exists in Tenzo but email not sent:
   - Contact Tenzo CSM
   - Request manual report export
   - Use backfill procedure once received
3. If data doesn't exist in Tenzo:
   - Check Toast POS for data transmission issues
   - Contact Toast support if needed
4. Document resolution in AutomationDeadLetter notes

## Milestones

- **C1 (2–3 days):** Lists created + permissions; Tenzo report confirmed; Tenzo SLA documented; webhooks created.
- **C2 (Week 1):** DailySalesIngest live for both venues; RunLog populated; daily message consistent.
- **C3 (Week 2):** WeeklyReconLink live; threshold flags tuned; backfill procedure documented and tested.
- **C4 (Week 3–4):** 7-day parallel proof; reliability target met; declare operational.

## Gathering Results

- Daily run success rate ≥ 99%.
- 0 duplicate DailySales rows (business_key uniqueness).
- Daily chat summary aligns with Tenzo dashboard and weekly P&L review.
- Runbooks used successfully in at least one "missing report" drill.
- Backfill procedure tested and validated.

## Need Professional Help in Developing Your Architecture?

Please contact me at [sammuti.com](https://sammuti.com) :)