# Task List 01: Stage, Status, and Currency Updates

**Date:** 2026-02-10
**Purpose:** Update HTML mockup to match revised PRD requirements with 7 stages, 4 statuses, and million-format currency display

---

## Summary of Changes

### Stages (6 → 7)
| Old Stage | New Stage | Notes |
|-----------|-----------|-------|
| Lead | New | Renamed |
| Docs Collection | WIP | Renamed (Work in Progress) |
| — | **Docs Completed** | **NEW STAGE** between WIP and Submitted |
| Submitted to Bank | Submitted | Renamed |
| Decision | FOL | Renamed (Facility Offer Letter) + add notes field |
| Disbursement | Disbursed | Renamed |
| Closed | Closed | No change |

### Statuses (3 → 4)
| Old Status | New Status | Rules |
|------------|------------|-------|
| Open | Open | Only for "New" stage |
| — | **Active** | **NEW** — Default for WIP, Docs Completed, Submitted, FOL stages |
| On-Hold | On-Hold | Can be manually set for WIP-FOL stages, requires reason |
| Closed | — | Removed as status (Closed is now just a stage) |
| — | **Disbursed** | **NEW** — Auto-set when project reaches "Disbursed" stage |

### Currency Display
- All amounts to be formatted in **millions** (e.g., "AED 2.5M" for 2,500,000)

### Movement Rules
- Only "Open" OR "Active" status projects can move between stages
- "On-Hold" projects must first be changed to "Active" before dragging

---

## Phase 1: Data Model Updates

### 1.1 Update `data.js` — Stage Enum Values
**File:** `/html/assets/js/data.js`

- [x] Update all project stage values:
  - `"lead"` → `"new"`
  - `"docs_collection"` → `"wip"`
  - Add projects with `"docs_completed"` stage
  - `"submitted"` stays the same
  - `"decision"` → `"fol"`
  - `"disbursement"` → `"disbursed"`
  - `"closed"` stays the same

### 1.2 Update `data.js` — Status Enum Values
- [x] Update all project status values:
  - Projects in "new" stage → `status: "open"`
  - Projects in "wip", "docs_completed", "submitted", "fol" → `status: "active"`
  - Projects in "disbursed" stage → `status: "disbursed"`
  - Keep some projects as `status: "on_hold"` for testing
  - Remove `status: "closed"` (use `closedOutcome` instead when stage is "closed")

### 1.3 Update `data.js` — Add New Fields
- [x] Add `onHoldReason` field to projects with `status: "on_hold"` (string, required)
- [x] Add `folNotes` field to projects in "fol" or later stages (string, optional)
- [x] Update milestone timestamps:
  - Add `wipStartedAt` (when project moves to WIP)
  - Keep `docsCompletedAt` (when project moves to Docs Completed)
  - Keep `submittedAt`
  - Rename `decisionAt` → `folAt`
  - Keep `disbursedAt`
  - Add `closedAt` (when project moves to Closed)

### 1.4 Update `projectDetails` in `data.js`
- [x] Update timeline milestones to reflect new T1-T5 structure:
  - T1: _creationTime → wipStartedAt
  - T2: wipStartedAt → docsCompletedAt
  - T3: docsCompletedAt → submittedAt
  - T4: submittedAt → folAt
  - T5: folAt → disbursedAt

---

## Phase 2: Currency Formatting

### 2.1 Update `utils.js` — formatCurrency()
**File:** `/html/assets/js/utils.js`

- [x] Modify `formatCurrency()` function to format in millions:
  ```javascript
  export function formatCurrency(value) {
    if (!value) return 'AED 0.00M';
    const millions = value / 1000000;
    return `AED ${millions.toFixed(2)}M`;
  }
  ```

### 2.2 Test Currency Display
- [x] Verify currency display in:
  - Kanban cards
  - Project detail page (loan amount)
  - Projects list table
  - Dashboard analytics
  - New project modal
  - Commission calculations

---

## Phase 3: Stage Configuration Updates

