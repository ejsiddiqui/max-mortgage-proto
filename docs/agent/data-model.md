# Data Model

## Key Data Model Concepts

**Projects:**
- 7 stages: New → WIP → Docs Completed → Submitted → FOL → Disbursed → Closed
- 4 statuses: Open (New stage only), Active (WIP-FOL, editable), On-Hold (locked), Disbursed (auto-set)
- Forward-only stage progression enforced in Kanban drag
- Only "Open" or "Active" status projects can move between stages
- Milestone timestamps: `wipStartedAt`, `docsCompletedAt`, `submittedAt`, `folAt`, `disbursedAt`, `closedAt`
- Auto-generated project code (MM-XXXX) and project name (code + client + business type)
- Currency displayed in millions: "AED 2.5M" for 2,500,000

**Documents:**
- 29 fixed document slots across 5 sections (A-E)
- Section B (Company Documents) + D2 hidden for Salaried borrowers
- 4 statuses: Missing → Uploaded → Verified/Rejected
- Multi-file support for most slots (some are PDF-only single file)
- Ad-hoc "Others" section for user-defined documents

**Roles & Permissions:**
- **Admin:** Full access, manages master tables, can backdate milestones, edits commissions
- **Agent:** Sees only assigned projects, can upload docs, view Final Commission (read-only)
- **Viewer:** Read-only all projects, can verify/reject documents

## Convex Schema (Production Data Model)

### Core Tables

**projects** — Main project entity
- `projectCode` (string, auto-generated MM-0001 format)
- `projectName` (string, auto: "{code} - {clientName} - {businessType}")
- `clientName`, `clientEmail`, `clientPhone`
- `borrowerType`: "salaried" | "self_employed"
- `businessType`: "buyout" | "equity_release"
- `bankId`, `referralCompanyId`, `assignedAgentId` (refs)
- `loanAmount`, `property`, `propertyValue` (amounts displayed in millions)
- `stage`: "new" | "wip" | "docs_completed" | "submitted" | "fol" | "disbursed" | "closed"
- `status`: "open" | "active" | "on_hold" | "disbursed"
- `closedOutcome`: "approved" | "rejected" | "cancelled" | "disbursed" (required when stage=closed)
- `onHoldReason`: string (required when status=on_hold)
- `folNotes`: string (bank conditions, set when moved to FOL stage)
- Milestone timestamps: `wipStartedAt`, `docsCompletedAt`, `submittedAt`, `folAt`, `disbursedAt`, `closedAt` (nullable)
- Commission rate overrides: `bankCommissionRate`, `agentCommissionRate`, `referralCommissionRate` (decimals)
- Commission fields: `expectedCommission`, `finalCommission`, `agentPayoutAmount`, `referralPayoutAmount`
- Loan details: `ltv`, `interestRate`, `termYears`, `downPayment`, `monthlyPayment`
- `notes`, `createdBy`

**documents** — File instances
- `projectId` (ref), `section` (borrower|company|asset|bank|lease|other)
- `documentCode` (e.g., "A1", "B2"), `label`
- `fileIds`: Id<"_storage">[] (array for multi-file support)
- `status`: "missing" | "uploaded" | "verified" | "rejected"
- `verifiedBy`, `rejectionReason`, `uploadedBy`

**Master Tables:**
- **banks** — `name`, `commissionRate`, `isActive`
- **referralCompanies** — `name`, `contactPerson`, `email`, `phone`, `commissionRate`, `isActive`
- **agentProfiles** — `userId` (ref), `commissionRate`, `isActive`

**auditLog** (v1: append-only, no UI)
- `projectId` (nullable), `action`, `performedBy`, `details` (JSON string), `timestamp`
- Log: stage changes, status changes, document actions (upload/verify/reject), commission edits

## Data Integrity Rules

- Milestone chronological order: `docsCompletedAt ≤ submittedAt ≤ decisionAt ≤ disbursedAt`
- Only Admins can backdate milestones (via edit modal)
- Project code auto-generation must handle race conditions
- Commission rates stored as decimals (0.015 = 1.5%, 0.7 = 70%), displayed as percentages

## RBAC Enforcement

- Agent queries filtered by `assignedAgentId`
- Viewer has write restrictions on all mutations except document verify/reject
- Commission tab hidden before Disbursement stage
- Commission tab hidden entirely for Viewer role
- "Other Docs" section visible only to project owner (Agent) or Admin
