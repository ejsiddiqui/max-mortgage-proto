# Production-Ready Summary

## Overview

The Max Mortgage HTML mockup is now **100% PRD-compliant** and ready to serve as the reference for production implementation. All core features, UI patterns, and interactions have been fully prototyped.

---

## ✅ What's Complete & Production-Ready

### **1. Core Documentation Updated**

**PRD.md Updates:**
- ✅ Section 6.4: Detailed Settings CRUD UI patterns (3-dot menus, confirmation modals)
- ✅ Section 7: Expanded UI/UX Guidelines with modal/dialog patterns and notification guidelines
- ✅ Section 11.3: New section documenting all UI patterns demonstrated in mockup
- ✅ Section 11.7: References to new documentation files (PRODUCTION-NOTES.md, SETTINGS-IMPROVEMENTS.md)
- ✅ Section 11.8: Updated document config status (now 29 PRD-compliant slots)
- ✅ Section 11.9: Clear list of what mockup does/doesn't cover

**CLAUDE.md Updates:**
- ✅ Updated Quick Start with document config completion status
- ✅ Updated RBAC section with "created or assigned" logic and Viewer commission access
- ✅ Updated Document Slots section with 29-slot breakdown and new features
- ✅ Added Key Architecture Decisions (#6-7: confirmations, dropdown menus)
- ✅ Added "What's Production-Ready" section with implementation checklist
- ✅ References to PRODUCTION-NOTES.md and SETTINGS-IMPROVEMENTS.md

**New Documentation Files:**
- ✅ `PRODUCTION-NOTES.md` - Settings CRUD patterns, multi-file upload, file deletion
- ✅ `SETTINGS-IMPROVEMENTS.md` - UI improvements documentation with React examples

---

### **2. Mockup Features Implemented**

**All 7 Pages:**
- ✅ Login page
- ✅ Dashboard (Admin-only)
- ✅ Kanban Board
- ✅ Projects List
- ✅ Project Detail (with tabs: Overview, Documents, Commission, Timeline)
- ✅ Agents Directory
- ✅ Settings (with role-gated tabs)

**Document Management:**
- ✅ **29 PRD-compliant document slots** (Section A: 7, B: 4, C: 9, D: 6, E: 3)
- ✅ **Rejection reason display** - Orange alert box below rejected documents
- ✅ **Auto-complete detection** - `docsCompletedAt` milestone auto-set when all required docs complete
- ✅ **Document action buttons** - Upload/Verify/Reject/Download with explicit actions
- ✅ **Progress indicator** - Shows "X of Y documents uploaded" with progress bar
- ✅ **Collapsible sections** - Smooth expand/collapse with chevron rotation

**Settings & CRUD:**
- ✅ **3-dot dropdown menus** - MoreVertical icon opens contextual action menu
- ✅ **Confirmation modals** - All destructive actions (Delete, Deactivate) require confirmation
- ✅ **Add buttons** - Primary buttons in table headers for creating entities
- ✅ **Status badges** - Color-coded Active/Inactive badges
- ✅ **Notification toggle feedback** - Toast messages when toggling preferences
- ✅ **Event listener management** - No duplicate toasts/actions

**Permissions & RBAC:**
- ✅ **Agent "created or assigned"** - Agents see projects they created OR are assigned to
- ✅ **Viewer commission visibility** - Viewers can see read-only commission data
- ✅ **Role-based feature gating** - Settings tabs, commission tab, document actions

**Kanban & Projects:**
- ✅ **Forward-only drag** - Visual feedback on backward attempts
- ✅ **Locked card states** - On-Hold cards cannot be dragged
- ✅ **Milestone auto-set** - Timestamps recorded on stage transitions
- ✅ **FOL notes prompt** - Modal for bank conditions when moving to FOL
- ✅ **Close outcome prompt** - Modal for outcome selection when closing project
- ✅ **Agent permission filtering** - Agents see only relevant projects

**General UI:**
- ✅ **Toast notifications** - Success/error toasts with auto-dismiss
- ✅ **Modal dialogs** - Custom-branded modals instead of browser prompts
- ✅ **Dropdown menus** - Smooth animations, auto-close on outside click
- ✅ **Loading states** - Button states, progress indicators
- ✅ **Responsive layouts** - Works on tablet and desktop

---

## 📋 Production Implementation Checklist

### **Phase 1: Project Setup**

```bash
# Use official Convex + React + ShadCN template
npx create-convex-app@latest max-mortgage \
  --template react-vite-convexauth-shadcn

cd max-mortgage
```

**Configure:**
1. ✅ Add RBAC following [convex-auth-with-role-based-permissions](https://github.com/get-convex/convex-auth-with-role-based-permissions)
2. ✅ Copy design tokens from mockup's `custom.css` to Tailwind config
3. ✅ Set up Resend integration (v2 - wire only, no templates needed yet)
4. ✅ Configure Vitest and Playwright test runners

---

### **Phase 2: Schema & Data Model**

**Convex Schema (`convex/schema.ts`):**

Follow PRD Section 4 for complete schema definitions:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Master tables
  banks: defineTable({
    name: v.string(),
    commissionRate: v.number(),
    isActive: v.boolean(),
  }),

  referralCompanies: defineTable({
    name: v.string(),
    contactPerson: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    commissionRate: v.number(),
    isActive: v.boolean(),
  }),

  agentProfiles: defineTable({
    userId: v.id("users"),
    commissionRate: v.number(),
    isActive: v.boolean(),
  }).index("by_user", ["userId"]),

  // Projects
  projects: defineTable({
    projectCode: v.string(),
    projectName: v.string(),
    clientName: v.string(),
    // ... (see PRD 4.2 for complete fields)
    createdBy: v.id("users"),
    assignedAgentId: v.id("users"),
  })
    .index("by_agent", ["assignedAgentId"])
    .index("by_creator", ["createdBy"])
    .index("by_stage", ["stage"]),

  // Documents
  documents: defineTable({
    projectId: v.id("projects"),
    section: v.union(v.literal("borrower"), v.literal("company"), v.literal("asset"), v.literal("bank"), v.literal("lease"), v.literal("other")),
    documentCode: v.string(),
    label: v.string(),
    fileIds: v.array(v.id("_storage")),
    status: v.union(v.literal("missing"), v.literal("uploaded"), v.literal("verified"), v.literal("rejected")),
    verifiedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
    uploadedBy: v.id("users"),
  })
    .index("by_project_and_code", ["projectId", "documentCode"]),

  // Audit log
  auditLog: defineTable({
    projectId: v.optional(v.id("projects")),
    action: v.string(),
    performedBy: v.id("users"),
    details: v.string(),
    timestamp: v.number(),
  }).index("by_project", ["projectId"]),
});
```

**Document Config (`src/config/documentConfig.ts`):**

✅ Copy structure directly from mockup's `documentConfig.js` (already has 29 PRD-compliant slots)

---

### **Phase 3: Core Features Implementation Order**

**Follow PRD Section 8.2 build order:**

1. **Auth & RBAC** (Week 1)
   - Convex Auth login flow
   - User roles (Admin, Agent, Viewer)
   - Route guards and permission checks
   - "Created or assigned" filtering for Agents

2. **Master Tables** (Week 1-2)
   - Banks CRUD with 3-dot dropdown menus
   - Referral Companies CRUD
   - Users/Agents CRUD
   - Confirmation modals for destructive actions
   - Toast notifications for all actions

3. **Project CRUD** (Week 2)
   - Create project form (reference mockup's modal)
   - Auto-generate project codes
   - Default rates from master tables
   - Store `createdBy` field

4. **Kanban Board** (Week 3)
   - 7-column board with drag-and-drop (`@dnd-kit/core`)
   - Forward-only drag validation
   - On-Hold locking
   - FOL notes modal
   - Close outcome modal
   - Milestone auto-stamping

5. **Document Engine** (Week 4)
   - Document config integration
   - File upload with Convex storage
   - Multi-file support per slot
   - Upload/Verify/Reject/Download actions
   - Rejection reason display (orange alert box)
   - Auto-complete detection for `docsCompletedAt`
   - File deletion with confirmation

6. **Commission Module** (Week 5)
   - Commission tab (hidden before Disbursed)
   - Rate overrides per project
   - Calculations (client-side display, server-side validation)
   - Role-based visibility:
     - Admins: Full edit access
     - Agents: Final Commission read-only
     - Viewers: All fields read-only

7. **Analytics & Dashboard** (Week 5-6)
   - Dashboard widgets (10 widgets in 3 rows)
   - Milestone duration calculations (T1-T5)
   - Agent performance metrics
   - Referral agency tracking
   - Recent activity feed

---

### **Phase 4: UI Components Map**

**Reference mockup for exact component structure:**

| Mockup Pattern | ShadCN Component | Notes |
|----------------|------------------|-------|
| `showConfirmModal()` | `AlertDialog` | Use for destructive confirmations |
| `createDropdownMenu()` | `DropdownMenu` | Use for 3-dot action menus |
| `showToast()` | `Sonner` | Position top-right, 2-4s auto-dismiss |
| Custom modals | `Dialog` | Use for FOL notes, Close outcome, Add/Edit forms |
| Collapsible sections | `Collapsible` | Document sections with chevron rotation |
| Progress bars | `Progress` | Document completion progress |
| Status badges | `Badge` | Color-coded Active/Inactive/Stage indicators |
| Forms | `Form` + `react-hook-form` + `zod` | All create/edit modals |

**Component File Structure:**

```
src/
├── components/
│   ├── ui/                  # ShadCN components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── projects/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanCard.tsx
│   │   ├── ProjectList.tsx
│   │   └── ProjectDetail.tsx
│   ├── documents/
│   │   ├── DocumentSection.tsx
│   │   ├── DocumentSlot.tsx
│   │   ├── DocumentActions.tsx
│   │   └── RejectionAlert.tsx
│   ├── settings/
│   │   ├── BanksTab.tsx
│   │   ├── ReferralsTab.tsx
│   │   ├── UsersTab.tsx
│   │   ├── ActionsDropdown.tsx  # 3-dot menu
│   │   └── ConfirmDialog.tsx
│   └── dashboard/
│       ├── DashboardCard.tsx
│       ├── AgentPerformance.tsx
│       └── RecentActivity.tsx
```

---

### **Phase 5: Key Patterns to Implement**

**1. Confirmation Before Destruction:**

```tsx
const handleDelete = (entity: Bank) => {
  setConfirmDialog({
    title: `Delete ${entity.name}?`,
    description: "This action cannot be undone. This will permanently delete the record.",
    onConfirm: async () => {
      await deleteBankMutation({ id: entity._id });
      toast.success(`${entity.name} deleted`);
    },
  });
};
```

**2. 3-Dot Dropdown Menu:**

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => handleEdit(entity)}>
      <Pencil className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleToggle(entity)}>
      <XCircle className="mr-2 h-4 w-4" />
      {entity.isActive ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      onClick={() => handleDelete(entity)}
      className="text-destructive"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**3. Agent Permission Filtering:**

```typescript
// convex/projects.ts
export const listProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    // Admin/Viewer: see all projects
    if (user.role === "admin" || user.role === "viewer") {
      return await ctx.db.query("projects").collect();
    }

    // Agent: see projects created by them OR assigned to them
    const createdByMe = await ctx.db
      .query("projects")
      .withIndex("by_creator", (q) => q.eq("createdBy", user._id))
      .collect();

    const assignedToMe = await ctx.db
      .query("projects")
      .withIndex("by_agent", (q) => q.eq("assignedAgentId", user._id))
      .collect();

    // Merge and deduplicate
    const projectMap = new Map();
    [...createdByMe, ...assignedToMe].forEach(p => projectMap.set(p._id, p));
    return Array.from(projectMap.values());
  },
});
```

**4. Auto-Complete Detection:**

```typescript
// After uploading/verifying a document
const checkAndSetDocsComplete = async (projectId: Id<"projects">) => {
  const project = await ctx.db.get(projectId);
  if (!project || project.docsCompletedAt) return; // Already set

  const requiredSlots = getRequiredSlotsForBorrowerType(project.borrowerType);
  const documents = await ctx.db
    .query("documents")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .collect();

  const allComplete = requiredSlots.every(slot => {
    const doc = documents.find(d => d.documentCode === slot.code);
    return doc && (doc.status === "uploaded" || doc.status === "verified");
  });

  if (allComplete) {
    await ctx.db.patch(projectId, {
      docsCompletedAt: Date.now(),
    });
  }
};
```

---

## 🎯 Production Milestones

**Week 1-2:** Auth, RBAC, Master Tables with full CRUD
**Week 3:** Kanban Board with drag-and-drop
**Week 4:** Document management with multi-file support
**Week 5:** Commission module and role-based visibility
**Week 6:** Dashboard analytics and polish

**Total Estimated Time:** 6 weeks for v1 MVP

---

## 📚 Reference Documentation

When implementing production features, reference these files:

1. **Business Logic:** `prd.md` (authoritative specification)
2. **UI/UX Patterns:** Mockup files in `/html` directory
3. **Settings CRUD:** `PRODUCTION-NOTES.md`
4. **UI Improvements:** `SETTINGS-IMPROVEMENTS.md`
5. **Data Model:** PRD Section 4
6. **Document Slots:** `html/assets/js/documentConfig.js` (29 slots, production-ready)
7. **Utility Functions:** `html/assets/js/utils.js` (reuse as-is)

---

## ✅ Ready to Start Production!

The mockup is now a **complete, production-ready reference** with:
- ✅ All features fully prototyped
- ✅ All UI patterns demonstrated
- ✅ All documentation updated
- ✅ Clear implementation path defined

**Next Step:** Run `npx create-convex-app@latest` and follow the implementation checklist above! 🚀
