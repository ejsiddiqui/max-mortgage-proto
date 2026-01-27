# Business Logic Rules

This document details all PRD-mandated business rules that MUST be enforced in Convex mutations.

## 1. The "One-Bank" Rule (PRD Section 3.1)

A project represents exactly **one** submission to **one** bank. Validate before creation:

```typescript
// In createProject mutation
export const createProject = mutation({
  args: {
    clientEmail: v.string(),
    bankId: v.id("banks"),
    // ... other fields
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    // RULE: One-Bank Rule
    const existingProject = await ctx.db
      .query("projects")
      .filter((q) =>
        q.and(
          q.eq(q.field("clientEmail"), args.clientEmail),
          q.eq(q.field("bankId"), args.bankId)
        )
      )
      .first();

    if (existingProject) {
      throw new Error("A project for this client and bank already exists");
    }
    
    // ... continue with creation
  },
});
```

## 2. Stage/Status Lock (PRD Section 3.1)

Stage transitions are only allowed when `status === "Open"`:

```typescript
export const updateProjectStage = mutation({
  args: {
    projectId: v.id("projects"),
    newStage: v.union(v.literal("Intake"), v.literal("Docs"), /* ... */),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    
    // RULE: Stage Lock
    if (project.status !== "Open") {
      throw new Error("Cannot change stage when status is not Open");
    }
    
    // ... continue with update
  },
});
```

## 3. Chronological Milestones (PRD Section 4.2)

Validate `newDate >= previousDate`:

```typescript
export const updateSubmissionDate = mutation({
  args: {
    projectId: v.id("projects"),
    submittedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    
    // RULE: Chronological Order
    if (project.docsCompletedAt && args.submittedAt < project.docsCompletedAt) {
      throw new Error("Submission date cannot be before Docs Completed date");
    }
    
    // ... continue with update
  },
});
```

## 4. Backdating Permissions (PRD Section 4.2)

Only Admins can modify past milestone dates:

```typescript
export const backdateMilestone = mutation({
  args: {
    projectId: v.id("projects"),
    milestoneField: v.string(),
    newTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    // RULE: Admin-Only Backdating
    if (user?.role !== "admin") {
      throw new Error("Only admins can backdate milestones");
    }
    
    // ... continue with update
  },
});
```

## 5. On-Hold Clock Tracking (PRD Section 3.1)

When status changes to "On-Hold", capture `pausedAt` timestamp:

```typescript
export const updateProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    newStatus: v.union(v.literal("Open"), v.literal("On-Hold"), v.literal("Closed")),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    
    // RULE: On-Hold Clock Tracking
    if (args.newStatus === "On-Hold") {
      await ctx.db.patch(args.projectId, {
        status: "On-Hold",
        pausedAt: Date.now(),
      });
    } else if (project.status === "On-Hold" && args.newStatus === "Open") {
      const pausedDuration = Date.now() - (project.pausedAt ?? 0);
      await ctx.db.patch(args.projectId, {
        status: "Open",
        pausedAt: undefined,
        totalPausedDuration: (project.totalPausedDuration ?? 0) + pausedDuration,
      });
    } else {
      await ctx.db.patch(args.projectId, {
        status: args.newStatus,
      });
    }
    
    // ... audit log, etc.
  },
});
```

## 6. Commission Calculation Logic (PRD Section 3.2)

```typescript
export const calculateCommissionSplits = (params: {
  totalCommission: number;
  agentRate: number;
  referralRate?: number;
}) => {
  const agentShare = params.totalCommission * params.agentRate;
  const referralShare = params.referralRate 
    ? params.totalCommission * params.referralRate 
    : 0;
  const companyShare = params.totalCommission - agentShare - referralShare;
  
  return {
    agentShare,
    referralShare,
    companyShare,
  };
};

export const updateFinalCommission = mutation({
  args: {
    projectId: v.id("projects"),
    finalCommission: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    // RULE: Only Admin can edit final commission
    if (user?.role !== "admin") {
      throw new Error("Only admins can update final commission");
    }
    
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    
    // Update commission
    await ctx.db.patch(args.projectId, {
      finalCommission: args.finalCommission,
    });
    
    // Recalculate splits in projectFacts
    const agent = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", project.agentId))
      .unique();
    
    const referralCompany = project.referralCompanyId 
      ? await ctx.db.get(project.referralCompanyId)
      : null;
    
    const splits = calculateCommissionSplits({
      totalCommission: args.finalCommission,
      agentRate: agent?.commissionRate ?? 0.6,
      referralRate: referralCompany?.commissionRate,
    });
    
    // Update projectFacts
    await ctx.db
      .query("projectFacts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first()
      .then(async (fact) => {
        if (fact) {
          await ctx.db.patch(fact._id, {
            agentCommissionShare: splits.agentShare,
            referralCommissionShare: splits.referralShare,
            lastCalculatedAt: Date.now(),
          });
        }
      });
    
    // Audit log
    await ctx.db.insert("auditEvents", {
      projectId: args.projectId,
      action: "COMMISSION_EDIT",
      userId: identity.subject,
      previousValue: JSON.stringify({ finalCommission: project.finalCommission }),
      newValue: JSON.stringify({ finalCommission: args.finalCommission }),
      timestamp: Date.now(),
    });
  },
});
```

## Business Rules Checklist

Before deploying:
- [ ] One-Bank Rule enforced on project creation
- [ ] Stage changes blocked when status is not "Open"
- [ ] Milestone dates validated for chronological order
- [ ] Backdating restricted to Admin role
- [ ] On-Hold clock tracking working correctly
- [ ] Commission splits calculated accurately
- [ ] All business rules have corresponding audit logs
