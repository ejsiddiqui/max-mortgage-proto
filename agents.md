# Agent Behavior Guidelines: Production Migration (Convex + React)

**Role:** Senior Full-Stack Engineer (Specializing in Convex, React, and Type Safety).  
**Input Context:** 
1. `/html` directory: Contains the approved visual prototype and mock data.
2. `PRD.md` & `specs`: Contains the business logic rules (Stage vs Status, Commission Logic, RBAC).

**Goal:** Build the production application using the specified stack, using the prototype as a visual reference only.

---

## 📚 Documentation Structure

This guide uses **progressive disclosure** to save context tokens. Core concepts are in this file, with detailed implementation guides in separate documents:

### Core Guides
- **[Schema Guide](docs/agents/schema-guide.md)** - Complete Convex schema definition
- **[Auth & RBAC](docs/agents/auth-rbac.md)** - Authentication patterns and role-based access control
- **[Business Rules](docs/agents/business-rules.md)** - PRD-mandated validation logic
- **[Document & Audit](docs/agents/document-audit.md)** - File storage and immutable audit logging
- **[UI Components](docs/agents/ui-components.md)** - ShadCN patterns and prototype mapping
- **[Testing & Deployment](docs/agents/testing-deployment.md)** - Test strategies and deployment procedures

---

## 1. Technology Stack & Constraints (Non-Negotiable)
You are strictly bound to the following technologies. Do not introduce alternatives.

* **Backend/DB:** [Convex](https://convex.dev/) (Real-time database, backend functions).
* **Frontend:** React 18+ (TypeScript).
* **Boilerplate:** [React Starter Kit](https://github.com/michaelshimeles/react-starter-kit).
* **Auth:** [Clerk](https://clerk.com/) (React SDK + Convex Integration).
* **UI Library:** [ShadCN UI](https://ui.shadcn.com/) (Radix Primitives + Tailwind).
* **Icons:** [Lucide React](https://lucide.dev/).
* **Testing:** Vitest (Unit), [agent-browser](https://github.com/vercel-labs/agent-browser) or Playwright (E2E).

---

## 2. Migration Protocol (The "Prototype-to-Prod" Workflow)

**DO NOT** copy-paste code from `/html` directly into React files. The prototype is Vanilla JS; the production app is Declarative React.

### Feature Implementation Loop
**For every feature task, follow this loop:**

1. **Analyze:** Open the relevant `.html` file in the `/html` folder to understand the layout and flow.
2. **Schema (Convex):** Define the data model in `convex/schema.ts` to support this feature. Run `npx convex dev` to push changes. See **[Schema Guide](docs/agents/schema-guide.md)** for complete schema definition.
3. **Backend (Convex):** Write the `query` and `mutation` functions in `convex/`. Use `v.validator` for strict argument checking. Reference **[Business Rules](docs/agents/business-rules.md)** for validation logic.
4. **UI Components (ShadCN):** Check if the required ShadCN component exists (e.g., `npx shadcn-ui@latest add card`). If not, install it. See **[UI Components](docs/agents/ui-components.md)** for patterns.
5. **Implementation (React):** Rebuild the view using React Components, `useQuery` (Convex), and Tailwind classes.
6. **Verify:** Ensure strict Type Safety (no `any` types), run linter, and test data flow.

---

## 3. Quick Reference

### File Structure
```
/convex
  ├── schema.ts          # Database schema
  ├── projects.ts        # Project queries/mutations
  ├── documents.ts       # Document queries/mutations
  ├── users.ts           # User sync mutations
  ├── http.ts            # Webhook handlers
  └── _generated/        # Auto-generated types

/app
  ├── dashboard/         # Dashboard page
  ├── projects/          # Projects pages
  │   ├── [id]/          # Project detail (dynamic route)
  │   └── kanban/        # Kanban view
  ├── admin/             # Admin-only pages
  └── components/        # Shared components
      ├── ui/            # ShadCN components
      └── custom/        # Custom components

/docs/agents/          # Detailed implementation guides
  ├── schema-guide.md
  ├── auth-rbac.md
  ├── business-rules.md
  ├── document-audit.md
  ├── ui-components.md
  └── testing-deployment.md
```

### Common Commands
```bash
# Start Convex dev server
npx convex dev

# Deploy to production
npx convex deploy --prod

# Add ShadCN component
npx shadcn-ui@latest add <component>

# Run tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 4. Core Principles

### Schema-First Development
When starting a task, define the schema change in `convex/schema.ts` *before* writing the React code. See **[Schema Guide](docs/agents/schema-guide.md)**.

### RBAC Enforcement
Every Convex query/mutation must check user permissions. See **[Auth & RBAC](docs/agents/auth-rbac.md)**.

### Business Rules Validation
Enforce all PRD-mandated rules in Convex mutations. See **[Business Rules](docs/agents/business-rules.md)**:
- One-Bank Rule
- Stage/Status Lock
- Chronological Milestones
- Backdating Permissions
- On-Hold Clock Tracking

### Audit Trail
Log all critical actions to the `auditEvents` table (append-only). See **[Document & Audit](docs/agents/document-audit.md)**.

### Error Handling
- **Loading States:** Use ShadCN `Skeleton` components
- **Mutation Errors:** Always wrap in `try/catch` and show `toast.error()`
- **Optimistic Updates:** Use Convex's `.withOptimisticUpdate()` for instant UI feedback

---

## 5. Task Execution Checklist

Before marking a task as complete, verify:

- [ ] Type Check: `npm run type-check` passes
- [ ] Lint: `npm run lint` passes
- [ ] Data Flow: Reading/writing to real Convex DB (not mock data)
- [ ] Security: RBAC enforced (agent cannot access other agent's data)
- [ ] Business Rules: All PRD-mandated rules enforced
- [ ] Audit Trail: Critical actions logged to `auditEvents`
- [ ] Testing: Unit tests written, E2E tests pass

---

## 6. Interaction Style

### Incremental Implementation
Do not generate 5 files at once. Build the Backend Function → Verify → Build the UI Component.

### Code Review Checkpoints
After implementing a feature:
1. Show the Convex mutation/query code
2. Show the React component using it
3. Explain the RBAC rules applied
4. Confirm the audit event is logged (if applicable)

---

**Remember:** The prototype is a visual guide, not a code template. Rebuild everything using the production stack with proper type safety, RBAC, and business logic enforcement.

**For detailed implementation guidance, refer to the documentation in `/docs/agents/`.**