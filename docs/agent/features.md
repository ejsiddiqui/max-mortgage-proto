# Features

## Pages & Routes (PRD Section 6.2)

| Page | Route | Access | Mockup File |
|------|-------|--------|-------------|
| Login | `/login` | Public | `html/index.html` |
| Dashboard | `/` | Admin only (Agents/Viewers redirect to Kanban) | `html/dashboard.html` |
| Kanban Board | `/projects` | All roles | `html/projects-kanban.html` |
| Projects List | `/projects/list` | All roles | `html/projects-list.html` |
| Project Detail | `/projects/:id` | All roles (write permissions vary) | `html/project-detail.html` |
| Agents | `/agents` | All roles (Agents see only themselves) | `html/agents.html` |
| Settings | `/settings` | All roles (restricted tabs by role) | `html/settings.html` |

**Layout Structure (PRD Section 6.1):**
- Left sidebar: Navigation links + user info + role badge
- Top bar: Page title + global search + "New Project" button
- Main area: Content

## Project Detail Tabs (PRD Section 5.1.3)

1. **Overview** — Meta info grid, document progress card, loan overview, client & agent info, recent activity log, status controls
2. **Documents** — Grouped checklist with collapsible sections A-F, upload/verify/reject/download actions
3. **Commission** — Financial fields (visible only at Disbursement+ stage, hidden for Viewer)
4. **Timeline** — Horizontal T1-T4 milestone bar showing durations

## Commission Calculation (PRD Section 5.3)

- Rates stored as decimals (0.015 = 1.5%, 0.7 = 70%), displayed as percentages
- Per-project rate overrides (defaulted from master tables at creation, overridable by Admin)
- **Formulas:**
  - Expected Commission = `loanAmount × bankCommissionRate / 100` (Admin can override manually)
  - Agent Share (Projected) = `expectedCommission × agentRate / 100`
  - Referral Share (Projected) = `expectedCommission × referralRate / 100`
  - Agent Payout (Final) = `finalCommission × agentRate / 100`
  - Referral Payout (Final) = `finalCommission × referralRate / 100`
- **Agent visibility:** Agents see only Loan Amount, Final Commission (read-only), and their Agent Payout (Final)
- Commission tab visible only at Disbursement+ stage, hidden entirely for Viewer

## Project Creation (PRD Section 5.1.2)

- Triggered by "New Project" button (hidden for Viewer)
- Required fields: Client Name, Borrower Type, Business Type, Bank, Assigned Agent, Loan Amount
- Optional: Client Email/Phone, Referral Company, Property, Notes
- On save: auto-generate `projectCode` (MM-0001, MM-0002...), `projectName` ("{code} - {clientName} - {businessType}")
- Set `stage = "lead"`, `status = "open"`
- Redirect to Document Gathering view for the new project

## Analytics (T1-T5 Milestones) — PRD Section 5.4

- T1 (Speed to Start): `_creationTime` → `wipStartedAt` (time to start working on project)
- T2 (Doc Collection): `wipStartedAt` → `docsCompletedAt` (time to collect all docs)
- T3 (Prep & Submit): `docsCompletedAt` → `submittedAt` (time to prepare & submit to bank)
- T4 (Bank Processing): `submittedAt` → `folAt` (bank processing time to FOL)
- T5 (FOL to Disbursement): `folAt` → `disbursedAt` (time from FOL to disbursement)
- **On-Hold pausing:** Track `pausedDays` and `onHoldReason`, subtract from T-metric calculations (v1: simple approach)
- **Chronological enforcement:** `wipStartedAt ≤ docsCompletedAt ≤ submittedAt ≤ folAt ≤ disbursedAt ≤ closedAt`

## Dashboard Analytics (Admin Only, PRD Section 5.4.2)

- Total projects by stage (bar chart or Kanban view)
- Average T1-T4 durations across all closed/disbursed projects
- Projects by status breakdown (open / on-hold / closed)
- Agent leaderboard: number of projects, total loan volume, avg T1
- v1 scope: Summary cards row + 1-2 charts using Recharts (keep lightweight)

## Agents Page (PRD Section 6.3)

- All roles can view (Agents see only themselves)
- Agent Card shows: Name, role, region, active project count, closed project count, pipeline total (sum of open loan amounts), contact info
- Features: Region filter dropdown, search by name/email, grid view (cards) and table view (workload summary)

## Projects List View (Secondary, PRD Section 5.1.1b)

- Table-based alternative to Kanban board
- Accessible via "List view" toggle link
- Table columns: Client Name, Stage, Agent, Loan Amount, Updated Date, Status, Action (View link)
- Paginated (default 5 per page) with Prev/Next navigation
- Pipeline snapshot card: total open pipeline value, average ticket size
- Same filter controls as Kanban (stage, agent, status, search)
- "New Project" button (hidden for Viewer)

## Settings Page Structure (PRD Section 6.4)

- Single page with left sidebar tab navigation
- **Admin tabs:** Profile, Banks, Referral Companies, Users, Notifications, Privacy & Security
- **Agent/Viewer tabs:** Profile, Notifications, Privacy & Security (no master table access)
- Master table CRUD:
  - Banks: name, commission rate, active status, toggle activate/deactivate
  - Referral Companies: name, contact person, email, phone, commission rate, active status
  - Users: name, email, role (Admin/Agent/Viewer), commission rate (for agents), active status
