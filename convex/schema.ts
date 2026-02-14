import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("agent"), v.literal("viewer"))),
    isActive: v.optional(v.boolean()),
    commissionRate: v.optional(v.number()), // For agents, in percentage (0-100)
    phone: v.optional(v.string()),
    region: v.optional(v.string()),
  }).index("by_email", ["email"]),

  banks: defineTable({
    name: v.string(),
    commissionRate: v.number(), // Default bank rate in percentage
    isActive: v.boolean(),
  }),

  referralCompanies: defineTable({
    name: v.string(),
    contactPerson: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    commissionRate: v.number(), // Percentage
    isActive: v.boolean(),
  }),

  projects: defineTable({
    projectCode: v.string(), // e.g. "MM-0001"
    projectName: v.string(), // "{code} - {client} - {type}"
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
    propertyValue: v.optional(v.number()),
    propertyProfile: v.union(v.literal("Land"), v.literal("Building")),
    stage: v.union(
      v.literal("new"),
      v.literal("wip"),
      v.literal("docs_completed"),
      v.literal("submitted"),
      v.literal("fol"),
      v.literal("disbursed"),
      v.literal("closed")
    ),
    status: v.union(
      v.literal("open"),
      v.literal("active"),
      v.literal("on_hold"),
      v.literal("disbursed")
    ),
    closedOutcome: v.optional(
      v.union(
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("cancelled"),
        v.literal("disbursed")
      )
    ),
    onHoldReason: v.optional(v.string()),
    folNotes: v.optional(v.string()),
    createdBy: v.id("users"),
    notes: v.optional(v.string()),

    // Milestone timestamps
    wipStartedAt: v.optional(v.number()),
    docsCompletedAt: v.optional(v.number()),
    submittedAt: v.optional(v.number()),
    folAt: v.optional(v.number()),
    disbursedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),

    // Commission overrides per project (percentages)
    bankCommissionRate: v.optional(v.number()),
    agentCommissionRate: v.optional(v.number()),
    referralCommissionRate: v.optional(v.number()),

    // Commission fields
    expectedCommission: v.optional(v.number()),
    finalCommission: v.optional(v.number()),
    agentPayoutAmount: v.optional(v.number()),
    referralPayoutAmount: v.optional(v.number()),

    // Loan details
    ltv: v.optional(v.number()),
    interestRate: v.optional(v.number()),
    termYears: v.optional(v.number()),
    downPayment: v.optional(v.number()),
    monthlyPayment: v.optional(v.number()),
  })
    .index("by_projectCode", ["projectCode"])
    .index("by_stage", ["stage"])
    .index("by_status", ["status"])
    .index("by_assignedAgent", ["assignedAgentId"])
    .index("by_createdBy", ["createdBy"])
    .index("by_bank", ["bankId"]),

  documents: defineTable({
    projectId: v.id("projects"),
    section: v.union(
      v.literal("borrower"),
      v.literal("company"),
      v.literal("asset"),
      v.literal("bank"),
      v.literal("lease"),
      v.literal("other")
    ),
    documentCode: v.string(), // e.g. "A1"
    label: v.string(),
    fileIds: v.array(v.string()), // IDs from Convex storage
    status: v.union(
      v.literal("missing"),
      v.literal("uploaded"),
      v.literal("verified"),
      v.literal("rejected")
    ),
    verifiedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
    uploadedBy: v.id("users"),
  })
    .index("by_project", ["projectId"])
    .index("by_project_code", ["projectId", "documentCode"]),

  auditLog: defineTable({
    projectId: v.optional(v.id("projects")),
    action: v.string(),
    performedBy: v.id("users"),
    details: v.string(), // JSON string
    timestamp: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_timestamp", ["timestamp"]),
});