### 3.1 Update Stage Constants in `main.js`
**File:** `/html/assets/js/main.js`

- [x] Find all stage constant definitions and update:
  ```javascript
  const STAGES = {
    NEW: 'new',              // was 'lead'
    WIP: 'wip',              // was 'docs_collection'
    DOCS_COMPLETED: 'docs_completed',  // NEW
    SUBMITTED: 'submitted',
    FOL: 'fol',              // was 'decision'
    DISBURSED: 'disbursed',  // was 'disbursement'
    CLOSED: 'closed'
  };

  const STAGE_LABELS = {
    new: 'New',
    wip: 'WIP',
    docs_completed: 'Docs Completed',
    submitted: 'Submitted',
    fol: 'FOL',
    disbursed: 'Disbursed',
    closed: 'Closed'
  };
  ```

### 3.2 Update Status Constants
- [x] Update status constants:
  ```javascript
  const STATUSES = {
    OPEN: 'open',
    ACTIVE: 'active',        // NEW
    ON_HOLD: 'on_hold',
    DISBURSED: 'disbursed'   // NEW
  };

  const STATUS_LABELS = {
    open: 'Open',
    active: 'Active',
    on_hold: 'On-Hold',
    disbursed: 'Disbursed'
  };
  ```

---

## Phase 4: Kanban Board Updates

### 4.1 Update Kanban Column Rendering
**File:** `/html/assets/js/main.js` → `renderProjectsKanban()`

- [x] Add 7th column for "Docs Completed" stage
- [x] Update column headers to new stage labels (New, WIP, Docs Completed, Submitted, FOL, Disbursed, Closed)
- [x] Update column data attributes to new stage values

### 4.2 Update Kanban Card Rendering
- [x] Update status badge colors:
  ```javascript
  function getStatusBadgeClass(status) {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'on_hold': return 'bg-amber-100 text-amber-700';
      case 'disbursed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
  ```
- [x] Update status badge text to display new status labels

### 4.3 Update Drag-and-Drop Rules
**File:** `/html/assets/js/main.js` → `initProjectsKanban()`

- [x] Modify drag start handler to check for "open" OR "active" status:
  ```javascript
  if (project.status !== 'open' && project.status !== 'active') {
    showToast('Cannot move projects that are On-Hold or Disbursed', 'error');
    return;
  }
  ```

- [x] Add visual feedback for locked cards (on_hold, disbursed):
  ```javascript
  if (project.status === 'on_hold' || project.status === 'disbursed') {
    card.classList.add('opacity-60', 'cursor-not-allowed');
    card.setAttribute('draggable', 'false');
  }
  ```

- [x] Update forward-only validation to include new stage order:
  ```javascript
  const stageOrder = ['new', 'wip', 'docs_completed', 'submitted', 'fol', 'disbursed', 'closed'];
  ```

### 4.4 Add FOL Notes Prompt
- [x] When dropping to "fol" column, prompt for FOL notes:
  ```javascript
  if (newStage === 'fol' && !project.folNotes) {
    const folNotes = prompt('Enter bank conditions/requirements (FOL Notes):');
    if (folNotes) {
      project.folNotes = folNotes;
    }
  }
  ```

### 4.5 Auto-Set Status on Stage Change
- [x] When moving to "wip" from "new", set status to "active"
- [x] When moving to "disbursed" stage, automatically set status to "disbursed":
  ```javascript
  if (newStage === 'disbursed') {
    project.status = 'disbursed';
  }
  ```

### 4.6 Update Milestone Auto-Stamping
- [x] Auto-set milestone timestamps on stage transitions:
  ```javascript
  switch(newStage) {
    case 'wip':
      if (!project.wipStartedAt) project.wipStartedAt = Date.now();
      break;
    case 'docs_completed':
      if (!project.docsCompletedAt) project.docsCompletedAt = Date.now();
      break;
    case 'submitted':
      if (!project.submittedAt) project.submittedAt = Date.now();
      break;
    case 'fol':
      if (!project.folAt) project.folAt = Date.now();
      break;
    case 'disbursed':
      if (!project.disbursedAt) project.disbursedAt = Date.now();
      break;
    case 'closed':
      if (!project.closedAt) project.closedAt = Date.now();
      break;
  }
  ```

