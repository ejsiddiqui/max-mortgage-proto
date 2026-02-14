import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireRole } from "./utils";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project) return [];

    // RBAC check
    if (user.role === "agent" && project.assignedAgentId !== user._id && project.createdBy !== user._id) {
       throw new Error("Not authorized to view documents for this project");
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

import { DOCUMENT_CONFIG } from "./documentConfig";
import { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

async function checkDocsCompletion(ctx: MutationCtx, projectId: Id<"projects">) {
  const project = await ctx.db.get(projectId);
  if (!project || project.docsCompletedAt) return;

  const docs = await ctx.db
    .query("documents")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .collect();

  const requiredSlots = DOCUMENT_CONFIG.filter(slot => 
    slot.required && (project.borrowerType === "self_employed" || !slot.selfEmployedOnly)
  );

  const completedRequiredSlots = requiredSlots.filter(slot => {
    const doc = docs.find(d => d.documentCode === slot.code);
    return doc && (doc.status === "uploaded" || doc.status === "verified");
  });

  if (completedRequiredSlots.length === requiredSlots.length) {
    await ctx.db.patch(projectId, {
      docsCompletedAt: Date.now(),
    });
    
    // Also move to Docs Completed stage if currently WIP
    if (project.stage === "wip") {
      await ctx.db.patch(projectId, {
        stage: "docs_completed",
      });
    }
  }
}

export const upload = mutation({
  args: {
    projectId: v.id("projects"),
    documentCode: v.string(),
    section: v.union(v.literal("borrower"), v.literal("company"), v.literal("asset"), v.literal("bank"), v.literal("lease"), v.literal("other")),
    label: v.string(),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "agent"]);
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    if (user.role === "agent" && project.assignedAgentId !== user._id && project.createdBy !== user._id) {
      throw new Error("Not authorized to upload to this project");
    }

    // Check if document entry already exists
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_project_code", (q) => q.eq("projectId", args.projectId).eq("documentCode", args.documentCode))
      .first();

    let docId;
    if (existing) {
      const newFileIds = [...existing.fileIds, args.storageId];
      await ctx.db.patch(existing._id, {
        fileIds: newFileIds,
        status: "uploaded",
        uploadedBy: user._id,
      });
      docId = existing._id;
    } else {
      docId = await ctx.db.insert("documents", {
        projectId: args.projectId,
        documentCode: args.documentCode,
        section: args.section,
        label: args.label,
        fileIds: [args.storageId],
        status: "uploaded",
        uploadedBy: user._id,
      });
    }

    // Log action
    await ctx.db.insert("auditLog", {
      projectId: args.projectId,
      action: "document_upload",
      performedBy: user._id,
      details: JSON.stringify({ documentCode: args.documentCode, label: args.label }),
      timestamp: Date.now(),
    });

    // Check for auto-complete milestone
    await checkDocsCompletion(ctx, args.projectId);
    
    return docId;
  },
});

export const verify = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "viewer"]);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Document not found");

    await ctx.db.patch(args.id, {
      status: "verified",
      verifiedBy: user._id,
      rejectionReason: undefined,
    });

    // Log action
    await ctx.db.insert("auditLog", {
      projectId: doc.projectId,
      action: "document_verify",
      performedBy: user._id,
      details: JSON.stringify({ documentCode: doc.documentCode }),
      timestamp: Date.now(),
    });

    // Check for auto-complete milestone
    await checkDocsCompletion(ctx, doc.projectId);
  },
});

export const reject = mutation({
  args: { id: v.id("documents"), reason: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "viewer"]);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Document not found");

    await ctx.db.patch(args.id, {
      status: "rejected",
      rejectionReason: args.reason,
    });

    // Log action
    await ctx.db.insert("auditLog", {
      projectId: doc.projectId,
      action: "document_reject",
      performedBy: user._id,
      details: JSON.stringify({ documentCode: doc.documentCode, reason: args.reason }),
      timestamp: Date.now(),
    });
  },
});

export const removeFile = mutation({
  args: { id: v.id("documents"), storageId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["admin", "agent"]);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Document not found");

    const newFileIds = doc.fileIds.filter(f => f !== args.storageId);
    
    if (newFileIds.length === 0) {
      await ctx.db.patch(args.id, {
        fileIds: [],
        status: "missing",
      });
    } else {
      await ctx.db.patch(args.id, {
        fileIds: newFileIds,
      });
    }

    await ctx.storage.delete(args.storageId as any);
  },
});
