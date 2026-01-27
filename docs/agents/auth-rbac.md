# Authentication & RBAC Guide

This document covers authentication patterns and role-based access control implementation.

## Identity Management

* **Do NOT create a "Users" table for basic auth.** Use `ctx.auth.getUserIdentity()` in Convex functions for authentication.
* **DO create a "Users" table** for storing custom metadata (role, commission rate, etc.).

## Role-Based Access Control (RBAC)

Check roles inside Convex mutations and queries:

```typescript
// Example Pattern
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Unauthorized");

const user = await ctx.db
  .query("users")
  .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
  .unique();

if (!user || user.role !== "admin") {
  throw new Error("Admin access required");
}
```

## Role Syncing with Clerk Webhooks

Use Clerk Webhooks to sync `publicMetadata.role` to the `users` table:

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Verify Clerk webhook signature
    // 2. Parse payload
    const payload = await request.json();
    const { id, email_addresses, first_name, last_name, public_metadata } = payload.data;
    
    // 3. Sync to Convex
    await ctx.runMutation(internal.users.syncFromClerk, {
      clerkId: id,
      email: email_addresses[0]?.email_address ?? "",
      name: `${first_name} ${last_name}`,
      role: public_metadata?.role ?? "agent",
    });
    
    return new Response(null, { status: 200 });
  }),
});

export default http;
```

## RBAC Patterns by Feature

### Project Access Control
```typescript
// Agent can only view their own projects
export const getMyProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    return await ctx.db
      .query("projects")
      .withIndex("by_agent", (q) => q.eq("agentId", identity.subject))
      .collect();
  },
});

// Admin can view all projects
export const getAllProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (user?.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    return await ctx.db.query("projects").collect();
  },
});
```

### Document Visibility (PRD Section 3.4)
```typescript
export const getProjectDocuments = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    // RBAC: Admin or Project Owner
    if (user?.role !== "admin" && project.agentId !== identity.subject) {
      throw new Error("Access denied");
    }
    
    return await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});
```

### Financial Data Access
```typescript
// Agents can only view their own commission data
export const getMyCommissionSummary = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_agent", (q) => q.eq("agentId", identity.subject))
      .collect();
    
    // Only return finalCommission for closed projects
    return projects
      .filter(p => p.status === "Closed")
      .map(p => ({
        projectId: p._id,
        projectCode: p.code,
        finalCommission: p.finalCommission,
      }));
  },
});
```

## Frontend Route Protection

```tsx
// app/admin/layout.tsx
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function AdminLayout({ children }) {
  const { user } = useUser();
  
  if (!user?.publicMetadata?.role || user.publicMetadata.role !== "admin") {
    redirect("/dashboard");
  }
  
  return <>{children}</>;
}
```

## RBAC Testing Checklist

- [ ] Agent cannot view another agent's projects
- [ ] Agent cannot access admin routes
- [ ] Agent can only view their own commission data
- [ ] Admin can view all projects and financials
- [ ] Admin can backdate milestones
- [ ] Document visibility follows PRD rules
