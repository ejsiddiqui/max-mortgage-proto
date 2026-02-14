import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { requireAdmin } from "./utils";
import { Doc } from "./_generated/dataModel";

async function resolveUserImage(ctx: QueryCtx, user: Doc<"users"> | null) {
  if (!user) return null;
  if (!user.image) return user;
  
  // If it's a storageId, get the URL
  try {
    const url = await ctx.storage.getUrl(user.image);
    if (url) {
      return { ...user, image: url };
    }
  } catch (e) {
    // If it fails, it might already be a URL or invalid ID
  }
  return user;
}

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    return await resolveUserImage(ctx, user);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return await Promise.all(users.map(u => resolveUserImage(ctx, u)));
  },
});

export const listAgents = query({
  args: { onlyActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "agent"));
    
    if (args.onlyActive) {
      q = q.filter((q) => q.eq(q.field("isActive"), true));
    }
    
    const agents = await q.collect();
    return await Promise.all(agents.map(a => resolveUserImage(ctx, a)));
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("agent"), v.literal("viewer"))),
    isActive: v.optional(v.boolean()),
    commissionRate: v.optional(v.number()),
    phone: v.optional(v.string()),
    region: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...fields } = args;
    
    // Check if user is updating themselves or is an admin
    const user = await ctx.db.get(userId);
    const isAdmin = user?.role === "admin";
    const isSelf = userId === id;

    if (!isAdmin && !isSelf) {
      throw new Error("Not authorized to update this profile");
    }

    // Restrict sensitive fields to admins only
    if (!isAdmin) {
      delete fields.role;
      delete fields.isActive;
      delete fields.commissionRate;
    }
    
    // Safety check: Cannot deactivate last admin
    if (fields.isActive === false && isAdmin) {
      const targetUser = await ctx.db.get(id);
      if (targetUser?.role === "admin") {
        const otherAdmins = await ctx.db
          .query("users")
          .filter((q) => 
            q.and(
              q.eq(q.field("role"), "admin"),
              q.eq(q.field("isActive"), true),
              q.neq(q.field("_id"), id)
            )
          )
          .first();
        if (!otherAdmins) {
          throw new Error("Cannot deactivate the last active admin.");
        }
      }
    }
    
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const userId = await getAuthUserId(ctx);
    
    if (userId === args.id) {
      throw new Error("Cannot delete your own account.");
    }
    
    const user = await ctx.db.get(args.id);
    if (user?.role === "admin") {
      const otherAdmins = await ctx.db
          .query("users")
          .filter((q) => 
            q.and(
              q.eq(q.field("role"), "admin"),
              q.eq(q.field("isActive"), true),
              q.neq(q.field("_id"), args.id)
            )
          )
          .first();
      if (!otherAdmins) {
        throw new Error("Cannot delete the last active admin.");
      }
    }
    
    // Check if user is referenced in projects
    const project = await ctx.db
      .query("projects")
      .withIndex("by_assignedAgent", (q) => q.eq("assignedAgentId", args.id))
      .first();
    
    if (project) {
      throw new Error("Cannot delete user: They are assigned to one or more projects. Deactivate them instead.");
    }

    await ctx.db.delete(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("agent"), v.literal("viewer")),
    commissionRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    if (existing) {
      throw new Error("User with this email already exists.");
    }

    const userId = await ctx.db.insert("users", {
      ...args,
      isActive: true,
    });

    return userId;
  },
});