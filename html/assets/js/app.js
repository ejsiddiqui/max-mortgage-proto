/**
 * Max Mortgage Prototype - Combined Application Logic
 * Refactored to run locally without ES Modules (CORS fix)
 */

(function () {
    // ==========================================
    // DATA LAYER (Formerly data.js)
    // ==========================================

    // Project Stages (PRD Section 5.1.1)
    const STAGES = {
        NEW: 'New',
        WIP: 'WIP',
        DOCS_COMPLETED: 'Docs Completed',
        SUBMITTED: 'Submitted',
        FOL: 'FOL',
        DISBURSED: 'Disbursed',
        CLOSED: 'Closed'
    };

    // Project Status (PRD Section 10)
    const STATUS = {
        OPEN: 'Open',
        ACTIVE: 'Active',
        ON_HOLD: 'On Hold',
        DISBURSED: 'Disbursed'
    };

    // Loan Types
    const LOAN_TYPES = {
        HOME_LOAN: 'Home Loan',
        REFINANCE: 'Refinance',
        CONSTRUCTION: 'Construction',
        INVESTMENT: 'Investment Property',
        COMMERCIAL: 'Commercial'
    };

    // Document Configuration (PRD Section 5.2.2)
    const DOCUMENT_CONFIG = [
        // Section A — Borrower Documents
        { code: 'A1', label: 'Valid UAE ID', section: 'borrower', multiFile: true, required: true, selfEmployedOnly: false },
        { code: 'A2', label: 'Valid Passport', section: 'borrower', multiFile: true, required: true, selfEmployedOnly: false },
        { code: 'A3', label: 'Visa', section: 'borrower', multiFile: true, required: true, selfEmployedOnly: false },
        { code: 'A4', label: 'DEWA Bill of current residence', section: 'borrower', multiFile: false, required: true, selfEmployedOnly: false },
        { code: 'A5', label: 'Bank Account details', section: 'borrower', multiFile: false, required: true, selfEmployedOnly: false },
        { code: 'A6', label: 'Existing Bank Account Statement for 12 months', section: 'borrower', multiFile: false, required: true, selfEmployedOnly: false },
        { code: 'A7', label: 'Salary Certificate', section: 'borrower', multiFile: false, required: false, selfEmployedOnly: false },

        // Section B — Company Documents (Self-Employed Only)
        { code: 'B1', label: 'Trade License, MOA & AOA', section: 'company', multiFile: true, required: true, selfEmployedOnly: true },
        { code: 'B2', label: 'Company Information / Activity', section: 'company', multiFile: false, required: true, selfEmployedOnly: true },
        { code: 'B3', label: 'Bank Account Statement for 6 months', section: 'company', multiFile: false, required: true, selfEmployedOnly: true },
        { code: 'B4', label: 'Company Profile / Website', section: 'company', multiFile: false, required: true, selfEmployedOnly: true },

        // Section C — Asset Documents
        { code: 'C1', label: 'Title Deed', section: 'asset', multiFile: true, required: true, selfEmployedOnly: false },
        { code: 'C2', label: 'Affection / Site plan of plot/land', section: 'asset', multiFile: true, required: false, selfEmployedOnly: false },
        { code: 'C3', label: 'Floor Plan or Approved Drawings', section: 'asset', multiFile: true, required: false, selfEmployedOnly: false },
        { code: 'C4', label: 'Certificate of Completion / Completion Notice', section: 'asset', multiFile: true, required: false, selfEmployedOnly: false },
        { code: 'C5', label: 'MOU or SPA or Initial Contract of Sale', section: 'asset', multiFile: true, required: false, selfEmployedOnly: false },
        { code: 'C6', label: 'Form F', section: 'asset', multiFile: false, required: false, selfEmployedOnly: false, allowedTypes: ['application/pdf'] },
        { code: 'C7', label: 'Developer Statement of Accounts', section: 'asset', multiFile: false, required: false, selfEmployedOnly: false },
        { code: 'C8', label: 'Valuation Slip (to be PAID)', section: 'asset', multiFile: false, required: true, selfEmployedOnly: false },
        { code: 'C9', label: 'Project Profile', section: 'asset', multiFile: false, required: false, selfEmployedOnly: false },

        // Section D — Banking Documents
        { code: 'D1', label: 'AECB Form for Individual (to be filled & signed)', section: 'bank', multiFile: false, required: true, selfEmployedOnly: false, allowedTypes: ['application/pdf'] },
        { code: 'D2', label: 'AECB Form Company (to be filled & signed)', section: 'bank', multiFile: false, required: true, selfEmployedOnly: true, allowedTypes: ['application/pdf'] },
        { code: 'D3', label: 'Bank Application Form (to be filled & signed)', section: 'bank', multiFile: false, required: true, selfEmployedOnly: false, allowedTypes: ['application/pdf'] },
        { code: 'D4', label: 'PNWS Form (to be filled & signed)', section: 'bank', multiFile: false, required: true, selfEmployedOnly: false, allowedTypes: ['application/pdf'] },
        { code: 'D5', label: 'Existing Asset Title Information', section: 'bank', multiFile: true, required: true, selfEmployedOnly: false },
        { code: 'D6', label: 'Key Fact Statement — FAB Bundle T&C (to be signed)', section: 'bank', multiFile: false, required: false, selfEmployedOnly: false, allowedTypes: ['application/pdf'] },

        // Section E — Lease of Target Asset
        { code: 'E1', label: 'Trade License of Company or UAE ID of individual tenancy', section: 'lease', multiFile: true, required: true, selfEmployedOnly: false },
        { code: 'E2', label: 'Tenancy or Ijary agreement (min AED 0.525m)', section: 'lease', multiFile: true, required: true, selfEmployedOnly: false },
        { code: 'E3', label: 'Tenancy 4 Cheques', section: 'lease', multiFile: true, required: true, selfEmployedOnly: false }
    ];

    // Agents
    const agents = [
        {
            id: 'AGT001',
            name: 'Sarah Mitchell',
            email: 'sarah.mitchell@maxmortgage.com',
            phone: '+1 (555) 123-4567',
            avatar: null,
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

    // Projects (PRD Section 4.2)
    const projects = [
        {
            id: 'MM-0001',
            clientName: 'Michael Thompson',
            clientEmail: 'thompson.mj@gmail.com',
            loanType: 'Buyout',
            loanAmount: 2500000,
            borrowerType: 'salaried',
            propertyProfile: 'Building',
            stage: STAGES.DOCS_COMPLETED,
            status: STATUS.ACTIVE,
            agentId: 'AGT001',
            updatedAt: '2026-01-25T14:20:00Z',
            expectedCommission: 25000,
            documents: { required: Array(24).fill({status: 'verified'}) }
        },
        {
            id: 'MM-0002',
            clientName: 'David Chen',
            clientEmail: 'david.chen@outlook.com',
            loanType: 'Equity Release',
            loanAmount: 1200000,
            borrowerType: 'self_employed',
            propertyProfile: 'Land',
            stage: STAGES.SUBMITTED,
            status: STATUS.ACTIVE,
            agentId: 'AGT001',
            updatedAt: '2026-01-24T09:00:00Z',
            expectedCommission: 12000,
            documents: { required: Array(29).fill({status: 'verified'}) }
        },
        {
            id: 'MM-0003',
            clientName: 'Amanda Foster',
            loanType: 'Buyout',
            loanAmount: 5500000,
            borrowerType: 'salaried',
            propertyProfile: 'Building',
            stage: STAGES.NEW,
            status: STATUS.OPEN,
            agentId: 'AGT002',
            updatedAt: '2026-01-24T16:30:00Z',
            expectedCommission: 55000,
            documents: { required: [] }
        },
        {
            id: 'MM-0004',
            clientName: 'Robert Martinez',
            loanType: 'Buyout',
            loanAmount: 8900000,
            borrowerType: 'self_employed',
            propertyProfile: 'Building',
            stage: STAGES.FOL,
            status: STATUS.ACTIVE,
            agentId: 'AGT002',
            updatedAt: '2026-01-23T10:30:00Z',
            expectedCommission: 89000,
            documents: { required: Array(29).fill({status: 'verified'}) }
        },
        {
            id: 'MM-0005',
            clientName: 'Emily Watson',
            loanType: 'Buyout',
            loanAmount: 3750000,
            borrowerType: 'salaried',
            propertyProfile: 'Land',
            stage: STAGES.DISBURSED,
            status: STATUS.DISBURSED,
            agentId: 'AGT001',
            updatedAt: '2026-01-15T11:00:00Z',
            expectedCommission: 37500,
            documents: { required: Array(24).fill({status: 'verified'}) }
        }
    ];

    // Products
    const products = [
        { id: 'PROD-001', name: 'Basic Home Loan', type: 'Fixed', rate: 5.04, comparisonRate: 5.04, monthly: 2420, fees: 450 },
        { id: 'PROD-002', name: 'AMP Essential Home Loan', type: 'Variable', rate: 5.88, comparisonRate: 5.88, monthly: 2650, fees: 0 },
        { id: 'PROD-003', name: 'Basic Home Loan (Alternate)', type: 'Fixed 3 Years', rate: 5.77, comparisonRate: 5.82, monthly: 2580, fees: 395 },
        { id: 'PROD-004', name: 'Premium Wealth Package', type: 'Variable', rate: 6.12, comparisonRate: 6.45, monthly: 2800, fees: 395 }
    ];

    // Activity Logs
    const activityLogs = [
        {
            id: 'LOG001',
            projectId: 'PRJ-2026-001',
            action: 'Document Uploaded',
            description: 'Property Contract uploaded',
            performedBy: 'AGT001',
            timestamp: '2026-01-25T14:20:00Z'
        },
        {
            id: 'LOG002',
            projectId: 'PRJ-2026-002',
            action: 'Stage Changed',
            description: 'Moved to Submitted',
            performedBy: 'AGT001',
            timestamp: '2026-01-24T09:00:00Z'
        },
        {
            id: 'LOG003',
            projectId: 'PRJ-2026-003',
            action: 'Project Created',
            description: 'New investment property loan application',
            performedBy: 'AGT002',
            timestamp: '2026-01-24T16:30:00Z'
        },
        {
            id: 'LOG004',
            projectId: 'PRJ-2026-004',
            action: 'Lender Decision',
            description: 'Awaiting final approval from Chase',
            performedBy: 'AGT002',
            timestamp: '2026-01-23T10:30:00Z'
        },
        {
            id: 'LOG005',
            projectId: 'PRJ-2026-001',
            action: 'Document Verified',
            description: 'Bank Statements verified',
            performedBy: 'AGT001',
            timestamp: '2026-01-22T11:45:00Z'
        },
        {
            id: 'LOG006',
            projectId: 'PRJ-2025-089',
            action: 'Commission Received',
            description: '$3,750 received for closed deal',
            performedBy: 'System',
            timestamp: '2026-01-20T09:00:00Z'
        },
        {
            id: 'LOG007',
            projectId: 'PRJ-2026-002',
            action: 'Note Added',
            description: 'Client requested to expedite',
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

    // ==========================================
    // UTILS LAYER (Formerly utils.js)
    // ==========================================

    const utils = {
        formatCurrency: (amount) => {
            if (amount === null || amount === undefined) return 'AED 0.00M';
            const millions = amount / 1000000;
            return `AED ${millions.toFixed(2)}M`;
        },

        formatRelativeTime: (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

            return date.toLocaleDateString();
        },

        getInitials: (name) => {
            if (!name) return '??';
            return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
        },

        getStatusBadge: (status) => {
            const badges = {
                'Open': 'bg-blue-100 text-blue-700 border-blue-200',
                'Active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                'On Hold': 'bg-amber-100 text-amber-700 border-amber-200',
                'New': 'bg-blue-100 text-blue-700 border-blue-200',
                'WIP': 'bg-indigo-100 text-indigo-700 border-indigo-200',
                'Docs Completed': 'bg-purple-100 text-purple-700 border-purple-200',
                'Submitted': 'bg-cyan-100 text-cyan-700 border-cyan-200',
                'FOL': 'bg-orange-100 text-orange-700 border-orange-200',
                'Disbursed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                'Closed': 'bg-slate-100 text-slate-700 border-slate-200'
            };
            const badgeClass = badges[status] || 'bg-navy-100 text-navy-700 border-navy-200';
            return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}">${status}</span>`;
        },

        getProgressBar: (percentage) => {
            let colorClass = 'bg-red-500';
            if (percentage >= 70) colorClass = 'bg-neon-500';
            else if (percentage >= 40) colorClass = 'bg-amber-500';

            return `
                <div class="flex items-center gap-2">
                    <div class="flex-1 h-2 bg-navy-200 rounded-full overflow-hidden">
                        <div class="h-full ${colorClass} rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
                    </div>
                    <span class="text-xs font-medium text-navy-600">${percentage}%</span>
                </div>
            `;
        },

        getDocumentCompletion: (documents) => {
            if (!documents || documents.length === 0) return 0;
            const verified = documents.filter(d => d.status === 'verified').length;
            return Math.round((verified / documents.length) * 100);
        },

        getActionIcon: (action) => {
            const icons = {
                'Document Uploaded': `<svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>`,
                'Stage Changed': `<svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>`,
                'Project Created': `<svg class="w-4 h-4 text-neon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>`,
                'Document Verified': `<svg class="w-4 h-4 text-neon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
                'Commission Received': `<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
                'Note Added': `<svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`,
                'Lender Decision': `<svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`
            };
            return icons[action] || `<svg class="w-4 h-4 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        },

        // Helper functions for Project Detail View
        getTrackingEvents: (currentStage) => {
            const allStages = ['New', 'WIP', 'Docs Completed', 'Submitted', 'FOL', 'Disbursed', 'Closed'];
            const currentIndex = allStages.indexOf(currentStage) === -1 ? 0 : allStages.indexOf(currentStage);

            return allStages.map((stage, index) => {
                let status = 'pending';
                if (index < currentIndex) status = 'completed';
                else if (index === currentIndex) status = 'current';

                return { stage, status };
            });
        },

        getEligibilityScore: (project) => {
            // Mock score generation based on loan amount
            const baseScore = 85;
            const variation = (project.loanAmount % 100) / 10;
            return Math.min(100, Math.max(0, Math.round(baseScore + variation)));
        },

        getMatchingProducts: () => {
            return products;
        }
    };

    // ==========================================
    // UI COMPONENT & RENDER LOGIC (Formerly main.js)
    // ==========================================

    const App = {
        init: function () {
            // Only inject layout if containers exist (i.e. we are NOT on login page)
            if (document.getElementById('sidebar')) {
                this.renderGlobalComponents(); // Inject Modals/Toasts
                this.renderSidebar();
                this.updateMainContentMargin(); // Set initial margin
                this.renderHeader();
                this.renderDashboard();
            }
        },

        toggleSidebar: function () {
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            localStorage.setItem('sidebarCollapsed', !isCollapsed);
            this.renderSidebar();
            this.updateMainContentMargin();
        },

        updateMainContentMargin: function () {
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            // Find the main content wrapper
            const main = document.querySelector('.ml-64') || document.querySelector('.ml-20') || document.querySelector('.md\\:ml-64') || document.querySelector('.md\\:ml-20');
            if (main) {
                // Remove existing margins
                main.classList.remove('ml-64', 'ml-20');
                // We handle desktop margin via specific classes or just toggle
                // To be safe and compatible with recent changes:
                main.classList.remove('md:ml-64', 'md:ml-20');
                main.classList.add(isCollapsed ? 'md:ml-20' : 'md:ml-64');
            }
        },

        renderGlobalComponents: function () {
            // Toast Container
            if (!document.getElementById('toast-container')) {
                const toastContainer = document.createElement('div');
                toastContainer.id = 'toast-container';
                toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
                document.body.appendChild(toastContainer);
            }

            // Modal Overlay
            if (!document.getElementById('modal-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'modal-overlay';
                overlay.className = 'fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-50 hidden flex items-center justify-center opacity-0 transition-opacity duration-300';
                overlay.innerHTML = '<div id="modal-content" class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform scale-95 transition-transform duration-300 p-0 overflow-hidden relative"></div>';

                // Close on click outside
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) App.hideModal();
                });

                document.body.appendChild(overlay);
            }

            // Mobile Overlay
            if (!document.getElementById('mobile-overlay-container')) {
                // Container for mobile sidebar backdrop if needed, mostly handled by toggleMobileMenu
            }
        },

        toggleMobileMenu: function () {
            const sidebar = document.getElementById('sidebar').querySelector('aside');
            const overlayId = 'mobile-backdrop';
            let overlay = document.getElementById(overlayId);

            if (sidebar.classList.contains('-translate-x-full')) {
                // Open
                sidebar.classList.remove('-translate-x-full');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = overlayId;
                    overlay.className = 'fixed inset-0 bg-navy-900/50 z-30 md:hidden backdrop-blur-sm';
                    overlay.onclick = App.toggleMobileMenu;
                    document.body.appendChild(overlay);
                }
            } else {
                // Close
                sidebar.classList.add('-translate-x-full');
                if (overlay) overlay.remove();
            }
        },

        showToast: function (message, type = 'success') {
            const container = document.getElementById('toast-container');
            if (!container) return; // Should be init

            const toast = document.createElement('div');

            let icon = `<svg class="w-5 h-5 text-neon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
            let borderClass = 'border-neon-500';

            if (type === 'error') {
                icon = `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
                borderClass = 'border-red-500';
            }

            toast.className = `flex items-center gap-3 bg-white border-l-4 ${borderClass} px-4 py-3 rounded-lg shadow-lg transform translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto min-w-[300px]`;
            toast.innerHTML = `
                ${icon}
                <p class="text-sm font-medium text-navy-800">${message}</p>
            `;

            container.appendChild(toast);

            // Animate In
            requestAnimationFrame(() => {
                toast.classList.remove('translate-y-10', 'opacity-0');
            });

            // Remove after delay
            setTimeout(() => {
                toast.classList.add('translate-y-10', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        showModal: function ({ title, content, onConfirm, confirmText = 'Confirm' }) {
            const overlay = document.getElementById('modal-overlay');
            const container = document.getElementById('modal-content');
            if (!overlay || !container) return;

            container.innerHTML = `
                <div class="px-6 py-4 border-b border-navy-100 flex justify-between items-center bg-navy-50/50">
                    <h3 class="text-lg font-bold text-navy-800">${title}</h3>
                    <button onclick="App.hideModal()" class="text-navy-400 hover:text-navy-600 cursor-pointer"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
                <div class="p-6">
                    ${content}
                </div>
                <div class="px-6 py-4 bg-navy-50/50 border-t border-navy-100 flex justify-end gap-3">
                    <button onclick="App.hideModal()" class="px-4 py-2 text-navy-600 hover:bg-navy-100 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                    <button id="modal-confirm-btn" class="px-4 py-2 bg-neon-500 hover:bg-neon-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-neon-500/20">${confirmText}</button>
                </div>
            `;

            // Bind Confirm
            if (onConfirm) {
                document.getElementById('modal-confirm-btn').onclick = () => {
                    onConfirm();
                    App.hideModal();
                };
            } else {
                document.getElementById('modal-confirm-btn').onclick = App.hideModal;
            }

            // Show
            overlay.classList.remove('hidden');
            // Force reflow
            void overlay.offsetWidth;
            overlay.classList.remove('opacity-0');
            container.classList.remove('scale-95');
            container.classList.add('scale-100');
        },

        hideModal: function () {
            const overlay = document.getElementById('modal-overlay');
            const container = document.getElementById('modal-content');
            if (!overlay || !container) return;

            overlay.classList.add('opacity-0');
            container.classList.remove('scale-100');
            container.classList.add('scale-95');

            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        },

        renderSidebar: function () {
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

            // Simplified for file protocol reliability
            const navItems = [
                { id: 'dashboard.html', label: 'Dashboard', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>' },
                { id: 'projects-list.html', label: 'Projects', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>' },
                { id: 'projects-kanban.html', label: 'Kanban', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>' },
                { id: 'agents.html', label: 'Agents', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>' }
            ];

            const settingsItem = { id: 'settings.html', label: 'Settings', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>' };

            const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';

            const renderNavItem = (item) => {
                const isActive = item.id === currentFile;
                return `
                    <li>
                        <a href="${item.id}" 
                           title="${item.label}"
                           class="flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-neon-500/10 text-neon-400 ' + (isCollapsed ? '' : 'border-l-4 border-neon-400 -ml-px') : 'text-navy-300 hover:text-white hover:bg-navy-800'}">
                            <svg class="w-5 h-5 flex-shrink-0 ${isActive ? 'text-neon-400' : 'text-navy-400 group-hover:text-navy-200'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.icon}</svg>
                            <span class="font-medium ${isCollapsed ? 'hidden' : 'block'}">${item.label}</span>
                        </a>
                    </li>
                `;
            };

            const navHtml = navItems.map(renderNavItem).join('');
            const settingsHtml = renderNavItem(settingsItem);

            document.getElementById('sidebar').innerHTML = `
                <aside class="fixed left-0 top-0 bottom-0 ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-navy-900 border-r border-navy-800 flex flex-col z-40 transform -translate-x-full md:translate-x-0">
                    <div class="p-6 border-b border-navy-800 flex items-center justify-between ${isCollapsed ? 'flex-col gap-4 px-2' : ''}">
                        <a href="dashboard.html" class="flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}">
                            <div class="w-10 h-10 bg-gradient-to-br from-neon-400 to-neon-600 rounded-xl flex items-center justify-center shadow-lg shadow-neon-500/25 flex-shrink-0">
                                <span class="text-navy-900 font-bold text-xl">M</span>
                            </div>
                            <div class="${isCollapsed ? 'hidden' : 'block'}">
                                <h1 class="text-lg font-bold text-white tracking-tight">Max Mortgage</h1>
                                <p class="text-xs text-navy-200">Lead Management</p>
                            </div>
                        </a>
                        <button onclick="App.toggleSidebar()" class="text-navy-400 hover:text-white transition-colors hidden md:block ${isCollapsed ? 'rotate-180 mt-2' : ''}">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button onclick="App.toggleMobileMenu()" class="text-navy-400 hover:text-white transition-colors md:hidden">
                             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <nav class="flex-1 p-4 overflow-y-auto">
                        <ul class="space-y-1">${navHtml}</ul>
                    </nav>
                    <div class="p-4 border-t border-navy-800">
                        <ul class="space-y-1">${settingsHtml}</ul>
                        <div class="mt-4 pt-4 border-t border-navy-800/50">
                            <div class="flex items-center gap-3 px-2 ${isCollapsed ? 'justify-center' : ''}">
                                <div class="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">SM</div>
                                <div class="${isCollapsed ? 'hidden' : 'block'}">
                                    <p class="text-sm font-medium text-navy-100">Sarah Mitchell</p>
                                    <p class="text-xs text-navy-400">Senior Broker</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            `;
        },

        renderHeader: function () {
            const path = window.location.pathname;
            let title = 'Dashboard';
            if (path.includes('projects-list')) title = 'Project Inventory';
            else if (path.includes('projects-kanban')) title = 'Pipeline Board';
            else if (path.includes('project-detail')) title = 'Project Detail';
            else if (path.includes('project-documents')) title = 'Document Workspace';
            else if (path.includes('agents')) title = 'Agents Directory';
            else if (path.includes('settings')) title = 'Settings';

            document.getElementById('header').innerHTML = `
                <header class="bg-white border-b border-navy-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div class="flex items-center gap-4">
                        <button onclick="App.toggleMobileMenu()" class="md:hidden text-navy-500 hover:text-navy-700">
                             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <div>
                            <h1 class="text-2xl font-bold text-navy-800 hidden md:block">${title}</h1>
                            <h1 class="text-xl font-bold text-navy-800 md:hidden">Max Mortgage</h1>
                            <p class="text-sm text-navy-500 mt-0.5 hidden md:block">Welcome back, Sarah!</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <button onclick="App.openNewProjectModal()" class="bg-neon-500 hover:bg-neon-600 text-white px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-lg shadow-neon-500/20 whitespace-nowrap">
                            + New Project
                        </button>
                    </div>
                </header>
            `;
        },

        openNewProjectModal: function () {
            this.showModal({
                title: 'Create New Project',
                confirmText: 'Create Project',
                content: `
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-navy-700 mb-1">Client Name</label>
                            <input type="text" id="np-client" class="w-full px-4 py-2 bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-neon-500 text-navy-700" placeholder="e.g. Michael Scott">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1">Loan Amount</label>
                                <input type="number" id="np-amount" class="w-full px-4 py-2 bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-neon-500 text-navy-700" placeholder="500000">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-navy-700 mb-1">Type</label>
                                <select id="np-type" class="w-full px-4 py-2 bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-neon-500 text-navy-700">
                                    <option>Home Loan</option>
                                    <option>Refinance</option>
                                    <option>Investment</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `,
                onConfirm: () => {
                    const client = document.getElementById('np-client').value;
                    const amount = document.getElementById('np-amount').value;

                    if (client && amount) {
                        // In a real app, this would make an API call
                        // Here we just show feedback
                        this.showToast(`Project created for <span class="font-bold">${client}</span>`);

                        // Optional: Add to 'projects' list in memory to see interaction
                        const newId = `PRJ-2026-00${projects.length + 1}`;
                        projects.unshift({
                            id: newId,
                            clientName: client,
                            loanAmount: parseInt(amount),
                            type: document.getElementById('np-type').value,
                            stage: 'New',
                            status: 'active',
                            updatedAt: new Date().toISOString(),
                            loanType: document.getElementById('np-type').value,
                            documents: { required: [], groups: [] }
                        });

                        // Refresh views if applicable
                        if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('project')) {
                            // Simple refresh hack or re-call render
                            if (this.renderDashboard) this.renderDashboard();
                            if (this.renderProjectsList) this.renderProjectsList();
                        }
                    } else {
                        this.showToast('Please fill all required fields', 'error');
                        // Re-open logic omitted for simplicity, user has to try again
                    }
                }
            });
        },

        renderDashboard: function () {
            if (!document.getElementById('kpi-cards')) return;

            // Compute KPIs
            const totalProjects = projects.length;
            const activeProjects = projects.filter(p => p.status === STATUS.ACTIVE || p.status === STATUS.OPEN);
            const activeValue = activeProjects.reduce((sum, p) => sum + p.loanAmount, 0);
            
            const disbursedProjects = projects.filter(p => p.stage === STAGES.DISBURSED);
            const disbursedValue = disbursedProjects.reduce((sum, p) => sum + p.loanAmount, 0);

            const buildingCount = projects.filter(p => p.propertyProfile === 'Building').length;
            const landCount = projects.filter(p => p.propertyProfile === 'Land').length;

            // Render KPI Cards (Row 1)
            document.getElementById('kpi-cards').innerHTML = `
                <!-- Dashboard Greeting -->
                <div class="card p-6 border border-navy-200 bg-gradient-to-br from-navy-800 to-navy-900 text-white rounded-xl shadow-lg relative overflow-hidden">
                    <div class="relative z-10">
                        <p class="text-navy-300 text-xs font-medium uppercase tracking-wider">Welcome back</p>
                        <h2 class="text-2xl font-bold mt-1">Sarah Mitchell</h2>
                        <p class="text-navy-400 text-xs mt-4">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <a href="projects-kanban.html" class="inline-flex items-center gap-2 mt-6 text-xs font-bold text-neon-400 hover:text-neon-300 transition-colors uppercase tracking-widest">
                            View Pipeline
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7-7 7"></path></svg>
                        </a>
                    </div>
                    <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-neon-500/10 rounded-full blur-3xl"></div>
                </div>

                <!-- YTD Widget -->
                <div class="card p-6 border border-navy-200 bg-white rounded-xl shadow-sm">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span class="text-xs font-bold text-navy-500 uppercase tracking-wider">YTD Disbursed</span>
                    </div>
                    <p class="text-3xl font-bold text-navy-800">${utils.formatCurrency(disbursedValue)}</p>
                    <p class="text-xs text-navy-400 mt-2"><span class="text-emerald-600 font-bold">${disbursedProjects.length}</span> cases closed</p>
                </div>

                <!-- Active Widget -->
                <div class="card p-6 border border-navy-200 bg-white rounded-xl shadow-sm">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        </div>
                        <span class="text-xs font-bold text-navy-500 uppercase tracking-wider">Active Pipeline</span>
                    </div>
                    <p class="text-3xl font-bold text-navy-800">${utils.formatCurrency(activeValue)}</p>
                    <p class="text-xs text-navy-400 mt-2"><span class="text-blue-600 font-bold">${activeProjects.length}</span> open applications</p>
                </div>

                <!-- Active Profile Widget -->
                <div class="card p-6 border border-navy-200 bg-white rounded-xl shadow-sm">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <span class="text-xs font-bold text-navy-500 uppercase tracking-wider">Portfolio Split</span>
                    </div>
                    <div class="flex items-end justify-between">
                        <div class="space-y-1">
                            <p class="text-xs text-navy-500 flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-navy-800"></span>
                                Building: <span class="font-bold text-navy-800">${buildingCount}</span>
                            </p>
                            <p class="text-xs text-navy-500 flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-neon-500"></span>
                                Land: <span class="font-bold text-navy-800">${landCount}</span>
                            </p>
                        </div>
                        <div class="text-right">
                             <p class="text-xl font-bold text-navy-800">${Math.round((buildingCount/(buildingCount+landCount||1))*100)}%</p>
                             <p class="text-[10px] text-navy-400">Residential</p>
                        </div>
                    </div>
                </div>
            `;

            // Render Active Projects Table
            const activeTable = document.getElementById('projects-table-body');
            if (activeTable) {
                const activeList = projects.filter(p => p.status === STATUS.ACTIVE || p.status === STATUS.OPEN).slice(0, 5);
                activeTable.innerHTML = activeList.map(p => {
                    const completion = utils.getDocumentCompletion(p.documents.required || []);
                    return `
                        <tr class="hover:bg-navy-50 transition-colors border-b border-navy-100 last:border-0">
                            <td class="p-4">
                                <a href="project-detail.html?id=${p.id}" class="font-medium text-neon-600 hover:text-neon-700 block text-xs font-mono">${p.id}</a>
                                <span class="text-[10px] text-navy-500">${p.loanType}</span>
                            </td>
                            <td class="p-4">
                                <div class="font-medium text-navy-700 text-sm">${p.clientName.split('&')[0]}</div>
                                <div class="text-[10px] text-navy-400">${utils.formatRelativeTime(p.updatedAt)}</div>
                            </td>
                            <td class="p-4 font-mono text-xs font-semibold text-navy-700">${utils.formatCurrency(p.loanAmount)}</td>
                            <td class="p-4">${utils.getStatusBadge(p.stage)}</td>
                            <td class="p-4 px-6 w-32">${utils.getProgressBar(completion)}</td>
                        </tr>
                    `;
                }).join('');
            }

            // Render Activity Feed (Row 3)
            const feedContainer = document.getElementById('activity-feed');
            if (feedContainer) {
                feedContainer.innerHTML = activityLogs.slice(0, 5).map(log => `
                    <div class="flex gap-3 pb-4 relative">
                        <div class="flex-shrink-0 mt-1">${utils.getActionIcon(log.action)}</div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-medium text-navy-700 truncate">${log.action} <span class="text-navy-400 font-normal">on</span> <span class="text-neon-600 font-mono">${log.projectId}</span></p>
                            <p class="text-[10px] text-navy-500 mt-0.5 line-clamp-1">${log.description}</p>
                            <p class="text-[9px] text-navy-400 mt-1">${utils.formatRelativeTime(log.timestamp)}</p>
                        </div>
                    </div>
                `).join('');
            }

            // Render Stage Breakdown (Row 2)
            const stageContainer = document.getElementById('stage-breakdown');
            if (stageContainer) {
                const stageColors = {
                    'New': 'bg-blue-500',
                    'WIP': 'bg-indigo-500',
                    'Docs Completed': 'bg-purple-500',
                    'Submitted': 'bg-cyan-500',
                    'FOL': 'bg-orange-500',
                    'Disbursed': 'bg-emerald-500',
                    'Closed': 'bg-slate-500'
                };

                const stages = Object.values(STAGES);
                const totalActiveCount = projects.length;

                stageContainer.innerHTML = stages.map(stage => {
                    const count = projects.filter(p => p.stage === stage).length;
                    const percentage = totalActiveCount > 0 ? Math.round((count / totalActiveCount) * 100) : 0;

                    return `
                        <div class="flex items-center gap-3">
                            <div class="w-24 text-[10px] font-bold text-navy-500 uppercase tracking-tight truncate">${stage}</div>
                            <div class="flex-1 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                                <div class="h-full ${stageColors[stage] || 'bg-navy-400'} rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                            </div>
                            <div class="w-6 text-[10px] font-bold text-navy-700 text-right">${count}</div>
                        </div>
                    `;
                }).join('');
            }

            // Render Avg Milestone Durations (Row 2)
            const avgDurationsContainer = document.getElementById('avg-durations');
            if (avgDurationsContainer) {
                const durations = [
                    { label: 'T1 Speed to Start', value: '1.2d' },
                    { label: 'T2 Doc Collection', value: '14.5d' },
                    { label: 'T3 Prep & Submit', value: '2.1d' },
                    { label: 'T4 Bank Processing', value: '8.4d' },
                    { label: 'T5 FOL to Disbursed', value: '12.0d' }
                ];

                avgDurationsContainer.innerHTML = `
                    <div class="space-y-4">
                        ${durations.map(d => `
                            <div class="flex justify-between items-center border-b border-navy-50 pb-2 last:border-0">
                                <span class="text-xs text-navy-500 font-medium">${d.label}</span>
                                <span class="text-sm font-bold text-navy-800 font-mono">${d.value}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            // Render Referral Agencies (Row 3)
            const referralContainer = document.getElementById('referral-agencies');
            if (referralContainer) {
                const agencies = [
                    { name: 'Epyc Digital', active: 3, disbursed: 1, value: 4500000 },
                    { name: 'Prime Realty', active: 2, disbursed: 0, value: 2800000 },
                    { name: 'Elite Assets', active: 5, disbursed: 2, value: 9200000 }
                ];

                referralContainer.innerHTML = agencies.map(agency => `
                    <div class="flex items-center gap-3 p-3 rounded-xl bg-navy-50/50 hover:bg-navy-100 transition-colors border border-transparent">
                        <div class="w-9 h-9 bg-navy-100 rounded-lg flex items-center justify-center text-navy-600 text-xs font-bold uppercase">
                            ${agency.name.substring(0, 2)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-bold text-navy-700 truncate">${agency.name}</p>
                            <p class="text-[10px] text-navy-400">${agency.active} active • ${agency.disbursed} disbursed</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-bold text-navy-800">${utils.formatCurrency(agency.value)}</p>
                            <p class="text-[9px] text-navy-400 uppercase font-bold tracking-tighter">Pipeline</p>
                        </div>
                    </div>
                `).join('');
            }

            // Render Agent Performance (Row 3)
            const agentContainer = document.getElementById('agent-performance');
            if (agentContainer) {
                agentContainer.innerHTML = agents.map(agent => `
                    <div class="flex items-center gap-3 p-3 rounded-xl bg-navy-50/50 hover:bg-navy-100 transition-colors border border-transparent">
                        <div class="w-9 h-9 bg-navy-800 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            ${utils.getInitials(agent.name)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-bold text-navy-700 truncate">${agent.name}</p>
                            <p class="text-[10px] text-navy-400">${agent.activeProjects} active • ${agent.closedThisMonth} closed</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-bold text-emerald-600">${utils.formatCurrency(agent.commissionYTD * 100)}</p>
                            <p class="text-[9px] text-navy-400 uppercase font-bold tracking-tighter">Active Val</p>
                        </div>
                    </div>
                `).join('');
            }
        },

        renderProjectsList: function () {
            if (!document.getElementById('projects-list-table')) return;

            // Render Filters
            const filterContainer = document.getElementById('projects-filters');
            if (filterContainer) {
                const stages = Object.values(STAGES);
                const statuses = Object.values(STATUS);

                filterContainer.innerHTML = `
                    <div class="flex flex-col md:flex-row gap-4 mb-6">
                        <div class="flex-1 relative">
                            <input type="text" placeholder="Search projects, clients..." class="w-full pl-10 pr-4 py-2 bg-white border border-navy-200 rounded-xl text-sm focus:outline-none focus:border-neon-500 transition-colors">
                            <svg class="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -trannavy-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <select class="px-4 py-2 bg-white border border-navy-200 rounded-xl text-sm text-navy-700 focus:outline-none focus:border-neon-500">
                            <option value="">All Stages</option>
                            ${stages.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                        <select class="px-4 py-2 bg-white border border-navy-200 rounded-xl text-sm text-navy-700 focus:outline-none focus:border-neon-500">
                            <option value="">All Statuses</option>
                            ${statuses.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                        <select class="px-4 py-2 bg-white border border-navy-200 rounded-xl text-sm text-navy-700 focus:outline-none focus:border-neon-500">
                            <option value="">All Agents</option>
                            ${agents.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
                        </select>
                    </div>
                `;
            }

            // Render Table
            const tbody = document.getElementById('projects-list-table');
            // Use all projects for now
            tbody.innerHTML = projects.map(p => {
                const agent = agents.find(a => a.id === p.agentId);
                const completion = utils.getDocumentCompletion(p.documents.required);

                return `
                    <tr class="hover:bg-navy-50 transition-colors border-b border-navy-100 last:border-0 group">
                        <td class="p-4">
                            <a href="project-detail.html?id=${p.id}" class="block">
                                <span class="font-medium text-neon-600 hover:text-neon-700 font-mono text-sm">${p.id}</span>
                                <span class="block text-xs text-navy-500 mt-0.5">${p.loanType}</span>
                            </a>
                        </td>
                        <td class="p-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-xs font-medium text-navy-600">
                                    ${utils.getInitials(p.clientName)}
                                </div>
                                <div>
                                    <div class="font-medium text-navy-700">${p.clientName.split('&')[0]}</div>
                                    <div class="text-xs text-navy-400">${p.clientEmail}</div>
                                </div>
                            </div>
                        </td>
                        <td class="p-4 font-mono text-sm font-semibold text-navy-700">${utils.formatCurrency(p.loanAmount)}</td>
                        <td class="p-4">${utils.getStatusBadge(p.stage)}</td>
                        <td class="p-4 w-32">${utils.getProgressBar(completion)}</td>
                        <td class="p-4">
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-navy-600">${agent ? agent.name.split(' ')[0] : 'Unassigned'}</span>
                            </div>
                        </td>
                        <td class="p-4 text-right">
                            <button class="p-2 hover:bg-navy-100 rounded-lg text-navy-400 hover:text-navy-600 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        },

        renderKanbanBoard: function () {
            const container = document.getElementById('kanban-board');
            if (!container) return;

            const stages = Object.values(STAGES);

            container.innerHTML = stages.map(stage => {
                const stageProjects = projects.filter(p => p.stage === stage);
                const count = stageProjects.length;
                const totalAmount = stageProjects.reduce((sum, p) => sum + p.loanAmount, 0);

                let stageColor = 'border-navy-200';
                if (stage === 'New') stageColor = 'border-blue-200';
                if (stage === 'WIP') stageColor = 'border-indigo-200';
                if (stage === 'Docs Completed') stageColor = 'border-purple-200';
                if (stage === 'Submitted') stageColor = 'border-cyan-200';
                if (stage === 'FOL') stageColor = 'border-orange-200';
                if (stage === 'Disbursed') stageColor = 'border-emerald-200';
                if (stage === 'Closed') stageColor = 'border-slate-200';

                return `
                    <div class="kanban-column flex-shrink-0 w-80 flex flex-col h-full bg-navy-50/50 rounded-xl border border-navy-200/50" data-stage="${stage}">
                        <!-- Column Header -->
                        <div class="p-4 border-b ${stageColor} bg-white/50 rounded-t-xl backdrop-blur-sm sticky top-0 z-10">
                            <div class="flex items-center justify-between mb-1">
                                <h3 class="font-semibold text-navy-700 text-sm">${stage}</h3>
                                <span class="bg-navy-100 text-navy-600 text-xs px-2 py-0.5 rounded-full font-medium" id="count-${stage.replace(/\s+/g, '-')}">${count}</span>
                            </div>
                            <div class="text-xs text-navy-500 font-mono" id="total-${stage.replace(/\s+/g, '-')}">${utils.formatCurrency(totalAmount)}</div>
                        </div>

                        <!-- Cards Container -->
                        <div class="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar drop-zone" data-stage="${stage}">
                            ${stageProjects.map(p => {
                    const agent = agents.find(a => a.id === p.agentId);
                    return `
                                    <div class="bg-white p-4 rounded-xl border border-navy-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group draggable-card" draggable="true" data-id="${p.id}">
                                        <div class="flex justify-between items-start mb-2">
                                            <span class="text-[10px] font-mono text-navy-400 bg-navy-50 px-1.5 py-0.5 rounded border border-navy-100">${p.id}</span>
                                            ${utils.getStatusBadge(p.status)}
                                        </div>
                                        
                                        <h4 class="font-bold text-navy-800 text-sm mb-1 line-clamp-1 pointer-events-none">${p.clientName}</h4>
                                        <div class="flex items-center gap-1.5 mb-2 pointer-events-none">
                                            <span class="text-[10px] px-1.5 py-0.5 bg-navy-50 text-navy-600 rounded font-medium">${p.borrowerType === 'salaried' ? 'Salaried' : 'Self-Employed'}</span>
                                            <span class="text-[10px] text-navy-400">${p.bank || 'FAB'}</span>
                                        </div>

                                        <div class="flex items-center justify-between mb-3 pointer-events-none">
                                            <span class="text-sm font-mono font-bold text-neon-600">${utils.formatCurrency(p.loanAmount)}</span>
                                            <span class="text-[10px] text-navy-400">12d in stage</span>
                                        </div>

                                        <!-- Doc Progress -->
                                        <div class="mb-4 pointer-events-none">
                                            <div class="flex justify-between text-[9px] mb-1">
                                                <span class="text-navy-400 font-bold uppercase">Docs</span>
                                                <span class="text-navy-600 font-bold">${utils.getDocumentCompletion(p.documents.required)}%</span>
                                            </div>
                                            <div class="w-full h-1 bg-navy-50 rounded-full overflow-hidden">
                                                <div class="h-full bg-navy-800 rounded-full" style="width: ${utils.getDocumentCompletion(p.documents.required)}%"></div>
                                            </div>
                                        </div>

                                        <div class="flex items-center justify-between pt-3 border-t border-navy-50 pointer-events-none">
                                            <div class="flex items-center gap-2">
                                                <div class="w-6 h-6 rounded-full bg-navy-800 flex items-center justify-center text-[10px] font-bold text-white" title="${agent?.name}">
                                                    ${utils.getInitials(agent?.name)}
                                                </div>
                                                <span class="text-[10px] text-navy-500 font-medium">${agent?.name.split(' ')[0]}</span>
                                            </div>
                                            <button class="text-navy-300 hover:text-navy-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                `;
                }).join('')}
                        </div>
                    </div>
                `;
            }).join('');

            // Initialize Drag and Drop logic
            this.initDragAndDrop();
        },

        renderProjectDetail: function () {
            if (!document.getElementById('project-detail-container')) return;

            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            const project = projects.find(p => p.id === projectId);

            if (!project) {
                document.getElementById('project-detail-container').innerHTML = `
                    <div class="text-center py-12">
                        <h3 class="text-lg font-medium text-navy-900">Project Not Found</h3>
                        <p class="text-navy-500 mt-2">The project you are looking for does not exist.</p>
                        <a href="projects-list.html" class="inline-block mt-4 text-navy-600 hover:text-navy-700 font-medium">Back to Projects</a>
                    </div>
                `;
                return;
            }

            const agent = agents.find(a => a.id === project.agentId);
            const trackingEvents = utils.getTrackingEvents(project.stage);
            const eligibilityScore = utils.getEligibilityScore(project);
            const matchingProducts = utils.getMatchingProducts();
            const completion = utils.getDocumentCompletion(project.documents.required);

            // Update Breadcrumb & Header
            document.getElementById('project-header-title').textContent = `${project.clientName.split('&')[0]}'s application details`;
            document.getElementById('project-ref-id').textContent = `Reference ID: ${project.id.split('-').pop()}`;
            document.getElementById('header-status-badge').innerHTML = utils.getStatusBadge(project.status);

            // Remove review button logic if it exists (since we have a tab now)
            const reviewBtn = document.getElementById('btn-review-docs');
            if (reviewBtn) reviewBtn.style.display = 'none';

            // Tab State
            let currentTab = 'Overview';

            // Constants for Financials
            const commissionRate = 1.1; // %
            const agentSplit = 70; // %

            // Render Functions
            const renderTabs = () => {
                const tabs = ['Overview', 'Docs', 'Financials', 'Timeline'];
                return `
                    <div class="flex border-b border-navy-100 mb-8">
                        ${tabs.map(tab => `
                            <button onclick="window.switchTab('${tab}')" 
                                class="px-6 py-3 text-sm font-medium transition-colors border-b-2 ${currentTab === tab ? 'border-neon-500 text-navy-600' : 'border-transparent text-navy-300 hover:text-navy-500'}">
                                ${tab}
                            </button>
                        `).join('')}
                    </div>
                    <div id="project-tab-content"></div>
                `;
            };

            const renderOverview = () => {
                const statusActions = `
                    <div class="flex items-center gap-3 mt-6 pt-6 border-t border-navy-50">
                        ${project.status === STATUS.ON_HOLD ? `
                            <button onclick="window.updateProjectStatus('active')" class="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm">Activate Project</button>
                        ` : `
                            ${project.status !== STATUS.DISBURSED ? `
                                <button onclick="window.updateProjectStatus('on_hold')" class="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all shadow-sm">Put On Hold</button>
                            ` : ''}
                        `}
                        ${project.stage !== STAGES.CLOSED ? `
                            <button onclick="window.updateProjectStatus('closed')" class="px-4 py-2 bg-navy-800 text-white text-xs font-bold rounded-lg hover:bg-navy-900 transition-all shadow-sm">Close Project</button>
                        ` : ''}
                    </div>
                `;

                return `
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2">
                            <!-- Top Stats -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div class="p-4 bg-white rounded-xl border border-navy-100 shadow-sm">
                                    <p class="text-[10px] text-navy-400 uppercase font-bold mb-1">Borrower Type</p>
                                    <span class="bg-navy-50 text-navy-700 text-xs px-2 py-1 rounded font-bold">${project.borrowerType === 'salaried' ? 'Salaried' : 'Self-Employed'}</span>
                                </div>
                                <div class="p-4 bg-white rounded-xl border border-navy-100 shadow-sm">
                                    <p class="text-[10px] text-navy-400 uppercase font-bold mb-1">Loan Amount</p>
                                    <p class="text-lg font-bold text-navy-800">${utils.formatCurrency(project.loanAmount)}</p>
                                </div>
                                <div class="p-4 bg-white rounded-xl border border-navy-100 shadow-sm">
                                    <p class="text-[10px] text-navy-400 uppercase font-bold mb-1">Property Profile</p>
                                    <p class="text-lg font-bold text-navy-800">${project.propertyProfile || 'Building'}</p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <!-- AI Eligibility -->
                                <div class="card p-6 bg-[#F0FDF4] border border-neon-100 rounded-xl">
                                    <div class="flex items-center justify-between mb-4">
                                        <h3 class="text-xs font-bold text-navy-800 uppercase tracking-wider">Assessed Eligibility</h3>
                                        <div class="flex items-end gap-1">
                                            <span class="text-3xl font-bold text-navy-800">${eligibilityScore}</span>
                                            <span class="text-xs text-navy-500 mb-1">/100</span>
                                        </div>
                                    </div>
                                    <div class="w-full h-2 bg-white rounded-full overflow-hidden mb-6 border border-neon-100">
                                        <div class="h-full bg-neon-500 rounded-full" style="width: ${eligibilityScore}%"></div>
                                    </div>
                                    <div class="space-y-4">
                                        <div class="flex justify-between text-xs"><span class="text-navy-500 font-medium">Credit Score</span><span class="font-bold text-navy-800">720</span></div>
                                        <div class="flex justify-between text-xs"><span class="text-navy-500 font-medium">DTI Ratio</span><span class="font-bold text-neon-600">Low Risk</span></div>
                                    </div>
                                </div>

                                <!-- Project Info -->
                                <div class="card p-6 bg-white border border-navy-100 rounded-xl">
                                     <h3 class="text-xs font-bold text-navy-800 uppercase tracking-wider mb-4">Meta Information</h3>
                                     <div class="space-y-3">
                                        <div class="flex justify-between text-xs"><span class="text-navy-400 font-medium">Business Type</span><span class="font-bold text-navy-700">${project.loanType}</span></div>
                                        <div class="flex justify-between text-xs"><span class="text-navy-400 font-medium">Assigned Agent</span><span class="font-bold text-navy-700">${agent?.name}</span></div>
                                        <div class="flex justify-between text-xs"><span class="text-navy-400 font-medium">Last Updated</span><span class="font-bold text-navy-700">${utils.formatRelativeTime(project.updatedAt)}</span></div>
                                     </div>
                                     ${statusActions}
                                </div>
                            </div>
                        </div>

                        <!-- Sidebar Info -->
                        <div class="space-y-6">
                            <div class="card p-6 bg-white border border-navy-100 rounded-xl">
                                <h3 class="text-xs font-bold text-navy-800 uppercase tracking-wider mb-4">Document Progress</h3>
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-2xl font-bold text-navy-800">${completion}%</span>
                                    <span class="text-[10px] font-bold text-navy-400 uppercase">${project.documents.required.length} Required</span>
                                </div>
                                ${utils.getProgressBar(completion)}
                                <a href="project-documents.html?id=${projectId}" class="block w-full mt-6 text-center py-2 bg-navy-50 text-navy-600 text-xs font-bold rounded-lg hover:bg-navy-100 transition-all border border-navy-100">Manage Documents</a>
                            </div>
                        </div>
                    </div>
                `;
            };

            // Status Control Event Handlers
            window.updateProjectStatus = (newStatus) => {
                if (newStatus === 'on_hold') {
                    App.showModal({
                        title: 'Put Project On Hold',
                        content: `
                            <div class="space-y-4">
                                <p class="text-sm text-navy-500">Please provide a reason for putting this project on hold.</p>
                                <textarea id="on-hold-reason-input" class="w-full h-24 px-4 py-2 bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-neon-500 text-navy-700" placeholder="e.g. Awaiting client's tax return..."></textarea>
                            </div>
                        `,
                        confirmText: 'Put On Hold',
                        onConfirm: () => {
                            const reason = document.getElementById('on-hold-reason-input').value;
                            if (!reason) {
                                App.showToast('Reason is required', 'error');
                                return;
                            }
                            project.status = STATUS.ON_HOLD;
                            project.onHoldReason = reason;
                            project.updatedAt = new Date().toISOString();
                            App.showToast('Project is now On-Hold');
                            window.switchTab('Overview');
                            document.getElementById('header-status-badge').innerHTML = utils.getStatusBadge(project.status);
                        }
                    });
                } else if (newStatus === 'active') {
                    project.status = STATUS.ACTIVE;
                    delete project.onHoldReason;
                    project.updatedAt = new Date().toISOString();
                    App.showToast('Project reactivated');
                    window.switchTab('Overview');
                    document.getElementById('header-status-badge').innerHTML = utils.getStatusBadge(project.status);
                } else if (newStatus === 'closed') {
                    App.showModal({
                        title: 'Close Project',
                        content: `
                            <div class="space-y-4">
                                <p class="text-sm text-navy-500">Select the outcome for this project.</p>
                                <select id="close-outcome-input" class="w-full px-4 py-2 bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-neon-500 text-navy-700">
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Disbursed">Disbursed</option>
                                </select>
                            </div>
                        `,
                        confirmText: 'Close Project',
                        onConfirm: () => {
                            const outcome = document.getElementById('close-outcome-input').value;
                            project.stage = STAGES.CLOSED;
                            project.status = (outcome === 'Disbursed') ? STATUS.DISBURSED : STATUS.CLOSED;
                            project.closedOutcome = outcome;
                            project.updatedAt = new Date().toISOString();
                            if (!project.timeline) project.timeline = {};
                            project.timeline.closedAt = Date.now();
                            App.showToast(`Project closed as ${outcome}`);
                            window.switchTab('Overview');
                            document.getElementById('header-status-badge').innerHTML = utils.getStatusBadge(project.status);
                        }
                    });
                }
            };

            const renderDocs = () => {
                const borrowerType = project.borrowerType || 'salaried';
                const slots = DOCUMENT_CONFIG.filter(slot => borrowerType === 'self_employed' || !slot.selfEmployedOnly);
                
                const sections = {
                    borrower: { title: 'Section A — Borrower', items: [] },
                    company: { title: 'Section B — Company', items: [] },
                    asset: { title: 'Section C — Asset', items: [] },
                    bank: { title: 'Section D — Banking', items: [] },
                    lease: { title: 'Section E — Lease', items: [] }
                };

                slots.forEach(slot => {
                    sections[slot.section].items.push(slot);
                });

                return `
                    <div class="bg-white border border-navy-100 rounded-xl p-8 text-center">
                        <div class="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4 text-navy-300">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <h3 class="text-lg font-bold text-navy-800 mb-2">Document Review Interface</h3>
                        <p class="text-sm text-navy-500 mb-6 max-w-md mx-auto">Launch the specialized workspace for verifying, rejecting, and commenting on applicant documents.</p>
                        <a href="project-documents.html?id=${projectId}" class="inline-flex items-center gap-2 px-6 py-3 bg-neon-500 text-white font-medium rounded-xl hover:bg-neon-600 transition-colors shadow-lg shadow-neon-500/20">
                            Open Document Workspace
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                    </div>
                    <div class="mt-8">
                        <h4 class="text-sm font-bold text-navy-700 mb-4">Checklist Summary</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            ${Object.values(sections).filter(s => s.items.length > 0).map(s => `
                                <div class="p-4 bg-white border border-navy-100 rounded-xl">
                                    <p class="text-[10px] text-navy-400 uppercase tracking-wider font-bold mb-2">${s.title}</p>
                                    <div class="space-y-1">
                                        ${s.items.map(item => {
                    const d = project.documents.items?.[item.code];
                    let color = 'text-navy-300';
                    if (d?.status === 'verified') color = 'text-neon-600';
                    else if (d?.status === 'uploaded') color = 'text-blue-500';
                    else if (d?.status === 'rejected') color = 'text-red-500';
                    
                    return `
                                                <div class="flex items-center justify-between text-[11px]">
                                                    <span class="text-navy-600 truncate mr-1">${item.code}</span>
                                                    <span class="${color}">●</span>
                                                </div>
                                            `;
                }).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            };

            const renderFinancials = () => {
                const commission = project.loanAmount * (commissionRate / 100);
                const agentPay = commission * (agentSplit / 100);
                const referralPay = commission * ((100 - agentSplit) / 100);

                return `
                    <div class="bg-white border border-navy-100 rounded-xl p-6 max-w-3xl mx-auto">
                        <div class="flex items-center justify-between mb-6 border-b border-navy-50 pb-6">
                            <div>
                                <h3 class="text-lg font-bold text-navy-800">Commission Calculator</h3>
                                <p class="text-sm text-navy-500">Estimated payouts based on loan value</p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-navy-400 uppercase tracking-wider font-bold">Total Commission</p>
                                <p class="text-2xl font-bold text-neon-600">${utils.formatCurrency(commission, true)}</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div class="space-y-4">
                                <label class="block">
                                    <span class="text-sm font-medium text-navy-700">Loan Amount</span>
                                    <div class="mt-1 relative">
                                        <span class="absolute left-3 top-2.5 text-navy-400">$</span>
                                        <input type="text" value="${project.loanAmount.toLocaleString()}" readonly class="w-full bg-navy-50 border border-navy-200 rounded-lg pl-7 pr-4 py-2 text-navy-600 font-mono text-sm cursor-not-allowed">
                                    </div>
                                </label>
                                <label class="block">
                                    <span class="text-sm font-medium text-navy-700">Bank Rate (%)</span>
                                    <input type="number" value="${commissionRate}" class="w-full mt-1 bg-white border border-navy-200 rounded-lg px-4 py-2 text-navy-800 text-sm focus:border-neon-500 focus:outline-none transition-colors">
                                </label>
                            </div>
                            <div class="bg-navy-50 rounded-xl p-6 space-y-4">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium text-navy-600">Agent Split (${agentSplit}%)</span>
                                    <span class="font-mono font-bold text-navy-800">${utils.formatCurrency(agentPay, true)}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium text-navy-600">Referral / House (${100 - agentSplit}%)</span>
                                    <span class="font-mono font-bold text-navy-800">${utils.formatCurrency(referralPay, true)}</span>
                                </div>
                                <div class="pt-4 border-t border-navy-200/50 mt-2">
                                    <p class="text-xs text-navy-400 text-center">Payouts are estimates until Disbursement.</p>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end">
                            <button class="px-6 py-2 bg-navy-800 text-white font-medium rounded-lg hover:bg-navy-900 transition-colors shadow-lg shadow-navy-900/10">
                                Save Calculation
                            </button>
                        </div>
                    </div>
                `;
            };

            const renderTimeline = () => {
                const projectTimeline = project.timeline || {};
                const milestoneData = [
                    { label: 'T1 — Speed to Start', from: project.createdAt, to: projectTimeline.wipStartedAt },
                    { label: 'T2 — Doc Collection', from: projectTimeline.wipStartedAt, to: projectTimeline.docsCompletedAt },
                    { label: 'T3 — Prep & Submit', from: projectTimeline.docsCompletedAt, to: projectTimeline.submittedAt },
                    { label: 'T4 — Bank Processing', from: projectTimeline.submittedAt, to: projectTimeline.folAt },
                    { label: 'T5 — FOL to Disbursement', from: projectTimeline.folAt, to: projectTimeline.disbursedAt }
                ];

                const calculateDuration = (start, end) => {
                    if (!start || !end) return 'Pending';
                    const diff = new Date(end) - new Date(start);
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    return `${days}d`;
                };

                return `
                    <div class="bg-white border border-navy-100 rounded-xl p-6 max-w-2xl mx-auto">
                        <h3 class="text-sm font-semibold text-navy-800 mb-6">Application Timeline (T1-T5)</h3>
                        <div class="space-y-0 relative pl-4">
                            ${milestoneData.map((m, index) => {
                    const isLast = index === milestoneData.length - 1;
                    const duration = calculateDuration(m.from, m.to);
                    const isCompleted = duration !== 'Pending';
                    
                    let icon = '';
                    let textClass = '';

                    if (isCompleted) {
                        icon = `<div class="w-8 h-8 rounded-full bg-neon-100 text-neon-600 flex items-center justify-center border-4 border-white shadow-sm z-10"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>`;
                        textClass = 'text-navy-800 font-medium';
                    } else {
                        icon = `<div class="w-8 h-8 rounded-full bg-navy-50 text-navy-300 flex items-center justify-center border-4 border-white z-10"><div class="w-2 h-2 bg-navy-200 rounded-full"></div></div>`;
                        textClass = 'text-navy-400';
                    }

                    return `
                                    <div class="relative pb-12 ${isLast ? '' : 'border-l-2 border-navy-50'} ml-4">
                                        <div class="absolute -left-[1.15rem] top-0">
                                            ${icon}
                                        </div>
                                        <div class="pl-8 pt-1">
                                            <div class="flex justify-between items-center">
                                                <p class="text-sm ${textClass}">${m.label}</p>
                                                <span class="text-xs font-mono ${isCompleted ? 'text-neon-600 font-bold' : 'text-navy-300'}">${duration}</span>
                                            </div>
                                            ${isCompleted ? `<p class="text-[10px] text-navy-400 mt-1">Completed on ${new Date(m.to).toLocaleDateString()}</p>` : ''}
                                        </div>
                                    </div>
                                `;
                }).join('')}
                        </div>
                    </div>
                `;
            };

            // Initial Render
            const container = document.getElementById('project-detail-container');
            container.innerHTML = renderTabs();

            // Tab Switching Logic
            window.switchTab = (tab) => {
                currentTab = tab;
                // Re-render tabs header to update active state
                const header = renderTabs().split('<div id="project-tab-content">')[0];
                container.innerHTML = header + '<div id="project-tab-content"></div>';

                // Render Content
                const contentContainer = document.getElementById('project-tab-content');
                if (tab === 'Overview') contentContainer.innerHTML = renderOverview();
                if (tab === 'Docs') contentContainer.innerHTML = renderDocs();
                if (tab === 'Financials') contentContainer.innerHTML = renderFinancials();
                if (tab === 'Timeline') contentContainer.innerHTML = renderTimeline();
            };

            // Trigger default
            window.switchTab('Overview');
        },

        renderDocumentReview: function () {
            if (!document.getElementById('document-review-container')) return;

            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            const project = projects.find(p => p.id === projectId);

            if (!project) {
                window.location.href = 'projects-list.html';
                return;
            }

            // Update Header
            document.getElementById('doc-header-title').textContent = `${project.clientName.split('&')[0]}'s documents`;
            document.getElementById('doc-view-ref').textContent = `Ref: ${project.id.split('-').pop()}`;
            document.getElementById('doc-view-ref').nextElementSibling.textContent = project.status;
            document.getElementById('back-link').href = `project-detail.html?id=${projectId}`;

            const container = document.getElementById('document-review-container');

            // State
            let selectedKind = 'A1'; // Default to first PRD slot

            // Helper to render
            const renderLayout = () => {
                const borrowerType = project.borrowerType || 'salaried';
                const slots = DOCUMENT_CONFIG.filter(slot => borrowerType === 'self_employed' || !slot.selfEmployedOnly);
                
                // Initialize documents object if not present
                if (!project.docs) project.documents.items = {};
                
                let selectedSlot = slots.find(s => s.code === selectedKind) || slots[0];
                const docData = project.documents.items[selectedSlot.code] || { status: 'missing', files: [] };

                // Group slots by section
                const sections = {
                    borrower: { title: 'Section A — Borrower Documents', items: [] },
                    company: { title: 'Section B — Company Documents', items: [] },
                    asset: { title: 'Section C — Asset Documents', items: [] },
                    bank: { title: 'Section D — Banking Documents', items: [] },
                    lease: { title: 'Section E — Lease Documents', items: [] }
                };

                slots.forEach(slot => {
                    sections[slot.section].items.push(slot);
                });

                // Calculate progress
                const totalRequired = slots.filter(s => s.required).length;
                const completedCount = slots.filter(s => {
                    const d = project.documents.items[s.code];
                    return d && (d.status === 'verified' || d.status === 'uploaded');
                }).length;
                const percentage = Math.round((completedCount / slots.length) * 100);

                // Render Left Pane
                const leftHtml = `
                    <div class="w-1/3 min-w-[320px] bg-white border border-navy-200 rounded-xl flex flex-col overflow-hidden">
                        <!-- Progress -->
                        <div class="p-6 border-b border-navy-100">
                            <div class="flex justify-between items-end mb-2">
                                <span class="text-2xl font-bold text-navy-800">${percentage}% <span class="text-sm font-normal text-navy-500">Complete</span></span>
                                <span class="text-xs text-navy-500">${slots.length - completedCount} Outstanding | ${completedCount} Done</span>
                            </div>
                            <div class="w-full h-2 bg-navy-100 rounded-full overflow-hidden">
                                <div class="h-full bg-navy-800 rounded-full" style="width: ${percentage}%"></div>
                            </div>
                        </div>

                        <!-- Scrollable List -->
                        <div class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                            ${Object.values(sections).filter(s => s.items.length > 0).map(section => `
                                <div>
                                    <h4 class="text-xs font-bold text-navy-400 uppercase tracking-wider mb-3 ml-1">${section.title}</h4>
                                    <div class="space-y-2">
                                        ${section.items.map(item => {
                    const isSelected = item.code === selectedSlot.code;
                    const d = project.documents.items[item.code] || { status: 'missing' };
                    let statusBadge = '';
                    if (d.status === 'verified') statusBadge = '<span class="text-[10px] text-neon-600 font-medium bg-neon-50 px-2 py-0.5 rounded">Verified</span>';
                    else if (d.status === 'uploaded') statusBadge = '<span class="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">Uploaded</span>';
                    else if (d.status === 'rejected') statusBadge = '<span class="text-[10px] text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">Rejected</span>';
                    else statusBadge = '<span class="text-[10px] text-navy-400 font-medium bg-navy-50 px-2 py-0.5 rounded">Missing</span>';

                    return `
                                                <div onclick="window.updateSelection('${item.code}')" 
                                                     class="cursor-pointer p-3 rounded-lg border transition-all ${isSelected ? 'bg-navy-50 border-navy-300 ring-1 ring-navy-200 shadow-sm' : 'bg-white border-transparent hover:bg-navy-50 hover:border-navy-200'}">
                                                    <div class="flex justify-between items-start">
                                                        <div class="flex items-start gap-3">
                                                            <div class="w-8 h-8 rounded bg-white border border-navy-200 flex items-center justify-center text-[10px] text-navy-500 font-bold shadow-sm">${item.code}</div>
                                                            <div>
                                                                <p class="text-sm font-medium text-navy-700 line-clamp-1 break-all">${item.label}</p>
                                                                <p class="text-[10px] text-navy-400 mt-0.5">${item.required ? 'Required' : 'If applicable'}</p>
                                                            </div>
                                                        </div>
                                                        ${d.status === 'verified' ? '<svg class="w-4 h-4 text-neon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : ''}
                                                    </div>
                                                    <div class="mt-3 flex justify-between items-center">
                                                        ${statusBadge}
                                                        ${d.status === 'missing' || d.status === 'rejected' ? `<button onclick="event.stopPropagation(); window.simulateUpload('${item.code}')" class="text-xs bg-navy-800 text-white px-2 py-1 rounded hover:bg-navy-700 transition-colors">Upload</button>` : ''}
                                                    </div>
                                                </div>
                                            `;
                }).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                // Render Right Pane
                const rightHtml = `
                    <div class="flex-1 bg-white border border-navy-200 rounded-xl flex flex-col overflow-hidden">
                        <!-- Toolbar -->
                        <div class="p-4 border-b border-navy-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 class="text-sm font-bold text-navy-800">${selectedSlot.label} (${selectedSlot.code})</h3>
                                <p class="text-xs text-navy-500">Status: <span class="font-medium capitalize">${docData.status}</span></p>
                            </div>
                            <div class="flex gap-2">
                                ${docData.status === 'uploaded' ? `
                                    <button onclick="window.updateDocStatus('${selectedSlot.code}', 'rejected')" class="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100">Reject</button>
                                    <button onclick="window.updateDocStatus('${selectedSlot.code}', 'verified')" class="px-3 py-1.5 bg-neon-600 text-white text-xs font-medium rounded-lg hover:bg-neon-700 shadow-sm">Verify Document</button>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Viewer Placeholder -->
                        <div class="flex-1 bg-navy-100 relative flex items-center justify-center p-8 overflow-hidden">
                            ${docData.status === 'missing' ? `
                                <div class="text-center">
                                    <div class="w-16 h-16 bg-navy-200/50 rounded-full flex items-center justify-center mx-auto mb-4 text-navy-400">
                                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    </div>
                                    <p class="text-sm font-medium text-navy-500">No document uploaded yet</p>
                                    <button onclick="window.simulateUpload('${selectedSlot.code}')" class="mt-4 text-xs bg-white border border-navy-200 px-4 py-2 rounded-lg text-navy-600 font-medium hover:bg-navy-50 shadow-sm transition-all">Click to simulate upload</button>
                                </div>
                            ` : `
                                <div class="bg-white shadow-lg w-full max-w-2xl h-full border border-navy-200 flex flex-col p-8">
                                    <div class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-navy-100 rounded-xl">
                                        <svg class="w-12 h-12 text-navy-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        <p class="text-xs text-navy-400 font-mono">${selectedSlot.code}_${project.id}_v1.pdf</p>
                                    </div>
                                </div>
                            `}
                        </div>

                        <!-- Rejection Reason if any -->
                        ${docData.rejectionReason ? `
                            <div class="px-6 py-3 bg-red-50 border-t border-red-100">
                                <p class="text-xs text-red-600 font-medium">Rejection Reason: ${docData.rejectionReason}</p>
                            </div>
                        ` : ''}
                    </div>
                `;

                container.innerHTML = leftHtml + rightHtml;
            };

            // Event Handlers
            window.updateSelection = (code) => {
                selectedKind = code;
                renderLayout();
            };

            window.updateDocStatus = (code, status) => {
                if (!project.documents.items) project.documents.items = {};
                if (!project.documents.items[code]) project.documents.items[code] = { files: [] };
                
                if (status === 'rejected') {
                    App.showModal({
                        title: 'Reject Document',
                        content: `
                            <div class="space-y-4">
                                <p class="text-sm text-navy-500">Please provide a reason for rejecting document ${code}.</p>
                                <textarea id="rejection-reason-input" class="w-full h-24 px-4 py-2 bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-neon-500 text-navy-700" placeholder="e.g. Image blurry, expired ID..."></textarea>
                            </div>
                        `,
                        confirmText: 'Reject Document',
                        onConfirm: () => {
                            const reason = document.getElementById('rejection-reason-input').value;
                            if (!reason) {
                                this.showToast('Rejection reason is required', 'error');
                                return;
                            }
                            project.documents.items[code].rejectionReason = reason;
                            project.documents.items[code].status = 'rejected';
                            this.showToast(`Document ${code} rejected`);
                            renderLayout();
                        }
                    });
                    return;
                } else {
                    delete project.documents.items[code].rejectionReason;
                }

                project.documents.items[code].status = status;
                
                // Auto-stamping docsCompletedAt (PRD Section 5.2.4)
                if (status === 'verified') {
                    const borrowerType = project.borrowerType || 'salaried';
                    const slots = DOCUMENT_CONFIG.filter(slot => borrowerType === 'self_employed' || !slot.selfEmployedOnly);
                    const verifiedCount = slots.filter(s => project.documents.items[s.code]?.status === 'verified').length;
                    
                    if (verifiedCount === slots.length) {
                        if (!project.timeline) project.timeline = {};
                        project.timeline.docsCompletedAt = Date.now();
                        this.showToast('All documents verified! Milestone updated.');
                    }
                }

                this.showToast(`Document ${code} marked as ${status}`);
                renderLayout();
            };

            window.simulateUpload = (code) => {
                if (!project.documents.items) project.documents.items = {};
                project.documents.items[code] = {
                    status: 'uploaded',
                    date: new Date().toLocaleDateString(),
                    files: ['simulated_file.pdf']
                };
                this.showToast(`Simulated upload for ${code}`);
                renderLayout();
            };

            renderLayout();
        },

        initDragAndDrop: function () {
            const cards = document.querySelectorAll('.draggable-card');
            const dropZones = document.querySelectorAll('.drop-zone');

            let draggedCard = null;

            cards.forEach(card => {
                const projectId = card.dataset.id;
                const project = projects.find(p => p.id === projectId);

                // Initial lock state visual
                if (project && (project.status === STATUS.ON_HOLD || (project.status === STATUS.DISBURSED && project.stage !== STAGES.DISBURSED))) {
                    card.classList.add('opacity-60', 'cursor-not-allowed');
                    card.setAttribute('draggable', 'false');
                }

                card.addEventListener('dragstart', (e) => {
                    if (project.status === STATUS.ON_HOLD) {
                        e.preventDefault();
                        this.showToast('On-Hold projects cannot be moved', 'error');
                        return;
                    }
                    
                    draggedCard = card;
                    e.dataTransfer.effectAllowed = 'move';
                    setTimeout(() => card.classList.add('opacity-50', 'rotate-3'), 0);
                });

                card.addEventListener('dragend', () => {
                    draggedCard = null;
                    card.classList.remove('opacity-50', 'rotate-3');
                });
            });

            dropZones.forEach(zone => {
                zone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    zone.classList.add('bg-navy-100/50');
                });

                zone.addEventListener('dragleave', () => {
                    zone.classList.remove('bg-navy-100/50');
                });

                zone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    zone.classList.remove('bg-navy-100/50');

                    if (draggedCard) {
                        const projectId = draggedCard.dataset.id;
                        const project = projects.find(p => p.id === projectId);
                        const newStage = zone.dataset.stage;
                        const oldStage = project.stage;

                        // 1. Forward-only Rule
                        const stageOrder = ['New', 'WIP', 'Docs Completed', 'Submitted', 'FOL', 'Disbursed', 'Closed'];
                        const oldIndex = stageOrder.indexOf(oldStage);
                        const newIndex = stageOrder.indexOf(newStage);

                        if (newIndex < oldIndex) {
                            this.showToast('Projects can only move forward', 'error');
                            return;
                        }

                        if (newIndex === oldIndex) return;

                        // 2. Disbursed stage restrictions
                        if (oldStage === STAGES.DISBURSED && newStage !== STAGES.CLOSED) {
                            this.showToast('Disbursed projects can only move to Closed', 'error');
                            return;
                        }

                        // 3. Interactive Prompts
                        if (newStage === STAGES.FOL) {
                            App.showModal({
                                title: 'FOL Conditions',
                                content: `
                                    <div class="space-y-4">
                                        <p class="text-sm text-navy-500">Enter bank conditions or requirements for this Facility Offer Letter.</p>
                                        <textarea id="fol-notes-input" class="w-full h-32 px-4 py-2 bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-neon-500 text-navy-700" placeholder="Enter bank conditions..."></textarea>
                                    </div>
                                `,
                                confirmText: 'Set Stage to FOL',
                                onConfirm: () => {
                                    const notes = document.getElementById('fol-notes-input').value;
                                    project.folNotes = notes;
                                    this.finalizeStageChange(project, newStage, draggedCard, zone);
                                }
                            });
                            return;
                        }

                        if (newStage === STAGES.CLOSED) {
                            App.showModal({
                                title: 'Select Project Outcome',
                                content: `
                                    <div class="space-y-4">
                                        <p class="text-sm text-navy-500">How was this project closed?</p>
                                        <select id="closed-outcome-input" class="w-full px-4 py-2 bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-neon-500 text-navy-700">
                                            <option value="Disbursed">Disbursed (Default)</option>
                                            <option value="Approved">Approved but not disbursed</option>
                                            <option value="Rejected">Rejected by Bank</option>
                                            <option value="Cancelled">Cancelled by Client</option>
                                        </select>
                                    </div>
                                `,
                                confirmText: 'Close Project',
                                onConfirm: () => {
                                    const outcome = document.getElementById('closed-outcome-input').value;
                                    project.closedOutcome = outcome;
                                    this.finalizeStageChange(project, newStage, draggedCard, zone);
                                }
                            });
                            return;
                        }

                        this.finalizeStageChange(project, newStage, draggedCard, zone);
                    }
                });
            });
        },

        finalizeStageChange: function (project, newStage, card, zone) {
            // Update Data
            project.stage = newStage;
            project.updatedAt = new Date().toISOString();

            // Auto-stamping milestones (PRD Section 5.4.1)
            if (!project.timeline) project.timeline = {};
            if (newStage === STAGES.WIP) project.timeline.wipStartedAt = Date.now();
            if (newStage === STAGES.DOCS_COMPLETED) project.timeline.docsCompletedAt = Date.now();
            if (newStage === STAGES.SUBMITTED) project.timeline.submittedAt = Date.now();
            if (newStage === STAGES.FOL) project.timeline.folAt = Date.now();
            if (newStage === STAGES.DISBURSED) {
                project.timeline.disbursedAt = Date.now();
                project.status = STATUS.DISBURSED;
            }
            if (newStage === STAGES.CLOSED) {
                project.timeline.closedAt = Date.now();
                project.status = STATUS.DISBURSED; // Disbursed stage sets status to disbursed, closed can too or remain
            }

            // Move card visually
            if (card && zone) zone.appendChild(card);
            
            setTimeout(() => {
                this.renderKanbanBoard();
                this.showToast(`Moved ${project.clientName} to ${newStage}`);
            }, 50);
        },

        renderAgents: function () {
            const container = document.getElementById('agents-container');
            if (!container) return;

            container.innerHTML = agents.map(agent => `
                <div class="bg-white border border-navy-200 rounded-xl p-6 flex flex-col items-center hover:shadow-md transition-all">
                    <div class="w-20 h-20 bg-navy-100 rounded-full flex items-center justify-center text-xl font-bold text-navy-600 mb-4 bg-gradient-to-br from-navy-100 to-navy-200">
                        ${utils.getInitials(agent.name)}
                    </div>
                    <h3 class="text-lg font-bold text-navy-800">${agent.name}</h3>
                    <p class="text-sm text-navy-500 mb-4">${agent.role}</p>
                    
                    <div class="w-full grid grid-cols-2 gap-4 border-t border-navy-100 pt-4 mb-4">
                        <div class="text-center">
                            <span class="block text-xl font-bold text-navy-800">${agent.activeProjects}</span>
                            <span class="text-xs text-navy-400">Active</span>
                        </div>
                        <div class="text-center border-l border-navy-100">
                            <span class="block text-xl font-bold text-neon-600">${agent.closedThisMonth}</span>
                            <span class="text-xs text-navy-400">Closed (Mo)</span>
                        </div>
                    </div>
                    
                    <a href="mailto:${agent.email}" class="w-full py-2 border border-navy-200 rounded-lg text-sm text-center text-navy-600 hover:bg-navy-50 transition-colors">
                        Contact
                    </a>
                </div>
            `).join('') + `
                <!-- Add Agent Card -->
                <button class="border-2 border-dashed border-navy-200 rounded-xl p-6 flex flex-col items-center justify-center text-navy-400 hover:border-navy-300 hover:text-navy-500 transition-colors min-h-[300px]">
                    <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span class="font-medium">Add New Agent</span>
                </button>
            `;
        },

        renderSettings: function () {
            const container = document.getElementById('settings-container');
            if (!container) return;

            let activeTab = 'Profile';

            const renderTabs = () => {
                const tabs = ['Profile', 'Banks', 'Referrals', 'Notifications'];
                return `
                    <div class="flex border-b border-navy-100 mb-8 overflow-x-auto">
                        ${tabs.map(tab => `
                            <button onclick="window.switchSettingsTab('${tab}')" 
                                class="px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-neon-500 text-navy-600' : 'border-transparent text-navy-300 hover:text-navy-500'}">
                                ${tab}
                            </button>
                        `).join('')}
                    </div>
                    <div id="settings-tab-content"></div>
                `;
            };

            const renderProfile = () => `
                <div class="max-w-2xl space-y-8">
                    <div class="bg-white border border-navy-200 rounded-xl p-8">
                        <h2 class="text-lg font-bold text-navy-800 mb-6">Profile Settings</h2>
                        <div class="flex items-start gap-6">
                            <div class="w-20 h-20 bg-navy-200 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold text-navy-500">SM</div>
                            <div class="flex-1 space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-navy-700 mb-1">First Name</label>
                                        <input type="text" value="Sarah" class="w-full px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:border-neon-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-navy-700 mb-1">Last Name</label>
                                        <input type="text" value="Mitchell" class="w-full px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:border-neon-500">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-navy-700 mb-1">Email Address</label>
                                    <input type="email" value="sarah.mitchell@maxmortgage.com" class="w-full px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:border-neon-500">
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-end mt-6">
                            <button onclick="App.showToast('Profile updated')" class="px-6 py-2 bg-neon-500 text-white rounded-lg font-medium hover:bg-neon-600 shadow-sm transition-all">Save Changes</button>
                        </div>
                    </div>
                </div>
            `;

            const renderBanks = () => `
                <div class="bg-white border border-navy-200 rounded-xl overflow-hidden">
                    <div class="p-6 border-b border-navy-100 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-navy-800">Bank Master Table</h2>
                        <button onclick="App.showToast('Add Bank modal (Prod only)')" class="bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-900 transition-all">+ Add Bank</button>
                    </div>
                    <table class="w-full text-left text-sm">
                        <thead class="bg-navy-50 text-navy-500 uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th class="p-4">Bank Name</th>
                                <th class="p-4">Default Comm. %</th>
                                <th class="p-4">Status</th>
                                <th class="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-navy-100">
                            <tr>
                                <td class="p-4 font-medium text-navy-700">First National Bank</td>
                                <td class="p-4 font-mono text-navy-600">1.5%</td>
                                <td class="p-4"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">Active</span></td>
                                <td class="p-4 text-right">
                                    <button class="text-navy-400 hover:text-navy-600">Edit</button>
                                </td>
                            </tr>
                            <tr>
                                <td class="p-4 font-medium text-navy-700">Wells Fargo</td>
                                <td class="p-4 font-mono text-navy-600">1.2%</td>
                                <td class="p-4"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">Active</span></td>
                                <td class="p-4 text-right">
                                    <button class="text-navy-400 hover:text-navy-600">Edit</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;

            const renderReferrals = () => `
                <div class="bg-white border border-navy-200 rounded-xl overflow-hidden">
                    <div class="p-6 border-b border-navy-100 flex justify-between items-center">
                        <h2 class="text-lg font-bold text-navy-800">Referral Partners</h2>
                        <button onclick="App.showToast('Add Referral modal (Prod only)')" class="bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-900 transition-all">+ Add Partner</button>
                    </div>
                    <table class="w-full text-left text-sm">
                        <thead class="bg-navy-50 text-navy-500 uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th class="p-4">Agency</th>
                                <th class="p-4">Contact</th>
                                <th class="p-4">Default Split</th>
                                <th class="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-navy-100">
                            <tr>
                                <td class="p-4 font-medium text-navy-700">Epyc Digital</td>
                                <td class="p-4 text-navy-500">Ejaz S.</td>
                                <td class="p-4 font-mono text-navy-600">25%</td>
                                <td class="p-4 text-right">
                                    <button class="text-navy-400 hover:text-navy-600">Edit</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;

            const renderNotifications = () => `
                <div class="max-w-2xl bg-white border border-navy-200 rounded-xl p-8">
                    <h2 class="text-lg font-bold text-navy-800 mb-6">Notification Preferences</h2>
                    <div class="space-y-4">
                        <label class="flex items-center justify-between p-4 border border-navy-100 rounded-xl cursor-pointer hover:bg-navy-50 transition-all">
                            <div>
                                <span class="block text-sm font-medium text-navy-800">Email Notifications</span>
                                <span class="block text-xs text-navy-500">Daily pipeline summaries</span>
                            </div>
                            <input type="checkbox" checked onchange="App.showToast('Email notifications updated')" class="w-5 h-5 text-neon-600 rounded-lg">
                        </label>
                        <label class="flex items-center justify-between p-4 border border-navy-100 rounded-xl cursor-pointer hover:bg-navy-50 transition-all">
                            <div>
                                <span class="block text-sm font-medium text-navy-800">Push Notifications</span>
                                <span class="block text-xs text-navy-500">Instant stage change alerts</span>
                            </div>
                            <input type="checkbox" onchange="App.showToast('Push notifications updated')" class="w-5 h-5 text-neon-600 rounded-lg">
                        </label>
                    </div>
                </div>
            `;

            window.switchSettingsTab = (tab) => {
                activeTab = tab;
                container.innerHTML = renderTabs();
                const content = document.getElementById('settings-tab-content');
                if (tab === 'Profile') content.innerHTML = renderProfile();
                if (tab === 'Banks') content.innerHTML = renderBanks();
                if (tab === 'Referrals') content.innerHTML = renderReferrals();
                if (tab === 'Notifications') content.innerHTML = renderNotifications();
            };

            window.switchSettingsTab('Profile');
        }
    };

    // Initialize App
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
        App.renderProjectsList(); // Try to render if on list page
        App.renderKanbanBoard(); // Try to render if on kanban page
        App.renderProjectDetail(); // Try to render if on detail page
        App.renderDocumentReview(); // Try to render if on doc review page
        App.renderAgents(); // Try to render if on agents page
        App.renderSettings(); // Try to render if on settings page
    });

    // Expose App to global scope
    window.App = App;

})();

