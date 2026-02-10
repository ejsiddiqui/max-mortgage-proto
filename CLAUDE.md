# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Max Mortgage is a Lead & Project Management System (MIS) for mortgage brokers. This repository contains a **fully functional HTML/CSS/JS mockup** that serves as the design reference for building the production React + Convex application.

The `/html` directory is a complete prototype with 7 pages, all UI interactions, role-based permissions, and data flows. It demonstrates every feature specified in `prd.md`.

## Quick Start

**Understanding this repository:**
1. **Read `prd.md` first** — The authoritative specification for all business logic, data model, and requirements
2. **Explore `/html` mockup** — The complete UI reference with all pages, interactions, and design patterns
3. **This CLAUDE.md** — Entry point to detailed documentation in `/docs/agent` and `/docs/implementation`

**For mockup modifications:**
- Serve with `cd html && npx serve .` and open `index.html`
- Always `Read` files before `Write` (tool requirement)
- Maintain ES6 module structure, utilities in `utils.js`, document config in `documentConfig.js`

**For production development:**
- Start with [Convex + React + Vite + ConvexAuth + ShadCN template](https://github.com/get-convex/templates/tree/main/template-react-vite-convexauth-shadcn)
- Follow recommended build order: Auth → Master tables → Projects → Kanban → Documents → Commission → Analytics
- Reference PRD for business logic, mockup for UI/UX patterns
- ✅ Document config is now updated: 29 PRD-compliant slots in `documentConfig.js`
- Read `docs/implementation/PRODUCTION-NOTES.md` for Settings CRUD, multi-file upload, file deletion patterns
- Read `docs/implementation/SETTINGS-IMPROVEMENTS.md` for UI improvements: 3-dot menus, confirmation modals, notification feedback
- Read `docs/implementation/PRODUCTION-READY-SUMMARY.md` for complete 6-week implementation guide

## Development Workflow

**Running the Mockup:**
```bash
# Serve the /html directory with any static server
cd html
python -m http.server 8000
# or
npx serve .
```
Open `index.html` → Login page → Dashboard/Projects/etc.

**Mockup Features:**
- ✅ All 7 pages with complete interactions
- ✅ Role toggle widget in sidebar (toggle between Admin/Agent/Viewer)
- ✅ Kanban drag-and-drop with forward-only progression
- ✅ Document management with rejection reasons and auto-complete detection
- ✅ Settings CRUD with 3-dot dropdown menus and confirmation modals
- ✅ Toast notifications for all user actions
- ✅ Agent "created or assigned" permission model
- ✅ Viewer commission visibility
- ✅ 29 PRD-compliant document slots
- Data persists in memory only (refresh resets)

**When Modifying the Mockup:**
1. Always `Read` the file before `Write` (tool requirement)
2. Maintain ES6 module structure (`import`/`export`)
3. Keep utility functions in `utils.js`
4. Keep document config in `documentConfig.js`
5. Run `renderIcons()` after DOM updates (Lucide icon hydration)

**When Building Production App:**
1. Reference PRD (`prd.md`) for business logic and data model
2. Reference mockup (`/html`) for exact layout, design, and UX patterns
3. ✅ Use `documentConfig.js` structure directly — now has 29 PRD-compliant slots
4. Keep `utils.js` functions — they're production-ready
5. Implement UI patterns from mockup:
   - 3-dot dropdown menus (ShadCN `DropdownMenu`)
   - Confirmation modals (ShadCN `AlertDialog`)
   - Toast notifications (ShadCN `Sonner`)
   - Document rejection reason display
   - Auto-complete milestone detection
6. Follow recommended build order (Auth → Master tables → Projects → Kanban → Documents → Commission → Analytics)

## Documentation Structure

📖 **Detailed documentation is organized in `/docs`:**

### Agent Documentation (`/docs/agent/`)
Core concepts and implementation details for Claude Code:

**Core Concepts:**
- **[Architecture](docs/agent/architecture.md)** — Mockup structure, tech stack, migration patterns, architectural decisions
- **[Data Model](docs/agent/data-model.md)** — Projects, documents, roles, Convex schema, RBAC enforcement
- **[Features](docs/agent/features.md)** — All pages/routes, project creation, commission calculation, analytics, agents page

**Implementation Details:**
- **[Document Requirements](docs/agent/document-requirements.md)** — 29 document slots, file types, conditional visibility, upload rules
- **[Kanban Rules](docs/agent/kanban-rules.md)** — Card display, drag rules, filters, forward-only progression
- **[UI/UX Patterns](docs/agent/ui-ux-patterns.md)** — Component requirements, interaction patterns, design tokens

**Development Support:**
- **[Testing](docs/agent/testing.md)** — Mockup validation, agent-browser CLI usage, test scenarios, CI/CD integration
- **[Common Pitfalls](docs/agent/common-pitfalls.md)** — Known issues, mockup limitations, out-of-scope features
- **[Quick Reference](docs/agent/quick-reference.md)** — File mappings, utility functions, glossary, resources

### Implementation Guides (`/docs/implementation/`)
Production implementation documentation:

- **[Production Ready Summary](docs/implementation/PRODUCTION-READY-SUMMARY.md)** — Complete 6-week implementation guide with phase-by-phase checklist
- **[Production Notes](docs/implementation/PRODUCTION-NOTES.md)** — Settings CRUD patterns, multi-file upload, file deletion workflows
- **[Settings Improvements](docs/implementation/SETTINGS-IMPROVEMENTS.md)** — UI improvements: 3-dot menus, confirmation modals, notification feedback
- **[Testing Guide](docs/implementation/TESTING-GUIDE.md)** — Comprehensive testing documentation
- **[Task List](docs/implementation/task-list-01.md)** — Implementation task tracking
- **[Changelog](docs/implementation/CHANGELOG-02.md)** — Recent changes and updates

## When to Read Detailed Docs

**Always reference these topic docs when:**
- Working on specific features (read relevant topic file)
- Planning implementation approach (read Architecture)
- Writing tests (read Testing)
- Troubleshooting issues (read Common Pitfalls)
- Looking up definitions or file locations (read Quick Reference)

**Progressive disclosure pattern:**
- This CLAUDE.md provides the overview and entry point
- Agent documentation in `/docs/agent/` contains deep implementation details
- Implementation guides in `/docs/implementation/` contain production planning and patterns
- Only read specific docs when you need that information
- This saves context tokens and keeps guidance focused

## Critical Rules (Always Follow)

### Data Integrity
- Milestone chronological order: `docsCompletedAt ≤ submittedAt ≤ folAt ≤ disbursedAt ≤ closedAt`
- Only Admins can backdate milestones
- Commission rates stored as decimals (0.015 = 1.5%, 0.7 = 70%), displayed as percentages
- Project code auto-generation must handle race conditions
- Property Profile field (Land/Building) is required for all projects — used in dashboard analytics

### Stage vs Status
- **Stage** = Pipeline position (New → Closed) — moves forward via Kanban drag
- **Status** = Lifecycle state (Open / Active / On-Hold / Disbursed) — toggled via buttons
- Only Open or Active status projects can be dragged (exception: Disbursed can move to Closed)
- On-Hold projects must change to Active before dragging
- Disbursed status projects can only move to Closed stage (restricted movement)

### RBAC Enforcement
- **Agent queries:** Filtered by `assignedAgentId` OR `createdBy` (agents see projects they created or are assigned to)
- **Viewer permissions:** Read-only access (except document verify/reject)
- **Dashboard access:**
  - **Admin:** Full dashboard with all project data (unfiltered)
  - **Viewer:** Full dashboard with all project data (unfiltered, read-only)
  - **Agent:** Full dashboard with data filtered to projects they created or are assigned to
- **Commission visibility:**
  - Hidden before Disbursement stage
  - ✅ **Viewers CAN see commission tab** (read-only, updated per PRD 3.2)
  - Agents see only Final Commission (read-only)
  - Admins see and edit all commission fields

### Document Slots
- ✅ **29 total slots** (mockup now matches PRD Section 5.2.2)
  - Section A: 7 slots | Section B: 4 slots | Section C: 9 slots | Section D: 6 slots | Section E: 3 slots
- Section B (Company Docs) + D2 hidden for Salaried borrowers (24 slots vs 29 slots)
- PDF-only slots: C6, D1, D2, D3, D4, D6 (banking forms)
- Multi-file support: A1, A2, A3, B1, C1-C5, D5, E1-E3
- Progress = uploaded/verified count ÷ total required slots for borrower type
- ✅ **Rejection reasons:** Displayed in orange alert box below rejected documents
- ✅ **Auto-complete:** `docsCompletedAt` milestone auto-set when all required docs complete

### Kanban Drag
- Forward-only (no backward drag)
- Only Open/Active status can drag
- Moving to FOL prompts for notes
- Moving to Disbursed auto-sets status
- Moving to Closed prompts for outcome
- Milestone auto-stamped on drop

## Key Architecture Decisions

1. **Document Config as Code** — 29 slots defined in TypeScript constant, NOT in database
2. **Commission Calculations** — Client-side for display, server-side validation
3. **Per-Project Rate Overrides** — Each project stores own rates, defaulted from master tables
4. **Convex Patterns** — Use `query` for reads, `mutation` for writes, real-time subscriptions for live updates
5. **Agent Filtering** — Server-side filtering by `assignedAgentId` OR `createdBy` in Convex queries
6. **Confirmation Before Destruction** — All destructive actions (Delete, Deactivate) require modal confirmation
7. **Dropdown Action Menus** — Use 3-dot menus with contextual actions instead of inline buttons

## Technology Stack (Production)

- **Frontend:** React (Vite) + ShadCN UI + Tailwind CSS
- **Backend:** Convex (BaaS) — schema, queries, mutations, file storage
- **Auth:** Convex Auth with RBAC
- **DnD:** `@dnd-kit/core` + `@dnd-kit/sortable`
- **Forms:** ShadCN Form + `react-hook-form` + `zod`
- **Charts:** Recharts
- **Testing:** Vitest (unit), Playwright (e2e), agent-browser (UI automation)
- **Template:** [convex-react-vite-convexauth-shadcn](https://github.com/get-convex/templates/tree/main/template-react-vite-convexauth-shadcn)

## Additional Resources

### Core Documentation
- **PRD:** `prd.md` — Complete product specification (authoritative for all business logic)
  - Updated with UI/UX patterns, modal guidelines, Settings CRUD requirements
  - Section 11 fully documents mockup features and production migration patterns
- **Agent Docs:** `/docs/agent/` — Detailed implementation documentation for Claude Code
- **Implementation Guides:** `/docs/implementation/` — Production planning and patterns
  - `PRODUCTION-READY-SUMMARY.md` — 6-week implementation roadmap
  - `PRODUCTION-NOTES.md` — Settings CRUD, multi-file upload, file deletion
  - `SETTINGS-IMPROVEMENTS.md` — UI improvements (3-dot menus, confirmations)

### External Resources
- **Auto Memory:** `C:\Users\ejsid\.claude\projects\...\memory\MEMORY.md` — Project learnings
- **Convex RBAC:** [convex-auth-with-role-based-permissions](https://github.com/get-convex/convex-auth-with-role-based-permissions)

### What's Production-Ready

**✅ Fully Implemented in Mockup:**
- All 7 pages with complete UI interactions
- 29 PRD-compliant document slots
- Agent "created or assigned" permission filtering
- Viewer commission visibility (read-only)
- Document rejection reason display
- Auto-complete milestone detection
- Settings CRUD with 3-dot dropdown menus
- Confirmation modals for destructive actions
- Toast notifications for all user actions
- Forward-only Kanban with On-Hold blocking

**📋 Ready for Production Implementation:**
- Multi-file upload UI (patterns in `docs/implementation/PRODUCTION-NOTES.md`)
- File deletion functionality (patterns in `docs/implementation/PRODUCTION-NOTES.md`)
- Complete implementation roadmap (see `docs/implementation/PRODUCTION-READY-SUMMARY.md`)
- Real-time Convex subscriptions
- Convex Auth integration
- Loading states and skeleton screens
- Keyboard accessibility
- On-Hold pausing with pausedDays tracking
