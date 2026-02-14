# Task List 02: Core Features & UI Refinement

**Date:** 2026-02-14
**Status:** Completed
**Reference:** `docs/implementation/task-list-production-master.md`

---

## 🎯 Objectives
Complete the core functionality of the production application, focusing on document management, dashboard analytics, and refining the project detail experience. All tasks in this phase have been successfully implemented and verified.

---

## 🏗️ Phase 1: Backend Infrastructure

### 1.1 Document Engine Backend (#13)
- [x] Implement `documents:list` query for a project.
- [x] Implement `documents:upload` mutation (integrating with Convex storage).
- [x] Implement `documents:verify` and `documents:reject` mutations for admins.
- [x] Add auto-completion logic (e.g., set stage to "docs_completed" if all required docs are verified).
- [x] **Verify:** Upload stores files, verify/reject works, RBAC enforced.

### 1.2 Audit Log Refinement (#19)
- [x] Ensure all major mutations (stage change, status change, document upload) log to `auditLog`.
- [x] Implement `auditLog:listByProject` query with performer name resolution.
- [x] **Verify:** Entries created for all actions, performer names resolve correctly.

---

## 🎨 Phase 2: UI Implementation

### 2.1 Dashboard Analytics Page (#18)
- [x] Implement all 10 widgets from the PRD (Pipeline Value, Active Apps, etc.).
- [x] Add Charts (Recharts) for "Projects by Stage" and "Monthly Volume". (Note: Charts are represented by Segmented Bar and Stage Breakdown list, following mockup style)
- [x] Ensure AED Million formatting is applied everywhere.
- [x] Implement Agent-specific filtering (Agents see only their own data).
- [x] **Verify:** Widgets render, formatting correct, data matches seed.

### 2.2 New Project Creation Form (#9)
- [x] Build multi-step or single-page form for project creation.
- [x] Integrate with `banks` and `users` (agents) master tables for dropdowns.
- [x] Implement auto-code generation (e.g., MM-0004).
- [x] **Verify:** Validates inputs, redirects to detail page on success.

### 2.3 Project Detail: Documents Tab (#14)
- [x] Render 29 document slots based on `borrowerType` (Salaried vs. Self-Employed).
- [x] Implement file upload interface (drag & drop or click to upload).
- [x] Implement Admin verification/rejection UI.
- [x] **Verify:** Correct slots shown, upload/verify flow works.

### 2.4 Agents Page Refinement (#17)
- [x] Add the "Table View" toggle for agent performance.
- [x] Ensure metrics (Active, Closed, Pipeline) are calculated dynamically from project data.
- [x] **Verify:** Metrics match project list, toggle works.

### 2.5 Settings Page UI (#7)
- [x] Full CRUD for Banks, Referral Companies, and Users.
- [x] Confirmation modals for delete/deactivate.
- [x] Empty states and loading skeletons for all tables.
- [x] Role-gated tab access (Admin only for master tables).
- [x] **Verify:** All CRUD operations persist, RBAC enforced.

---

## 🛠️ Phase 3: Specialized Tabs & Logic

### 3.1 Project Detail: Commission Tab (#15)
- [x] Implement role-based visibility (Hidden for non-admins before Disbursed stage).
- [x] Add interactive calculators for Bank, Agent, and Referral shares.
- [x] **Verify:** Calculations accurate, visibility rules enforced.

### 3.2 Project Detail: Timeline Tab (#16)
- [x] Render T1-T5 milestones with duration calculations.
- [x] Implement Admin-only "Override" feature for milestone dates.
- [x] **Verify:** Durations correct, overrides persist.

---

## ✅ Progress Tracking
- [x] Agent Name reflecting on Kanban project cards.
- [x] Agent Name reflecting on Project List page.
- [x] Document upload functionality.
- [x] Dashboard charts and widgets.
- [x] Commission tab visibility & logic.
- [x] Timeline T1-T5 with Admin edit.
- [x] Agent Page Table View.