---

## Phase 5: Project Detail Page Updates

### 5.1 Update Status Control Buttons
**File:** `/html/assets/js/main.js` → `renderProjectDetail()`

- [x] Update "Put On Hold" button to prompt for reason:
  ```javascript
  const reason = prompt('Please enter reason for putting project on hold:');
  if (reason && reason.trim()) {
    project.status = 'on_hold';
    project.onHoldReason = reason;
    // Log and re-render
  }
  ```

- [x] Change "Reopen" button to "Activate" button (when status is on_hold):
  ```javascript
  <button class="activate-btn">Activate</button>
  ```

- [x] Update activation logic:
  ```javascript
  project.status = 'active';
  delete project.onHoldReason; // or keep for history
  ```

### 5.2 Display On-Hold Reason
- [x] In project detail overview, show on-hold reason when status is "on_hold":
  ```html
  ${project.status === 'on_hold' ? `
    <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-4">
      <h4 class="font-semibold text-amber-900 mb-2">On-Hold Reason:</h4>
      <p class="text-amber-800">${project.onHoldReason}</p>
    </div>
  ` : ''}
  ```

### 5.3 Display FOL Notes
- [x] In project detail overview, show FOL notes when stage is "fol" or later:
  ```html
  ${project.folNotes ? `
    <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-4">
      <h4 class="font-semibold text-blue-900 mb-2">FOL Notes (Bank Conditions):</h4>
      <p class="text-blue-800">${project.folNotes}</p>
    </div>
  ` : ''}
  ```

### 5.4 Update Timeline Display
- [x] Update timeline section to show T1-T5 milestones:
  - T1: Creation → WIP Started
  - T2: WIP Started → Docs Completed
  - T3: Docs Completed → Submitted
  - T4: Submitted → FOL
  - T5: FOL → Disbursed

- [x] Update timeline calculation logic:
  ```javascript
  function calculateTimeline(project) {
    return {
      t1: calculateDuration(project._creationTime, project.wipStartedAt),
      t2: calculateDuration(project.wipStartedAt, project.docsCompletedAt),
      t3: calculateDuration(project.docsCompletedAt, project.submittedAt),
      t4: calculateDuration(project.submittedAt, project.folAt),
      t5: calculateDuration(project.folAt, project.disbursedAt)
    };
  }
  ```

### 5.5 Update Commission Tab Visibility
- [x] Change visibility condition from "disbursement" to "disbursed":
  ```javascript
  const showCommissionTab = ['disbursed', 'closed'].includes(project.stage);
  ```

---

## Phase 6: Projects List View Updates

### 6.1 Update Table Column Display
**File:** `/html/assets/js/main.js` → `renderProjectsList()`

- [x] Update stage column to display new stage labels
- [x] Update status column to display new status labels with correct badge colors
- [x] Update loan amount column to display in millions format

### 6.2 Update Filter Dropdowns
- [x] Update stage filter dropdown options:
  ```html
  <option value="new">New</option>
  <option value="wip">WIP</option>
  <option value="docs_completed">Docs Completed</option>
  <option value="submitted">Submitted</option>
  <option value="fol">FOL</option>
  <option value="disbursed">Disbursed</option>
  <option value="closed">Closed</option>
  ```

- [x] Update status filter dropdown options:
  ```html
  <option value="open">Open</option>
  <option value="active">Active</option>
  <option value="on_hold">On-Hold</option>
  <option value="disbursed">Disbursed</option>
  ```

---

## Phase 7: Dashboard Updates

### 7.1 Update Analytics Display
**File:** `/html/assets/js/main.js` → `renderDashboard()`

