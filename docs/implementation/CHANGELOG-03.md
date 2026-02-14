# Changelog 03: Core Modules & Settings

**Date:** 2026-02-15
**Phase:** 2 - Production Implementation (Completed)

---

## 🚀 Major Features

### 1. Document Engine Backend & UI
- **Backend:** Implemented `upload`, `verify`, `reject`, `removeFile`, and `deleteDocument` mutations with full Convex storage integration.
- **UI:** Enhanced `DocumentsTab.tsx` with multi-file support, file type validation, and sanitize filename logic.
- **"Others" Section:** Added support for ad-hoc document uploads with custom labels.
- **Progress Tracking:** Real-time progress bar calculation based on borrower type (Salaried vs Self-Employed).

### 2. Dashboard Analytics
- **Dynamic Data:** Implemented `getDashboardStats` query to aggregate data for 10+ widgets in a single efficient call.
- **Widgets:** Fully wired up Active Pipeline, YTD Performance, Portfolio Mix, and Stage Breakdown widgets.
- **Processing Times:** Added T1-T5 milestone duration calculations based on project timestamps.

### 3. Settings Page CRUD
- **Banks Tab:** Full Add/Edit/Delete/Toggle functionality with validation.
- **Referrals Tab:** Full CRUD for referral partners.
- **Users Tab:** User management with role assignment (Admin/Agent/Viewer) and commission rate configuration.
- **UX:** Added confirmation modals for destructive actions and loading skeletons for all tables.

### 4. Project Detail & Lifecycle
- **Controls:** Wired up "Close Project" and "Edit Project" modals.
- **Status Logic:** Implemented "On Hold" logic with reason tracking and `pausedDays` calculation for accurate duration metrics.
- **Commission Tab:** Enforced strict RBAC visibility (Agents see only their payout, Admins see full breakdown).
- **Timeline Tab:** Added Admin-only milestone date editing.

### 5. Kanban & List Views
- **Filters:** Implemented Status, Agent, Bank, and Borrower Type filters across both views.
- **Drag & Drop:** Enforced "Forward-only" drag rules and locked "On Hold" cards.

---

## 🛠️ Technical Improvements

- **Quality Assurance:** Added `npx tsc --noEmit` and `npx convex dev --typecheck` to mandatory verification workflow.
- **Type Safety:** Resolved all TypeScript errors in Convex functions and React components.
- **Sanitization:** Added filename sanitization to prevent storage issues with special characters.
- **Loading States:** Replaced raw text with ShadCN `Skeleton` components across all major pages.

---

## 🐛 Bug Fixes

- Fixed `calculateReferralShare` missing export in `utils.ts`.
- Fixed duplicate `changeStage` declaration in `OverviewTab.tsx`.
- Corrected invalid status comparison (`status !== "closed"`) in project queries.
- Restored missing `requireAdmin` import in `documents.ts`.

---

## 📝 Next Steps (Phase 3)

- **Global Search:** Implement command-k style global search.
- **Dashboard Charts:** Replace CSS bars with Recharts for trends.
- **Audit Log UI:** Dedicated page for system-wide activity.
- **End-to-End Testing:** Full lifecycle walkthrough.
