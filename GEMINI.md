# Gemini CLI — Project Status & Implementation Plan

Read `/docs/agent/important-guidelines.md` before starting any tasks.

## 🎯 Objective
Implement Max Mortgage production stack using Convex + React + ShadCN, adhering to the 100% compatible mockup in `/html` and authoritative PRD in `prd.md`.

## 📊 Current Status

### 1. Mockup Phase (COMPLETED)
- [x] **Stage & Status Alignment:** All 7 stages and 4 statuses synced across constants and UI badges.
- [x] **Currency Formatting:** AED Millions format ("AED 2.50M") applied to all financial displays.
- [x] **Document Requirements:** 29 PRD-compliant slots implemented with borrower-type conditional visibility.
- [x] **Interactive Features:** Branded modals for FOL Notes, Closed Outcome, and On-Hold Reason.
- [x] **Dashboard UI:** 3-row layout with all 10 PRD widgets implemented.
- [x] **Timeline:** T1-T5 milestone durations implemented on project detail.

### 2. Production Implementation (IN PROGRESS)
- [x] **Backend Infrastructure:** Document engine, audit logs, and project lifecycle mutations fully implemented.
- [x] **Dashboard:** 100% dynamic dashboard with real-time stats and processing time averages.
- [x] **Document Management:** Multi-file upload, verification, rejection, and "Others" section implemented.
- [x] **Project Details:** Overview, Documents, Commission, and Timeline tabs fully functional with RBAC.
- [x] **Agents Page:** Grid and Table views with dynamic performance metrics.
- [x] **Settings Page:** Full CRUD for Banks, Referrals, and Users with confirmation modals.
- [x] **RBAC:** Consistent enforcement of Admin, Agent, and Viewer roles across UI and Backend.
- [x] **Master Task List:** `docs/implementation/task-list-production-master.md` tracked via `task-list-02.md`.

## 🛡️ Quality & Safety Rules (MANDATORY)
1. **Verification Before Finalizing:** After any code modification, especially in shared utilities or schemas, run:
   - `npx tsc --noEmit` (Frontend check)
   - `npx convex dev --once --typecheck enable` (Backend check)
2. **Import Integrity:** Never remove existing exports from `src/lib/utils.ts` or other shared files without verifying all call sites.
3. **RBAC Checks:** Always ensure `useCurrentUser` is used for UI gating and `requireRole/requireAdmin` for backend protection.

## 🚀 Production Implementation Plan

### Phase 1: Foundation & Core (Tasks #1 - #5)
1. Initialize Convex + React (Vite) + ShadCN + Tailwind.
2. Integrate Convex Auth with RBAC (Admin, Agent, Viewer).
3. Port shared utilities and document config constants.
4. Deploy Convex schema and seed mock data.

### Phase 2: Backend APIs (Tasks #6, #8, #13, #19)
1. Master Tables CRUD (Banks, Referrals, Users).
2. Project Lifecycle mutations (Stage/Status transitions, Milestones).
3. Document Engine (Upload, Verify, Reject, Storage).
4. Integrated Audit Logging.

### Phase 3: UI Implementation (Tasks #7, #9 - #12, #17, #18)
1. Settings page with gated tabs.
2. Project creation form and inventory lists.
3. Drag-and-drop Kanban board with stage rules.
4. Dashboard analytics with 10 real-time widgets.

### Phase 4: Project Detail Tabs (Tasks #14 - #16)
1. Document checklist with status lifecycle.
2. Commission calculator with role-based visibility.
3. Milestone timeline with duration tracking.

### Phase 5: Integration & Polish (Task #20)
1. End-to-end testing across all roles.
2. Loading states, empty states, and responsive refinement.

---
*Updated on 2026-02-11 by Gemini CLI Agent*