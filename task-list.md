# Task List: Mockup & PRD Alignment

## 1. Stage & Status Alignment
- [x] **Update `utils.js` Badges:**
    - [x] Rename `Qualified` to `WIP` in `getStageBadge`.
    - [x] Rename `Decision` to `FOL` in `getStageBadge`.
    - [x] Update `getStatusBadge` project statuses: `Active`, `On Hold`, `Open`, `Disbursed` (remove `Closed Won`/`Lost`).
    - [x] Ensure colors match PRD (Green for Active, Amber for On Hold, etc.).
- [x] **Update `app.js` Constants:**
    - [x] Sync `STAGES` and `STATUS` with PRD.
    - [x] Sync internal `utils` with `utils.js`.

## 2. Dashboard UI (PRD Section 5.4.2)
- [x] **Row 1:**
    - [x] Add **Dashboard Greeting** widget.
    - [x] Update **YTD Widget** (Case count + total disbursed).
    - [x] Update **Active Widget** (Count + total value).
    - [x] Add **Active Profile Widget** (Land vs Building breakdown).
- [x] **Row 2:**
    - [x] Add **Avg. Milestone Durations** widget.
- [x] **Row 3:**
    - [x] Add **Referral Agencies** widget (replace "Pending Actions" or rearrange).
- [x] Ensure all currency uses "AED X.XXM" format.

## 3. Project Detail & Documents
- [x] **Borrower Type Logic:**
    - [x] Implement conditional visibility for Section B and D2 based on `borrowerType` in `renderDocs`.
    - [x] Implement conditional visibility in `renderDocumentReview` workspace.
- [x] **Interactive Modals:**
    - [x] Replace `prompt()` with `App.showModal` for FOL Notes.
    - [x] Replace `prompt()` with `App.showModal` for Closed Outcome.
    - [x] Add `App.showModal` for **On-Hold Reason** when status changes to On-Hold.
- [x] **Auto-Milestones:**
    - [x] Implement auto-stamping of `docsCompletedAt` when all required documents are verified in the workspace.

## 4. Document Config
- [x] Ensure `app.js` uses the latest 29 slots from `documentConfig.js` (or sync them).

## 5. Testing
- [x] Verify UI with `agent-browser`.
- [x] Check Kanban drag-and-drop rules (forward only, disbursed -> closed).