- [x] Update projects by stage chart to show 7 stages
- [x] Update T-metrics display to show T1-T5 (instead of T1-T4)
- [x] Update status breakdown to show 4 statuses (Open, Active, On-Hold, Disbursed)
- [x] Format all loan amounts in millions

---

## Phase 8: New Project Modal Updates

### 8.1 Update Default Values
**File:** `/html/assets/js/main.js` → `initNewProjectModal()`

- [x] Set default stage to "new" (was "lead")
- [x] Set default status to "open"
- [x] Ensure loan amount input accepts values that will be displayed in millions

---

## Phase 9: Agents Page Updates

### 9.1 Update Pipeline Display
**File:** `/html/assets/js/main.js` → `renderAgents()`

- [x] Format pipeline totals in millions
- [x] Update active project count calculation (count projects with status "active" or "open")

---

## Phase 10: Settings Page Updates

### 10.1 Update Commission Rate Display
- [x] Ensure commission calculations still work with million-formatted amounts
- [x] Display expected commission in millions

---

## Phase 11: Audit Log Updates

### 11.1 Update Log Messages
**File:** `/html/assets/js/data.js` and `/html/assets/js/main.js`

- [x] Update log messages to reference new stage names:
  - "Lead" → "New"
  - "Docs Collection" → "WIP"
  - "Decision" → "FOL"
  - "Disbursement" → "Disbursed"

- [x] Add log entries for:
  - Status change to "on_hold" (include reason)
  - Status change to "active"
  - FOL notes added/updated

---

## Phase 12: CSS Updates

### 12.1 Update Status Badge Styles
**File:** `/html/assets/css/custom.css`

- [x] Ensure proper styling for new status badges (open, active, on_hold, disbursed)
- [x] Add styling for FOL notes section
- [x] Add styling for on-hold reason display

---

## Phase 13: Testing & Validation

### 13.1 Data Integrity Tests
- [x] Verify all projects have valid stage values (new, wip, docs_completed, submitted, fol, disbursed, closed)
- [x] Verify all projects have valid status values (open, active, on_hold, disbursed)
- [x] Verify projects in "new" stage have status "open"
- [x] Verify projects in "disbursed" stage have status "disbursed"
- [x] Verify projects with status "on_hold" have onHoldReason field

### 13.2 Currency Display Tests
- [x] Check Kanban cards show amounts in millions (e.g., "AED 2.5M")
- [x] Check project detail shows amounts in millions
- [x] Check projects list shows amounts in millions
- [x] Check dashboard shows amounts in millions
- [x] Check commission calculations work correctly with million display

### 13.3 Kanban Drag Tests
- [x] Test dragging project with status "open" (should work)
- [x] Test dragging project with status "active" (should work)
- [x] Test dragging project with status "on_hold" (should be blocked with error message)
- [x] Test dragging project with status "disbursed" (should be blocked)
- [x] Test forward-only validation with 7 stages
- [x] Test FOL notes prompt when dropping to FOL column
- [x] Test auto-status change to "disbursed" when moving to Disbursed stage

### 13.4 Status Control Tests
- [x] Test "Put On Hold" button prompts for reason
- [x] Test on-hold reason is displayed
- [x] Test "Activate" button changes status from "on_hold" to "active"
- [x] Test projects with "on_hold" status cannot be dragged until activated

### 13.5 Timeline Tests
- [x] Verify T1-T5 milestones display correctly
- [x] Verify milestone timestamps are auto-set on stage transitions
- [x] Verify chronological order validation: wipStartedAt ≤ docsCompletedAt ≤ submittedAt ≤ folAt ≤ disbursedAt ≤ closedAt

### 13.6 Visual Tests
- [x] Check all 7 Kanban columns display correctly
- [x] Check status badge colors are correct (green for open/active, amber for on-hold, blue for disbursed)
- [x] Check FOL notes section displays properly
- [x] Check on-hold reason section displays properly
- [x] Check locked cards have proper visual treatment (opacity, cursor)

### 13.7 Filter Tests
- [x] Test stage filter dropdown with 7 options
- [x] Test status filter dropdown with 4 options
- [x] Test filtering by each stage
- [x] Test filtering by each status

