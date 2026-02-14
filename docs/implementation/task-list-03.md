# Task List 03: Search, Visualization & Polish

**Date:** 2026-02-15
**Status:** Planned
**Reference:** `docs/implementation/task-list-production-master.md`

---

## 🎯 Objectives
Elevate the user experience with advanced visualization, global search capabilities, and comprehensive audit trails. Transform static tables into interactive data grids and ensure the system is robust through end-to-end testing.

---

## 🔍 Phase 1: Search & Navigation

### 1.1 Global Search (Command-K)
- [ ] Implement `Cmd+K` / `Ctrl+K` modal.
- [ ] Index Projects, Clients, and Agents for search.
- [ ] Keyboard navigation support.
- [ ] **Verify:** Fast result rendering and correct navigation.

### 1.2 DataTables Upgrade
- [ ] Upgrade Settings tables (Banks, Referrals, Users) to use TShadCN DataTable.
- [ ] Implement client-side sorting (asc/desc).
- [ ] Implement client-side filtering/search within tables.
- [ ] **Verify:** Sorting works on all columns, search filters rows instantly.

---

## 📊 Phase 2: Visualization

### 2.1 Dashboard Charts (Recharts)
- [ ] Replace CSS-based "Portfolio Mix" bar with a Pie Chart.
- [ ] Add "Monthly Volume" Bar Chart (New vs Closed per month).
- [ ] Add "Pipeline Trend" Area Chart (Total Value over time).
- [ ] **Verify:** Charts responsive and reflect live data.

---

## 📜 Phase 3: Audit & History

### 3.1 Audit Log UI
- [ ] Create dedicated `/audit` page (Admin only).
- [ ] Filter by Actor, Action Type, and Date Range.
- [ ] Expandable rows to show JSON details (before/after).
- [ ] **Verify:** All system actions are visible and searchable.

---

## 🧪 Phase 4: Integration & Testing

### 4.1 End-to-End Walkthrough
- [ ] Create a "Golden Path" test project.
- [ ] Move through all stages (New -> Closed).
- [ ] Upload real files, verify, reject, re-upload.
- [ ] Calculate commissions and close project.
- [ ] **Verify:** No console errors, data consistency maintained.

### 4.2 Error Handling & Polish
- [ ] Add Error Boundaries to all main routes.
- [ ] Ensure 404 Page exists and looks good.
- [ ] Final responsive check on mobile/tablet.

---

## ✅ Progress Tracking
- [ ] Global Search.
- [ ] DataTables in Settings.
- [ ] Dashboard Charts.
- [ ] Audit Log Page.
- [ ] E2E Walkthrough.
