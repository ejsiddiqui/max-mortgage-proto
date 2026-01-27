/**
 * Max Mortgage Prototype - Utility Functions
 * Formatters and helpers for the UI
 */

/**
 * Format currency with $ symbol and commas
 * @param {number} amount - The amount to format
 * @param {boolean} showCents - Whether to show cents (default: false)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showCents = false) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: showCents ? 2 : 0,
        maximumFractionDigits: showCents ? 2 : 0
    }).format(amount);
};

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @param {string} format - 'short', 'long', or 'datetime'
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, format = 'short') => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    switch (format) {
        case 'long':
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        case 'datetime':
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        case 'short':
        default:
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
    }
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateString) => {
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

    return formatDate(dateString, 'short');
};

/**
 * Format percentage
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(decimals)}%`;
};

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
    if (!name) return '??';
    return name
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

/**
 * Generate status badge HTML
 * @param {string} status - Status value
 * @param {string} type - 'project' or 'document'
 * @returns {string} HTML string for badge
 */
export const getStatusBadge = (status, type = 'project') => {
    const badges = {
        // Project statuses
        'Active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'On Hold': 'bg-amber-100 text-amber-700 border-amber-200',
        'Closed Won': 'bg-teal-100 text-teal-700 border-teal-200',
        'Closed Lost': 'bg-red-100 text-red-700 border-red-200',

        // Stage statuses
        'New': 'bg-blue-100 text-blue-700 border-blue-200',
        'Qualified': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'Docs Completed': 'bg-purple-100 text-purple-700 border-purple-200',
        'Submitted': 'bg-cyan-100 text-cyan-700 border-cyan-200',
        'Decision': 'bg-orange-100 text-orange-700 border-orange-200',
        'Disbursed': 'bg-emerald-100 text-emerald-700 border-emerald-200',

        // Document statuses
        'verified': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'pending': 'bg-amber-100 text-amber-700 border-amber-200',
        'rejected': 'bg-red-100 text-red-700 border-red-200'
    };

    const badgeClass = badges[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}">${displayStatus}</span>`;
};

/**
 * Generate stage badge with icon
 * @param {string} stage - Stage value
 * @returns {string} HTML string for stage badge
 */
export const getStageBadge = (stage) => {
    const stageIcons = {
        'New': `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>`,
        'Qualified': `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        'Docs Completed': `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
        'Submitted': `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>`,
        'Decision': `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        'Disbursed': `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    };

    const icon = stageIcons[stage] || '';
    return `${getStatusBadge(stage)}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Get action icon based on action type
 * @param {string} action - Action type
 * @returns {string} SVG icon HTML
 */
export const getActionIcon = (action) => {
    const icons = {
        'Document Uploaded': `<svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>`,
        'Stage Changed': `<svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>`,
        'Project Created': `<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>`,
        'Document Verified': `<svg class="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        'Commission Received': `<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        'Note Added': `<svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`,
        'Lender Decision': `<svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`
    };

    return icons[action] || `<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
};

/**
 * Calculate document completion percentage
 * @param {Array} documents - Array of required documents
 * @returns {number} Completion percentage
 */
export const getDocumentCompletion = (documents) => {
    if (!documents || documents.length === 0) return 0;
    const verified = documents.filter(d => d.status === 'verified').length;
    return Math.round((verified / documents.length) * 100);
};

/**
 * Generate progress bar HTML
 * @param {number} percentage - Completion percentage
 * @returns {string} HTML string for progress bar
 */
export const getProgressBar = (percentage) => {
    let colorClass = 'bg-red-500';
    if (percentage >= 70) colorClass = 'bg-emerald-500';
    else if (percentage >= 40) colorClass = 'bg-amber-500';

    return `
        <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full ${colorClass} rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
            </div>
            <span class="text-xs font-medium text-slate-600">${percentage}%</span>
        </div>
    `;
};
