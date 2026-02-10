# Production Implementation — Detailed Task Descriptions

**Companion to:** `task-list-production-master.md`
**Each task includes:** scope, steps, acceptance criteria, mockup references

---

## Task #1 — Project Setup - Initialize Convex + React + ShadCN

**Phase:** 1 (Foundation)
**Blocked by:** Nothing
**Blocks:** #2, #4, #5

### Scope
Initialize the production app at the repository root level, alongside existing `/html` and `/docs`.

### Steps
1. Clone the [Convex + React + Vite + ConvexAuth + ShadCN template](https://github.com/get-convex/templates/tree/main/template-react-vite-convexauth-shadcn) to a temp directory
2. Copy template files into repo root — **do NOT overwrite** `/html`, `/docs`, `prd.md`, `CLAUDE.md`
3. Run `npm install`
4. Install extra dependencies:
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable recharts lucide-react
   npm install -D vitest @playwright/test
   ```
5. Run `npx convex dev` → create a new Convex project when prompted
6. Configure `.env.local` with the Convex deployment URL
7. Configure Tailwind CSS with design tokens from `/html/assets/css/custom.css`:
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
8. Add Inter font import to `index.html`
9. Set up basic Vitest config (`vitest.config.ts`)
10. Verify the base template runs on `localhost`

### Acceptance Criteria
- [ ] `npm run dev` starts the app without errors
- [ ] Vite dev server accessible on localhost
- [ ] Convex dashboard shows the new project
- [ ] Tailwind design tokens applied (check font, primary color)
- [ ] All extra dependencies in `package.json`
- [ ] Existing `/html`, `/docs`, `prd.md`, `CLAUDE.md` untouched

---

## Task #2 — Auth & RBAC - Convex Auth Integration

**Phase:** 2 (Core Infrastructure)
**Blocked by:** #1
**Blocks:** #3, #6, #8, #13

### Scope
Implement email/password authentication with 3 roles (Admin, Agent, Viewer).

### Steps
1. Follow the [convex-auth-with-role-based-permissions](https://github.com/get-convex/convex-auth-with-role-based-permissions) pattern
2. Configure Convex Auth for email/password provider
3. Create user schema fields: `name`, `email`, `role` (admin|agent|viewer), `isActive`
4. Implement sign-up flow (internal — Admin creates users, no public registration)
5. Implement login page UI matching `/html/index.html`:
   - Email + password fields
   - "Sign In" button
   - Brand logo and styling
6. Implement logout (sidebar user menu)
7. Create auth helpers:
   - `useCurrentUser()` hook — returns user + role
   - `requireAuth(ctx)` — Convex middleware for mutations/queries
   - `requireRole(ctx, role)` — role-based mutation guard
8. Create a default admin user on first deployment (via seed or manual)

### Mockup Reference
- `/html/index.html` — Login page layout and design

### Acceptance Criteria
- [ ] Login page renders with correct branding
- [ ] Users can log in with email/password
- [ ] Users can log out
- [ ] `useCurrentUser()` returns correct user and role
- [ ] `requireRole()` blocks unauthorized mutations
- [ ] At least 1 admin user exists for testing
- [ ] Invalid credentials show error message

---

## Task #3 — Layout Shell & Navigation

**Phase:** 3 (App Shell)
**Blocked by:** #2
**Blocks:** #7, #9, #10, #11, #12, #17, #18

### Scope
Build the app shell with sidebar, top bar, and React Router routes.

### Steps
1. Create layout component with:
   - **Left sidebar:** Logo, nav links, user info + role badge, collapse toggle
   - **Top bar:** Page title (dynamic), search input, "New Project" button, user avatar
   - **Main content area:** `<Outlet />` for React Router
2. Set up React Router routes:
   ```
   /login           → <LoginPage />        (public)
   /                → <DashboardPage />     (all roles)
   /projects        → <KanbanPage />        (all roles)
   /projects/list   → <ProjectsListPage />  (all roles)
   /projects/:id    → <ProjectDetailPage /> (all roles, write varies)
   /agents          → <AgentsPage />        (all roles)
   /settings        → <SettingsPage />      (all roles, tabs restricted)
   ```
3. Implement route guards:
   - Redirect unauthenticated users to `/login`
   - Settings admin tabs: server-side role check + client-side hiding
4. Active nav link highlighting
5. "New Project" button hidden for Viewer role
6. Sidebar nav items:
   - Dashboard (home icon)
   - Projects (kanban icon)
   - Agents (users icon)
   - Settings (settings icon)

### Mockup Reference
- `/html/assets/js/loader.js` — Layout shell, sidebar, header rendering
- All HTML pages — for layout proportions

### Acceptance Criteria
- [ ] Sidebar renders with correct nav items
- [ ] All routes render placeholder content
- [ ] Active nav link highlighted
- [ ] Unauthenticated → redirected to /login
- [ ] "New Project" button hidden for Viewer
- [ ] Settings shows correct tabs per role
- [ ] Layout proportions match mockup
- [ ] User info + role badge in sidebar

---

## Task #4 — Shared Utilities & Document Config Constants

**Phase:** 2 (Core Infrastructure)
**Blocked by:** #1
**Blocks:** #11, #12, #13, #16, #18

### Scope
Port utilities from mockup and create TypeScript constants.

### Steps
1. Create `src/lib/utils.ts` — port from `/html/assets/js/utils.js`:
   ```typescript
   formatCurrency(amount: number): string    // → "AED 2.50M"
   formatDate(timestamp: number): string     // → "Jan 15, 2026"
   formatRelativeTime(timestamp: number): string // → "2 hours ago"
   calculateDuration(from: number, to: number): number // → days
   generateProjectCode(lastCode: string): string // → "MM-0001"
   ```
2. Create `src/lib/documentConfig.ts` — port from `/html/assets/js/documentConfig.js`:
   - 29 document slot definitions across 5 sections (A-E)
   - Type: `DocSlot = { code, label, section, multiFile, allowedTypes, selfEmployedOnly, required }`
   - Export: `DOCUMENT_SECTIONS`, `DOCUMENT_SLOTS`, `getDocSlotsForBorrowerType()`
   - **Use PRD Section 5.2.2 labels** (they're authoritative over mockup)
3. Create `src/lib/constants.ts`:
   ```typescript
   STAGES = [{ value, label, color }]  // 7 stages in order
   STATUSES = [{ value, label, color }] // 4 statuses
   STAGE_ORDER: string[]  // for forward-only validation
   BORROWER_TYPES, BUSINESS_TYPES, PROPERTY_PROFILES
   ```
4. Create `src/lib/commission.ts`:
   ```typescript
   calculateExpectedCommission(loanAmount, bankRate): number
   calculateAgentShare(commission, agentRate): number
   calculateReferralShare(commission, referralRate): number
   ```
5. Create Zod schemas in `src/lib/schemas.ts`:
   - `projectSchema`, `bankSchema`, `referralCompanySchema`, `userSchema`
6. Write Vitest unit tests for all utility functions

### Mockup Reference
- `/html/assets/js/utils.js` — Utility functions (port as-is where possible)
- `/html/assets/js/documentConfig.js` — Document slot definitions
- PRD Section 5.2.2 — Authoritative document labels

### Acceptance Criteria
- [ ] All utility functions exported and typed
- [ ] `formatCurrency(2500000)` returns `"AED 2.50M"`
- [ ] `DOCUMENT_SLOTS` has exactly 29 entries
- [ ] `getDocSlotsForBorrowerType("salaried")` returns 24 slots
- [ ] `getDocSlotsForBorrowerType("self_employed")` returns 29 slots
- [ ] Stage order constant used for forward-only validation
- [ ] Commission calculations return correct values
- [ ] Zod schemas validate sample data
- [ ] All unit tests pass

---

## Task #5 — Convex Schema & Seed Data

**Phase:** 2 (Core Infrastructure)
**Blocked by:** #1
**Blocks:** #6, #8, #13, #19

### Scope
Define the complete Convex schema and create a seed data script.

### Steps
1. Create `convex/schema.ts` with all tables from PRD Section 4:

   **users** (extends Convex Auth users):
   - name, email, role (admin|agent|viewer), isActive, commissionRate?, phone?, region?

   **banks:**
   - name, commissionRate, isActive

   **referralCompanies:**
   - name, contactPerson?, email?, phone?, commissionRate, isActive

   **projects** (all fields from PRD 4.2):
   - projectCode, projectName, clientName, clientEmail?, clientPhone?
   - borrowerType (salaried|self_employed), businessType (buyout|equity_release)
   - bankId, referralCompanyId?, assignedAgentId, loanAmount
   - property?, propertyValue?, propertyProfile (Land|Building)
   - stage (7 values), status (4 values), closedOutcome?, onHoldReason?, folNotes?
   - createdBy, notes?
   - Milestone timestamps: wipStartedAt?, docsCompletedAt?, submittedAt?, folAt?, disbursedAt?, closedAt?
   - Commission overrides: bankCommissionRate?, agentCommissionRate?, referralCommissionRate?
   - Commission fields: expectedCommission?, finalCommission?, agentPayoutAmount?, referralPayoutAmount?
   - Loan details: ltv?, interestRate?, termYears?, downPayment?, monthlyPayment?

   **documents:**
   - projectId, section, documentCode, label, fileIds (array), status, verifiedBy?, rejectionReason?, uploadedBy

   **auditLog:**
   - projectId?, action, performedBy, details, timestamp

2. Add indexes:
   - projects: by_stage, by_status, by_assignedAgent, by_createdBy, by_bank
   - documents: by_project, by_project_code
   - auditLog: by_project, by_timestamp

3. Create `convex/seed.ts` — port from `/html/assets/js/data.js`:
   - 1 Admin, 2 Agents, 1 Viewer
   - 3-4 Banks with commission rates
   - 2-3 Referral Companies
   - 8-10 Projects across all stages with realistic data
   - Sample documents for some projects
   - Sample audit log entries

### Mockup Reference
- `/html/assets/js/data.js` — All mock data shapes
- PRD Section 4 — Authoritative schema definition

### Acceptance Criteria
- [ ] `npx convex dev` deploys schema without errors
- [ ] All tables visible in Convex dashboard
- [ ] Seed script runs successfully
- [ ] Test users can be authenticated
- [ ] All field types match PRD (use `v.union()` for enums)
- [ ] Indexes created for common queries

---

## Task #6 — Master Tables Backend - Banks, Referrals, Users

**Phase:** 4 (Backend APIs)
**Blocked by:** #2, #5
**Blocks:** #7, #9

### Scope
Convex queries and mutations for all admin-managed master tables.

### Steps
1. **`convex/banks.ts`:**
   - `list(isActive?)` → query, all banks
   - `getById(id)` → query
   - `create({ name, commissionRate, isActive })` → mutation, Admin only
   - `update(id, fields)` → mutation, Admin only
   - `toggleActive(id)` → mutation, Admin only
   - `remove(id)` → mutation, Admin only
     - Validate: check if any project references this bank
     - Reject deletion if in use

2. **`convex/referralCompanies.ts`:**
   - `list(isActive?)` → query
   - `getById(id)` → query
   - `create({ name, contactPerson?, email?, phone?, commissionRate, isActive })` → mutation, Admin only
   - `update(id, fields)` → mutation, Admin only
   - `toggleActive(id)` → mutation, Admin only
   - `remove(id)` → mutation, Admin only, validate not in use

3. **`convex/userManagement.ts`** (separate from auth users):
   - `list()` → query (Admin: all, Agent: self only)
   - `listAgents()` → query (users with role=agent, for dropdowns)
   - `getById(id)` → query
   - `createUser({ name, email, role, commissionRate?, isActive })` → mutation, Admin only
   - `updateUser(id, fields)` → mutation, Admin only
   - `toggleActive(id)` → mutation, Admin only
     - Cannot deactivate the last active admin
   - `removeUser(id)` → mutation, Admin only
     - Cannot delete own account
     - Cannot delete last active admin
     - Prefer deactivation over deletion

4. All mutations check `requireRole(ctx, "admin")`

### Acceptance Criteria
- [ ] All CRUD operations work via Convex dashboard testing
- [ ] Non-admin mutation calls are rejected with clear error
- [ ] Bank deletion fails if projects reference it (returns error message)
- [ ] Cannot deactivate/delete last admin
- [ ] Cannot delete own account
- [ ] `listAgents()` returns only agent-role users

---

## Task #7 — Settings Page UI - Banks, Referrals, Users Tabs

**Phase:** 5 (UI Pages)
**Blocked by:** #3, #6
**Blocks:** #20

### Scope
Full Settings page with tabbed navigation and CRUD interfaces.

### Steps
1. Settings layout with left sidebar tab navigation:
   - **Admin sees:** Profile, Banks, Referral Companies, Users, Notifications, Privacy & Security
   - **Agent/Viewer sees:** Profile, Notifications, Privacy & Security
   - Active tab state preserved on re-render

2. **Banks Tab** (Admin only):
   - Data table: Name | Commission Rate (%) | Status badge | Actions
   - "Add Bank" primary button (top-right)
   - Actions column: ShadCN `DropdownMenu` triggered by `MoreVertical` icon
     - Edit (pencil icon) → opens edit Dialog
     - Activate/Deactivate (toggle icon) → AlertDialog confirmation
     - Divider
     - Delete (trash icon, red) → AlertDialog with "cannot be undone" warning
   - Add/Edit: ShadCN `Dialog` with `Form` (name required, commissionRate 0-100%, isActive)
   - Success/error toasts via Sonner

3. **Referral Companies Tab** (Admin only):
   - Data table: Name | Contact Person | Email | Phone | Commission Rate | Status | Actions
   - Same CRUD pattern as Banks with expanded form fields

4. **Users Tab** (Admin only):
   - Data table: Name | Email | Role badge | Commission Rate (agents only) | Status | Actions
   - Add/Edit Dialog: name, email (unique), role dropdown, commissionRate (shown only when role=agent), isActive
   - Delete blocked for: self, last admin

5. **Profile Tab** (all roles):
   - Display current user name, email, role
   - Edit name/email

6. **Notifications Tab** (all roles):
   - Toggle switches: Email notifications, Push notifications, SMS alerts
   - Toast on each toggle: "[Setting] enabled" / "[Setting] disabled"

7. **Privacy & Security Tab** (all roles):
   - Password change form (v1 placeholder)

### Mockup Reference
- `/html/settings.html` — Page layout
- `/html/assets/js/main.js` → `renderSettings()`, `buildSettingsContentMap()`
- `docs/implementation/SETTINGS-IMPROVEMENTS.md` — 3-dot menu and confirmation patterns

### Acceptance Criteria
- [ ] Admin sees all 6 tabs; Agent/Viewer sees only 3
- [ ] Banks: Add, Edit, Toggle, Delete all work with toasts
- [ ] Referrals: Full CRUD works
- [ ] Users: CRUD with role-conditional commission rate field
- [ ] Delete shows "cannot be undone" AlertDialog
- [ ] Deactivate shows confirmation AlertDialog
- [ ] 3-dot menus open/close correctly, positioned right-aligned
- [ ] Notification toggles show toast feedback
- [ ] Tab state preserved on navigation

---

## Task #8 — Project CRUD Backend - Queries & Mutations

**Phase:** 4 (Backend APIs)
**Blocked by:** #2, #5
**Blocks:** #9, #10, #11, #12, #15, #17, #18, #19

### Scope
Complete Convex backend for project lifecycle management.

### Steps
1. **Queries (`convex/projects.ts`):**
   - `list(filters?)` → paginated, with stage/status/agent/bank/borrowerType/search filters
     - Admin/Viewer: all projects
     - Agent: where `assignedAgentId = user` OR `createdBy = user`
   - `getById(id)` → single project with resolved references (bank name, agent name, referral name)
   - `getForKanban(filters?)` → projects grouped by stage column (same RBAC)
   - `getNextProjectCode()` → reads latest code, returns next sequential "MM-XXXX"
   - `getDashboardStats(userId?, role?)` → aggregated data for all dashboard widgets

2. **Mutations:**
   - `create(fields)` → Admin/Agent only
     - Auto-generate `projectCode` using `getNextProjectCode()` within the mutation (race-safe)
     - Auto-generate `projectName`: `"{code} - {clientName} - {businessType}"`
     - Set `stage = "new"`, `status = "open"`
     - Pull default commission rates from bank/agent/referral master records
   - `update(id, fields)` → Admin or (Agent if assigned/created)
   - `changeStage(id, newStage, metadata?)`:
     - **Forward-only validation:** compare stage indexes, reject backward moves
     - Set the corresponding milestone timestamp to `Date.now()`
     - If `newStage = "disbursed"` → auto-set `status = "disbursed"`
     - If `newStage = "closed"` → require `closedOutcome` in metadata
     - If `newStage = "fol"` → accept `folNotes` in metadata
     - Validate chronological order of all milestone timestamps
     - Write audit log entry
   - `changeStatus(id, newStatus, reason?)`:
     - `on_hold` requires `reason`
     - Cannot change status of `disbursed` projects
     - Must be `active` before stage transitions (except Disbursed → Closed)
     - Write audit log entry
   - `updateCommission(id, fields)` → Admin only
     - Write audit log entry with before/after values

### Acceptance Criteria
- [ ] Agent queries return only own/assigned projects
- [ ] `changeStage` rejects backward moves
- [ ] `changeStage("disbursed")` auto-sets status to "disbursed"
- [ ] `changeStage("closed")` requires closedOutcome
- [ ] Milestone timestamps set correctly on each stage transition
- [ ] Chronological validation works (cannot set `submittedAt < docsCompletedAt`)
- [ ] Project code generation handles concurrent creates (no duplicates)
- [ ] Commission update restricted to Admin
- [ ] Audit log entries written for stage/status/commission changes

---

## Task #9 — New Project Creation Form

**Phase:** 5 (UI Pages)
**Blocked by:** #3, #6, #8
**Blocks:** #20

### Scope
Modal dialog for creating new projects with form validation.

### Steps
1. "New Project" button in layout top bar (hidden for Viewer)
2. ShadCN `Dialog` with `react-hook-form` + `zod` validation:

   | Field | Type | Required | Source |
   |-------|------|----------|--------|
   | Client Name | Text | Yes | User input |
   | Client Email | Email | No | User input |
   | Client Phone | Phone | No | User input |
   | Borrower Type | Select | Yes | ["Salaried", "Self-Employed"] |
   | Business Type | Select | Yes | ["Buyout", "Equity Release"] |
   | Bank | Select | Yes | `banks.list(isActive=true)` |
   | Referral Company | Select | No | `referralCompanies.list(isActive=true)` |
   | Assigned Agent | Select | Yes | `users.listAgents()` |
   | Loan Amount | Number | Yes | User input (AED) |
   | Property | Text | No | User input |
   | Property Profile | Select | Yes | ["Land", "Building"] |
   | Notes | Textarea | No | User input |

3. On submit:
   - Call `projects.create` mutation
   - Show success toast: "Project {code} created successfully"
   - Navigate to `/projects/{id}` (project detail → Documents tab)
4. Button loading state during submission
5. Form reset on close

### Mockup Reference
- `/html/assets/js/main.js` → `renderNewProjectModalHTML()`, `initNewProjectModal()`

### Acceptance Criteria
- [ ] Dialog opens from "New Project" button
- [ ] All required fields validated before submission
- [ ] Dropdowns populated from live Convex data (active banks, agents, referrals)
- [ ] Submit creates project with auto-generated code + name
- [ ] Success toast shows project code
- [ ] Redirects to project detail page
- [ ] Button disabled for Viewer role
- [ ] Loading spinner on submit button during API call

---

## Task #10 — Projects List View

**Phase:** 5 (UI Pages)
**Blocked by:** #3, #8
**Blocks:** #20

### Scope
Table-based project list with filters and pagination.

### Steps
1. Route: `/projects/list`
2. Pipeline snapshot card at top:
   - Total open pipeline value (sum of loan amounts for open/active projects)
   - Average ticket size
3. Filter bar:
   - Stage dropdown (7 stages + All)
   - Agent dropdown (from users)
   - Status dropdown (4 statuses + All)
   - Search input (client name or project code)
4. ShadCN data table:
   - Columns: Client Name, Stage (badge), Agent, Loan Amount (AED M), Updated Date, Status (color badge), Action (View link)
5. Pagination: 5 per page, Prev/Next + page numbers
6. Toggle link to Kanban view (`/projects`)
7. "New Project" button (hidden for Viewer)
8. Agent RBAC: sees only own/assigned projects

### Mockup Reference
- `/html/projects-list.html`
- `/html/assets/js/main.js` → `renderProjectsList()`, `initProjectsList()`

### Acceptance Criteria
- [ ] Table displays with correct column formatting
- [ ] Stage badges color-coded
- [ ] Status badges color-coded (green=open/active, amber=on-hold, blue=disbursed)
- [ ] Loan amounts in AED millions format
- [ ] Filters work independently and combined
- [ ] Pagination with 5 per page
- [ ] Pipeline snapshot shows correct totals
- [ ] View link navigates to `/projects/:id`
- [ ] Toggle switches to Kanban view
- [ ] Agent sees only own projects

---

## Task #11 — Kanban Board View

**Phase:** 5 (UI Pages)
**Blocked by:** #3, #4, #8
**Blocks:** #20

### Scope
Drag-and-drop Kanban board with 7 stage columns.

### Steps
1. Route: `/projects`
2. 7 columns with headers + card counts:
   New | WIP | Docs Completed | Submitted | FOL | Disbursed | Closed
3. Card content:
   - Project code + Client name
   - Borrower type badge
   - Bank name
   - Loan amount (AED M)
   - Assigned agent name
   - Status color indicator
   - Document completion % (mini progress bar)
   - Days in current stage
4. Implement with `@dnd-kit/core` + `@dnd-kit/sortable`:
   - **Forward-only:** Reject backward drag with amber flash animation
   - **Status gating:** Only `open` or `active` can drag
   - **On-Hold locked:** opacity-60, cursor-not-allowed, not draggable
   - **Disbursed restricted:** Can ONLY drag to Closed column (blue ring indicator)
   - **FOL modal:** ShadCN Dialog for FOL Notes when dropping to FOL
   - **Closed modal:** ShadCN Dialog for outcome selection (Approved/Rejected/Cancelled/Disbursed)
   - **Disbursed auto-status:** Auto-set status to "disbursed" on drop
   - **Milestone stamps:** Auto-set timestamp on successful drop
5. Filter bar: Status, Agent, Bank, Borrower Type, Search
6. Card click → navigate to `/projects/:id`
7. Toggle to List view (`/projects/list`)
8. Real-time via Convex `useQuery` subscriptions

### Mockup Reference
- `/html/projects-kanban.html`
- `/html/assets/js/main.js` → `renderProjectsKanban()`, `initProjectsKanban()`
- `docs/agent/kanban-rules.md`

### Acceptance Criteria
- [ ] 7 columns render with correct headers and card counts
- [ ] Cards display all required info with correct formatting
- [ ] Drag forward → card moves, milestone auto-set
- [ ] Drag backward → rejected with amber flash, card returns
- [ ] On-Hold card → cannot initiate drag, visual treatment applied
- [ ] Disbursed card → can only drop on Closed column
- [ ] Drop on FOL → FOL Notes dialog appears first
- [ ] Drop on Closed → Outcome selection dialog appears first
- [ ] Drop on Disbursed → status auto-set to "disbursed"
- [ ] All filters work and update card counts
- [ ] Card click navigates to detail page
- [ ] Board updates in real-time when data changes

---

## Task #12 — Project Detail - Overview Tab

**Phase:** 5 (UI Pages)
**Blocked by:** #3, #4, #8
**Blocks:** #14, #15, #16, #20

### Scope
Project detail page structure with Overview tab content.

### Steps
1. Route: `/projects/:id`
2. Page header: Project code + name, Stage badge, Status badge, Back link
3. Tab navigation component:
   - **Overview** (default active)
   - **Documents**
   - **Commission** — hidden before Disbursed stage; Viewer CAN see (read-only per PRD 3.2)
   - **Timeline**
4. Overview tab sections:
   - **Meta info grid:** Borrower type, Business type, Bank, Referral Company
   - **Document progress card:** "X of Y documents uploaded" with progress bar
   - **Loan overview:** Amount, Property value, LTV, Rate, Term, Down payment, Monthly payment
   - **Client info:** Name, Email, Phone
   - **Agent info:** Name, contact details
   - **Recent activity:** Last 5 audit log entries for this project
5. Status control buttons:
   - "Put On Hold" → Dialog with reason input → changes status to on_hold
   - "Activate" (shown when on_hold) → changes status to active
   - "Close Project" (Admin only) → Dialog with outcome selection
   - Button visibility rules per role and current status
6. Edit project button → opens Dialog with project fields (Admin + assigned Agent)

### Mockup Reference
- `/html/project-detail.html`
- `/html/assets/js/main.js` → `renderProjectDetail()`, `initProjectDetail()`

### Acceptance Criteria
- [ ] All project data displays correctly with proper formatting
- [ ] Tab navigation switches between Overview/Documents/Commission/Timeline
- [ ] Commission tab hidden before Disbursed stage
- [ ] Commission tab visible to Viewer (read-only) at Disbursed+ stage
- [ ] "Put On Hold" prompts for reason and updates status
- [ ] "Activate" changes on_hold back to active
- [ ] "Close Project" prompts for outcome (Admin only)
- [ ] Edit button opens form dialog (Admin + assigned Agent only)
- [ ] Recent activity shows audit log entries
- [ ] Back link returns to projects view

---

## Task #13 — Document Engine Backend

**Phase:** 4 (Backend APIs)
**Blocked by:** #2, #4, #5
**Blocks:** #14, #19

### Scope
Convex backend for document upload, verification, rejection, and storage.

### Steps
1. **Queries (`convex/documents.ts`):**
   - `listByProject(projectId)` → all documents for a project
   - `getProgress(projectId)` → `{ uploaded, verified, total, percentage }` based on borrower type

2. **Mutations:**
   - `generateUploadUrl()` → Convex storage upload URL
   - `upload(projectId, documentCode, section, label, storageId)`:
     - Admin/Agent only
     - Create document record with `status = "uploaded"`
     - Validate file type against slot config
   - `addFile(documentId, storageId)`:
     - Append to `fileIds` array (multi-file slots)
   - `removeFile(documentId, storageId)`:
     - Remove from `fileIds` array
     - If no files left, delete document record or set status to "missing"
   - `verify(documentId)`:
     - Admin/Viewer only
     - Set `status = "verified"`, `verifiedBy = currentUser`
   - `reject(documentId, reason)`:
     - Admin/Viewer only
     - Set `status = "rejected"`, `rejectionReason = reason`
   - `deleteDocument(documentId)`:
     - Admin only

3. **Auto-complete detection:**
   - After each `upload`, `addFile`, or `verify`: check if all required slots for borrower type are `uploaded` or `verified`
   - If complete and project's `docsCompletedAt` not set → update project milestone
   - Write audit log entry

4. **File URL query:**
   - `getFileUrl(storageId)` → download URL from Convex storage

### Acceptance Criteria
- [ ] Upload stores file in Convex storage and creates document record
- [ ] `getFileUrl()` returns working download URL
- [ ] Verify changes status to "verified" with verifiedBy
- [ ] Reject changes status to "rejected" with rejectionReason
- [ ] Multi-file: `addFile` appends, `removeFile` removes
- [ ] Auto-complete: sets `docsCompletedAt` when all required slots filled
- [ ] Role checks: only Admin/Agent can upload, only Admin/Viewer can verify/reject
- [ ] Audit log entries written for upload/verify/reject

---

## Task #14 — Project Detail - Documents Tab UI

**Phase:** 6 (Detail Tabs)
**Blocked by:** #12, #13
**Blocks:** #20

### Scope
Document checklist UI with upload, verify, reject, and progress tracking.

### Steps
1. Progress indicator at top: "X of Y documents uploaded" with progress bar
   - Y = 24 (salaried) or 29 (self-employed)
   - X = slots with status `uploaded` or `verified`
2. Collapsible sections A through F:
   - Section headers with chevron toggle + rotation animation
   - Section B entirely hidden for salaried borrowers
   - D2 hidden for salaried borrowers
3. Each document slot renders:
   - Code + label (e.g., "A1 — Valid UAE ID")
   - Status badge: Missing (red) | Uploaded (blue) | Verified (green) | Rejected (orange)
   - **Upload zone:** File picker (or drag-and-drop) — Admin/Agent only
     - Client-side file type validation before upload
     - Upload progress indicator
   - **Uploaded files list:** filename, download link, delete button (Admin only)
   - **Multi-file slots:** Show all files with individual actions
   - **Verify button** — Admin/Viewer only
   - **Reject button** → Dialog for reason — Admin/Viewer only
   - **Rejected display:** Orange alert box showing rejection reason below the slot
4. Section F — Others:
   - "Add Document" button
   - Text input for label
   - Multi-file upload
   - Same verify/reject lifecycle
5. Role-based button visibility:
   - Upload: Admin, Agent
   - Verify/Reject: Admin, Viewer
   - Download: All
   - Delete file: Admin

### Mockup Reference
- `/html/project-detail.html` → Documents tab
- `/html/assets/js/documentConfig.js` — Slot definitions
- `docs/agent/document-requirements.md`

### Acceptance Criteria
- [ ] All 29 slots display for self-employed projects
- [ ] 24 slots display for salaried (Section B + D2 hidden)
- [ ] File upload works with progress indicator
- [ ] File type validation rejects invalid types
- [ ] Multi-file slots accept and display multiple files
- [ ] Verify button changes status to green with verification
- [ ] Reject button opens reason dialog, shows orange alert
- [ ] Re-upload on rejected documents works (resets to "uploaded")
- [ ] Download link works for all uploaded files
- [ ] Auto-complete sets docsCompletedAt milestone
- [ ] Progress bar updates in real-time
- [ ] Others section allows ad-hoc uploads with custom labels
- [ ] Collapsible sections animate correctly

---

## Task #15 — Project Detail - Commission Tab

**Phase:** 6 (Detail Tabs)
**Blocked by:** #8, #12
**Blocks:** #20

### Scope
Commission calculation and display with role-based visibility.

### Steps
1. Tab visibility:
   - Hidden when project stage is before `disbursed`
   - Visible to: Admin (full edit), Viewer (read-only), Agent (limited view)
2. Fields layout:

   | Field | Edit | Formula |
   |-------|------|---------|
   | Loan Amount | Read-only (from project) | — |
   | Bank Commission Rate (%) | Admin | From bank master, overridable |
   | Expected Total Commission | Auto | loanAmount x bankRate |
   | Agent Commission Rate (%) | Admin | From agent profile, overridable |
   | Agent Share (Projected) | Auto | expectedCommission x agentRate |
   | Referral Commission Rate (%) | Admin | From referral, overridable. 0 if none |
   | Referral Share (Projected) | Auto | expectedCommission x referralRate |
   | --- Divider --- | | |
   | Final Commission (Actual) | Admin | Manual entry post-disbursement |
   | Agent Payout (Final) | Auto | finalCommission x agentRate |
   | Referral Payout (Final) | Auto | finalCommission x referralRate |

3. Agent visibility (limited):
   - Sees only: Loan Amount, Final Commission, Agent Payout (all read-only)
   - Cannot see rates, projected splits, referral details
4. Rates stored as decimals, displayed as percentages
5. Auto-calculations update in real-time as inputs change
6. Save button for Admin edits → calls `updateCommission` mutation
7. Audit log on save

### Mockup Reference
- `/html/project-detail.html` → Commission section
- PRD Section 5.3

### Acceptance Criteria
- [ ] Tab hidden for projects before Disbursed stage
- [ ] Admin sees all fields and can edit rates + final commission
- [ ] Viewer sees all fields read-only
- [ ] Agent sees only Loan Amount, Final Commission, Agent Payout (read-only)
- [ ] Auto-calculations correct (verify with known values)
- [ ] Rate displayed as % in UI, stored as decimal in DB
- [ ] Save persists changes and shows success toast
- [ ] Audit log entry created on commission edit

---

## Task #16 — Project Detail - Timeline Tab

**Phase:** 6 (Detail Tabs)
**Blocked by:** #4, #12
**Blocks:** #20

### Scope
Visual milestone timeline with T1-T5 durations.

### Steps
1. Horizontal timeline bar with 5 segments:
   - T1 — Speed to Start: `_creationTime` → `wipStartedAt`
   - T2 — Doc Collection: `wipStartedAt` → `docsCompletedAt`
   - T3 — Prep & Submit: `docsCompletedAt` → `submittedAt`
   - T4 — Bank Processing: `submittedAt` → `folAt`
   - T5 — FOL to Disbursement: `folAt` → `disbursedAt`
2. Each segment shows:
   - Label (T1, T2, etc.) + descriptive name
   - Duration in days (e.g., "5 days")
   - "Pending" with muted styling if milestone not yet reached
   - Visual bar width proportional to duration
3. Total project duration display
4. On-Hold impact: note `pausedDays` subtracted from active T-metric
5. Admin backdating:
   - Click on a milestone date → ShadCN date picker
   - Validate chronological order on save
   - Only Admin can edit

### Mockup Reference
- `/html/project-detail.html` → Timeline section
- PRD Section 5.4.1

### Acceptance Criteria
- [ ] All 5 milestones display with correct labels
- [ ] Durations calculate correctly in days
- [ ] "Pending" shown for unreached milestones
- [ ] Bar widths proportional to durations
- [ ] Total duration shown
- [ ] Admin can click to edit milestone dates
- [ ] Chronological validation enforced on edits
- [ ] Non-admin cannot edit dates

---

## Task #17 — Agents Page

**Phase:** 5 (UI Pages)
**Blocked by:** #3, #8
**Blocks:** #20

### Scope
Agent directory with performance metrics and dual view modes.

### Steps
1. Route: `/agents`
2. Grid view (default) — agent cards:
   - Name, role, region
   - Active project count
   - Closed project count
   - Pipeline total (sum of loan amounts for open/active projects, AED M)
   - Contact: email, phone
3. Table view toggle — workload summary table
4. Filters:
   - Region dropdown
   - Search by name or email
5. Role-based access:
   - Admin/Viewer: see all agents
   - Agent: sees only themselves

### Mockup Reference
- `/html/agents.html`
- `/html/assets/js/main.js` → `renderAgents()`, `initAgents()`

### Acceptance Criteria
- [ ] Agent cards show with correct computed metrics
- [ ] Pipeline values in AED millions
- [ ] Grid/Table view toggle works
- [ ] Region filter works
- [ ] Search filters by name and email
- [ ] Agent role sees only their own card
- [ ] Admin/Viewer see all agents

---

## Task #18 — Dashboard Analytics Page

**Phase:** 5 (UI Pages)
**Blocked by:** #3, #4, #8
**Blocks:** #20

### Scope
Full dashboard with 10 analytics widgets across 3 rows.

### Steps
1. Route: `/` (home page)

2. **Row 1 — Top KPI Cards** (`xl:grid-cols-4`):
   - **Greeting:** User name, current date, "View Pipeline" button → `/projects`
   - **YTD:** Case count + total disbursed amount (projects with disbursedAt in current calendar year)
   - **Active:** Count + total value of open/active projects
   - **Active Profile:** Land vs Building breakdown — % split, counts, values (pipeline projects, stage != closed)

3. **Row 2 — Pipeline Overview** (`lg:grid-cols-[2.5fr_1fr_1fr]`):
   - **Active Projects Table:** 5 most recently updated active projects
     - Columns: Project (name + code), Value, Stage badge, Docs (verified/total), Last Updated
     - "View All" → `/projects/list`
   - **Stage Breakdown:** Total count + per-stage counts with color-coded badges
   - **Avg. Milestone Durations:** Overall average + T1-T5 individual averages in days (e.g., "19d")

4. **Row 3 — Performance & Activity** (`lg:grid-cols-3`):
   - **Agent Performance:** Top 3 agents by pipeline value
     - Agent name, active/disbursed counts, stacked amounts (Active on top, Disbursed below)
   - **Referral Agencies:** All active agencies
     - Same stacked layout as Agent Performance
   - **Recent Activity:** 5 most recent audit log entries
     - Actor name, action description, project code, relative timestamp

5. Access control:
   - Admin/Viewer: all data (unfiltered)
   - Agent: filtered to own/assigned projects

### Mockup Reference
- `/html/dashboard.html`
- `/html/assets/js/main.js` → `renderDashboard()`
- PRD Section 5.4.2

### Acceptance Criteria
- [ ] All 10 widgets render with live Convex data
- [ ] Grid layout matches mockup proportions per row
- [ ] AED amounts formatted in millions
- [ ] Stage badges color-coded correctly
- [ ] YTD calculation uses current calendar year
- [ ] Agent Performance shows top 3 by pipeline value
- [ ] Agent/Referral amounts stacked vertically (Active top, Disbursed bottom)
- [ ] "View Pipeline" and "View All" links navigate correctly
- [ ] Recent Activity shows relative timestamps
- [ ] Agent role sees filtered data only
- [ ] Icons in card headers using lucide-react

---

## Task #19 — Audit Log Backend

**Phase:** 5 (UI Pages)
**Blocked by:** #5, #8, #13
**Blocks:** #20

### Scope
Append-only audit logging integrated into existing mutations. No dedicated UI (v1).

### Steps
1. **`convex/auditLog.ts` mutations:**
   - `log({ projectId?, action, performedBy, details })` → append-only insert
   - `details` is a JSON string with before/after values

2. **Queries:**
   - `listByProject(projectId, limit?)` → for project detail Recent Activity
   - `listRecent(limit?)` → for dashboard Recent Activity widget
   - Both respect RBAC (Agent sees only own project logs)

3. **Logged actions:**
   | Action | Trigger | Details |
   |--------|---------|---------|
   | `stage_change` | `projects.changeStage` | `{ from, to, milestoneSet }` |
   | `status_change` | `projects.changeStatus` | `{ from, to, reason? }` |
   | `document_upload` | `documents.upload` | `{ documentCode, fileName }` |
   | `document_verify` | `documents.verify` | `{ documentCode }` |
   | `document_reject` | `documents.reject` | `{ documentCode, reason }` |
   | `commission_edit` | `projects.updateCommission` | `{ field, oldValue, newValue }` |

4. Integrate into existing mutations from Tasks #8 and #13

### Acceptance Criteria
- [ ] Audit entries created for all 6 action types
- [ ] `listByProject` returns entries for a specific project
- [ ] `listRecent` returns most recent entries across all projects
- [ ] Agent queries filter to own project logs only
- [ ] Details JSON contains meaningful before/after data
- [ ] Timestamps are correct

---

## Task #20 — End-to-End Testing & Polish

**Phase:** 7 (Integration)
**Blocked by:** ALL tasks #7-#19
**Blocks:** Nothing

### Scope
Full integration testing and UI refinement.

### Steps
1. **E2E lifecycle test:**
   - Create project → move through all 7 stages → verify at each step
   - Upload documents → verify → reject → re-upload → verify all
   - Enter commission data → verify calculations
   - Check milestone timeline accuracy
   - Repeat for all 3 roles (Admin, Agent, Viewer)

2. **UI polish:**
   - Add ShadCN `Skeleton` loading states on all async pages
   - Add React error boundaries
   - Add empty states (no projects, no agents, first-time setup)
   - Verify toast notification consistency (success=green, error=red, info=blue)
   - Modal close behavior: backdrop click, ESC key
   - Responsive verification: tablet (768px+) and desktop (1024px+)

3. **Edge case testing:**
   - On-Hold blocks stage transitions (must Activate first)
   - Disbursed → only Closed allowed
   - Forward-only Kanban (backward drag rejected)
   - Commission tab visibility rules per role and stage
   - Agent sees only own/assigned projects in ALL views
   - Cannot delete in-use banks/referrals
   - Cannot delete self or last admin
   - Project code no duplicates under concurrent creation

4. **Performance:**
   - Convex real-time subscriptions working (change in one tab reflects in another)
   - No unnecessary re-renders (React DevTools check)
   - File upload shows progress indicator
   - Large project lists paginate smoothly

### Acceptance Criteria
- [ ] Full project lifecycle (New → Closed) works for Admin
- [ ] Agent can only access own projects, create projects, upload docs
- [ ] Viewer can browse all, download, verify/reject docs, cannot edit
- [ ] No console errors in any flow
- [ ] All loading states show skeletons (not blank screens)
- [ ] All error states show user-friendly messages
- [ ] Empty states display helpful content
- [ ] Responsive on tablet and desktop
- [ ] Real-time updates working between browser tabs
- [ ] All edge cases from list above verified
