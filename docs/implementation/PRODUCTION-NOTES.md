# Production Implementation Notes

## Settings CRUD Implementation (Tasks #6-9)

### Overview
The HTML mockup demonstrates the basic table structure for Banks, Referral Companies, Agents, and Users in Settings. However, **full CRUD modals with forms, validation, and data manipulation are best implemented in the production React + Convex stack** rather than in the mockup.

### Why Implement in Production Instead of Mockup

1. **Form Validation**: React Hook Form + Zod provides robust validation that's cumbersome to replicate in vanilla JS
2. **State Management**: Convex's real-time subscriptions handle data updates elegantly
3. **Modal Components**: ShadCN's Dialog component is production-ready with accessibility built-in
4. **Data Persistence**: Mockup uses in-memory arrays; production uses Convex mutations with proper error handling
5. **Code Reusability**: React components can share form fields across Add/Edit modes

### Mockup Demonstrates

✅ **UI Patterns Implemented in Mockup:**
- Tab navigation with role-based visibility
- Table layouts for all 4 master tables
- Column structures (name, rate, status, actions)
- Activate/Deactivate toggle pattern
- Visual styling (borders, badges, spacing)

### Production Must Implement

#### 1. **Banks CRUD** (`/settings/banks`)

**Add Bank Modal:**
```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Bank</DialogTitle>
    </DialogHeader>
    <Form {...form}>
      <FormField name="name" label="Bank Name" required />
      <FormField name="commissionRate" label="Commission Rate (%)" type="number" step="0.01" required />
      <FormField name="isActive" label="Active" type="checkbox" />
    </Form>
    <DialogFooter>
      <Button variant="outline" onClick={closeDialog}>Cancel</Button>
      <Button onClick={handleSubmit}>Add Bank</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Edit Bank Modal:** Same structure, pre-filled with bank data

**Delete Confirmation:**
```tsx
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete {bank.name}?</AlertDialogTitle>
      <AlertDialogDescription>
        This bank is used in {projectCount} projects. Deletion will affect historical data.
        Consider deactivating instead.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Convex Mutations:**
```typescript
// convex/banks.ts
export const createBank = mutation({
  args: { name: v.string(), commissionRate: v.number(), isActive: v.boolean() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("banks", args);
  },
});

export const updateBank = mutation({
  args: { id: v.id("banks"), ...fields },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const toggleBankStatus = mutation({
  args: { id: v.id("banks") },
  handler: async (ctx, { id }) => {
    const bank = await ctx.db.get(id);
    if (!bank) throw new Error("Bank not found");
    await ctx.db.patch(id, { isActive: !bank.isActive });
  },
});

export const deleteBank = mutation({
  args: { id: v.id("banks") },
  handler: async (ctx, { id }) => {
    // Check for usage in projects
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("bankId"), id))
      .collect();
    if (projects.length > 0) {
      throw new Error(`Cannot delete bank used in ${projects.length} projects`);
    }
    await ctx.db.delete(id);
  },
});
```

#### 2. **Referral Companies CRUD** (`/settings/referrals`)

**Add Referral Company Modal Fields:**
- name (string, required)
- contactPerson (string, optional)
- email (email, optional)
- phone (string, optional)
- commissionRate (number, required, 0-100)
- isActive (boolean, default true)

**Validation:**
```typescript
const referralSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  commissionRate: z.number().min(0).max(100),
  isActive: z.boolean(),
});
```

#### 3. **Agents CRUD** (`/settings/agents`)

**Add Agent Modal Fields:**
- name (string, required)
- email (email, required, unique)
- phone (string, optional)
- region (dropdown: Dubai, Abu Dhabi, Sharjah, etc.)
- role (string, default "Agent")
- commissionRate (number, required, 0-100)
- isActive (boolean, default true)

**Important:**
- Agents link to `users` table via `userId`
- On create, must create user record first, then agentProfile
- On delete, use **deactivate** instead (set isActive=false) to preserve data integrity
- Cannot delete agents with active projects

**Convex Pattern:**
```typescript
export const createAgent = mutation({
  args: { name, email, phone, region, commissionRate },
  handler: async (ctx, args) => {
    // 1. Create user record (Convex Auth)
    const userId = await ctx.auth.createUser({ email: args.email, name: args.name });

    // 2. Create agent profile
    const agentId = await ctx.db.insert("agentProfiles", {
      userId,
      commissionRate: args.commissionRate / 100, // Convert to decimal
      isActive: true,
    });

    // 3. Update user role
    await ctx.db.patch(userId, { role: "agent" });

    return agentId;
  },
});
```

