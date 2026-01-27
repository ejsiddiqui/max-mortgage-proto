/**
 * Max Mortgage Prototype - Combined Application Logic
 * Refactored to run locally without ES Modules (CORS fix)
 */

(function () {
    // ==========================================
    // DATA LAYER (Formerly data.js)
    // ==========================================

    // Project Stages
    const STAGES = {
        NEW: 'New',
        QUALIFIED: 'Qualified',
        DOCS_COMPLETED: 'Docs Completed',
        SUBMITTED: 'Submitted',
        DECISION: 'Decision',
        DISBURSED: 'Disbursed'
    };

    // Project Status
    const STATUS = {
        ACTIVE: 'Active',
        ON_HOLD: 'On Hold',
        CLOSED_WON: 'Closed Won',
        CLOSED_LOST: 'Closed Lost'
    };

    // Loan Types
    const LOAN_TYPES = {
        HOME_LOAN: 'Home Loan',
        REFINANCE: 'Refinance',
        CONSTRUCTION: 'Construction',
        INVESTMENT: 'Investment Property',
        COMMERCIAL: 'Commercial'
    };

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

    // Projects
    const projects = [
        {
            id: 'PRJ-2026-001',
            clientName: 'Michael & Jennifer Thompson',
            clientEmail: 'thompson.mj@gmail.com',
            loanType: LOAN_TYPES.HOME_LOAN,
            loanAmount: 485000,
            stage: STAGES.DOCS_COMPLETED,
            status: STATUS.ACTIVE,
            agentId: 'AGT001',
            updatedAt: '2026-01-25T14:20:00Z',
            expectedCommission: 4850,
            documents: {
                stats: { completed: 6, outstanding: 3, percentage: 70 },
                groups: [
                    {
                        title: 'Primary Identification',
                        id: 'grp-1',
                        items: [
                            { id: 'doc-1', name: 'Passport_Thompson_2024.pdf', type: 'pdf', status: 'verified', date: '2024-03-05', size: '2.4 MB' },
                            { id: 'doc-2', name: 'DriversLicense_Thompson.jpg', type: 'image', status: 'pending', date: '2024-03-05', size: '1.1 MB' },
                            { id: 'doc-3', name: 'NationalID_Thompson_Front.jpg', type: 'image', status: 'missing', date: null, size: null }
                        ]
                    },
                    {
                        title: 'Financial Documents',
                        id: 'grp-2',
                        items: [
                            { id: 'doc-4', name: 'BankStatement_Chase_Feb2024.pdf', type: 'pdf', status: 'verified', date: '2024-03-04', size: '0.8 MB' },
                            { id: 'doc-5', name: 'TaxReturn_2023.pdf', type: 'pdf', status: 'rejected', date: '2024-03-01', size: '4.2 MB', note: 'Please upload all pages' },
                            { id: 'doc-6', name: 'PaySlip_Google_Jan.pdf', type: 'pdf', status: 'verified', date: '2024-02-28', size: '0.5 MB' }
                        ]
                    },
                    {
                        title: 'Property Documents',
                        id: 'grp-3',
                        items: [
                            { id: 'doc-7', name: 'SalesContract_Signed.pdf', type: 'pdf', status: 'verified', date: '2024-02-25', size: '5.1 MB' },
                            { id: 'doc-8', name: 'Insurance_Quote.pdf', type: 'pdf', status: 'missing', date: null, size: null }
                        ]
                    }
                ],
                // Fallback for old code
                required: [
                    { name: 'Primary ID', status: 'verified' },
                    { name: 'Financials', status: 'pending' },
                    { name: 'Property', status: 'pending' },
                ]
            }
        },
        {
            id: 'PRJ-2026-002',
            clientName: 'David Chen',
            clientEmail: 'david.chen@outlook.com',
            loanType: LOAN_TYPES.REFINANCE,
            loanAmount: 320000,
            stage: STAGES.SUBMITTED,
            status: STATUS.ACTIVE,
            agentId: 'AGT001',
            updatedAt: '2026-01-24T09:00:00Z',
            expectedCommission: 3200,
            documents: {
                required: [
                    { name: 'ID Verification', status: 'verified' },
                    { name: 'Income Statement', status: 'verified' },
                    { name: 'Bank Statements', status: 'verified' },
                    { name: 'Employment Letter', status: 'verified' },
                    { name: 'Current Mortgage Statement', status: 'verified' }
                ]
            }
        },
        {
            id: 'PRJ-2026-003',
            clientName: 'Amanda Foster',
            clientEmail: 'amanda.foster@gmail.com',
            loanType: LOAN_TYPES.INVESTMENT,
            loanAmount: 550000,
            stage: STAGES.NEW,
            status: STATUS.ACTIVE,
            agentId: 'AGT002',
            updatedAt: '2026-01-24T16:30:00Z',
            expectedCommission: 5500,
            documents: {
                required: [
                    { name: 'ID Verification', status: 'pending' },
                    { name: 'Income Statement', status: 'pending' },
                    { name: 'Bank Statements', status: 'pending' },
                    { name: 'Employment Letter', status: 'pending' },
                    { name: 'Investment Property Contract', status: 'pending' }
                ]
            }
        },
        {
            id: 'PRJ-2026-004',
            clientName: 'Robert & Lisa Martinez',
            clientEmail: 'martinez.family@yahoo.com',
            loanType: LOAN_TYPES.CONSTRUCTION,
            loanAmount: 890000,
            stage: STAGES.DECISION,
            status: STATUS.ACTIVE,
            agentId: 'AGT002',
            updatedAt: '2026-01-23T10:30:00Z',
            expectedCommission: 8900,
            documents: {
                required: [
                    { name: 'ID Verification', status: 'verified' },
                    { name: 'Income Statement', status: 'verified' },
                    { name: 'Bank Statements', status: 'verified' },
                    { name: 'Employment Letter', status: 'verified' },
                    { name: 'Construction Plans', status: 'verified' },
                    { name: 'Builder Contract', status: 'verified' }
                ]
            }
        },
        {
            id: 'PRJ-2025-089',
            clientName: 'Emily Watson',
            clientEmail: 'emily.watson@protonmail.com',
            loanType: LOAN_TYPES.HOME_LOAN,
            loanAmount: 375000,
            stage: STAGES.DISBURSED,
            status: STATUS.CLOSED_WON,
            agentId: 'AGT001',
            updatedAt: '2026-01-15T11:00:00Z',
            expectedCommission: 3750,
            documents: {
                required: [
                    { name: 'ID Verification', status: 'verified' },
                    { name: 'Income Statement', status: 'verified' },
                    { name: 'Bank Statements', status: 'verified' },
                    { name: 'Employment Letter', status: 'verified' },
                    { name: 'Property Contract', status: 'verified' }
                ]
            }
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
        formatCurrency: (amount, showCents = false) => {
            if (amount === null || amount === undefined) return '-';
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: showCents ? 2 : 0,
                maximumFractionDigits: showCents ? 2 : 0
            }).format(amount);
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
                'Active': 'bg-neon-100 text-neon-700 border-neon-200',
                'On Hold': 'bg-amber-100 text-amber-700 border-amber-200',
                'Closed Won': 'bg-neon-100 text-neon-700 border-neon-200',
                'Closed Lost': 'bg-red-100 text-red-700 border-red-200',
                'New': 'bg-blue-100 text-blue-700 border-blue-200',
                'Qualified': 'bg-navy-100 text-navy-700 border-navy-200',
                'Docs Completed': 'bg-purple-100 text-purple-700 border-purple-200',
                'Submitted': 'bg-cyan-100 text-cyan-700 border-cyan-200',
                'Decision': 'bg-orange-100 text-orange-700 border-orange-200',
                'Disbursed': 'bg-neon-100 text-neon-700 border-neon-200'
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
            const allStages = ['New', 'Qualified', 'Docs Completed', 'Submitted', 'Decision', 'Disbursed'];
            const currentIndex = allStages.indexOf(currentStage) === -1 ? 2 : allStages.indexOf(currentStage);

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
            document.getElementById('header').innerHTML = `
                <header class="bg-white border-b border-navy-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div class="flex items-center gap-4">
                        <button onclick="App.toggleMobileMenu()" class="md:hidden text-navy-500 hover:text-navy-700">
                             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <div>
                            <h1 class="text-2xl font-bold text-navy-800 hidden md:block">Dashboard</h1>
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
            const activeProjects = projects.filter(p => p.status === STATUS.ACTIVE).length;
            const closedProjects = projects.filter(p => p.status === STATUS.CLOSED_WON).length;
            const totalCommission = projects.filter(p => p.status === STATUS.CLOSED_WON).reduce((sum, p) => sum + p.expectedCommission, 0);

            // Render KPI Cards
            const cards = [
                { title: 'Total Projects', value: totalProjects, change: '+2 this month', color: 'blue' },
                { title: 'Active Projects', value: activeProjects, change: '80% of pipeline', color: 'neon' },
                { title: 'Closed Won', value: closedProjects, change: '+1 vs last month', color: 'purple' },
                { title: 'Commission', value: utils.formatCurrency(totalCommission), change: 'YTD', color: 'amber' }
            ];

            document.getElementById('kpi-cards').innerHTML = cards.map(card => `
                <div class="card p-6 border border-navy-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                    <p class="text-sm font-medium text-navy-500">${card.title}</p>
                    <p class="text-3xl font-bold text-navy-800 mt-2">${card.value}</p>
                    <p class="text-xs mt-2 text-${card.color}-600">${card.change}</p>
                </div>
            `).join('');

            // Render Active Projects Table
            const activeTable = document.getElementById('projects-table-body');
            if (activeTable) {
                const activeList = projects.filter(p => p.status === STATUS.ACTIVE).slice(0, 5);
                activeTable.innerHTML = activeList.map(p => {
                    const completion = utils.getDocumentCompletion(p.documents.required);
                    return `
                        <tr class="hover:bg-navy-50 transition-colors border-b border-navy-100 last:border-0">
                            <td class="p-4">
                                <a href="#" class="font-medium text-neon-600 hover:text-neon-700 block">${p.id}</a>
                                <span class="text-xs text-navy-500">${p.loanType}</span>
                            </td>
                            <td class="p-4">
                                <div class="font-medium text-navy-700">${p.clientName.split('&')[0]}</div>
                                <div class="text-xs text-navy-400">${utils.formatRelativeTime(p.updatedAt)}</div>
                            </td>
                            <td class="p-4 font-mono text-sm font-semibold text-navy-700">${utils.formatCurrency(p.loanAmount)}</td>
                            <td class="p-4">${utils.getStatusBadge(p.stage)}</td>
                            <td class="p-4 px-6 w-32">${utils.getProgressBar(completion)}</td>
                        </tr>
                    `;
                }).join('');
            }

            // Render Activity Feed
            const feedContainer = document.getElementById('activity-feed');
            if (feedContainer) {
                feedContainer.innerHTML = activityLogs.slice(0, 8).map(log => `
                    <div class="flex gap-3 pb-4 relative">
                        <div class="flex-shrink-0 mt-1">${utils.getActionIcon(log.action)}</div>
                        <div>
                            <p class="text-sm font-medium text-navy-700">${log.action}</p>
                            <p class="text-xs text-navy-500">${log.description}</p>
                            <p class="text-[10px] text-navy-400 mt-1">${utils.formatRelativeTime(log.timestamp)}</p>
                        </div>
                    </div>
                `).join('');
            }

            // Render Stage Breakdown
            const stageContainer = document.getElementById('stage-breakdown');
            if (stageContainer) {
                const stageColors = {
                    'New': 'bg-blue-500',
                    'Qualified': 'bg-navy-500',
                    'Docs Completed': 'bg-purple-500',
                    'Submitted': 'bg-cyan-500',
                    'Decision': 'bg-orange-500',
                    'Disbursed': 'bg-neon-500'
                };

                const stages = Object.values(STAGES);
                const totalActiveCount = projects.filter(p => p.status === STATUS.ACTIVE).length;

                stageContainer.innerHTML = stages.map(stage => {
                    const count = projects.filter(p => p.stage === stage && p.status === STATUS.ACTIVE).length;
                    const percentage = totalActiveCount > 0 ? Math.round((count / totalActiveCount) * 100) : 0;

                    return `
                        <div class="flex items-center gap-3">
                            <div class="w-24 text-xs font-medium text-navy-600 truncate">${stage}</div>
                            <div class="flex-1 h-2 bg-navy-100 rounded-full overflow-hidden">
                                <div class="h-full ${stageColors[stage] || 'bg-navy-400'} rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                            </div>
                            <div class="w-8 text-xs font-medium text-navy-500 text-right">${count}</div>
                        </div>
                    `;
                }).join('');
            }

            // Render Agent Performance
            const agentContainer = document.getElementById('agent-performance');
            if (agentContainer) {
                agentContainer.innerHTML = agents.map(agent => `
                    <div class="flex items-center gap-3 p-3 rounded-xl bg-navy-50 hover:bg-navy-100 transition-colors border border-transparent hover:border-navy-100">
                        <div class="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-700 rounded-xl flex items-center justify-center text-white text-sm font-medium">
                            ${utils.getInitials(agent.name)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-navy-700 truncate">${agent.name}</p>
                            <p class="text-xs text-navy-500">${agent.activeProjects} active • ${agent.closedThisMonth} closed</p>
                        </div>
                        <div class="text-right">
                            <p class="font-mono text-sm font-semibold text-neon-600">${utils.formatCurrency(agent.commissionYTD)}</p>
                            <p class="text-xs text-navy-400">YTD</p>
                        </div>
                    </div>
                `).join('');
            }

            // Render Pending Actions
            const pendingContainer = document.getElementById('pending-actions');
            if (pendingContainer) {
                const pendingActions = [
                    { title: 'Employment Letter needed', project: 'PRJ-2026-001', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>', iconClass: 'text-red-500' },
                    { title: 'Follow up with Chase Bank', project: 'PRJ-2026-004', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>', iconClass: 'text-amber-500' },
                    { title: 'Review new lead documents', project: 'PRJ-2026-003', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>', iconClass: 'text-blue-500' }
                ];

                pendingContainer.innerHTML = pendingActions.map(action => `
                    <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-navy-50 transition-colors cursor-pointer group border border-transparent hover:border-navy-100">
                        <svg class="w-4 h-4 mt-0.5 ${action.iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${action.icon}</svg>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-navy-700 group-hover:text-navy-900 font-medium">${action.title}</p>
                            <p class="font-mono text-[10px] text-neon-600 mt-0.5">${action.project}</p>
                        </div>
                        <svg class="w-4 h-4 text-navy-300 group-hover:text-navy-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
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
                if (stage === 'Qualified') stageColor = 'border-navy-200';
                if (stage === 'Docs Completed') stageColor = 'border-purple-200';
                if (stage === 'Submitted') stageColor = 'border-cyan-200';
                if (stage === 'Decision') stageColor = 'border-orange-200';
                if (stage === 'Disbursed') stageColor = 'border-neon-200';

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
                                            <button class="text-navy-300 hover:text-navy-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                            </button>
                                        </div>
                                        
                                        <h4 class="font-medium text-navy-800 text-sm mb-1 line-clamp-1 pointer-events-none">${p.clientName}</h4>
                                        <div class="flex items-center gap-1.5 mb-3 pointer-events-none">
                                            <span class="text-xs text-navy-500">${p.loanType}</span>
                                            <span class="text-navy-300">•</span>
                                            <span class="text-xs font-mono font-medium text-neon-600">${utils.formatCurrency(p.loanAmount)}</span>
                                        </div>

                                        <div class="flex items-center justify-between pt-3 border-t border-navy-50 pointer-events-none">
                                            <div class="flex items-center gap-2">
                                                <div class="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center text-[10px] font-medium text-navy-600" title="${agent?.name}">
                                                    ${utils.getInitials(agent?.name)}
                                                </div>
                                                <div class="text-[10px] text-navy-400">${utils.formatRelativeTime(p.updatedAt)}</div>
                                            </div>
                                            ${utils.getStatusBadge(p.status)}
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
                return `
                    <!-- Top Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="p-4 bg-white rounded-xl border border-navy-100 shadow-sm">
                            <p class="text-xs text-navy-400 mb-1">Housing status</p>
                            <span class="bg-navy-50 text-navy-700 text-xs px-2 py-1 rounded font-medium">Rent</span>
                        </div>
                        <div class="p-4 bg-white rounded-xl border border-navy-100 shadow-sm">
                            <p class="text-xs text-navy-400 mb-1">Borrowing power</p>
                            <p class="text-sm font-bold text-navy-800">${utils.formatCurrency(project.loanAmount * 2.5)}</p>
                        </div>
                        <div class="p-4 bg-white rounded-xl border border-navy-100 shadow-sm">
                            <p class="text-xs text-navy-400 mb-1">Loan amount</p>
                            <p class="text-sm font-bold text-navy-800">${utils.formatCurrency(project.loanAmount)}</p>
                        </div>
                        <div class="p-4 bg-white rounded-xl border border-navy-100 shadow-sm">
                            <p class="text-xs text-navy-400 mb-1">Annual Income</p>
                            <p class="text-sm font-bold text-navy-800">$185,000</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- AI Eligibility -->
                        <div class="card p-6 bg-[#F0FDF4] border border-neon-100 rounded-xl">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-sm font-semibold text-navy-800">AI Assessed Eligibility</h3>
                                <div class="flex items-end gap-1">
                                    <span class="text-3xl font-bold text-navy-800">${eligibilityScore}</span>
                                    <span class="text-sm text-navy-500 mb-1">/100</span>
                                </div>
                            </div>
                            <div class="w-full h-2 bg-white rounded-full overflow-hidden mb-6 border border-neon-100">
                                <div class="h-full bg-neon-500 rounded-full" style="width: ${eligibilityScore}%"></div>
                            </div>
                            <div class="space-y-4">
                                <div class="flex justify-between text-sm"><span class="text-navy-500">Credit Score</span><span class="font-medium text-navy-800">720</span></div>
                                <div class="flex justify-between text-sm"><span class="text-navy-500">DTI Ratio</span><span class="font-medium text-neon-600">Low Risk</span></div>
                            </div>
                        </div>

                        <!-- Matching Products -->
                        <div class="card p-6 bg-white border border-navy-100 rounded-xl">
                             <h3 class="text-sm font-semibold text-navy-800 mb-4">Matching Products</h3>
                             <div class="space-y-3">
                                ${matchingProducts.slice(0, 3).map(prod => `
                                    <div class="flex items-center justify-between p-3 border border-navy-50 rounded-lg hover:border-navy-200 transition-colors">
                                        <div>
                                            <p class="text-sm font-medium text-navy-800">${prod.name}</p>
                                            <p class="text-xs text-navy-400">${prod.rate}% p.a.</p>
                                        </div>
                                        <button class="text-xs font-medium text-navy-600 bg-navy-50 hover:bg-navy-100 px-3 py-1.5 rounded-lg">Select</button>
                                    </div>
                                `).join('')}
                             </div>
                        </div>
                    </div>
                `;
            };

            const renderDocs = () => {
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
                        <h4 class="text-sm font-bold text-navy-700 mb-4">Quick Summary</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            ${project.documents.groups ? project.documents.groups.map(g => `
                                <div class="p-4 bg-white border border-navy-100 rounded-xl">
                                    <p class="text-xs text-navy-400 uppercase tracking-wider font-bold mb-2">${g.title}</p>
                                    <div class="space-y-2">
                                        ${g.items.map(i => `
                                            <div class="flex items-center justify-between text-sm">
                                                <span class="text-navy-600 truncate mr-2" title="${i.name}">${i.name}</span>
                                                ${i.status === 'verified' ? '<span class="text-neon-600">✓</span>' : '<span class="text-amber-500">●</span>'}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('') : '<p class="text-sm text-navy-500">No document data available.</p>'}
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
                return `
                    <div class="bg-white border border-navy-100 rounded-xl p-6 max-w-2xl mx-auto">
                        <h3 class="text-sm font-semibold text-navy-800 mb-6">Application Tracking</h3>
                        <div class="space-y-0 relative pl-4">
                            ${trackingEvents.map((event, index) => {
                    const isLast = index === trackingEvents.length - 1;
                    let icon = '';
                    let textClass = '';

                    if (event.status === 'completed') {
                        icon = `<div class="w-8 h-8 rounded-full bg-neon-100 text-neon-600 flex items-center justify-center border-4 border-white shadow-sm z-10"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>`;
                        textClass = 'text-navy-800 font-medium';
                    } else if (event.status === 'current') {
                        icon = `<div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border-4 border-white shadow-sm z-10 ring-2 ring-amber-100"><div class="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></div></div>`;
                        textClass = 'text-navy-800 font-bold';
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
                                            <p class="text-sm ${textClass}">${event.stage}</p>
                                            ${event.status === 'completed' ? `<p class="text-xs text-navy-400 mt-1">Completed on Jan 24, 2026</p>` : ''}
                                            ${event.status === 'current' ? `<p class="text-xs text-amber-600 mt-1">In Progress (T${index + 1})</p>` : ''}
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
            document.getElementById('doc-view-ref').nextElementSibling.textContent = project.status; // simplified status
            document.getElementById('back-link').href = `project-detail.html?id=${projectId}`;

            const container = document.getElementById('document-review-container');

            // State
            let selectedKind = 'doc-1'; // Default to first doc if exists

            // Helper to render
            const renderLayout = () => {
                const groups = project.documents.groups || [];
                let selectedDoc = null;

                // Find selected doc logic
                groups.forEach(g => {
                    const found = g.items.find(i => i.id === selectedKind);
                    if (found) selectedDoc = found;
                });
                if (!selectedDoc && groups.length > 0 && groups[0].items.length > 0) {
                    selectedDoc = groups[0].items[0];
                    selectedKind = selectedDoc.id;
                }

                // Render Left Pane
                const leftHtml = `
                    <div class="w-1/3 min-w-[320px] bg-white border border-navy-200 rounded-xl flex flex-col overflow-hidden">
                        <!-- Progress -->
                        <div class="p-6 border-b border-navy-100">
                            <div class="flex justify-between items-end mb-2">
                                <span class="text-2xl font-bold text-navy-800">${project.documents.stats.percentage}% <span class="text-sm font-normal text-navy-500">Complete</span></span>
                                <span class="text-xs text-navy-500">${project.documents.stats.outstanding} Outstanding | ${project.documents.stats.completed} Verified</span>
                            </div>
                            <div class="w-full h-2 bg-navy-100 rounded-full overflow-hidden">
                                <div class="h-full bg-navy-800 rounded-full" style="width: ${project.documents.stats.percentage}%"></div>
                            </div>
                            
                            <div class="flex gap-4 mt-6">
                                <button class="text-sm font-medium text-navy-800 border-b-2 border-navy-800 pb-2 -mb-px">Document Checklist</button>
                                <button class="text-sm font-medium text-navy-400 pb-2 hover:text-navy-600 transition-colors">Unlinked documents</button>
                            </div>
                        </div>

                        <!-- Scrollable List -->
                        <div class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                            ${groups.map(group => `
                                <div>
                                    <h4 class="text-sm font-semibold text-navy-700 mb-3 ml-1">${group.title}</h4>
                                    <div class="space-y-2">
                                        ${group.items.map(item => {
                    const isSelected = item.id === selectedKind;
                    let statusBadge = '';
                    if (item.status === 'verified') statusBadge = '<span class="text-[10px] text-neon-600 font-medium bg-neon-50 px-2 py-0.5 rounded">Verified</span>';
                    else if (item.status === 'pending') statusBadge = '<span class="text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">Pending</span>';
                    else statusBadge = '<span class="text-[10px] text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">Missing</span>';

                    return `
                                                <div onclick="window.updateSelection('${item.id}')" 
                                                     class="cursor-pointer p-3 rounded-lg border transition-all ${isSelected ? 'bg-navy-50 border-navy-300 ring-1 ring-navy-200 shadow-sm' : 'bg-white border-transparent hover:bg-navy-50 hover:border-navy-200'}">
                                                    <div class="flex justify-between items-start">
                                                        <div class="flex items-start gap-3">
                                                            <div class="w-8 h-8 rounded bg-white border border-navy-200 flex items-center justify-center text-xs text-red-500 font-medium shadow-sm">PDF</div>
                                                            <div>
                                                                <p class="text-sm font-medium text-navy-700 line-clamp-1 break-all">${item.name}</p>
                                                                <p class="text-[10px] text-navy-400 mt-0.5">Uploaded ${item.date || '-'}</p>
                                                            </div>
                                                        </div>
                                                        ${item.status === 'verified' ? '<svg class="w-4 h-4 text-neon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : ''}
                                                    </div>
                                                    <div class="mt-3 flex justify-between items-center">
                                                        ${statusBadge}
                                                        ${item.status === 'pending' ? `<button class="text-xs bg-navy-800 text-white px-2 py-1 rounded hover:bg-navy-700 transition-colors">Verify</button>` : ''}
                                                        ${item.status === 'missing' ? `<button class="text-xs text-navy-500 hover:text-navy-700 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Request</button>` : ''}
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
                const rightHtml = selectedDoc ? `
                    <div class="flex-1 bg-white border border-navy-200 rounded-xl flex flex-col overflow-hidden">
                        <!-- Toolbar -->
                        <div class="p-4 border-b border-navy-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 class="text-sm font-bold text-navy-800">${selectedDoc.name}</h3>
                                <p class="text-xs text-navy-500">Status: <span class="font-medium ${selectedDoc.status === 'verified' ? 'text-neon-600' : 'text-amber-600'} capitalize">${selectedDoc.status}</span> | Uploaded: ${selectedDoc.date}</p>
                            </div>
                            <div class="flex gap-2">
                                ${selectedDoc.status === 'pending' ? `
                                    <button class="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100">Reject</button>
                                    <button class="px-3 py-1.5 bg-neon-600 text-white text-xs font-medium rounded-lg hover:bg-neon-700 shadow-sm border border-neon-700">Verify Document</button>
                                ` : ''}
                                <button class="p-1.5 text-navy-400 hover:text-navy-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                            </div>
                        </div>

                        <!-- Viewer -->
                        <div class="flex-1 bg-navy-100 relative flex items-center justify-center p-8 overflow-hidden group">
                            <!-- Placeholder for PDF Viewer -->
                            <div class="bg-white shadow-lg w-full max-w-2xl h-full border border-navy-200 flex flex-col">
                                <div class="p-8 flex-1">
                                    <div class="w-20 h-20 bg-navy-50 rounded-lg mx-auto mb-4 flex items-center justify-center text-navy-300">
                                        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <p class="text-center text-navy-400 text-sm font-medium">Document Preview</p>
                                    <p class="text-center text-navy-300 text-xs mt-1 font-mono">${selectedDoc.name}</p>
                                    
                                    <!-- Fake Text Lines -->
                                    <div class="space-y-3 mt-12 px-12 opacity-50">
                                        <div class="h-4 bg-navy-100 rounded w-3/4"></div>
                                        <div class="h-4 bg-navy-100 rounded w-full"></div>
                                        <div class="h-4 bg-navy-100 rounded w-5/6"></div>
                                        <div class="h-4 bg-navy-100 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Floating Controls -->
                            <div class="absolute bottom-6 left-1/2 -trannavy-x-1/2 bg-white/90 backdrop-blur border border-navy-200 shadow-lg rounded-full px-4 py-2 flex gap-4 text-navy-600">
                                <button class="hover:text-neon-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg> Zoom In</button>
                                <div class="w-px bg-navy-200"></div>
                                <button class="hover:text-neon-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path></svg> Zoom Out</button>
                                <div class="w-px bg-navy-200"></div>
                                <button class="hover:text-neon-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Rotate</button>
                            </div>
                        </div>

                        <!-- Comments -->
                        <div class="h-48 border-t border-navy-200 bg-white p-4 overflow-y-auto">
                            <h4 class="text-xs font-bold text-navy-500 uppercase tracking-wider mb-3">Comments</h4>
                            <div class="flex gap-3 mb-4">
                                <div class="w-6 h-6 rounded-full bg-navy-200 flex items-center justify-center text-[10px] text-navy-500 font-medium">JS</div>
                                <div>
                                    <p class="text-sm text-navy-700"><span class="font-bold">Jimmy Smith</span> <span class="text-navy-400 text-xs font-normal ml-1">Today 09:30</span></p>
                                    <p class="text-sm text-navy-600 mt-0.5">Please provide a clearer copy of the document.</p>
                                </div>
                            </div>
                            <!-- Input -->
                            <div class="relative">
                                <input type="text" placeholder="Add comments here" class="w-full bg-navy-50 border border-navy-200 rounded-lg pl-4 pr-12 py-2 text-sm focus:outline-none focus:border-navy-300">
                                <button class="absolute right-2 top-1.5 text-xs bg-white border border-navy-200 px-2 py-0.5 rounded text-navy-600 font-medium shadow-sm hover:text-navy-800">Add</button>
                            </div>
                        </div>
                    </div>
                ` : `<div class="flex-1 items-center justify-center flex text-navy-400">Select a document</div>`;

                container.innerHTML = leftHtml + rightHtml;
            };

            // Expose update function globally for inline onclick
            window.updateSelection = (id) => {
                selectedKind = id;
                renderLayout();
            };

            renderLayout();
        },

        initDragAndDrop: function () {
            const cards = document.querySelectorAll('.draggable-card');
            const dropZones = document.querySelectorAll('.drop-zone');

            let draggedCard = null;

            cards.forEach(card => {
                card.addEventListener('dragstart', (e) => {
                    draggedCard = card;
                    e.dataTransfer.effectAllowed = 'move';
                    // Make it semi-transparent
                    setTimeout(() => card.classList.add('opacity-50', 'rotate-3'), 0);
                });

                card.addEventListener('dragend', () => {
                    draggedCard = null;
                    card.classList.remove('opacity-50', 'rotate-3');
                });
            });

            dropZones.forEach(zone => {
                zone.addEventListener('dragover', (e) => {
                    e.preventDefault(); // Necessary to allow dropping
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
                        // Move card to new zone
                        zone.appendChild(draggedCard);

                        // Update Data Model
                        const projectId = draggedCard.dataset.id;
                        const newStage = zone.dataset.stage;

                        // Find project and update
                        const project = projects.find(p => p.id === projectId);
                        if (project) {
                            project.stage = newStage;
                            // Re-render to update counts, but wrapped in timeout to avoid dragend conflict
                            setTimeout(() => {
                                // Simple re-render only for prototype purposes
                                // In production, we'd act on the state manager
                                this.renderKanbanBoard();
                            }, 50);
                        }
                    }
                });
            });
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

            // Simple static form
            container.innerHTML = `
                <div class="max-w-2xl mx-auto space-y-8">
                    <!-- Profile Section -->
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
                    </div>

                    <!-- App Preferences -->
                    <div class="bg-white border border-navy-200 rounded-xl p-8">
                        <h2 class="text-lg font-bold text-navy-800 mb-6">Application Preferences</h2>
                        <div class="space-y-4">
                            <label class="flex items-center justify-between p-4 border border-navy-100 rounded-lg cursor-pointer hover:bg-navy-50">
                                <div>
                                    <span class="block text-sm font-medium text-navy-800">Email Notifications</span>
                                    <span class="block text-xs text-navy-500">Receive daily summaries</span>
                                </div>
                                <input type="checkbox" checked class="w-5 h-5 text-neon-600 rounded">
                            </label>
                            <label class="flex items-center justify-between p-4 border border-navy-100 rounded-lg cursor-pointer hover:bg-navy-50">
                                <div>
                                    <span class="block text-sm font-medium text-navy-800">Dark Mode</span>
                                    <span class="block text-xs text-navy-500">Enable dark theme (Coming Soon)</span>
                                </div>
                                <input type="checkbox" disabled class="w-5 h-5 text-navy-300 rounded">
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-3">
                        <button class="px-6 py-2 bg-white border border-navy-200 rounded-lg text-navy-600 font-medium hover:bg-navy-50">Cancel</button>
                        <button onclick="App.showToast('Settings saved successfully')" class="px-6 py-2 bg-neon-500 text-white rounded-lg font-medium hover:bg-neon-600 shadow-sm">Save Changes</button>
                    </div>
                </div>
            `;
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

