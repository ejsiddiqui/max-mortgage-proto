import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireUser } from "./utils";

export const listByProject = query({
  args: { projectId: v.id("projects"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project) return [];

    // RBAC
    if (user.role === "agent" && project.assignedAgentId !== user._id && project.createdBy !== user._id) {
       throw new Error("Not authorized to view logs for this project");
    }

    const logs = await ctx.db
      .query("auditLog")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(args.limit || 50);

    // Resolve performer names
    return await Promise.all(
      logs.map(async (log) => {
        const performer = await ctx.db.get(log.performedBy);
        return {
          ...log,
          performerName: performer?.name || "System",
        };
      })
    );
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    let q = ctx.db.query("auditLog").order("desc");

    const logs = await q.take(args.limit || 10);

    // Resolve details and RBAC filtering for agents
    const filteredLogs = [];
    for (const log of logs) {
      if (user.role === "agent" && log.projectId) {
        const project = await ctx.db.get(log.projectId);
        if (project && project.assignedAgentId !== user._id && project.createdBy !== user._id) {
          continue;
        }
      }
      
      const performer = await ctx.db.get(log.performedBy);
      const project = log.projectId ? await ctx.db.get(log.projectId) : null;
      
      filteredLogs.push({
        ...log,
        performerName: performer?.name || "System",
        projectCode: project?.projectCode,
      });
    }

    return filteredLogs;
  },
});
