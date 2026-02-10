# UI/UX Implementation (PRD Section 7)

## Component Requirements

- Design system: ShadCN components + Tailwind CSS (follow mockup for layout, colors, spacing)
- Kanban: `@dnd-kit/core` or similar lightweight React DnD library compatible with ShadCN
- Forms: ShadCN `Form` components with `react-hook-form` + `zod` validation
- File uploads: Convex `storage` API, show upload progress, validate file types client-side before upload
- Loading states: ShadCN `Skeleton` components for async data
- Toasts: ShadCN `Sonner` for success/error notifications (auto-dismiss 2.4s)
- Responsive: Must work on tablet and desktop (mobile is nice-to-have, not required for v1)

## Interaction Patterns (PRD Section 11.6)

1. Forward-only Kanban drag with visual ring flash (amber) on backward attempts
2. Locked card states (On-Hold/Closed): opacity-60, cursor-not-allowed, not draggable
3. Outcome prompt on Closed — when dropping to Closed column, prompt for outcome before accepting
4. Milestone auto-set — dropping a card to new stage auto-stamps relevant milestone timestamp
5. Collapsible document sections — chevron rotation, smooth expand/collapse animation
6. Document action buttons — explicit Upload/Verify/Reject/Download buttons (not click-to-cycle)
7. In-place re-render — after doc action or status toggle, re-render detail page preserving tab state
8. Toast notifications — success/error toasts with slide-in animation
9. Kanban filter bar — 4 dropdowns + search, applied client-side with card count updates
10. Pagination — projects list with prev/next and numbered page buttons
11. New Project modal — overlay with form validation, auto-code generation, redirect on submit
12. Status toggle — Open ↔ On-Hold toggle button with label swap

## Design Tokens

**Colors:**
```css
--primary: #002060     /* Brand navy */
--accent: #05f240      /* Brand green */
--surface: #ffffff     /* Card background */
--surface-muted: #f9fbff /* Alternate background */
```

**Typography:**
- Font family: Inter (400, 500, 600, 700) via Google Fonts
- Border radius: `rounded-3xl` (cards), `rounded-2xl` (buttons/inputs)