#### 4. **Users CRUD** (Admins/Viewers) (`/settings/users`)

**Add User Modal Fields:**
- name (string, required)
- email (email, required, unique)
- phone (string, optional)
- role (dropdown: Admin, Viewer)
- isActive (boolean, default true)

**Important:**
- Cannot change own role (prevent lockout)
- At least one Admin must remain active
- Deactivate instead of delete

**UI Pattern for Action Column:**
```tsx
<TableCell className="text-right">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => openEditModal(user)}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
        {user.isActive ? (
          <>
            <Ban className="mr-2 h-4 w-4" />
            Deactivate
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Activate
          </>
        )}
      </DropdownMenuItem>
      {!isSelf(user) && (
        <DropdownMenuItem
          onClick={() => openDeleteDialog(user)}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>
```

### React Component Structure

```
src/
├── pages/
│   └── SettingsPage.tsx          # Main settings layout with tabs
├── components/
│   └── settings/
│       ├── BanksTab.tsx          # Banks table + CRUD
│       ├── ReferralsTab.tsx      # Referrals table + CRUD
│       ├── AgentsTab.tsx         # Agents table + CRUD
│       ├── UsersTab.tsx          # Users table + CRUD
│       ├── BankForm.tsx          # Reusable form for Add/Edit Bank
│       ├── ReferralForm.tsx      # Reusable form for Add/Edit Referral
│       ├── AgentForm.tsx         # Reusable form for Add/Edit Agent
│       └── UserForm.tsx          # Reusable form for Add/Edit User
├── hooks/
│   └── useSettings.ts            # Shared logic for CRUD operations
└── convex/
    ├── banks.ts                  # Bank queries & mutations
    ├── referralCompanies.ts      # Referral queries & mutations
    ├── agentProfiles.ts          # Agent queries & mutations
    └── users.ts                  # User queries & mutations
```

### Shared Patterns Across All CRUD Modules

1. **Toast Notifications:**
   - Success: "Bank added successfully", "Agent updated", etc.
   - Error: "Failed to delete: Bank is in use", etc.

2. **Loading States:**
   - Skeleton loaders while fetching data
   - Button loading states during mutations
   - Optimistic updates for better UX

3. **Validation:**
   - Client-side: Zod schema validation
   - Server-side: Convex mutation validation
   - Unique constraints (email, name)

4. **Error Handling:**
   - Catch Convex errors (e.g., "Bank in use")
   - Display user-friendly error messages
   - Rollback optimistic updates on failure

5. **Accessibility:**
   - ShadCN components are ARIA-compliant
   - Keyboard navigation (Tab, Enter, Escape)
   - Screen reader announcements for toasts

### Testing Checklist

For each CRUD module, test:
- ✅ Add: Creates record, closes modal, shows toast, updates table
- ✅ Edit: Pre-fills form, saves changes, updates UI
- ✅ Delete: Shows confirmation, handles "in use" errors, removes from table
- ✅ Toggle Status: Updates isActive, shows correct badge color
- ✅ Validation: Required fields, email format, numeric ranges
- ✅ Permissions: Only Admin can access these tabs
- ✅ Real-time: Multiple users see updates instantly (Convex subscriptions)

### Migration from Mockup

When building production:
1. **Reference mockup for table column structure** (what data to display)
2. **Reference mockup for visual styling** (badges, spacing, colors)
3. **Do NOT copy vanilla JS logic** — rebuild with React patterns
4. **Use ShadCN components** throughout (Table, Dialog, Form, AlertDialog)
5. **Follow Convex best practices** for mutations and queries

---

## Multi-File Upload UI (Task #4)

The PRD specifies that certain document slots support multi-file uploads (e.g., A1, A2, A3, B1, C1, C2, etc.). The mockup's `documentConfig.js` correctly flags these with `multiFile: true`, but the UI currently simulates single-file uploads only.

### Production Implementation

**Component Structure:**
```tsx
<FormField name="files" label={slot.label}>
  <FileUpload
    accept={slot.allowedTypes.join(',')}
    multiple={slot.multiFile}
    maxSize={10 * 1024 * 1024} // 10MB per file
    maxFiles={slot.multiFile ? 5 : 1}
    onUpload={handleUpload}
  />
</FormField>
```

