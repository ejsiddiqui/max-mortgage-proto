# Kanban Board Rules (PRD Section 5.1.1)

## Card Display Requirements

- Project code + Client name
- Borrower type badge (Salaried / Self-Employed)
- Bank name
- Loan amount (formatted as AED)
- Assigned agent name
- Status indicator (green=open, amber=on-hold, gray=closed)
- Document completion percentage (small progress bar)
- Days in current stage

## Drag Rules

1. Drag allowed only when `status === "open"` OR `status === "active"` (On-Hold/Disbursed cards locked)
2. Projects with `status === "on_hold"` must first be changed to "active" before dragging
3. Forward-only stage progression (no backward drag, show visual feedback on attempt)
4. Moving to FOL prompts for FOL Notes (bank conditions/requirements)
5. Moving to Disbursed auto-sets status to "disbursed"
6. Moving to Closed prompts for outcome (Approved/Rejected/Cancelled/Disbursed)
7. Dropping to new stage auto-sets corresponding milestone timestamp to `Date.now()`

## Filters (top bar)

- By status (Open / On-Hold / Closed / All)
- By assigned agent
- By bank
- By borrower type
- Search by client name or project code
