# Documentation Directory

This directory contains detailed topic-specific documentation for the Max Mortgage project, following a **progressive disclosure pattern** to save context tokens.

## 📊 Documentation Split Summary

**Before:** Single 796-line CLAUDE.md
**After:** Streamlined 154-line entry point + 8 focused topic files (~35KB total)
**Token Savings:** ~80% reduction in initial context load

## 📁 File Organization

### Core Concepts (Read First)
1. **[architecture.md](architecture.md)** (6.4KB)
   - Mockup structure (ES6 modules, SPA routing)
   - Production tech stack (React + Convex)
   - Migration patterns (component mapping, data layer)
   - Key architectural decisions (document config, commission calc, Convex patterns)

2. **[data-model.md](data-model.md)** (4.0KB)
   - Projects (stages, statuses, milestones)
   - Documents (29 slots, file types)
   - Roles & permissions (Admin/Agent/Viewer)
   - Convex schema (tables, fields, relationships)
   - Data integrity rules & RBAC enforcement

3. **[features.md](features.md)** (5.1KB)
   - Pages & routes (7 pages)
   - Project detail tabs (Overview/Documents/Commission/Timeline)
   - Commission calculation formulas
   - Analytics (T1-T5 milestones)
   - Dashboard, Agents, Settings pages

### Implementation Details (Read When Needed)
4. **[document-requirements.md](document-requirements.md)** (2.1KB)
   - 29 document slots breakdown (A-E sections)
   - File type rules (multi-file vs PDF-only)
   - Conditional visibility (Salaried vs Self-Employed)
   - Upload rules & rejection flow

5. **[kanban-rules.md](kanban-rules.md)** (1.2KB)
   - Card display requirements
   - 7 drag-and-drop rules (forward-only, status checks)
   - Filters (status, agent, bank, borrower type)

6. **[ui-ux-patterns.md](ui-ux-patterns.md)** (2.2KB)
   - Component requirements (ShadCN, Tailwind)
   - 12 interaction patterns (drag, modals, toasts)
   - Design tokens (colors, typography)

### Development Support (Read When Needed)
7. **[testing.md](testing.md)** (8.6KB)
   - Mockup validation checklist
   - agent-browser CLI usage (10 core workflows)
   - Common test scenarios (commission visibility, RBAC, drag rules)
   - CI/CD integration examples

8. **[common-pitfalls.md](common-pitfalls.md)** (3.2KB)
   - 10 known issues to avoid
   - Mockup limitations
   - Out-of-scope features (v2+)

9. **[quick-reference.md](quick-reference.md)** (2.8KB)
   - File mappings (mockup → production routes)
   - Utility functions to preserve
   - Glossary (terms & definitions)
   - External resources

## 🎯 Usage Guidelines

### When Working on a Task

1. **Start with CLAUDE.md** (root) — Get project overview & critical rules
2. **Read relevant topic file(s)** — Only load what you need for the current task
3. **Cross-reference PRD** (`prd.md`) — For authoritative business logic

### Progressive Disclosure Pattern

**Don't load all docs at once!** Use this decision tree:

```
Task Type                    → Read These Docs
─────────────────────────────────────────────────────────
Mockup modifications         → architecture.md
Database/schema work         → data-model.md
Feature implementation       → features.md + relevant detail file
Document upload feature      → document-requirements.md
Kanban board work           → kanban-rules.md
UI/styling work             → ui-ux-patterns.md
Writing tests               → testing.md
Debugging issues            → common-pitfalls.md
Looking up reference        → quick-reference.md
```

### Context Token Optimization

**Example savings:**
- Old approach: Load 796-line CLAUDE.md (~3,000 tokens)
- New approach: Load 154-line CLAUDE.md + 1 topic file (~800 tokens average)
- **Savings:** ~70-80% per task

## 🔄 Maintenance

**When updating documentation:**
- Keep CLAUDE.md under 200 lines (entry point + critical rules only)
- Add detailed content to relevant topic files
- Update this README if adding new topic files
- Maintain cross-references between files

## 📚 Additional Resources

- **PRD:** `../prd.md` — Complete product specification
- **Mockup:** `../html/` — Functional prototype
- **Backup:** `../CLAUDE.md.backup` — Original monolithic file (for reference)
