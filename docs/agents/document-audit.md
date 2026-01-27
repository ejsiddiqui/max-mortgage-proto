# Document Management & Audit Trail

This document covers file storage patterns and immutable audit logging.

## Document Management (Convex File Storage)

### Storage Strategy
* **Upload:** Use `ctx.storage.store()` for file uploads (Convex File Storage, not external S3).
* **Metadata:** Store file metadata (name, category, uploadedBy, verificationStatus) in the `documents` table.
* **Retrieval:** Use `ctx.storage.getUrl(storageId)` to generate temporary download URLs.

### File Upload Example

```typescript
// convex/documents.ts
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveDocumentMetadata = mutation({
  args: {
    projectId: v.id("projects"),
    category: v.string(),
    fileName: v.string(),
    fileStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    // Verify project access
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (user?.role !== "admin" && project.agentId !== identity.subject) {
      throw new Error("Access denied");
    }
    
    // Save metadata
    const docId = await ctx.db.insert("documents", {
      projectId: args.projectId,
      category: args.category,
      fileName: args.fileName,
      fileStorageId: args.fileStorageId,
      uploadedBy: identity.subject,
      uploadedAt: Date.now(),
      verificationStatus: "Uploaded",
    });
    
    // Audit log
    await ctx.db.insert("auditEvents", {
      projectId: args.projectId,
      action: "DOC_UPLOAD",
      userId: identity.subject,
      newValue: JSON.stringify({ documentId: docId, fileName: args.fileName }),
      timestamp: Date.now(),
    });
    
    return docId;
  },
});
```

### Document Retrieval

```typescript
export const getDocumentUrl = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");
    
    const project = await ctx.db.get(document.projectId);
    if (!project) throw new Error("Project not found");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    // RBAC: Admin or Project Owner
    if (user?.role !== "admin" && project.agentId !== identity.subject) {
      throw new Error("Access denied");
    }
    
    return await ctx.storage.getUrl(document.fileStorageId);
  },
});
```

### Visibility Rules (PRD Section 3.4)
* **Required Docs:** Visible to Admin + Assigned Agent.
* **Other Docs:** Visible to Admin + Project Owner only.

### Verification Flow

```typescript
export const verifyDocument = mutation({
  args: {
    documentId: v.id("documents"),
    approved: v.boolean(),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    // RULE: Only Admin can verify documents
    if (user?.role !== "admin") {
      throw new Error("Only admins can verify documents");
    }
    
    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");
    
    await ctx.db.patch(args.documentId, {
      verificationStatus: args.approved ? "Verified" : "Rejected",
      verifiedBy: identity.subject,
      verifiedAt: Date.now(),
      rejectionReason: args.rejectionReason,
    });
    
    // Audit log
    await ctx.db.insert("auditEvents", {
      projectId: document.projectId,
      action: args.approved ? "DOC_VERIFIED" : "DOC_REJECTED",
      userId: identity.subject,
      newValue: JSON.stringify({
        documentId: args.documentId,
        fileName: document.fileName,
        rejectionReason: args.rejectionReason,
      }),
      timestamp: Date.now(),
    });
  },
});
```

**States:** Missing → Uploaded → Verified / Rejected

---

## Audit Trail (Immutable Log)

### Implementation

Every critical mutation must append a record to `auditEvents`:

```typescript
// Example: Stage Change Mutation
export const updateProjectStage = mutation({
  args: {
    projectId: v.id("projects"),
    newStage: v.union(v.literal("Intake"), v.literal("Docs"), /* ... */),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    
    // Business Rule: Stage changes only allowed when status is "Open"
    if (project.status !== "Open") {
      throw new Error("Cannot change stage when status is not Open");
    }
    
    // Update project
    await ctx.db.patch(args.projectId, {
      stage: args.newStage,
      updatedAt: Date.now(),
    });
    
    // Audit Log (Append-Only)
    await ctx.db.insert("auditEvents", {
      projectId: args.projectId,
      action: "STAGE_CHANGE",
      userId: identity.subject,
      previousValue: JSON.stringify({ stage: project.stage }),
      newValue: JSON.stringify({ stage: args.newStage }),
      timestamp: Date.now(),
    });
  },
});
```

### Audit Events to Track

| Event              | Description                          | Trigger                |
| ------------------ | ------------------------------------ | ---------------------- |
| `STAGE_CHANGE`     | Project moved to new stage           | Stage update mutation  |
| `STATUS_CHANGE`    | Status changed (Open/On-Hold/Closed) | Status update mutation |
| `DOC_UPLOAD`       | Document uploaded                    | File upload complete   |
| `DOC_VERIFIED`     | Document verified by admin           | Admin approval         |
| `DOC_REJECTED`     | Document rejected by admin           | Admin rejection        |
| `COMMISSION_EDIT`  | Commission amount changed            | Financial update       |
| `LOAN_AMOUNT_EDIT` | Loan amount modified                 | Project edit           |
| `PROJECT_CREATED`  | New project created                  | Project creation       |
| `PROJECT_CLOSED`   | Project closed with outcome          | Project closure        |

### Audit Log Query

```typescript
export const getProjectAuditLog = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    // RBAC: Admin only for full audit logs
    if (user?.role !== "admin") {
      throw new Error("Admin access required for audit logs");
    }
    
    return await ctx.db
      .query("auditEvents")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});
```

### Critical Rules
* **Append-Only:** The `auditEvents` table is immutable. No update/delete mutations allowed.
* **Complete Context:** Always include `userId`, `action`, and `timestamp`.
* **Structured Data:** Use JSON.stringify for `previousValue` and `newValue` to preserve structure.
* **Admin Access:** Only admins can query full audit logs.

### Frontend Display

```tsx
// components/AuditTimeline.tsx
const AuditTimeline = ({ projectId }: { projectId: Id<"projects"> }) => {
  const auditEvents = useQuery(api.documents.getProjectAuditLog, { projectId });
  
  if (!auditEvents) return <Skeleton />;
  
  return (
    <div className="space-y-4">
      {auditEvents.map((event) => (
        <div key={event._id} className="flex gap-4">
          <div className="text-sm text-navy-500">
            {new Date(event.timestamp).toLocaleString()}
          </div>
          <div className="flex-1">
            <Badge variant={getActionVariant(event.action)}>
              {event.action}
            </Badge>
            <p className="text-sm text-navy-600 mt-1">
              {formatAuditMessage(event)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## Document & Audit Checklist

- [ ] File uploads use Convex File Storage
- [ ] Document metadata stored in `documents` table
- [ ] Visibility rules enforced (Required vs Other docs)
- [ ] Verification flow requires Admin role
- [ ] All critical mutations log to `auditEvents`
- [ ] Audit table is append-only (no update/delete functions)
- [ ] Audit logs include complete context (user, action, before/after)
