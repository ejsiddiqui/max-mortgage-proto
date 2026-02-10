# Production Implementation — Master Task List

**Created:** 2026-02-10
**Project:** Max Mortgage — React + Convex Production App
**Reference:** `prd.md` (business logic), `/html` (UI mockup), `CLAUDE.md` (architecture)

---

## Decisions

| Decision | Choice |
|----------|--------|
| Auth method | Email/Password via Convex Auth |
| Project location | Root level of `max-mortgage-html` repo (alongside `/html`, `/docs`) |
| Convex project | Create new from scratch (`npx convex dev`) |
| Seed data | Full mock data ported from `/html/assets/js/data.js` |
| DnD library | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Forms | `react-hook-form` + `zod` |
| UI components | ShadCN UI + Tailwind CSS |
| Icons | `lucide-react` |
| Charts | Recharts |

---

## Dependency Graph

```
PHASE 1 — Foundation
  #1  Project Setup
       |
       +-------------------+-------------------+
       v                   v                   v
PHASE 2 — Core Infrastructure (3 PARALLEL)
  #2  Auth & RBAC       #4  Utilities        #5  Schema & Seed
       |                   |                   |
       v                   |                   |
PHASE 3 — App Shell        |                   |
  #3  Layout & Navigation  |                   |
       |                   |                   |
       +-------------------+-------------------+
       |
       v
PHASE 4 — Backend APIs (3 PARALLEL)
  #6  Master Tables Backend  <-- #2, #5
  #8  Project CRUD Backend   <-- #2, #5
  #13 Document Engine Backend <-- #2, #4, #5
       |
       v
PHASE 5 — UI Pages (UP TO 8 PARALLEL)
  #7   Settings Page UI        <-- #3, #6
  #9   New Project Form        <-- #3, #6, #8
  #10  Projects List View      <-- #3, #8
  #11  Kanban Board            <-- #3, #4, #8
  #12  Project Detail Overview <-- #3, #4, #8
  #17  Agents Page             <-- #3, #8
  #18  Dashboard Analytics     <-- #3, #4, #8
  #19  Audit Log Backend       <-- #5, #8, #13
       |
       v
PHASE 6 — Project Detail Tabs (3 PARALLEL)
  #14  Documents Tab UI        <-- #12, #13
  #15  Commission Tab          <-- #8, #12
  #16  Timeline Tab            <-- #4, #12
       |
       v
PHASE 7 — Integration
  #20  E2E Testing & Polish    <-- ALL above
```

---

## Parallel Execution Map

| Phase | Tasks | Max Parallel | Notes |
|-------|-------|-------------|-------|
| 1 | #1 | 1 | Must complete first |
| 2 | #2, #4, #5 | **3** | All depend only on #1 |
| 3 | #3 | 1 | Needs #2 (auth context for layout) |
| 4 | #6, #8, #13 | **3** | All backend, independent of each other |
| 5 | #7, #9, #10, #11, #12, #17, #18, #19 | **8** | All UI pages, check individual deps |
| 6 | #14, #15, #16 | **3** | All sub-tabs of Project Detail |
| 7 | #20 | 1 | Depends on everything |

---

## Task Status Tracker

### Phase 1 — Foundation
- [ ] **#1** Project Setup - Initialize Convex + React + ShadCN
  - Deps: None
  - Verify: App runs on localhost, Convex dashboard accessible, design tokens applied

### Phase 2 — Core Infrastructure (parallel)
- [ ] **#2** Auth & RBAC - Convex Auth Integration
  - Deps: #1
  - Verify: Login/logout works, roles persist, test users created
- [ ] **#4** Shared Utilities & Document Config Constants
  - Deps: #1
  - Verify: Unit tests pass for all utilities, doc config exports correctly
- [ ] **#5** Convex Schema & Seed Data
  - Deps: #1
  - Verify: Schema deploys, seed data populates, tables visible in dashboard

### Phase 3 — App Shell
- [ ] **#3** Layout Shell & Navigation
  - Deps: #2
  - Verify: All routes render, sidebar nav per role, route guards work

### Phase 4 — Backend APIs (parallel)
- [ ] **#6** Master Tables Backend - Banks, Referrals, Users
  - Deps: #2, #5
  - Verify: CRUD works via dashboard, role checks enforced, delete validates usage
- [ ] **#8** Project CRUD Backend - Queries & Mutations
  - Deps: #2, #5
  - Verify: CRUD works, agent filtering correct, forward-only stages, milestones auto-set
- [ ] **#13** Document Engine Backend - Upload, Verify, Reject
  - Deps: #2, #4, #5
  - Verify: Upload stores files, verify/reject works, auto-complete triggers, RBAC enforced

### Phase 5 — UI Pages (parallel, check deps)
- [ ] **#7** Settings Page UI - Banks, Referrals, Users Tabs
  - Deps: #3, #6
  - Verify: Full CRUD end-to-end, 3-dot menus, confirmations, toasts, tab gating
- [ ] **#9** New Project Creation Form
  - Deps: #3, #6, #8
  - Verify: Form validates, dropdowns populated, auto-code generated, redirects to detail
- [ ] **#10** Projects List View
  - Deps: #3, #8
  - Verify: Table displays, filters work, pagination works, agent sees own only
- [ ] **#11** Kanban Board View
  - Deps: #3, #4, #8
  - Verify: Drag forward works, backward rejected, on-hold locked, modals appear, real-time
- [ ] **#12** Project Detail - Overview Tab
  - Deps: #3, #4, #8
  - Verify: All data displays, status controls work, edit saves, tab nav works
- [ ] **#17** Agents Page
  - Deps: #3, #8
  - Verify: Cards display metrics, grid/table toggle, filters, agent sees only self
- [ ] **#18** Dashboard Analytics Page
  - Deps: #3, #4, #8
  - Verify: All 10 widgets render, agent data filtered, AED format, stage badges
- [ ] **#19** Audit Log Backend
  - Deps: #5, #8, #13
  - Verify: Entries created for all actions, queries return correct data, RBAC filtering

### Phase 6 — Project Detail Tabs (parallel)
- [ ] **#14** Project Detail - Documents Tab UI
  - Deps: #12, #13
  - Verify: 29 slots display, salaried hides B+D2, upload/verify/reject, auto-complete
- [ ] **#15** Project Detail - Commission Tab
  - Deps: #8, #12
  - Verify: Hidden before Disbursed, role visibility correct, calculations accurate
- [ ] **#16** Project Detail - Timeline Tab
  - Deps: #4, #12
  - Verify: T1-T5 display, durations correct, admin backdate works

### Phase 7 — Integration
- [ ] **#20** End-to-End Testing & Polish
  - Deps: ALL above
  - Verify: Full lifecycle E2E, all 3 roles, loading states, error handling, responsive

---

## Quick Reference

**Start here:** Task #1 (no dependencies)
**Critical path:** #1 → #2 → #3 → #8 → #12 → #14 (longest chain = 6 tasks)
**Biggest parallel batch:** Phase 5 (up to 8 tasks simultaneously)
**Total tasks:** 20
**Estimated phases:** 7

**File references:**
- Detailed task descriptions: `task-list-production-details.md`
- PRD: `../../prd.md`
- Mockup: `../../html/`
- Architecture: `../agent/architecture.md`
