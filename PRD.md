# Max Mortgage — Product Requirements Document (PRD)

## 1. Overview

Max Mortgage is a **Lead & Project Management System (MIS)** for mortgage brokers. It tracks borrowing applications from intake to disbursement, enforcing document compliance, commission tracking, and milestone-based analytics.

This is an **admin panel only** — no public-facing pages. The system has three internal roles (Admin, Agent, Viewer) and treats Clients/Borrowers as data entities (no login).

**Currency & Display:**
- All monetary amounts are displayed in **AED (United Arab Emirates Dirham)** and formatted in **millions** (e.g., "AED 2.5M" for 2,500,000)
- Fiscal year runs January to December (calendar year)

**Design Reference:** The `/html` directory contains a **comprehensive HTML/CSS/JS mockup covering 100% of the UI** — all pages, roles, interactions, and data flows are prototyped. Use it as the **primary layout, design, and interaction reference**. Reuse functional code where applicable, but rebuild components in React + ShadCN to match the patterns below. See **Section 11** for a complete mockup-to-production file mapping.

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Starter Template | [Convex + React (Vite) + Convex Auth + ShadCN](https://github.com/get-convex/templates/tree/main/template-react-vite-convexauth-shadcn) |
| Frontend | React (Vite) + ShadCN UI + Tailwind CSS |
| Backend & DB | Convex (BaaS) — schema, queries, mutations, file storage |
| Auth & RBAC | Convex Auth — reference: [convex-auth-with-role-based-permissions](https://github.com/get-convex/convex-auth-with-role-based-permissions) |
| Email | Resend (for notifications — v2, wire the integration but no templates needed yet) |
| Testing | Vitest (unit), Playwright (e2e) — setup only, full coverage is v2 |

---

## 3. Actors & Access Control (RBAC)

### 3.1 Roles

| Role | Description |
|------|------------|
| **Admin** | Full system control. Manages users, master tables, templates. Global access to all projects, financials, documents. Can backdate milestones, verify/reject documents, edit commissions. |
| **Agent** | Case manager. Sees only their **assigned projects**. Can edit project details, upload documents, create new projects. Can view "Final Commission" (read-only). Cannot access master tables or user management. |
| **Viewer** | Supervisor/reviewer. Read-only access to all projects. Can download documents. Cannot upload, edit, or create anything. |

### 3.2 Permission Matrix

| Action | Admin | Agent | Viewer |
|--------|-------|-------|--------|
| Master Dashboard (settings) | ✅ | ❌ | ❌ |
| View Analytics Dashboard | ✅ (all data) | ✅ (filtered to assigned/created projects) | ✅ (all data, read-only) |
| Create/edit user profiles & roles | ✅ | ❌ | ❌ |
| Manage master tables (Referral Companies, Banks, Agents) | ✅ | ❌ | ❌ |
| Browse projects | ✅ (all) | ✅ (created or assigned only)  | ✅ (all, read-only) |
| Create new projects | ✅ | ✅ | ❌ |
| Edit project details | ✅ | ✅ (created or assigned only) | ❌ |
| Move project stages (Kanban) | ✅ | ✅ (created or assigned only) | ❌ |
| Change project status (Open/On-Hold/Closed) | ✅ | ✅ (created or assigned only) | ❌ |
| Upload documents | ✅ | ✅ | ❌ |
| Download documents | ✅ | ✅ | ✅ |
| Verify/Reject documents | ✅ | ❌ | ✅ |
| View commission fields | ✅ | ✅ (Final Commission only) | ✅ |
| Edit commission fields | ✅ | ❌ | ❌ |
| Backdate milestone dates | ✅ | ❌ | ❌ |
| View "Other Docs" | ✅ | ✅ (created or assigned only) | ❌ |

### 3.3 External Entities (No Login)

- **Client (Borrower):** Data record attached to a project — Name, Email, Phone, Emirates ID, etc.
- **Referral Company:** Master data entity managed by Admins, used for tagging projects and commission splits.

---

## 4. Data Model (Convex Schema)

Below is the logical schema. Implement using Convex's `defineSchema` / `defineTable`.

### 4.1 Master Tables (Admin-managed)

```
referralCompanies
  - name: string
  - contactPerson: string (optional)
  - email: string (optional)
  - phone: string (optional)
  - commissionRate: number (percentage, e.g. 10)
  - isActive: boolean

banks
  - name: string
  - commissionRate: number (percentage — default bank rate)
  - isActive: boolean

agentProfiles
  - userId: Id<"users">  (links to Convex Auth user)
  - commissionRate: number (percentage)
  - isActive: boolean
```

### 4.2 Projects

```
projects
  - projectCode: string (auto-generated, e.g. "MM-0001")
  - projectName: string (auto: "{projectCode} - {clientName} - {businessType}")
  - clientName: string
  - clientEmail: string (optional)
  - clientPhone: string (optional)
  - borrowerType: "salaried" | "self_employed"
  - businessType: "buyout" | "equity_release"
  - bankId: Id<"banks">
  - referralCompanyId: Id<"referralCompanies"> (optional)
  - assignedAgentId: Id<"users">
  - loanAmount: number
  - property: string (name/address of the target property)
  - propertyValue: number (optional — estimated or appraised value)
  - propertyProfile: "Land" | "Building" (property type for portfolio analytics)
  - stage: "new" | "wip" | "docs_completed" | "submitted" | "fol" | "disbursed" | "closed"
  - status: "open" | "active" | "on_hold" | "disbursed"
  - closedOutcome: "approved" | "rejected" | "cancelled" | "disbursed" (optional, required when stage=closed)
  - onHoldReason: string (optional — required when status changes to on_hold)
  - folNotes: string (optional — bank conditions/requirements, set when moved to FOL stage)
  - createdBy: Id<"users">
  - notes: string (optional)

  // Milestone timestamps (nullable — set when stage is reached)
  - wipStartedAt: number (optional — when moved from New to WIP)
  - docsCompletedAt: number (optional — when moved to Docs Completed stage)
  - submittedAt: number (optional — when moved to Submitted stage)
  - folAt: number (optional — when moved to FOL stage)
  - disbursedAt: number (optional — when moved to Disbursed stage)
  - closedAt: number (optional — when moved to Closed stage)

  // Commission rate overrides per project (default from master tables, overridable by Admin)
  - bankCommissionRate: number (optional — decimal, e.g. 0.015 = 1.5%, pulled from bank master)
  - agentCommissionRate: number (optional — decimal, e.g. 0.7 = 70%, pulled from agent profile)
  - referralCommissionRate: number (optional — decimal, e.g. 0.25 = 25%, pulled from referral company)

  // Commission fields (in Disbursement section)
  - expectedCommission: number (optional — calculated: loanAmount × bankCommissionRate)
  - finalCommission: number (optional — actual received, entered by Admin post-disbursement)
  - agentPayoutAmount: number (optional — calculated: finalCommission × agentCommissionRate)
  - referralPayoutAmount: number (optional — calculated: finalCommission × referralCommissionRate)

  // Loan details (displayed on Project Detail → Overview)
  - ltv: number (optional — loan-to-value percentage)
  - interestRate: number (optional — annual percentage)
  - termYears: number (optional — loan term in years)
  - downPayment: number (optional)
  - monthlyPayment: number (optional — estimated EMI)
```

### 4.3 Documents

```
documents
  - projectId: Id<"projects">
  - section: "borrower" | "company" | "asset" | "bank" | "lease" | "other"
  - documentCode: string (e.g. "A1", "B2", "C5", "OTHER")
  - label: string (display name, e.g. "Valid UAE ID", or user-entered for Others)
  - fileIds: Id<"_storage">[] (array — supports multiple files per document slot)
  - status: "missing" | "uploaded" | "verified" | "rejected"
  - verifiedBy: Id<"users"> (optional)
  - rejectionReason: string (optional)
  - uploadedBy: Id<"users">
```

### 4.4 Audit Log (Lightweight v1)

```
auditLog
  - projectId: Id<"projects"> (optional — null for system-level events)
  - action: string (e.g. "stage_change", "document_upload", "commission_edit", "status_change")
  - performedBy: Id<"users">
  - details: string (JSON string with before/after values)
  - timestamp: number
```

> **Implementation note:** For v1, log only: stage changes, status changes, document status changes (upload/verify/reject), and commission edits. Keep it append-only. No UI needed for v1 — just write the data. Admin can query it later.

---

## 5. Core Modules

### 5.1 Project Management — Kanban Board

#### 5.1.1 Kanban View (Primary View)

The main projects view is a **drag-and-drop Kanban board** with 7 columns:

| Column | Stage Value | Description |
|--------|------------|-------------|
| New | `new` | Initial lead stage (formerly "Lead") |
| WIP | `wip` | Work in progress — docs collection started (formerly "Docs Collection") |
| Docs Completed | `docs_completed` | All required documents collected and verified |
| Submitted | `submitted` | Submitted to bank for processing (formerly "Submitted to Bank") |
| FOL | `fol` | Facility Offer Letter issued by bank (formerly "Decision") |
| Disbursed | `disbursed` | Loan amount disbursed to borrower (formerly "Disbursement") |
| Closed | `closed` | Project completed/closed |

**Card Display:** Each card shows:
- Project code + Client name
- Borrower type badge (Salaried / Self-Employed)
- Bank name
- Loan amount (formatted in millions: "AED 2.5M")
- Assigned agent
- Status indicator (color: green=open/active, amber=on-hold, blue=disbursed, gray=closed)
- Document completion percentage (small progress bar)
- Days in current stage

**Drag Rules:**
- Drag is allowed **only when status is "open" OR "active"**.
- Projects with status "on_hold" **cannot be dragged** until status is changed back to "active".
- Projects with status "disbursed" **can only move to "Closed"** stage (Disbursed → Closed transition allowed).
- Stages must move **forward only** (no backward dragging). Exception: Disbursed → Closed is allowed even though it's the final transition. If other backdating is needed, Admin uses the edit modal.
- Moving to "FOL" column prompts for **FOL Notes** modal (bank conditions/requirements before disbursement).
- Moving to "Closed" column prompts for an **outcome** selection modal (Approved / Rejected / Cancelled / Disbursed).
- When a card moves to a new stage, the corresponding milestone timestamp is auto-set to `Date.now()`.
- When a card is moved to "Disbursed" stage, status is automatically set to "disbursed".
- All prompts use **ShadCN-style modal dialogs** (not browser-native prompts) for consistent UX.

**Filters (top bar):**
- By status (Open / On-Hold / Closed / All)
- By assigned agent
- By bank
- By borrower type
- Search by client name or project code

#### 5.1.1b Projects List View (Secondary)

A **table-based list view** as an alternative to the Kanban board. Accessible via a "List view" toggle link.

**Table columns:** Client Name, Stage, Agent, Loan Amount, Updated Date, Status, Action (View link)

**Features:**
- Same filter controls as Kanban (stage, agent, status, search)
- Paginated (default 5 per page) with Prev/Next navigation
- Pipeline snapshot card showing total open pipeline value and average ticket size
- "New Project" button (hidden for Viewer)
- Toggle link to switch to Kanban board view

#### 5.1.2 Project Creation

Trigger: "New Project" button.

**Step 1 — Meta Information (Modal or Page):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Client Name | Text | Yes | |
| Client Email | Email | No | |
| Client Phone | Phone | No | |
| Borrower Type | Dropdown | Yes | "Salaried" / "Self-Employed" |
| Business Type | Dropdown | Yes | "Buyout" / "Equity Release" |
| Bank | Dropdown | Yes | From `banks` master table |
| Referral Company | Dropdown | No | From `referralCompanies` master table |
| Assigned Agent | Dropdown | Yes | From users with Agent role |
| Loan Amount | Number | Yes | Currency input (AED) |
| Property | Text | No | Property name or address |
| Property Profile | Dropdown | Yes | "Land" / "Building" |
| Notes | Textarea | No | |

On save:
- Auto-generate `projectCode` (sequential: MM-0001, MM-0002, etc.)
- Auto-generate `projectName`: `"{projectCode} - {clientName} - {businessType}"`
- Set `stage = "new"`, `status = "open"`
- Redirect to the **Document Gathering** view for this project.

#### 5.1.3 Project Detail View

Accessible by clicking a Kanban card. A detail page/panel with tabs or sections:

1. **Overview** — Meta info grid (borrower type, business type, bank, referral), document progress card, loan overview (amount, property value, LTV, rate, term), client & agent info, recent activity log, status controls
2. **Documents** — Document checklist/upload interface (Section 5.2)
3. **Commission** — Financial fields (Section 5.3) — **tab hidden before Disbursement stage, hidden for Viewer**
4. **Timeline** — Horizontal T1–T4 milestone bar with duration display (Section 5.4)

**Status Controls (on Overview):**
- "Put On Hold" button → prompts for reason, changes status to `on_hold`
- "Activate" button (when on-hold) → changes status back to `active`
- "Close Project" button → prompts for outcome, sets stage to `closed`

**Status Transition Rules:**
- **New stage:** Status must be "open"
- **WIP through FOL stages:** Status defaults to "active" but can be manually set to "on_hold"
- **Disbursed stage:** Status automatically becomes "disbursed" (cannot be changed)
- **On-Hold projects:** Must be changed to "active" before they can be moved to another stage

---

### 5.2 Document Management

This is the **core module**. Reference document: "Max Mortgage Applicable Documents" (takes precedence over all other specs).

#### 5.2.1 Document Requirements Engine

The system has **29 fixed document slots** organized in 5 sections, plus an **Others** section for ad-hoc uploads.

**Conditional logic:** When `borrowerType = "salaried"`, **Section B (Company Documents)** and **D2 (AECB Form Company)** are **hidden entirely** — not shown, not required.

This means:
- **Salaried borrowers:** 24 required document slots
- **Self-employed borrowers:** 29 required document slots

#### 5.2.2 Document Sections & Slots

Store the following as a **constant/config** (not in DB) so it's easy to extend later:

```typescript
// documentConfig.ts — Single source of truth for document requirements

type DocSlot = {
  code: string;
  label: string;
  section: "borrower" | "company" | "asset" | "bank" | "lease";
  multiFile: boolean;
  allowedTypes: string[];       // MIME types
  selfEmployedOnly: boolean;    // true = hidden for salaried
  required: boolean;            // false = "If Applicable"
};
```

**Section A — Borrower Documents**

| Code | Label | Multi-file | Required | Self-Employed Only |
|------|-------|-----------|----------|-------------------|
| A1 | Valid UAE ID | Yes | Yes | No |
| A2 | Valid Passport | Yes | Yes | No |
| A3 | Visa | Yes | Yes | No |
| A4 | DEWA Bill of current residence | No | Yes | No |
| A5 | Bank Account details | No | Yes | No |
| A6 | Existing Bank Account Statement for 12 months | No | Yes | No |
| A7 | Salary Certificate | No | No (if applicable) | No |

**Section B — Company Documents (Self-Employed Only)**

| Code | Label | Multi-file | Required | Self-Employed Only |
|------|-------|-----------|----------|-------------------|
| B1 | Trade License, MOA & AOA | Yes | Yes | **Yes** |
| B2 | Company Information / Activity | No | Yes | **Yes** |
| B3 | Bank Account Statement for 6 months | No | Yes | **Yes** |
| B4 | Company Profile / Website | No | Yes | **Yes** |

**Section C — Asset Documents**

| Code | Label | Multi-file | Required | Self-Employed Only |
|------|-------|-----------|----------|-------------------|
| C1 | Title Deed | Yes | Yes | No |
| C2 | Affection / Site plan of plot/land | Yes | No (if applicable) | No |
| C3 | Floor Plan or Approved Drawings | Yes | No | No |
| C4 | Certificate of Completion / Completion Notice | Yes | No | No |
| C5 | MOU or SPA or Initial Contract of Sale | Yes | No | No |
| C6 | Form F | No (PDF only) | No (if applicable) | No |
| C7 | Developer Statement of Accounts | — | No (if applicable) | No |
| C8 | Valuation Slip (to be PAID) | — | Yes | No |
| C9 | Project Profile | — | No (if applicable) | No |

**Section D — Banking Documents**

| Code | Label | Multi-file | Required | Self-Employed Only |
|------|-------|-----------|----------|-------------------|
| D1 | AECB Form for Individual (to be filled & signed) | No (PDF only) | Yes | No |
| D2 | AECB Form Company (to be filled & signed) | No (PDF only) | Yes | **Yes** |
| D3 | Bank Application Form (to be filled & signed) | No (PDF only) | Yes | No |
| D4 | PNWS Form (to be filled & signed) | No (PDF only) | Yes | No |
| D5 | Existing Asset Title Information | Yes | Yes | No |
| D6 | Key Fact Statement — FAB Bundle T&C (to be signed) | No (PDF only) | No (if applicable) | No |

**Section E — Lease of Target Asset**

| Code | Label | Multi-file | Required | Self-Employed Only |
|------|-------|-----------|----------|-------------------|
| E1 | Trade License of Company or UAE ID of individual tenancy | Yes | Yes | No |
| E2 | Tenancy or Ijary agreement (min AED 0.525m) | Yes | Yes | No |
| E3 | Tenancy 4 Cheques | Yes | Yes | No |

**Section F — Others (Ad-hoc)**

Not predefined. Users can add multiple entries, each with:
- `label`: Text input (user-provided name)
- `files`: Multi-file upload
- Allowed types: PDF, JPG/JPEG, PNG, XLS, DOC, DOCX, PPT, PPTX

#### 5.2.3 Allowed File Types

| Context | Allowed MIME types |
|---------|-------------------|
| Multi-file upload slots | PDF, JPG/JPEG, PNG, XLS, DOC, DOCX, PPT, PPTX |
| Single-file PDF-only slots | PDF only |
| Single-file general slots | PDF, JPG/JPEG, PNG, XLS, DOC, DOCX, PPT, PPTX |

Use Convex file storage (`storage.store()`) for all uploads. Store the `Id<"_storage">` reference in the `documents` table.

#### 5.2.4 Document UI — Grouped Checklist

After project creation, show the document interface as a **single scrollable page** with collapsible sections (A through F). This is simpler than a multi-step wizard and equally functional.

Each document slot shows:
- Document code + label
- Status badge: `Missing` (red) / `Uploaded` (blue) / `Verified` (green) / `Rejected` (orange)
- Upload button (drag-and-drop zone or file picker)
- For uploaded files: filename, download link, delete button
- For multi-file slots: list of uploaded files with individual actions
- Verify / Reject buttons (Admin and Viewer only)
- If rejected: show rejection reason

**Progress indicator** at the top of the page:
- `"X of Y documents uploaded"` with a progress bar
- Y = total required slots for this borrower type (24 or 29)
- X = slots with status `uploaded` or `verified`
- When X === Y → mark milestone `docsCompletedAt = Date.now()` (auto, if not already set)

#### 5.2.5 Document Lifecycle

```
Missing → Uploaded (by Admin or Agent)
Uploaded → Verified (by Admin or Viewer)
Uploaded → Rejected (by Admin or Viewer — requires reason)
Rejected → Uploaded (re-upload by Admin or Agent)
```

---

### 5.3 Commission & Financials

Located within the **project detail view**, under a "Commission" tab/section. Only visible when stage is at or past `disbursement`.

#### 5.3.1 Fields

| Field | Who can edit | Logic |
|-------|-------------|-------|
| Loan Amount | Admin, Agent (from project meta) | Set at project creation |
| Bank Commission Rate | Admin | Pulled from bank master table, overridable per project |
| Expected Total Commission | Auto-calculated | `loanAmount * bankCommissionRate / 100`. Admin can override manually. |
| Agent Commission Rate | Admin | Pulled from agent profile, overridable per project |
| Agent Share (Projected) | Auto-calculated | `expectedCommission * agentRate / 100` |
| Referral Commission Rate | Admin | Pulled from referral company, overridable. 0 if no referral. |
| Referral Share (Projected) | Auto-calculated | `expectedCommission * referralRate / 100` |
| Final Commission (Actual) | Admin only | Entered manually after actual disbursement payment is received |
| Agent Payout (Final) | Auto-calculated | `finalCommission * agentRate / 100` |
| Referral Payout (Final) | Auto-calculated | `finalCommission * referralRate / 100` |

#### 5.3.2 Agent Visibility

Agents can see **only**:
- Loan Amount
- Final Commission (read-only)
- Their own Agent Payout (Final)

They cannot see rates, projected splits, or referral details.

---

### 5.4 Analytics & Milestones

#### 5.4.1 Automated Milestones (T1–T4)

These are **calculated durations** between milestone timestamps:

| Milestone | From | To | Label |
|-----------|------|----|-------|
| T1 — Speed to Start | `_creationTime` | `wipStartedAt` | Time to start working on project |
| T2 — Doc Collection | `wipStartedAt` | `docsCompletedAt` | Time to collect all required docs |
| T3 — Prep & Submit | `docsCompletedAt` | `submittedAt` | Time to prepare & submit to bank |
| T4 — Bank Processing | `submittedAt` | `folAt` | Bank processing time to FOL |
| T5 — FOL to Disbursement | `folAt` | `disbursedAt` | Time from FOL to disbursement |

**Display:** Show as a horizontal timeline on the project detail page (Overview tab). Each segment shows the duration in days. If a milestone hasn't been reached yet, show "Pending".

**On-Hold pausing:** When a project is put on hold, track `onHoldAt` timestamp and `onHoldReason`. When reactivated, calculate the paused duration and subtract it from the relevant T-metric. For v1, a simple approach: store total `pausedDays` on the project and subtract from duration calculations.

#### 5.4.2 Dashboard Analytics (All Roles)

**Access Control:**
- **Admin**: Sees full dashboard with all project data (unfiltered)
- **Viewer**: Sees full dashboard with all project data (unfiltered, read-only)
- **Agent**: Sees full dashboard with data filtered to projects they created or are assigned to

The dashboard is organized in three rows of widgets:

**Row 1 — Top KPI Cards (4 widgets):**
- **Dashboard Greeting**: Personalized greeting with user name, date, and "View Pipeline" button
- **YTD Widget**: Year-to-date case count and total disbursed amount (projects with disbursedAt in current year)
- **Active Widget**: Count and total value of active projects (status = open or active)
- **Active Profile Widget**: Portfolio breakdown by property type (Land vs Building) showing percentage split, case counts, and values for all pipeline projects (stage ≠ closed)

**Row 2 — Pipeline Overview (3 widgets):**
- **Active Projects Table**: Shows 5 most recently updated active projects with columns: Project (name + code), Value, Stage badge, Docs (verified/total count), Last Updated. "View All" link to Projects List.
- **Stage Breakdown**: Vertical list showing Total project count + count for each stage (New, WIP, Docs Completed, Submitted, FOL, Disbursed, Closed) with color-coded badges
- **Avg. Milestone Durations**: Overall average across all milestones + individual T1–T5 averages for closed projects. Displays in days format (e.g., "19d")

**Row 3 — Performance & Activity (3 widgets):**
- **Agent Performance**: Top 3 agents by active pipeline value. Each entry shows agent avatar, name, active/disbursed counts, and two stacked amounts (Active value on top, Disbursed value below)
- **Referral Agencies**: All active referral agencies showing name, active/disbursed counts, and two stacked amounts (Active value on top, Disbursed value below)
- **Recent Activity**: 5 most recent audit log entries with actor name, action, project code, and relative timestamp

**Design Guidelines:**
- All monetary amounts displayed in millions format (AED 2.5M)
- Clean, minimal design with subtle color accents (blue for active, emerald for disbursed, color-coded stage badges)
- Icons used sparingly in card headers (users, briefcase, activity icons)
- Grid layout: Row 1 uses `xl:grid-cols-4`, Row 2 uses `lg:grid-cols-[2.5fr_1fr_1fr]`, Row 3 uses `lg:grid-cols-3`

> **v1 scope:** Keep this lightweight. Reference the `/html/dashboard.html` mockup for exact layout and styling. No complex drill-down or filtering on dashboard — use dedicated pages for that.

#### 5.4.3 Data Integrity Rules

- **Chronological enforcement:** `wipStartedAt <= docsCompletedAt <= submittedAt <= folAt <= disbursedAt <= closedAt`. The system must validate this on every stage transition.
- **Backdating:** Only Admins can manually edit milestone dates (via project edit modal). The system still enforces chronological order on manual edits.

---

## 6. Page Structure & Navigation

### 6.1 Layout

Standard admin panel layout:
- **Left sidebar:** Navigation links + user info + role badge
- **Top bar:** Page title + global search + "New Project" button
- **Main area:** Content

Reference the `/html` directory for exact layout proportions and styling.

### 6.2 Pages

| Page | Route | Access | Mockup File |
|------|-------|--------|-------------|
| Login | `/login` | Public | `index.html` |
| Dashboard | `/` | All roles (Viewer sees all data, Agent sees filtered data) | `dashboard.html` |
| Kanban Board | `/projects` | All roles | `projects-kanban.html` |
| Projects List | `/projects/list` | All roles | `projects-list.html` |
| Project Detail | `/projects/:id` | All roles (write permissions vary) | `project-detail.html` |
| Agents | `/agents` | All roles (Agents see only themselves) | `agents.html` |
| Settings | `/settings` | All roles (restricted tabs by role) | `settings.html` |
| Settings — Banks | `/settings/banks` | Admin only | (tab within Settings) |
| Settings — Referral Companies | `/settings/referrals` | Admin only | (tab within Settings) |
| Settings — Users | `/settings/users` | Admin only | (tab within Settings) |

### 6.3 Agents Page

A directory of all agents showing performance metrics. All roles can view (Agents see only themselves).

**Agent Card:** Each agent displays:
- Name, role, region
- Active project count
- Closed project count
- Pipeline total (sum of loan amounts for open projects)
- Contact info (email, phone)

**Features:**
- Region filter dropdown
- Search by name or email
- Grid view (cards) and table view (workload summary)

### 6.4 Master Table CRUD (Admin Only)

Settings is a single page with a left sidebar tab navigation. Tabs are role-gated:

**Admin sees:** Profile, Banks, Referral Companies, Users, Notifications, Privacy & Security
**Agent/Viewer sees:** Profile, Notifications, Privacy & Security

#### 6.4.1 Table UI Pattern

Each master table includes:
- **Header row:** Table title + "Add [Entity]" button (primary button, top-right)
- **Table columns:** Entity-specific fields + Status badge + Actions column
- **Actions column:** Vertical 3-dot menu (⋮) that opens a dropdown with:
  - **Edit** (pencil icon) - Opens edit modal
  - **Activate/Deactivate** (check/x-circle icon) - Toggles status with confirmation
  - **Divider**
  - **Delete** (trash-2 icon, red text) - Deletes record with confirmation

**Dropdown Menu Behavior:**
- Opens on click, positioned right-aligned below trigger
- Closes on outside click or action selection
- Smooth slide-down animation
- Destructive actions (Delete) styled in red

**Confirmation Modals:**
All destructive actions require confirmation before execution:
- **Deactivate/Activate:** Modal with title "Deactivate [Entity Name]?", message explaining impact, Cancel/Confirm buttons
- **Delete:** Modal with title "Delete [Entity Name]?", warning "This action cannot be undone", Cancel/Delete buttons (Delete button in red)

#### 6.4.2 Master Tables

**Banks:**
- Fields: name, commission rate (%), active status
- Add/Edit modal: name (required), commissionRate (required, 0-100%), isActive (checkbox)
- Delete validation: Check for usage in projects, prevent deletion if in use

**Referral Companies:**
- Fields: name, contact person, email, phone, commission rate (%), active status
- Add/Edit modal: name (required), contactPerson, email, phone, commissionRate (required, 0-100%), isActive
- Delete validation: Check for usage in projects

**Users:**
- Fields: name, email, role badge, commission rate (agents only), active status
- Add/Edit modal: name (required), email (required, unique), role (Admin/Agent/Viewer), commissionRate (agents only), isActive
- Delete validation: Cannot delete own account, at least one Admin must remain active
- Deactivate instead of delete for data integrity

#### 6.4.3 Notifications Tab

Settings → Notifications includes toggleable preferences:
- Email notifications (checkbox)
- Push notifications (checkbox)
- SMS alerts (checkbox)

**Feedback:** Toggling any option shows toast notification with status: "[Setting] enabled" or "[Setting] disabled"

---

## 7. UI/UX Guidelines

### 7.1 Design System & Components

- **Design system:** ShadCN components + Tailwind CSS. Follow the `/html` mockup for layout, colors, and spacing.
- **Kanban:** Use `@dnd-kit/core` or a similar lightweight React DnD library compatible with ShadCN. Keep cards compact.
- **Forms:** Use ShadCN `Form` components with `react-hook-form` + `zod` validation.
- **File uploads:** Use Convex's `storage` API. Show upload progress. Validate file types client-side before upload.
- **Responsive:** Must work on tablet and desktop. Mobile is nice-to-have but not required for v1.
- **Loading states:** Use ShadCN `Skeleton` components for async data.

### 7.2 Modal & Dialog Patterns

**Confirmation Dialogs (AlertDialog):**
- Use ShadCN `AlertDialog` for all destructive actions
- Structure: Title → Description → Cancel + Confirm buttons
- Destructive confirms use red button styling
- Close on backdrop click or ESC key
- Examples: Delete entity, Deactivate account, Close project

**Input Modals (Dialog):**
- Use ShadCN `Dialog` for data entry (Add/Edit forms)
- Structure: Header (title + close) → Form content → Footer (Cancel + Submit)
- Validate before submission
- Show loading state on submit button
- Examples: Add Bank, Edit Referral Company, FOL Notes, Close Project Outcome

**Dropdown Menus (DropdownMenu):**
- Use ShadCN `DropdownMenu` for action menus (3-dot menus in tables)
- Structure: Trigger (MoreVertical icon) → Menu (items + separators)
- Destructive items in red with trash icon
- Auto-close on selection
- Examples: CRUD actions in Settings tables

### 7.3 Notification & Feedback

**Toast Notifications (Sonner):**
- Use ShadCN `Sonner` for success/error/info messages
- Position: Top-right
- Duration: 2-4 seconds (auto-dismiss)
- Types:
  - **Success:** Green, check icon - "Bank added successfully"
  - **Error:** Red, x icon - "Failed to delete: Bank is in use"
  - **Info:** Blue, info icon - "Email notifications enabled"
- Show immediately after action completion

**Loading States:**
- Button loading: Disable + spinner icon
- Page loading: Skeleton components
- Async actions: Optimistic updates where possible

---

## 8. Implementation Notes for Claude Code

### 8.1 Project Setup

1. Start from the [Convex + React + Vite + ConvexAuth + ShadCN template](https://github.com/get-convex/templates/tree/main/template-react-vite-convexauth-shadcn).
2. Add RBAC following [convex-auth-with-role-based-permissions](https://github.com/get-convex/convex-auth-with-role-based-permissions).
3. Reference `/html` for **exact layout, design, and interaction patterns**. The mockup is the single source of truth for UI decisions — every page, tab, modal, and interaction has been prototyped. See Section 11 for the complete file mapping.

### 8.2 Build Order (Recommended)

Build in this order to ensure each layer works before the next:

1. **Auth & RBAC** — Login, user roles, route guards
2. **Master tables** — Banks, Referral Companies, User management (CRUD)
3. **Project CRUD** — Create project form, data model, basic list view
4. **Kanban Board** — Stage columns, drag-and-drop, filters
5. **Document Engine** — Config-driven document slots, file upload/download, status lifecycle
6. **Commission Module** — Fields, calculations, role-based visibility
7. **Milestones & Analytics** — Timeline display, duration calculations, dashboard

### 8.3 Key Architectural Decisions

- **Document config as code:** The 29 document slots should be a TypeScript constant (`DOCUMENT_CONFIG`), not stored in the database. This makes it easy to add/modify slots without migrations. The `documents` table only stores *instances* (uploaded files) referencing these slots by `documentCode`. Reference `/html/assets/js/documentConfig.js` for the mockup implementation (note: the PRD Section 5.2.2 document labels are authoritative — the mockup uses simplified labels).
- **One-bank rule:** Enforce at the UI level. There's no need for a DB constraint — just make it clear in the project creation form that one project = one bank.
- **Auto-generated project codes:** Use a Convex mutation that reads the latest project code and increments. Handle race conditions with Convex's built-in transaction guarantees. Reference `generateProjectCode()` in `/html/assets/js/utils.js`.
- **Commission calculations:** Do these client-side for display. Store only the input values (rates, loan amount, final commission) in the DB. Calculate derived values (shares, payouts) in a shared utility function used by both frontend display and any backend validations.
- **Commission rates as decimals:** Store all rates as decimal fractions (0.015 = 1.5%, 0.7 = 70%). This matches the mockup's data model. Display as percentages in the UI by multiplying by 100.
- **Per-project rate overrides:** Each project stores its own `bankCommissionRate`, `agentCommissionRate`, and `referralCommissionRate` — defaulted from master tables at creation time but overridable by Admin. This allows commission adjustments without affecting master data.

### 8.4 Convex-Specific Patterns

- Use `query` for all read operations, `mutation` for writes.
- Use Convex's `ctx.storage.store()` for file uploads and `ctx.storage.getUrl()` for download URLs.
- Use Convex's real-time subscriptions — the Kanban board should update live when another user moves a card.
- Use `v.union()` for enum fields like `stage`, `status`, `borrowerType`, etc.
- Add `_creationTime` is automatic in Convex. Use it for T1 start time.

---

## 9. Out of Scope (v2+)

- Email notifications (Resend integration wired but no templates)
- In-app notifications
- Full audit log UI (data is being captured, but no viewer)
- Kanban backward drag (manual stage regression)
- Native mobile app
- Multi-currency support
- Bulk operations (bulk document upload, bulk status change)
- Advanced reporting / export to Excel
- Document templates / auto-fill
- Client portal / external access

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| Project | A single mortgage application submission to one bank for one client |
| Stage | Where a project is in the pipeline (New → WIP → Docs Completed → Submitted → FOL → Disbursed → Closed). Displayed as Kanban columns. |
| Status | The work state of a project (Open / Active / On-Hold / Disbursed) |
| Open | Initial status for projects in "New" stage |
| Active | Default status for projects in WIP through FOL stages (actively being worked on) |
| On-Hold | Manually set status when work is paused (requires reason, blocks stage transitions) |
| Disbursed | Auto-set status when project reaches "Disbursed" stage |
| FOL | Facility Offer Letter — bank's conditional approval with requirements before disbursement |
| Outcome | The result when a project is closed (Approved / Rejected / Cancelled / Disbursed) |
| Milestone | An auto-recorded timestamp when a project reaches a specific stage |
| T1–T5 | Calculated durations between milestones, used for performance analytics |
| Master Table | Admin-managed reference data (Banks, Referral Companies) |
| Document Slot | A predefined document requirement (e.g., "A1 — Valid UAE ID") |
| Borrower Type | Salaried or Self-Employed — determines which document slots are visible |
| Business Type | Buyout or Equity Release — the type of mortgage product |

---

## 11. HTML Mockup Reference (Production Migration Guide)

The `/html` directory contains the **complete, production-ready UI mockup**. Every page, role, interaction, and data flow is prototyped. Use this as the single source of truth for layout, component design, and interaction patterns when building the React + Convex production app.

### 11.1 File Map

| Mockup File | Purpose | Production Equivalent |
|-------------|---------|----------------------|
| `html/index.html` | Login page | `/login` route — replace with Convex Auth login flow |
| `html/dashboard.html` | Admin dashboard | `/` route — React page component |
| `html/projects-kanban.html` | Kanban board | `/projects` route — React page + @dnd-kit |
| `html/projects-list.html` | Projects table view | `/projects/list` route — React page + ShadCN Table |
| `html/project-detail.html` | Project detail (tabs) | `/projects/:id` route — React page with tab router |
| `html/agents.html` | Agents directory | `/agents` route — React page |
| `html/settings.html` | Settings (tabbed) | `/settings` route — React page with nested tabs |

| JS Module | Purpose | Production Equivalent |
|-----------|---------|----------------------|
| `assets/js/main.js` | All page renderers + interactivity (~933 lines) | Split into React page components + hooks |
| `assets/js/data.js` | Mock data (projects, agents, banks, referrals, logs) | Convex schema + seed data |
| `assets/js/loader.js` | Layout shell, sidebar, header, role toggle | React layout component + auth context |
| `assets/js/utils.js` | `formatCurrency`, `formatDate`, `calculateDuration`, `generateProjectCode` | Shared utility module (reuse as-is) |
| `assets/js/documentConfig.js` | 29 document slot definitions, section config | TypeScript constant `DOCUMENT_CONFIG` (update labels to match PRD Section 5.2.2) |
| `assets/css/custom.css` | Brand tokens, modal, progress bar, collapsible styles | Tailwind config + ShadCN component overrides |

### 11.2 Mockup → React Component Mapping

```
main.js function              →  React Component / Hook
────────────────────────────────────────────────────────
renderLogin()                 →  <LoginPage />
renderDashboard()             →  <DashboardPage />
renderProjectsKanban()        →  <KanbanPage />
initProjectsKanban()          →  useKanbanDragDrop() hook
renderProjectsList()          →  <ProjectsListPage />
initProjectsList()            →  useProjectFilters() hook
renderProjectDetail()         →  <ProjectDetailPage />
initProjectDetail()           →  useProjectDetail() hook
renderAgents()                →  <AgentsPage />
initAgents()                  →  useAgentFilters() hook
renderSettings()              →  <SettingsPage />
buildSettingsContentMap()     →  <BanksTab />, <ReferralsTab />, <UsersTab />, etc.
renderNewProjectModalHTML()   →  <NewProjectDialog /> (ShadCN Dialog)
initNewProjectModal()         →  useCreateProject() mutation hook
showToast()                   →  Sonner toast (ShadCN)
getDocProgress()              →  useDocumentProgress() hook
```

### 11.3 UI Patterns Demonstrated in Mockup

The mockup fully implements these production-ready UI patterns:

**Modal & Dialog Patterns:**
- ✅ **Confirmation modals** for destructive actions (Delete, Deactivate)
  - Title + warning message + Cancel/Confirm buttons
  - Backdrop click to dismiss
  - Red confirm button for destructive actions
- ✅ **Input modals** for data entry (rejection reason, FOL notes)
- ✅ **Dropdown menus** for CRUD actions (3-dot menu pattern)
  - MoreVertical icon trigger
  - Contextual actions (Edit, Toggle, Delete)
  - Destructive items in red
  - Divider separating dangerous operations

**Feedback & Notifications:**
- ✅ **Toast notifications** (success/error states)
  - Auto-dismiss after 2.4 seconds
  - Positioned top-right
  - Slide-in animation
- ✅ **Immediate feedback** for user actions
  - Notification toggle feedback ("Email notifications enabled")
  - Status change confirmation ("Bank deactivated")
  - CRUD operation results

**Document Management:**
- ✅ **Rejection reason display** - Shows orange alert below rejected documents
- ✅ **Auto-complete detection** - Automatically sets `docsCompletedAt` when all required docs uploaded/verified
- ✅ **Multi-file slot configuration** - documentConfig marks multi-file slots (production must implement UI)
- ✅ **Document action buttons** - Upload, Verify, Reject, Download (explicit, not click-to-cycle)

**Settings & CRUD:**
- ✅ **3-dot dropdown menus** for table row actions
- ✅ **Add buttons** in table headers (primary button, top-right)
- ✅ **Status badges** with color coding (Active: green, Inactive: gray)
- ✅ **Event listener management** - No duplicate actions/toasts

**Permission Model:**
- ✅ **Agent: "created or assigned only"** - Agents see projects they created OR are assigned to
- ✅ **Viewer commission visibility** - Viewers can see read-only commission data
- ✅ **Role-based feature gating** - Settings tabs, commission tab, document actions

### 11.4 Mock Behavior → Production Replacements

| Mockup Pattern | What It Does | Production Replacement |
|----------------|-------------|----------------------|
| `localStorage('mm-role')` | Stores active role for demo toggle | Convex Auth — role from user record, no toggle in production |
| `projects.push(newProject)` | In-memory data mutation | Convex `mutation` — `ctx.db.insert("projects", ...)` |
| `logs.unshift(...)` | In-memory audit logging | Convex `mutation` — `ctx.db.insert("auditLog", ...)` |
| `showConfirmModal()` | Custom confirmation modal | ShadCN `AlertDialog` component |
| `createDropdownMenu()` | Custom dropdown menu | ShadCN `DropdownMenu` component |
| `showToast()` | Custom toast notification | ShadCN `Sonner` toast |
| `bank.isActive = !bank.isActive` | In-memory toggle | Convex `mutation` — `ctx.db.patch(bankId, { isActive })` |
| `details.documents[code] = {...}` | In-memory doc status change | Convex `mutation` — update document record |
| `window.location.href = '...'` | Full-page navigation | React Router `navigate()` |
| `window.location.reload()` | Page reload on role change | N/A — no role toggle in production |
| `data-page` attribute on `#app` | SPA page routing | React Router `<Routes>` |
| Native HTML5 drag & drop | Kanban card dragging | `@dnd-kit/core` + `@dnd-kit/sortable` |
| `renderIcons()` (Lucide CDN) | Icon rendering | `lucide-react` package imports |

### 11.4 Data Model Migration

The mockup's `data.js` provides the exact shape of all data objects. Map these to the Convex schema:

```
data.js export        →  Convex table         Notes
─────────────────────────────────────────────────────
admins                →  users (role=admin)    Merge into single users table with role field
agents                →  users (role=agent)    + agentProfiles for commissionRate
viewers               →  users (role=viewer)   Merge into users table
banks                 →  banks                 Direct mapping
referralCompanies     →  referralCompanies     Direct mapping
projects              →  projects              Direct mapping (see Section 4.2)
logs                  →  auditLog              Map actorId → performedBy (user ref)
projectDetails        →  (split across tables) summary → project fields, documents → documents table, timeline → calculated from milestones
```

**Key transformations:**
- `projectDetails.summary` fields (ltv, rate, termYears, etc.) → project record fields
- `projectDetails.documents` → individual rows in `documents` table
- `projectDetails.timeline` → **calculated at query time** from project milestone timestamps, not stored
- `projectDetails.otherDocs` → rows in `documents` table with `section: "other"`

### 11.5 Design Tokens (from custom.css)

Carry these into the Tailwind config and ShadCN theme:

```
--surface:       #ffffff
--surface-muted: #f9fbff
--accent:        #05f240  (brand green)
--primary:       #002060  (brand navy)

Border color:    #e6eaf2
Card shadow:     0 18px 40px -32px rgba(15, 23, 42, 0.2)
Border radius:   rounded-3xl (cards), rounded-2xl (buttons/inputs), rounded-xl (icons)
Font:            Inter (400, 500, 600, 700) via Google Fonts
```

### 11.6 Interaction Patterns Demonstrated in Mockup

All of the following are fully prototyped and working in the mockup — replicate in production:

**Kanban & Projects:**
1. **Forward-only Kanban drag** — visual ring flash (amber) on backward attempts, Disbursed → Closed allowed
2. **Locked card states** — On-Hold cards: opacity-60, cursor-not-allowed, not draggable. Disbursed cards: draggable with blue ring indicator, restricted to Closed stage only
3. **Outcome prompt on Closed** — when dropping to Closed column, modal appears with outcome selection before accepting
4. **Milestone auto-set** — dropping a card to a new stage auto-stamps the relevant milestone timestamp
5. **Agent permission filtering** — Agents see only projects they created OR are assigned to

**Documents:**
6. **Collapsible document sections** — chevron rotation, smooth expand/collapse animation
7. **Document action buttons** — explicit Upload/Verify/Reject/Download buttons (not click-to-cycle)
8. **Rejection reason display** — Orange alert box below rejected documents showing reason
9. **Auto-complete detection** — `docsCompletedAt` milestone auto-set when all required docs uploaded/verified
10. **Document progress indicator** — Shows "X of Y documents uploaded" with progress bar

**Settings & CRUD:**
11. **3-dot dropdown menus** — MoreVertical icon opens contextual action menu (Edit, Toggle, Delete)
12. **Confirmation modals** — All destructive actions (Delete, Deactivate) require user confirmation
13. **Notification toggle feedback** — Toast notification when toggling Email/Push/SMS preferences
14. **Status badges** — Color-coded Active/Inactive badges in tables

**General UI:**
15. **Toast notifications** — success/error toasts with slide-in animation (auto-dismiss 2.4s)
16. **In-place re-render** — after doc action or status toggle, re-renders the detail page preserving tab state
17. **Modal dialogs** — all prompts (FOL notes, Close outcome, On-Hold reason, Document reject, Confirmations) use branded modal components
18. **Kanban filter bar** — 4 dropdowns + search, applied client-side with card count updates
19. **Pagination** — projects list with prev/next and numbered page buttons
20. **Settings tab memory** — active tab state preserved on re-render
21. **New Project modal** — overlay with form validation, auto-code generation, redirect on submit
22. **Close Project button** — admin-only, prompts for outcome, sets status + stage to Closed
23. **Status toggle** — Open ↔ On-Hold toggle button with label swap

### 11.7 Additional Documentation

Refer to these files in the repository for detailed implementation guidance:

- **`PRODUCTION-NOTES.md`** — Comprehensive guide for Settings CRUD, multi-file upload, file deletion patterns
- **`SETTINGS-IMPROVEMENTS.md`** — Detailed documentation of UI improvements: 3-dot menus, confirmation modals, notification feedback
- **`TESTING-GUIDE.md`** — Test scenarios and validation checklist for mockup features

### 11.8 Document Configuration

✅ **The mockup's `documentConfig.js` has been updated to match PRD Section 5.2.2**

- **29 document slots** with exact PRD labels
- Section A: 7 slots | Section B: 4 slots | Section C: 9 slots | Section D: 6 slots | Section E: 3 slots
- Correct `multiFile`, `required`, and `selfEmployedOnly` flags
- Production can use this config structure directly

### 11.9 What the Mockup Does NOT Cover

These items are specified in the PRD but best implemented in production:

- ❌ Real authentication flow (Convex Auth) — mockup uses mock login
- ❌ File upload with progress and Convex storage — mockup simulates with status changes
- ❌ Multi-file upload UI per document slot — mockup demonstrates config, UI detailed in PRODUCTION-NOTES.md
- ❌ File deletion from uploaded documents — UI pattern detailed in PRODUCTION-NOTES.md
- ❌ On-Hold pausing with `pausedDays` subtraction from T-metrics — not tracked in mockup
- ❌ Backdating milestone dates (Admin) — not in mockup
- ❌ Real-time subscriptions (Convex live queries) — mockup is single-user static
- ❌ Keyboard accessibility — mockup uses click/drag only
- ❌ Loading skeleton states — mockup renders synchronously

**Note:** Items marked ❌ should be implemented in the React + Convex production app using ShadCN components and Convex real-time features.
- On-Hold pausing with `pausedDays` subtraction from T-metrics — not tracked in mockup
- Auto-set `docsCompletedAt` when all docs are uploaded — mockup only sets on stage transition
- Backdating milestone dates (Admin) — not in mockup
- Real-time subscriptions (Convex live queries) — mockup is single-user static
- Keyboard accessibility — mockup uses click/drag only
- Loading skeleton states — mockup renders synchronously
