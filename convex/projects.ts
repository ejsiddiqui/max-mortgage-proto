import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireRole, getCurrentUser } from "./utils";
import { generateProjectCode } from "../src/lib/utils";

export const list = query({
  args: {
    stage: v.optional(v.string()),
    status: v.optional(v.string()),
    agentId: v.optional(v.id("users")),
    bankId: v.optional(v.id("banks")),
    borrowerType: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    let q = ctx.db.query("projects");

    // RBAC: Agents see only assigned/created projects
    if (user.role === "agent") {
      // Convex doesn't support OR in filters easily across different indexes
      // For now, we'll filter after collecting or use a custom filter
      q = q.filter((q) => 
        q.or(
          q.eq(q.field("assignedAgentId"), user._id),
          q.eq(q.field("createdBy"), user._id)
        )
      );
    }

    if (args.stage) q = q.filter(f => f.eq(f.field("stage"), args.stage));
    if (args.status) q = q.filter(f => f.eq(f.field("status"), args.status));
    if (args.agentId) q = q.filter(f => f.eq(f.field("assignedAgentId"), args.agentId));
    if (args.bankId) q = q.filter(f => f.eq(f.field("bankId"), args.bankId));
    if (args.borrowerType) q = q.filter(f => f.eq(f.field("borrowerType"), args.borrowerType));
    
    let results = await q.collect();

    if (args.search) {
      const search = args.search.toLowerCase();
      results = results.filter(p => 
        p.clientName.toLowerCase().includes(search) || 
        p.projectCode.toLowerCase().includes(search)
      );
    }

    // Resolve bank and agent names for the list
    const enrichedResults = await Promise.all(
      results.map(async (project) => {
        const bank = await ctx.db.get(project.bankId);
        const agent = await ctx.db.get(project.assignedAgentId);
        return {
          ...project,
          bankName: bank?.name,
          agentName: agent?.name,
        };
      })
    );

    return enrichedResults;
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const project = await ctx.db.get(args.id);
    if (!project) return null;

    // RBAC check
    if (user.role === "agent" && project.assignedAgentId !== user._id && project.createdBy !== user._id) {
      throw new Error("Not authorized to view this project");
    }

    // Resolve references
    const bank = await ctx.db.get(project.bankId);
    const agent = await ctx.db.get(project.assignedAgentId);
    const referral = project.referralCompanyId ? await ctx.db.get(project.referralCompanyId) : null;
    const creator = await ctx.db.get(project.createdBy);

    // Resolve agent image
    let agentImage = agent?.image;
    if (agentImage) {
      try {
        const url = await ctx.storage.getUrl(agentImage);
        if (url) agentImage = url;
      } catch (e) {}
    }

    return {
      ...project,
      bankName: bank?.name,
      agentName: agent?.name,
      agentImage,
      referralName: referral?.name,
      creatorName: creator?.name,
    };
  },
});

export const create = mutation({
  args: {
    clientName: v.string(),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    borrowerType: v.union(v.literal("salaried"), v.literal("self_employed")),
    businessType: v.union(v.literal("buyout"), v.literal("equity_release")),
    bankId: v.id("banks"),
    referralCompanyId: v.optional(v.id("referralCompanies")),
    assignedAgentId: v.id("users"),
    loanAmount: v.number(),
    property: v.optional(v.string()),
    propertyProfile: v.union(v.literal("Land"), v.literal("Building")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "agent"]);

    // Generate project code
    const lastProject = await ctx.db.query("projects").order("desc").first();
    const projectCode = generateProjectCode(lastProject?.projectCode);
    const projectName = `${projectCode} - ${args.clientName} - ${args.businessType === "buyout" ? "Buyout" : "Equity Release"}`;

    // Get default commission rates
    const bank = await ctx.db.get(args.bankId);
    const agent = await ctx.db.get(args.assignedAgentId);
    const referral = args.referralCompanyId ? await ctx.db.get(args.referralCompanyId) : null;

    const projectId = await ctx.db.insert("projects", {
      ...args,
      projectCode,
      projectName,
      stage: "new",
      status: "open",
      createdBy: user._id,
      bankCommissionRate: bank?.commissionRate,
      agentCommissionRate: agent?.commissionRate,
      referralCommissionRate: referral?.commissionRate || 0,
    });

    // Log action
    await ctx.db.insert("auditLog", {
      projectId,
      action: "project_created",
      performedBy: user._id,
      details: JSON.stringify({ projectCode }),
      timestamp: Date.now(),
    });

    return projectId;
  },
});