### 13.8 Role-Based Tests
- [x] Test Admin can put projects on hold
- [x] Test Admin can activate on-hold projects
- [x] Test Admin can add FOL notes
- [x] Test Agent can see their own projects only
- [x] Test Viewer cannot change status

---

## Phase 14: Documentation Updates

### 14.1 Update README (if exists)
- [x] Document new 7-stage process
- [x] Document new 4-status system
- [x] Document currency display in millions

### 14.2 Update Inline Comments
- [x] Update comments in code that reference old stage names
- [x] Update comments that reference old status values
- [x] Add comments explaining FOL notes and on-hold reason fields

---

## Implementation Notes

### Migration Strategy
1. **Phase 1-2 first** (data model + currency) — foundational changes
2. **Phase 3-4 next** (stage config + Kanban) — core UI changes
3. **Phase 5-10** (detail pages, lists, forms) — secondary UI updates
4. **Phase 11-12** (logs, CSS) — polish
5. **Phase 13** (testing) — validation
6. **Phase 14** (docs) — documentation

### Testing After Each Phase
- Serve the mockup with `cd html && npx serve .`
- Open `index.html` in browser
- Test affected functionality
- Check console for errors

### Key Files to Modify
1. `/html/assets/js/data.js` — Mock data (stages, statuses, new fields)
2. `/html/assets/js/utils.js` — formatCurrency() function
3. `/html/assets/js/main.js` — All render and init functions
4. `/html/assets/css/custom.css` — Status badge styles

### Breaking Changes to Watch For
- Any hardcoded stage checks (e.g., `if (stage === 'lead')`) must be updated
- Any hardcoded status checks must be updated
- Currency calculations may need adjustment if they depend on exact values
- Filter logic needs to handle new stage/status values

---

## Completion Checklist

- [x] All Phase 1 tasks completed (Data Model)
- [x] All Phase 2 tasks completed (Currency)
- [x] All Phase 3 tasks completed (Stage Config)
- [x] All Phase 4 tasks completed (Kanban)
- [x] All Phase 5 tasks completed (Project Detail)
- [x] All Phase 6 tasks completed (Projects List)
- [x] All Phase 7 tasks completed (Dashboard)
- [x] All Phase 8 tasks completed (New Project Modal)
- [x] All Phase 9 tasks completed (Agents Page)
- [x] All Phase 10 tasks completed (Settings)
- [x] All Phase 11 tasks completed (Audit Log)
- [x] All Phase 12 tasks completed (CSS)
- [x] All Phase 13 tasks completed (Testing)
- [x] All Phase 14 tasks completed (Documentation)
- [x] No console errors when running mockup
- [x] All 7 stages display correctly in Kanban
- [x] All 4 statuses work correctly
- [x] Currency displays in millions throughout
- [x] Drag rules enforce Open/Active only
- [x] FOL notes prompt and display works
- [x] On-hold reason prompt and display works
- [x] Timeline shows T1-T5 correctly

---

## Quick Reference

### Stage Mapping
```
lead → new
docs_collection → wip
[NEW] → docs_completed
submitted → submitted
decision → fol
disbursement → disbursed
closed → closed
```

### Status Mapping
```
open → open (New stage only)
[NEW] → active (WIP-FOL stages)
on_hold → on_hold (requires reason)
closed → [REMOVED]
[NEW] → disbursed (auto-set at Disbursed stage)
```

### New Fields
- `onHoldReason` (string) — Required when status is "on_hold"
- `folNotes` (string) — Bank conditions, set when moved to FOL
- `wipStartedAt` (timestamp) — When project enters WIP stage
- `folAt` (timestamp) — When project enters FOL stage (replaces decisionAt)
- `closedAt` (timestamp) — When project enters Closed stage

### Currency Format
```javascript
// Old: "AED 2,500,000"
// New: "AED 2.5M"
formatCurrency(2500000) // → "AED 2.50M"
```
