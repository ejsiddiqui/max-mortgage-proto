/**
 * Max Mortgage Prototype - Mock Data
 * Realistic data for projects, agents, and activity logs
 */

// Project Stages
export const STAGES = {
    NEW: 'New',
    QUALIFIED: 'Qualified',
    DOCS_COMPLETED: 'Docs Completed',
    SUBMITTED: 'Submitted',
    DECISION: 'Decision',
    DISBURSED: 'Disbursed'
};

// Project Status
export const STATUS = {
    ACTIVE: 'Active',
    ON_HOLD: 'On Hold',
    CLOSED_WON: 'Closed Won',
    CLOSED_LOST: 'Closed Lost'
};

// Loan Types
export const LOAN_TYPES = {
    HOME_LOAN: 'Home Loan',
    REFINANCE: 'Refinance',
    CONSTRUCTION: 'Construction',
    INVESTMENT: 'Investment Property',
    COMMERCIAL: 'Commercial'
};

// Agents
export const agents = [
    {
        id: 'AGT001',
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@maxmortgage.com',
        phone: '+1 (555) 123-4567',
        avatar: null, // Will use initials
        role: 'Senior Broker',
        activeProjects: 12,
        closedThisMonth: 3,
        commissionYTD: 45000
    },
    {
        id: 'AGT002',
        name: 'James Rodriguez',
        email: 'james.rodriguez@maxmortgage.com',
        phone: '+1 (555) 987-6543',
        avatar: null,
        role: 'Broker',
        activeProjects: 8,
        closedThisMonth: 2,
        commissionYTD: 28500
    }
];

