# Architecture

## Current Mockup Structure

**Single Page Application Pattern:**
- All HTML pages load as `type="module"` with ES6 imports
- Page routing simulated via `data-page` attribute on `#app` div
- Navigation handled by `loader.js` (layout shell + sidebar)

**Core JavaScript Modules:**

1. **`main.js`** (~933 lines) — All page renderers and interactivity
   - `renderLogin()`, `renderDashboard()`, `renderProjectsKanban()`, `renderProjectsList()`, `renderProjectDetail()`, `renderAgents()`, `renderSettings()`
   - Event handlers for Kanban drag-and-drop, document actions, status toggles
   - Modal renderers for New Project, document actions
   - In-memory data mutations simulating backend operations

2. **`data.js`** — Mock data store
   - Exports: `admins`, `agents`, `viewers`, `banks`, `referralCompanies`, `projects`, `logs`, `projectDetails`
   - Provides exact shape for production Convex schema migration

3. **`loader.js`** — Layout & navigation
   - Renders sidebar, header, user profile widget
   - Role toggle widget (demo-only, not in production)
   - Icon rendering via Lucide CDN

4. **`utils.js`** — Shared utilities (reusable in production)
   - `formatCurrency(value)` — AED formatting
   - `formatDate(timestamp)` — DD MMM YYYY
   - `formatRelative(timestamp)` — "2 days ago"
   - `calculateDuration(start, end)` — Duration in days
   - `generateProjectCode(lastCode)` — Sequential MM-0001, MM-0002...

5. **`documentConfig.js`** — Document requirements engine
   - `DOCUMENT_SECTIONS` — 5 sections (A-E)
   - `DOCUMENT_SLOTS` — 28 predefined slots (mockup version)
   - `getDocSlotsForBorrowerType(type)` — Filters by Salaried/Self-Employed
   - **⚠️ Important:** PRD Section 5.2.2 defines the authoritative 29-slot list with different labels. The mockup structure is correct, but content needs updating for production.

6. **`custom.css`** — Brand design tokens
   - Colors: `--primary` (#002060 navy), `--accent` (#05f240 green), `--surface` (#ffffff), `--surface-muted` (#f9fbff)
   - Border radius: `rounded-3xl` (cards), `rounded-2xl` (buttons/inputs)
   - Typography: Inter (400, 500, 600, 700) via Google Fonts

## Production Migration Path

This mockup is the foundation for a React + Convex production application. See PRD Section 11 for the complete migration guide.

**Technology Stack (Production):**
- Frontend: React (Vite) + ShadCN UI + Tailwind CSS
- Backend: Convex (BaaS) — schema, queries, mutations, file storage
- Auth: Convex Auth with RBAC ([reference template](https://github.com/get-convex/convex-auth-with-role-based-permissions))
- DnD: `@dnd-kit/core` + `@dnd-kit/sortable` for Kanban
- Forms: ShadCN Form + `react-hook-form` + `zod` validation
- Charts: Recharts (for dashboard analytics)
- Toasts: ShadCN Sonner
- Testing: Vitest (unit), Playwright (e2e) — setup only for v1
- Starter template: [convex-react-vite-convexauth-shadcn](https://github.com/get-convex/templates/tree/main/template-react-vite-convexauth-shadcn)

**Recommended Build Order (PRD Section 8.2):**
1. Auth & RBAC — Login, user roles, route guards
2. Master tables — Banks, Referral Companies, User management (CRUD)
3. Project CRUD — Create project form, data model, basic list view
4. Kanban Board — Stage columns, drag-and-drop, filters
5. Document Engine — Config-driven document slots, file upload/download, status lifecycle
6. Commission Module — Fields, calculations, role-based visibility
7. Milestones & Analytics — Timeline display, duration calculations, dashboard

**Key Migration Patterns:**

1. **Component Mapping:**
   - Each `render*()` function → React page component
   - Each `init*()` function → custom hook (e.g., `useKanbanDragDrop()`, `useProjectFilters()`)

2. **Data Layer:**
   - `projects.push(...)` → Convex `mutation` with `ctx.db.insert("projects", ...)`
   - `logs.unshift(...)` → Audit log mutation
   - In-memory arrays → Convex `query` with real-time subscriptions

3. **UI Replacements:**
   - `prompt()` → ShadCN `AlertDialog` with form
   - `window.location.href` → React Router `navigate()`
   - Native HTML5 drag-and-drop → `@dnd-kit/sortable`
   - Lucide CDN → `lucide-react` package imports

4. **Storage:**
   - Mock file actions → Convex `ctx.storage.store()` and `ctx.storage.getUrl()`

## Key Architectural Decisions (PRD Section 8.3 & 8.4)

### Document Config as Code
- The 29 document slots should be a TypeScript constant (`DOCUMENT_CONFIG`), NOT stored in the database
- Makes it easy to add/modify slots without migrations
- The `documents` table only stores *instances* (uploaded files) referencing slots by `documentCode`
- Reference `/html/assets/js/documentConfig.js` for structure (update labels to PRD Section 5.2.2)

### Project Code Generation
- Use Convex mutation that reads latest project code and increments (MM-0001, MM-0002...)
- Handle race conditions with Convex's built-in transaction guarantees
- Reference `generateProjectCode()` in `/html/assets/js/utils.js` for logic

### Commission Calculations
- Do these client-side for display (keeps UI responsive)
- Store only input values (rates, loan amount, final commission) in DB
- Calculate derived values (shares, payouts) in shared utility function
- Use same utility for both frontend display and backend validations

### Commission Rates as Decimals
- Store all rates as decimal fractions in DB (0.015 = 1.5%, 0.7 = 70%)
- Display as percentages in UI by multiplying by 100
- Formulas divide by 100: `expectedCommission = loanAmount × bankCommissionRate / 100`

### Per-Project Rate Overrides
- Each project stores its own `bankCommissionRate`, `agentCommissionRate`, `referralCommissionRate`
- Defaulted from master tables at creation time but overridable by Admin
- Allows commission adjustments without affecting master data

### Convex-Specific Patterns
- Use `query` for all read operations, `mutation` for writes
- Use `ctx.storage.store()` for file uploads, `ctx.storage.getUrl()` for download URLs
- Use Convex's real-time subscriptions — Kanban board should update live when another user moves a card
- Use `v.union()` for enum fields like `stage`, `status`, `borrowerType`, `businessType`
- `_creationTime` is automatic in Convex — use it for T1 start time
- Agent queries must filter by `assignedAgentId` at the Convex query level (server-side RBAC)
