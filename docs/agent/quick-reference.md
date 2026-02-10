# Quick Reference

## File Reference Quick Map

**Mockup Files → Production Routes:**
- `html/index.html` → `/login` (Convex Auth)
- `html/dashboard.html` → `/` (Admin dashboard)
- `html/projects-kanban.html` → `/projects` (Kanban board)
- `html/projects-list.html` → `/projects/list` (Table view)
- `html/project-detail.html` → `/projects/:id` (Detail page with tabs)
- `html/agents.html` → `/agents` (Agent directory)
- `html/settings.html` → `/settings` (Settings with nested tabs)

**Key Functions to Preserve:**
- `formatCurrency()` from `utils.js` — **UPDATE to format in millions** (e.g., "AED 2.5M")
- `formatDate()`, `formatRelative()`, `calculateDuration()` from `utils.js`
- `generateProjectCode()` from `utils.js` (add Convex transaction safety)
- `getDocSlotsForBorrowerType()` from `documentConfig.js` (update labels)

**Design Tokens (from custom.css):**
```css
--primary: #002060     /* Brand navy */
--accent: #05f240      /* Brand green */
--surface: #ffffff     /* Card background */
--surface-muted: #f9fbff /* Alternate background */
```

## Glossary (PRD Section 10)

| Term | Definition |
|------|-----------|
| Project | A single mortgage application submission to one bank for one client |
| Stage | Where a project is in the pipeline (Lead → Closed). Displayed as Kanban columns. |
| Status | The lifecycle state of a project (Open / On-Hold / Closed) |
| Outcome | The result when a project is closed (Approved / Rejected / Cancelled / Disbursed) |
| Milestone | An auto-recorded timestamp when a project reaches a specific stage |
| T1–T4 | Calculated durations between milestones, used for performance analytics |
| Master Table | Admin-managed reference data (Banks, Referral Companies) |
| Document Slot | A predefined document requirement (e.g., "A1 — Valid UAE ID") |
| Borrower Type | Salaried or Self-Employed — determines which document slots are visible |
| Business Type | Buyout or Equity Release — the type of mortgage product |

## Additional Resources

- **PRD:** `prd.md` — Complete product specification (authoritative for all business logic, data model, and requirements)
- **Auto Memory:** `C:\Users\ejsid\.claude\projects\...\memory\MEMORY.md` — Project-specific learnings and patterns
- **Convex RBAC Reference:** [convex-auth-with-role-based-permissions](https://github.com/get-convex/convex-auth-with-role-based-permissions)
- **Starter Template:** [convex-react-vite-convexauth-shadcn](https://github.com/get-convex/templates/tree/main/template-react-vite-convexauth-shadcn)
- **PRD Section 11:** Complete HTML mockup reference and production migration guide
- **Document Requirements:** PRD Section 5.2.2 has the authoritative 29-slot document list with exact labels