// Projects
export const projects = [
    {
        id: 'PRJ-2026-001',
        clientName: 'Michael & Jennifer Thompson',
        clientEmail: 'thompson.mj@gmail.com',
        clientPhone: '+1 (555) 234-5678',
        loanType: LOAN_TYPES.HOME_LOAN,
        loanAmount: 485000,
        propertyValue: 625000,
        propertyAddress: '1234 Oak Street, Springfield, IL 62704',
        stage: STAGES.DOCS_COMPLETED,
        status: STATUS.ACTIVE,
        agentId: 'AGT001',
        lender: 'First National Bank',
        interestRate: 6.75,
        loanTerm: 30,
        lvr: 77.6, // Loan to Value Ratio
        createdAt: '2026-01-10T09:30:00Z',
        updatedAt: '2026-01-25T14:20:00Z',
        expectedCommission: 4850,
        timeline: {
            t1_initialContact: '2026-01-10T09:30:00Z',
            t2_qualified: '2026-01-12T11:00:00Z',
            t3_docsComplete: '2026-01-25T14:20:00Z',
            t4_submitted: null
        },
        documents: {
            required: [
                { name: 'ID Verification', status: 'verified', uploadedAt: '2026-01-11T10:00:00Z' },
                { name: 'Income Statement', status: 'verified', uploadedAt: '2026-01-15T09:30:00Z' },
                { name: 'Bank Statements (3 months)', status: 'verified', uploadedAt: '2026-01-18T16:00:00Z' },
                { name: 'Employment Letter', status: 'pending', uploadedAt: null },
                { name: 'Property Contract', status: 'verified', uploadedAt: '2026-01-20T11:45:00Z' }
            ],
            other: [
                { name: 'Tax Returns 2024.pdf', size: '2.4 MB', uploadedAt: '2026-01-15T10:00:00Z' },
                { name: 'Credit Report.pdf', size: '156 KB', uploadedAt: '2026-01-16T14:30:00Z' }
            ]
        }
    },
    {
        id: 'PRJ-2026-002',
        clientName: 'David Chen',
        clientEmail: 'david.chen@outlook.com',
        clientPhone: '+1 (555) 345-6789',
        loanType: LOAN_TYPES.REFINANCE,
        loanAmount: 320000,
        propertyValue: 480000,
        propertyAddress: '5678 Maple Avenue, Austin, TX 78701',
        stage: STAGES.SUBMITTED,
        status: STATUS.ACTIVE,
        agentId: 'AGT001',
        lender: 'Wells Fargo',
        interestRate: 6.25,
        loanTerm: 25,
        lvr: 66.7,
        createdAt: '2026-01-05T14:00:00Z',
        updatedAt: '2026-01-24T09:00:00Z',
        expectedCommission: 3200,
        timeline: {
            t1_initialContact: '2026-01-05T14:00:00Z',
            t2_qualified: '2026-01-07T10:30:00Z',
            t3_docsComplete: '2026-01-20T16:45:00Z',
            t4_submitted: '2026-01-24T09:00:00Z'
        },
        documents: {
            required: [
                { name: 'ID Verification', status: 'verified', uploadedAt: '2026-01-06T11:00:00Z' },
                { name: 'Income Statement', status: 'verified', uploadedAt: '2026-01-10T14:00:00Z' },
                { name: 'Bank Statements (3 months)', status: 'verified', uploadedAt: '2026-01-12T09:30:00Z' },
                { name: 'Employment Letter', status: 'verified', uploadedAt: '2026-01-15T10:00:00Z' },
                { name: 'Current Mortgage Statement', status: 'verified', uploadedAt: '2026-01-18T11:00:00Z' }
            ],
            other: [
                { name: 'Property Valuation.pdf', size: '3.1 MB', uploadedAt: '2026-01-19T15:00:00Z' }
            ]
        }
    },
    {
        id: 'PRJ-2026-003',
        clientName: 'Amanda Foster',
        clientEmail: 'amanda.foster@gmail.com',
        clientPhone: '+1 (555) 456-7890',
        loanType: LOAN_TYPES.INVESTMENT,
        loanAmount: 550000,
        propertyValue: 720000,
        propertyAddress: '910 Beach Boulevard, Miami, FL 33139',
        stage: STAGES.NEW,
        status: STATUS.ACTIVE,
        agentId: 'AGT002',
        lender: null,
        interestRate: null,
        loanTerm: 30,
        lvr: 76.4,
        createdAt: '2026-01-24T16:30:00Z',
        updatedAt: '2026-01-24T16:30:00Z',
        expectedCommission: 5500,
        timeline: {
            t1_initialContact: '2026-01-24T16:30:00Z',
            t2_qualified: null,
            t3_docsComplete: null,
            t4_submitted: null
        },
        documents: {
            required: [
                { name: 'ID Verification', status: 'pending', uploadedAt: null },
                { name: 'Income Statement', status: 'pending', uploadedAt: null },
                { name: 'Bank Statements (3 months)', status: 'pending', uploadedAt: null },
                { name: 'Employment Letter', status: 'pending', uploadedAt: null },
                { name: 'Investment Property Contract', status: 'pending', uploadedAt: null }
            ],
            other: []
        }
    },
    {
        id: 'PRJ-2026-004',
        clientName: 'Robert & Lisa Martinez',
        clientEmail: 'martinez.family@yahoo.com',
        clientPhone: '+1 (555) 567-8901',
        loanType: LOAN_TYPES.CONSTRUCTION,
        loanAmount: 890000,
        propertyValue: 1200000,
        propertyAddress: '2345 Hillside Drive, Denver, CO 80202',
        stage: STAGES.DECISION,
        status: STATUS.ACTIVE,
        agentId: 'AGT002',
        lender: 'Chase Bank',
        interestRate: 7.15,
        loanTerm: 30,
        lvr: 74.2,
        createdAt: '2025-12-15T11:00:00Z',
        updatedAt: '2026-01-23T10:30:00Z',
        expectedCommission: 8900,
        timeline: {
            t1_initialContact: '2025-12-15T11:00:00Z',
            t2_qualified: '2025-12-18T14:00:00Z',
            t3_docsComplete: '2026-01-10T16:00:00Z',
            t4_submitted: '2026-01-15T09:00:00Z'
        },
        documents: {
            required: [
                { name: 'ID Verification', status: 'verified', uploadedAt: '2025-12-16T10:00:00Z' },
                { name: 'Income Statement', status: 'verified', uploadedAt: '2025-12-20T11:30:00Z' },
                { name: 'Bank Statements (3 months)', status: 'verified', uploadedAt: '2025-12-22T14:00:00Z' },
                { name: 'Employment Letter', status: 'verified', uploadedAt: '2025-12-28T09:00:00Z' },
                { name: 'Construction Plans', status: 'verified', uploadedAt: '2026-01-05T15:00:00Z' },
                { name: 'Builder Contract', status: 'verified', uploadedAt: '2026-01-08T11:00:00Z' }
            ],
            other: [
                { name: 'Land Title.pdf', size: '1.8 MB', uploadedAt: '2025-12-17T10:00:00Z' },
                { name: 'Council Approval.pdf', size: '4.2 MB', uploadedAt: '2026-01-03T14:00:00Z' },
                { name: 'Insurance Quote.pdf', size: '890 KB', uploadedAt: '2026-01-09T16:30:00Z' }
            ]
        }
    },
    {
        id: 'PRJ-2025-089',
        clientName: 'Emily Watson',
        clientEmail: 'emily.watson@protonmail.com',
        clientPhone: '+1 (555) 678-9012',
        loanType: LOAN_TYPES.HOME_LOAN,
        loanAmount: 375000,
        propertyValue: 500000,
        propertyAddress: '789 Sunset Lane, Seattle, WA 98101',
        stage: STAGES.DISBURSED,
        status: STATUS.CLOSED_WON,
        agentId: 'AGT001',
        lender: 'Bank of America',
        interestRate: 6.50,
        loanTerm: 30,
        lvr: 75.0,
        createdAt: '2025-11-20T09:00:00Z',
        updatedAt: '2026-01-15T11:00:00Z',
        expectedCommission: 3750,
        timeline: {
            t1_initialContact: '2025-11-20T09:00:00Z',
            t2_qualified: '2025-11-22T14:30:00Z',
            t3_docsComplete: '2025-12-10T16:00:00Z',
            t4_submitted: '2025-12-15T10:00:00Z'
        },
        documents: {
            required: [
                { name: 'ID Verification', status: 'verified', uploadedAt: '2025-11-21T10:00:00Z' },
                { name: 'Income Statement', status: 'verified', uploadedAt: '2025-11-25T11:00:00Z' },
                { name: 'Bank Statements (3 months)', status: 'verified', uploadedAt: '2025-11-28T14:00:00Z' },
                { name: 'Employment Letter', status: 'verified', uploadedAt: '2025-12-02T09:30:00Z' },
                { name: 'Property Contract', status: 'verified', uploadedAt: '2025-12-05T15:00:00Z' }
            ],
            other: [
                { name: 'Signed Loan Agreement.pdf', size: '5.6 MB', uploadedAt: '2026-01-10T14:00:00Z' }
            ]
        }
    }
];

