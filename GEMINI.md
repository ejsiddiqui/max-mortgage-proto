# Gemini CLI — Mockup Completion Status & Plan

This document tracks the progress of aligning the HTML mockup in `/html` with the authoritative Product Requirements Document (`prd.md`).

## 🎯 Objective
Achieve 100% compatibility between the mockup and the PRD, focusing on stages, statuses, currency formatting, and document requirements.

## 📊 Current Status

### 1. Stage & Status Alignment
- [x] **Update `STAGES` Constants:** Renamed `QUALIFIED` to `WIP` and `DECISION` to `FOL`. Added `CLOSED`.
- [x] **Update `STATUS` Constants:** Renamed `CLOSED_WON`/`CLOSED_LOST` to `DISBURSED`. Added `OPEN` and `ACTIVE`.
- [ ] **UI Refresh:** Update badges and labels in `utils.js` and `app.js` renderers.
- [ ] **Kanban Columns:** Update Kanban board to reflect 7 stages.

### 2. Currency Formatting (AED Millions)
- [ ] **Utility Update:** Update `formatCurrency` in `utils.js` and `app.js` to format in AED and Millions (e.g., "AED 2.50M").
- [ ] **UI Update:** Apply new formatting to KPI cards, Kanban cards, and project lists.

### 3. Document Requirements (29 Slots)
- [x] **Config File:** Created `html/assets/js/documentConfig.js` with all 29 PRD-compliant slots.
- [ ] **Integration:** Update `app.js` and `project-documents.html` to use the new configuration for rendering checklists and calculating progress.
- [ ] **Borrower Type Logic:** Implement conditional visibility for Section B and D2 based on `borrowerType`.

### 4. Interactive Features
- [ ] **FOL Notes:** Prompt for notes when moving a project to the FOL stage.
- [ ] **On-Hold Reason:** Prompt for reason when changing status to On-Hold.
- [ ] **Auto-Milestones:** Implement auto-stamping of `docsCompletedAt` when required docs are verified.

## 🚀 Implementation Plan

### Phase 1: Core Data & Utilities (High Priority)
1.  **Sync `app.js` Utilities:** Port the million-format currency logic to both `utils.js` and the internal `utils` object in `app.js`.
2.  **Badge Consistency:** Update `getStatusBadge` and `getStageBadge` to use PRD colors and labels.

### Phase 2: UI Components
1.  **Kanban Columns:** Modify `renderKanbanBoard` to iterate over all 7 stages.
2.  **Project Detail Tabs:** Update `renderProjectDetail` to show the Timeline tab with T1-T5 milestones.

### Phase 3: Document Workspace
1.  **Config-Driven Rendering:** Replace hardcoded document groups in `app.js` with dynamic rendering from `DOCUMENT_CONFIG`.
2.  **Status Lifecycle:** Ensure "Verify" and "Reject" buttons update the status correctly according to the PRD.

### Phase 4: Final Polish
1.  **Audit Log:** Ensure actions like "Stage Changed" and "Status Changed" are logged with the new terminology.
2.  **Role Gating:** Verify that Admin/Agent/Viewer permissions are respected in the UI (e.g., Commission tab visibility).

---
*Created on 2026-02-11 by Gemini CLI Agent*
