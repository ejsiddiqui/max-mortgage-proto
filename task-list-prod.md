# Max Mortgage — Production Implementation Task List

This task list tracks the implementation of the Max Mortgage production stack using Convex, React, and ShadCN.

## Phase 1: Foundation
- [x] **Task #1: Project Setup**
    - [x] Initialize Convex + React (Vite) + ShadCN
    - [x] Install dependencies: `@dnd-kit/core`, `@dnd-kit/sortable`, `recharts`, `lucide-react`, `vitest`, `playwright`
    - [x] Configure Tailwind with design tokens (Section 7.1 & 11.5 of PRD)
    - [x] Setup Vitest config
    - [x] Verify base template runs
- [x] **Task #2: Auth & RBAC**
    - [x] Integrate Convex Auth (Email/Password)
    - [x] Implement roles: Admin, Agent, Viewer
    - [x] Create `useCurrentUser` hook and middleware guards
    - [x] Implement Login UI matching mockup (`/html/index.html`)
- [x] **Task #3: Layout & Navigation**
    - [x] Build App Shell (Sidebar, Top bar, dynamic title)
    - [x] Setup React Router with route guards
    - [x] Implement role-based navigation visibility
- [x] **Task #4: Shared Utilities & Config**
    - [x] Port `formatCurrency`, `formatDate`, `generateProjectCode` from mockup
    - [x] Implement `DOCUMENT_CONFIG` (29 slots) with PRD Section 5.2.2 labels
    - [x] Define Constants: `STAGES`, `STATUSES`, `BORROWER_TYPES`
    - [x] Implement commission calculation utilities
- [x] **Task #5: Convex Schema & Seed Data**
    - [x] Define `schema.ts` (Users, Banks, Referrals, Projects, Documents, AuditLog)
    - [x] Setup indexes for common queries
    - [x] Create seed script with mock data from `/html/assets/js/data.js`

## Phase 2: Backend APIs
- [x] **Task #6: Master Tables Backend**
    - [x] Implement CRUD for Banks (Admin only)
    - [x] Implement CRUD for Referral Companies (Admin only)
    - [x] Implement User Management CRUD (Admin only)
    - [x] Add usage validation for deletions
- [x] **Task #8: Project CRUD Backend**
    - [x] Implement Project creation with auto-code generation
    - [x] Implement Stage transition logic (Forward-only, auto-milestones)
    - [x] Implement Status transition logic (On-hold reason, disbursed auto-lock)
    - [x] Implement RBAC-aware project queries (Agent sees assigned/created)
- [x] **Task #13: Document Engine Backend**
    - [x] Setup Convex Storage integration
    - [x] Implement Upload/Verify/Reject mutations
    - [x] Implement auto-complete detection for `docsCompletedAt`
- [x] **Task #19: Audit Log Backend**
    - [x] Integrate logging into Stage/Status/Document/Commission mutations
    - [x] Implement queries for project-specific and global recent activity

## Phase 3: UI Pages
- [x] **Task #7: Settings Page UI**
    - [x] Implement Profile, Banks, Referrals, Users tabs
    - [x] Use 3-dot menus and confirmation dialogs per mockup
    - [x] Implement notification toggles with toast feedback
- [x] **Task #9: New Project Form**
    - [x] Implement creation modal with Zod validation
    - [x] Populate dropdowns from Convex master tables
- [x] **Task #10: Projects List View**
    - [x] Implement filterable/paginated table
    - [x] Add pipeline snapshot card
- [x] **Task #11: Kanban Board**
    - [x] Implement drag-and-drop with stage rules
    - [x] Implement FOL Notes and Closed Outcome modals
    - [x] Ensure real-time updates and status locking
- [ ] **Task #17: Agents Page**
    - [ ] Implement directory with performance metrics
    - [ ] Add grid/table toggle and filters
- [x] **Task #18: Dashboard Analytics**
    - [x] Implement all 10 widgets (KPI cards, Pipeline table, Durations, etc.)
    - [x] Ensure role-based data filtering

## Phase 4: Project Detail Tabs
- [x] **Task #12: Project Detail Overview**
    - [x] Build tabbed navigation structure
    - [x] Implement data grid, status controls, and recent activity
- [x] **Task #14: Documents Tab UI**
    - [x] Implement collapsible sections (A-F) with visibility logic
    - [x] Implement upload/verify/reject lifecycle with status badges
- [x] **Task #15: Commission Tab**
    - [x] Implement calculation grid with role-based visibility
    - [x] Add admin override capability and actual payout tracking
- [x] **Task #16: Timeline Tab**
    - [x] Implement horizontal T1-T5 bar with duration labels
    - [x] Add admin backdating capability with validation

## Phase 5: Integration & Polish
- [x] **Task #20: E2E Testing & Polish**
    - [x] Verify full project lifecycle for all 3 roles
    - [x] Add skeleton loading states and error boundaries
    - [x] Ensure responsive design on tablet/desktop
    - [x] Final UI/UX review against mockup

## Phase 6: Maintenance & Technical Debt (Pending)
- [ ] **Task #21: Resolve TypeScript Schema Errors**
    - [ ] Run `npx convex dev` to generate `convex/_generated/api.d.ts`
    - [ ] Remove `// @ts-ignore` markers once types are available
    - [ ] Fix any remaining type mismatches in project and document objects
- [ ] **Task #22: Final Code Cleanup**
    - [ ] Remove unused imports identified in build logs
    - [ ] Standardize `any` types to strict interfaces once schema types exist
    - [ ] Audit all console logs and debug mutations
