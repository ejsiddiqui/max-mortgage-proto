import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./utils";

export const list = query({
  args: {
    onlyActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("banks");
    if (args.onlyActive) {
      q = q.filter((q) => q.eq(q.field("isActive"), true));
    }
    return await q.collect();
  },
});

export const getById = query({
  args: { id: v.id("banks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    commissionRate: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("banks", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("banks"),
    name: v.optional(v.string()),
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
  args: { id: v.id("banks") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    // Validate: check if any project references this bank
    const project = await ctx.db
      .query("projects")
      .withIndex("by_bank", (q) => q.eq("bankId", args.id))
      .first();
    
    if (project) {
      throw new Error("Cannot delete bank: It is currently referenced by one or more projects.");
    }
    
    await ctx.db.delete(args.id);
  },
});
