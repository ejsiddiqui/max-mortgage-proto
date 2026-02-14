import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./utils";

export const list = query({
  args: {
    onlyActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("referralCompanies");
    if (args.onlyActive) {
      q = q.filter((q) => q.eq(q.field("isActive"), true));
    }
    return await q.collect();
  },
});

export const getById = query({
  args: { id: v.id("referralCompanies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    contactPerson: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    commissionRate: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("referralCompanies", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("referralCompanies"),
    name: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    commissionRate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("referralCompanies") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    // Validate usage
    const project = await ctx.db
      .query("projects")
      .filter(q => q.eq(q.field("referralCompanyId"), args.id))
      .first();
    
    if (project) {
      throw new Error("Cannot delete referral company: It is currently referenced by one or more projects.");
    }
    
    await ctx.db.delete(args.id);
  },
});