export const changeStage = mutation({
  args: {
    id: v.id("projects"),
    newStage: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "agent"]);
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    // RBAC for agents
    if (user.role === "agent" && project.assignedAgentId !== user._id && project.createdBy !== user._id) {
      throw new Error("Not authorized to modify this project");
    }

    // Status check: must be open or active to move (except for some transitions if needed)
    if (project.status === "on_hold") {
      throw new Error("Cannot move project while it is on hold");
    }

    const stages = ["new", "wip", "docs_completed", "submitted", "fol", "disbursed", "closed"];
    const currentIndex = stages.indexOf(project.stage);
    const newIndex = stages.indexOf(args.newStage);

    if (newIndex === -1) throw new Error("Invalid stage");

    // Forward-only validation (exception: Disbursed -> Closed is always allowed if we are at Disbursed)
    if (newIndex <= currentIndex && !(project.stage === "disbursed" && args.newStage === "closed")) {
       // Only Admins can move backwards via specialized tool if we had one, but Kanban blocks it.
       // For v1, we enforce forward-only.
       throw new Error("Stages must move forward only");
    }

    const updates: any = { stage: args.newStage };

    // Auto-milestones
    if (args.newStage === "wip" && !project.wipStartedAt) updates.wipStartedAt = Date.now();
    if (args.newStage === "docs_completed" && !project.docsCompletedAt) updates.docsCompletedAt = Date.now();
    if (args.newStage === "submitted" && !project.submittedAt) updates.submittedAt = Date.now();
    if (args.newStage === "fol" && !project.folAt) {
      updates.folAt = Date.now();
      if (args.metadata?.folNotes) updates.folNotes = args.metadata.folNotes;
    }
    if (args.newStage === "disbursed" && !project.disbursedAt) {
      updates.disbursedAt = Date.now();
      updates.status = "disbursed";
    }
    if (args.newStage === "closed" && !project.closedAt) {
      updates.closedAt = Date.now();
      if (args.metadata?.closedOutcome) updates.closedOutcome = args.metadata.closedOutcome;
    }

    await ctx.db.patch(args.id, updates);

    // Log action
    await ctx.db.insert("auditLog", {
      projectId: args.id,
      action: "stage_change",
      performedBy: user._id,
      details: JSON.stringify({ from: project.stage, to: args.newStage }),
      timestamp: Date.now(),
    });
  },
});

export const changeStatus = mutation({
  args: {
    id: v.id("projects"),
    newStatus: v.union(v.literal("open"), v.literal("active"), v.literal("on_hold"), v.literal("disbursed")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "agent"]);
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    if (user.role === "agent" && project.assignedAgentId !== user._id && project.createdBy !== user._id) {
      throw new Error("Not authorized to modify this project");
    }

    if (project.status === "disbursed") {
      throw new Error("Cannot change status of a disbursed project");
    }

    if (args.newStatus === "on_hold" && !args.reason) {
      throw new Error("Reason is required to put a project on hold");
    }

    const updates: any = { status: args.newStatus };
    if (args.newStatus === "on_hold") updates.onHoldReason = args.reason;
    if (args.newStatus === "active") updates.onHoldReason = undefined;

    await ctx.db.patch(args.id, updates);

    // Log action
    await ctx.db.insert("auditLog", {
      projectId: args.id,
      action: "status_change",
      performedBy: user._id,
      details: JSON.stringify({ from: project.status, to: args.newStatus, reason: args.reason }),
      timestamp: Date.now(),
    });
  },
});

export const updateCommission = mutation({
  args: {
    id: v.id("projects"),
    bankCommissionRate: v.optional(v.number()),
    agentCommissionRate: v.optional(v.number()),
    referralCommissionRate: v.optional(v.number()),
    finalCommission: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const { id, ...fields } = args;
    const project = await ctx.db.get(id);
    if (!project) throw new Error("Project not found");

    await ctx.db.patch(id, fields);

    // Log action
    await ctx.db.insert("auditLog", {
      projectId: id,
      action: "commission_edit",
      performedBy: (await requireUser(ctx))._id,
      details: JSON.stringify({ fields }),
      timestamp: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    clientName: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    borrowerType: v.optional(v.union(v.literal("salaried"), v.literal("self_employed"))),
    businessType: v.optional(v.union(v.literal("buyout"), v.literal("equity_release"))),
    bankId: v.optional(v.id("banks")),
    referralCompanyId: v.optional(v.id("referralCompanies")),
    assignedAgentId: v.optional(v.id("users")),
    loanAmount: v.optional(v.number()),
    property: v.optional(v.string()),
    propertyProfile: v.optional(v.union(v.literal("Land"), v.literal("Building"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "agent"]);
    const { id, ...fields } = args;
    const project = await ctx.db.get(id);
    if (!project) throw new Error("Project not found");

    if (user.role === "agent" && project.assignedAgentId !== user._id && project.createdBy !== user._id) {
      throw new Error("Not authorized to modify this project");
    }

    await ctx.db.patch(id, fields);

    // Log action
    await ctx.db.insert("auditLog", {
      projectId: id,
      action: "project_updated",
      performedBy: user._id,
      details: JSON.stringify({ updatedFields: Object.keys(fields) }),
      timestamp: Date.now(),
    });
  },
});