**File List Display:**
When multiple files are uploaded to a slot:
```tsx
<div className="mt-2 space-y-2">
  {files.map((file, idx) => (
    <div key={file.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2">
        <FileIcon type={file.type} className="h-4 w-4" />
        <div>
          <p className="text-sm font-semibold text-slate-900">{file.name}</p>
          <p className="text-xs text-slate-500">{file.size} • Uploaded {formatRelative(file.uploadedAt)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => downloadFile(file.id)}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => deleteFile(file.id)}>
          <Trash2 className="h-4 w-4 text-rose-600" />
        </Button>
      </div>
    </div>
  ))}
</div>
```

**Convex Storage Pattern:**
```typescript
export const uploadDocument = mutation({
  args: {
    projectId: v.id("projects"),
    documentCode: v.string(),
    storageId: v.id("_storage"), // Single file upload
  },
  handler: async (ctx, args) => {
    // Get existing document record or create new
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_project_and_code", (q) =>
        q.eq("projectId", args.projectId).eq("documentCode", args.documentCode)
      )
      .first();

    if (existing) {
      // Multi-file: append to fileIds array
      await ctx.db.patch(existing._id, {
        fileIds: [...existing.fileIds, args.storageId],
        status: "uploaded",
        uploadedBy: ctx.auth.getUserId()!,
      });
    } else {
      // First file: create document record
      await ctx.db.insert("documents", {
        projectId: args.projectId,
        documentCode: args.documentCode,
        section: args.section,
        label: args.label,
        fileIds: [args.storageId],
        status: "uploaded",
        uploadedBy: ctx.auth.getUserId()!,
      });
    }
  },
});
```

---

## File Deletion from Documents (Task #5)

The PRD specifies that uploaded files should have delete buttons. When all files are deleted from a slot, the status reverts to "missing".

### Production Implementation

**Delete Confirmation:**
```tsx
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete {file.name}?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete the file from {documentSlot.label}.
        {isLastFile && " The document status will change to Missing."}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Convex Mutation:**
```typescript
export const deleteDocumentFile = mutation({
  args: {
    documentId: v.id("documents"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");

    // Remove storage file
    await ctx.storage.delete(args.storageId);

    // Remove from fileIds array
    const newFileIds = doc.fileIds.filter((id) => id !== args.storageId);

    if (newFileIds.length === 0) {
      // Last file deleted: revert to missing
      await ctx.db.patch(args.documentId, {
        fileIds: [],
        status: "missing",
        uploadedBy: undefined,
        verifiedBy: undefined,
        rejectionReason: undefined,
      });
    } else {
      // Still has files: update array
      await ctx.db.patch(args.documentId, {
        fileIds: newFileIds,
      });
    }

    // Audit log
    await ctx.db.insert("auditLog", {
      action: "document_file_deleted",
      performedBy: ctx.auth.getUserId()!,
      projectId: doc.projectId,
      details: JSON.stringify({ documentCode: doc.documentCode, storageId: args.storageId }),
      timestamp: Date.now(),
    });
  },
});
```

**UI Interaction:**
1. User clicks Delete button on file
2. Confirmation dialog appears
3. On confirm:
   - Show loading state on delete button
   - Call `deleteDocumentFile` mutation
   - On success: remove file from UI, show toast
   - On error: show error toast, revert UI
4. If last file deleted:
   - Update document slot status badge to "Missing"
   - Show "Upload" button
   - Show toast: "All files deleted. Document status changed to Missing."

**Important Permissions:**
- Agents can delete files from their own projects (assigned or created)
- Admins can delete files from any project
- Viewers **cannot** delete files (read-only)

---

## Summary

The mockup demonstrates the **UI patterns and table structures** for Settings CRUD. Production implementation should use React + ShadCN + Convex with proper:
- Form validation (React Hook Form + Zod)
- Modal dialogs (ShadCN Dialog)
- Data mutations (Convex mutations)
- Error handling (in-use checks, unique constraints)
- Real-time updates (Convex subscriptions)

Implementing full CRUD in the vanilla JS mockup would be ~1000+ lines of code that wouldn't translate to production. Better to invest that effort directly in the React app.

**Document enhancements implemented in mockup:**
- ✅ Rejection reason display (Task #2)
- ✅ Auto-complete detection for docsCompletedAt milestone (Task #3)
- 📋 Multi-file upload UI (Task #4) - detailed in production notes above
- 📋 File deletion functionality (Task #5) - detailed in production notes above
