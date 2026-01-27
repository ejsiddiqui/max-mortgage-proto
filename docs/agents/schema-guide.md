# Database Schema Guide

This document details the complete Convex schema definition for the Max Mortgage system.

## Core Schema Definition

Always use `defineSchema` and `defineTable`. Here's the complete schema mapping from the PRD:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Projects (Core Entity)
  projects: defineTable({
    code: v.string(), // Auto-generated: {Code} + {Client} + {Business Type}
    clientName: v.string(),
    clientEmail: v.string(),
    clientPhone: v.string(),
    businessType: v.string(), // e.g., "Home Purchase", "Refinance"
    
    // Status & Stage (PRD Section 3.1)
    status: v.union(v.literal("Open"), v.literal("On-Hold"), v.literal("Closed")),
    stage: v.union(
      v.literal("Intake"),
      v.literal("Docs"),
      v.literal("Submission"),
      v.literal("Decision"),
      v.literal("Disbursement")
    ),
    outcome: v.optional(v.union(
      v.literal("Approved"),
      v.literal("Rejected"),
      v.literal("Cancelled"),
      v.literal("Disbursed")
    )),
    
    // Relationships
    bankId: v.id("banks"),
    agentId: v.string(), // Clerk User ID
    referralCompanyId: v.optional(v.id("referralCompanies")),
    
    // Template & Versioning
    templateId: v.id("templates"),
    templateVersion: v.number(),
    
    // Financial Data
    loanAmount: v.number(),
    expectedCommission: v.optional(v.number()),
    finalCommission: v.optional(v.number()), // Entered after disbursement
    
    // Milestone Timestamps (T1-T4 from PRD Section 4.1)
    createdAt: v.number(),
    docsCompletedAt: v.optional(v.number()),
    submittedAt: v.optional(v.number()),
    decisionAt: v.optional(v.number()),
    disbursedAt: v.optional(v.number()),
    
    // On-Hold Tracking
    pausedAt: v.optional(v.number()),
    totalPausedDuration: v.optional(v.number()), // Milliseconds
    
    updatedAt: v.number(),
  })
    .index("by_agent", ["agentId"])
    .index("by_status", ["status"])
    .index("by_stage", ["stage"])
    .index("by_bank", ["bankId"])
    .index("by_created", ["createdAt"]),

  // Banks (Master Data)
  banks: defineTable({
    name: v.string(),
    commissionRate: v.number(), // Percentage
    isActive: v.boolean(),
  }),

  // Referral Companies (Master Data)
  referralCompanies: defineTable({
    name: v.string(),
    contactPerson: v.string(),
    commissionRate: v.number(), // Percentage
    isActive: v.boolean(),
  }),

  // Users (Synced from Clerk)
  users: defineTable({
    clerkId: v.string(),
    role: v.union(v.literal("admin"), v.literal("agent")),
    name: v.string(),
    email: v.string(),
    commissionRate: v.optional(v.number()), // Agent's commission percentage
    isActive: v.boolean(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  // Templates (Dynamic Forms)
  templates: defineTable({
    name: v.string(),
    businessType: v.string(),
    version: v.number(),
    isActive: v.boolean(),
    screens: v.array(v.object({
      title: v.string(),
      fields: v.array(v.object({
        name: v.string(),
        type: v.union(v.literal("text"), v.literal("number"), v.literal("dropdown"), v.literal("file")),
        label: v.string(),
        required: v.boolean(),
        options: v.optional(v.array(v.string())), // For dropdowns
      })),
    })),
    requiredDocs: v.array(v.string()), // Document categories
  })
    .index("by_business_type", ["businessType"])
    .index("by_active", ["isActive"]),

  // Documents
  documents: defineTable({
    projectId: v.id("projects"),
    category: v.string(), // "Required" or "Other"
    fileName: v.string(),
    fileStorageId: v.id("_storage"), // Convex File Storage ID
    uploadedBy: v.string(), // Clerk User ID
    uploadedAt: v.number(),
    verificationStatus: v.union(
      v.literal("Missing"),
      v.literal("Uploaded"),
      v.literal("Verified"),
      v.literal("Rejected")
    ),
    verifiedBy: v.optional(v.string()), // Admin Clerk User ID
    verifiedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["verificationStatus"]),

  // Audit Events (Immutable Log - PRD Section 6.2)
  auditEvents: defineTable({
    projectId: v.optional(v.id("projects")),
    action: v.string(), // "STAGE_CHANGE", "DOC_UPLOAD", "COMMISSION_EDIT", etc.
    userId: v.string(), // Clerk User ID
    previousValue: v.optional(v.string()), // JSON stringified
    newValue: v.optional(v.string()), // JSON stringified
    timestamp: v.number(),
    metadata: v.optional(v.object({})), // Additional context
  })
    .index("by_project", ["projectId"])
    .index("by_timestamp", ["timestamp"]),

  // Project Facts (Cached Rollups for Reporting - PRD Section 4.2)
  projectFacts: defineTable({
    projectId: v.id("projects"),
    daysInCurrentStage: v.number(),
    t1Duration: v.optional(v.number()), // Speed to Lead (days)
    t2Duration: v.optional(v.number()), // Prep Time (days)
    t3Duration: v.optional(v.number()), // Bank SLA (days)
    t4Duration: v.optional(v.number()), // Closing (days)
    agentCommissionShare: v.optional(v.number()),
    referralCommissionShare: v.optional(v.number()),
    lastCalculatedAt: v.number(),
  })
    .index("by_project", ["projectId"]),
});
```

## Schema Best Practices

* **Strict Schemas:** Always use `defineSchema` and `defineTable`.
* **Enums:** Use string unions for Status/Stage (e.g., `v.union(v.literal("Open"), v.literal("Closed"))`).
* **Indexing:** Add `.index("by_agent", ["agentId"])` for performance early on.
* **No Nullable IDs:** Use `v.optional()` for optional fields, but never for required relationships.

## Schema Evolution

When modifying the schema:
1. Run `npx convex dev` to push changes
2. Test with existing data to ensure backward compatibility
3. Update TypeScript types via `npx convex dev` auto-generation
4. Document breaking changes in migration notes