// Activity Logs
export const activityLogs = [
    {
        id: 'LOG001',
        projectId: 'PRJ-2026-001',
        action: 'Document Uploaded',
        description: 'Property Contract uploaded and marked for verification',
        performedBy: 'AGT001',
        timestamp: '2026-01-25T14:20:00Z'
    },
    {
        id: 'LOG002',
        projectId: 'PRJ-2026-002',
        action: 'Stage Changed',
        description: 'Project moved from Docs Completed to Submitted',
        performedBy: 'AGT001',
        timestamp: '2026-01-24T09:00:00Z'
    },
    {
        id: 'LOG003',
        projectId: 'PRJ-2026-003',
        action: 'Project Created',
        description: 'New investment property loan application started',
        performedBy: 'AGT002',
        timestamp: '2026-01-24T16:30:00Z'
    },
    {
        id: 'LOG004',
        projectId: 'PRJ-2026-004',
        action: 'Lender Decision',
        description: 'Awaiting final approval from Chase Bank',
        performedBy: 'AGT002',
        timestamp: '2026-01-23T10:30:00Z'
    },
    {
        id: 'LOG005',
        projectId: 'PRJ-2026-001',
        action: 'Document Verified',
        description: 'Bank Statements verified and approved',
        performedBy: 'AGT001',
        timestamp: '2026-01-22T11:45:00Z'
    },
    {
        id: 'LOG006',
        projectId: 'PRJ-2025-089',
        action: 'Commission Received',
        description: 'Commission of $3,750 received for closed deal',
        performedBy: 'System',
        timestamp: '2026-01-20T09:00:00Z'
    },
    {
        id: 'LOG007',
        projectId: 'PRJ-2026-002',
        action: 'Note Added',
        description: 'Client requested to expedite the refinance process',
        performedBy: 'AGT001',
        timestamp: '2026-01-19T15:30:00Z'
    },
    {
        id: 'LOG008',
        projectId: 'PRJ-2026-004',
        action: 'Document Uploaded',
        description: 'Insurance Quote uploaded',
        performedBy: 'AGT002',
        timestamp: '2026-01-09T16:30:00Z'
    }
];

// Dashboard KPIs (computed from projects)
export const getKPIs = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === STATUS.ACTIVE).length;
    const closedProjects = projects.filter(p => p.status === STATUS.CLOSED_WON || p.status === STATUS.CLOSED_LOST).length;
    const totalCommission = projects
        .filter(p => p.status === STATUS.CLOSED_WON)
        .reduce((sum, p) => sum + p.expectedCommission, 0);
    const pipelineValue = projects
        .filter(p => p.status === STATUS.ACTIVE)
        .reduce((sum, p) => sum + p.loanAmount, 0);
    
    return {
        totalProjects,
        activeProjects,
        closedProjects,
        totalCommission,
        pipelineValue
    };
};

// Get agent by ID
export const getAgentById = (id) => agents.find(a => a.id === id);

// Get project by ID
export const getProjectById = (id) => projects.find(p => p.id === id);

// Get projects by stage
export const getProjectsByStage = (stage) => projects.filter(p => p.stage === stage);

// Get active projects (top N)
export const getActiveProjects = (limit = 5) => 
    projects
        .filter(p => p.status === STATUS.ACTIVE)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, limit);

// Get recent activity (top N)
export const getRecentActivity = (limit = 8) =>
    activityLogs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
