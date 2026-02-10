# Common Pitfalls

1. **Document slot count mismatch:** The mockup has 28 slots with simplified labels. PRD Section 5.2.2 is authoritative (29 slots, see breakdown above). Section C has 9 slots in PRD vs 5 in mockup, Section D has 6 vs 5, Section B has 4 vs 6.

2. **Commission rate units:** All rates stored as decimals (0.015 = 1.5%, 0.7 = 70%). Display logic multiplies by 100 for percentage. Keep this pattern in production.

3. **Commission calculation errors:** Rates are already decimals, so formulas divide by 100. Example: `expectedCommission = loanAmount × bankCommissionRate / 100` where `bankCommissionRate` might be 1.5 (not 0.015).

4. **Role toggle in production:** The mockup's role toggle widget is demo-only. Production uses real Convex Auth roles from user records — no toggling.

5. **Stage vs Status confusion:**
   - **Stage** = Pipeline position (Lead, Docs Collection, etc.) — moves forward via Kanban drag
   - **Status** = Lifecycle state (Open, On-Hold, Closed) — toggled via status buttons

6. **On-Hold pausing:** When a project goes On-Hold, track `pausedDays` to exclude from T-metric calculations. The mockup doesn't implement this — production must.

7. **Real-time updates:** The mockup is single-user static. Production must use Convex subscriptions for live Kanban updates when other users move cards.

8. **Document completion milestone:** Auto-set `docsCompletedAt` when all required documents reach uploaded/verified status. The mockup only sets milestones on stage transitions.

9. **Multi-file upload:** Document table stores `fileIds` as array `Id<"_storage">[]`. Each slot can have multiple files. Show list UI with individual download/delete actions.

10. **Agent data filtering:** Agent queries must filter by `assignedAgentId` at the database level (Convex query), not just UI-level filtering.

## Mockup Limitations (PRD Section 11.8)

The mockup does NOT implement these features (specified in PRD but not prototyped):
- Real authentication flow (uses mock login)
- File upload with progress and Convex storage (simulates with status changes)
- Multi-file upload per document slot (simulates single file per slot)
- File deletion from uploaded documents
- Rejection reason display (captures via `prompt()` but doesn't persist/display)
- On-Hold pausing with `pausedDays` subtraction from T-metrics
- Auto-set `docsCompletedAt` when all docs are uploaded (only sets on stage transition)
- Backdating milestone dates (Admin feature)
- Real-time subscriptions (Convex live queries) — mockup is single-user static
- Keyboard accessibility
- Loading skeleton states (renders synchronously)

## Out of Scope (v2+, PRD Section 9)

These features are explicitly NOT included in v1:
- Email notifications (Resend integration wired but no templates)
- In-app notifications
- Full audit log UI (data is being captured in auditLog table, but no viewer)
- Kanban backward drag (manual stage regression)
- Native mobile app
- Multi-currency support (AED only for v1)
- Bulk operations (bulk document upload, bulk status change)
- Advanced reporting / export to Excel
- Document templates / auto-fill
- Client portal / external access
