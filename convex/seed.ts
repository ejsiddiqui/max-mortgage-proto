import { mutation, internalMutation } from "./_generated/server";

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // 1. Create Users
    const adminId = await ctx.db.insert("users", {
      name: "Admin User",
      email: "admin@maxmortgage.com",
      role: "admin",
      isActive: true,
    });

    const agent1Id = await ctx.db.insert("users", {
      name: "Sarah Mitchell",
      email: "sarah.mitchell@maxmortgage.com",
      role: "agent",
      isActive: true,
      commissionRate: 70,
    });

    const agent2Id = await ctx.db.insert("users", {
      name: "James Rodriguez",
      email: "james.rodriguez@maxmortgage.com",
      role: "agent",
      isActive: true,
      commissionRate: 65,
    });

    const viewerId = await ctx.db.insert("users", {
      name: "Supervisor John",
      email: "john@maxmortgage.com",
      role: "viewer",
      isActive: true,
    });

    // 2. Create Banks
    const bank1Id = await ctx.db.insert("banks", {
      name: "First National Bank",
      commissionRate: 1.5,
      isActive: true,
    });

    const bank2Id = await ctx.db.insert("banks", {
      name: "Emirates NBD",
      commissionRate: 1.25,
      isActive: true,
    });

    const bank3Id = await ctx.db.insert("banks", {
      name: "ADCB",
      commissionRate: 1.4,
      isActive: true,
    });

    // 3. Create Referral Companies
    const ref1Id = await ctx.db.insert("referralCompanies", {
      name: "Epyc Real Estate",
      contactPerson: "Ejaz Siddiqui",
      email: "ejaz@epyc.ae",
      commissionRate: 20,
      isActive: true,
    });

    const ref2Id = await ctx.db.insert("referralCompanies", {
      name: "Prime Properties",
      contactPerson: "Sarah Johnson",
      commissionRate: 15,
      isActive: true,
    });

    // 4. Create Projects
    const p1Id = await ctx.db.insert("projects", {
      projectCode: "MM-0001",
      projectName: "MM-0001 - Michael Thompson - Buyout",
      clientName: "Michael Thompson",
      clientEmail: "thompson.mj@gmail.com",
      borrowerType: "salaried",
      businessType: "buyout",
      bankId: bank1Id,
      assignedAgentId: agent1Id,
      loanAmount: 4850000, // 4.85M
      property: "1234 Oak Street, Springfield",
      propertyProfile: "Building",
      stage: "docs_completed",
      status: "active",
      createdBy: adminId,
      wipStartedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      docsCompletedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    });

    const p2Id = await ctx.db.insert("projects", {
      projectCode: "MM-0002",
      projectName: "MM-0002 - David Chen - Equity Release",
      clientName: "David Chen",
      borrowerType: "self_employed",
      businessType: "equity_release",
      bankId: bank2Id,
      referralCompanyId: ref1Id,
      assignedAgentId: agent1Id,
      loanAmount: 3200000, // 3.2M
      propertyProfile: "Land",
      stage: "submitted",
      status: "active",
      createdBy: agent1Id,
      wipStartedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
      docsCompletedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      submittedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    });

    const p3Id = await ctx.db.insert("projects", {
      projectCode: "MM-0003",
      projectName: "MM-0003 - Amanda Foster - Buyout",
      clientName: "Amanda Foster",
      borrowerType: "salaried",
      businessType: "buyout",
      bankId: bank3Id,
      assignedAgentId: agent2Id,
      loanAmount: 5500000, // 5.5M
      propertyProfile: "Building",
      stage: "new",
      status: "open",
      createdBy: agent2Id,
    });

    // 5. Create Audit Log entries
    await ctx.db.insert("auditLog", {
      projectId: p1Id,
      action: "stage_change",
      performedBy: agent1Id,
      details: JSON.stringify({ from: "wip", to: "docs_completed" }),
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    });

    await ctx.db.insert("auditLog", {
      projectId: p3Id,
      action: "project_created",
      performedBy: agent2Id,
      details: JSON.stringify({ name: "Amanda Foster" }),
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    });

    return { adminId, agent1Id, agent2Id, viewerId };
  },
});
