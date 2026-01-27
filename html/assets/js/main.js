/**
 * Max Mortgage Prototype - Main JavaScript
 * Component injection and navigation handling
 */

import { agents, getAgentById } from './data.js';
import { getInitials } from './utils.js';

// Current user (mock - using first agent)
const currentUser = agents[0];

/**
 * Get current page from URL
 * @returns {string} Current page name
 */
const getCurrentPage = () => {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'dashboard';
    return page;
};

/**
 * Navigation items configuration
 */
const navItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: 'dashboard.html',
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>`
    },
    {
        id: 'projects-list',
        label: 'Projects',
        href: 'projects-list.html',
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>`,
        subItems: [
            { id: 'projects-list', label: 'List View', href: 'projects-list.html' },
            { id: 'projects-kanban', label: 'Kanban Board', href: 'projects-kanban.html' }
        ]
    },
    {
        id: 'agents',
        label: 'Agents',
        href: 'agents.html',
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`
    },
    {
        id: 'settings',
        label: 'Settings',
        href: 'settings.html',
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
    }
];

/**
 * Render sidebar navigation HTML
 * @returns {string} Sidebar HTML
 */
const renderSidebar = () => {
    const currentPage = getCurrentPage();

    const navItemsHtml = navItems.map(item => {
        const isActive = currentPage === item.id ||
            (item.subItems && item.subItems.some(sub => sub.id === currentPage));
        const hasSubItems = item.subItems && item.subItems.length > 0;

        // Check if any sub-item is active
        const activeSubItem = item.subItems?.find(sub => sub.id === currentPage);

        let subItemsHtml = '';
        if (hasSubItems) {
            subItemsHtml = `
                <div class="ml-9 mt-1 space-y-1 ${isActive ? '' : 'hidden'}" id="sub-${item.id}">
                    ${item.subItems.map(sub => `
                        <a href="${sub.href}" 
                           class="block py-2 px-3 text-sm rounded-lg transition-all duration-200 ${currentPage === sub.id
                    ? 'text-teal-400 bg-slate-700/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                }">
                            ${sub.label}
                        </a>
                    `).join('')}
                </div>
            `;
        }

        return `
            <li>
                <a href="${item.href}" 
                   class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-400 -ml-px'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
            }">
                    <span class="${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}">${item.icon}</span>
                    <span class="font-medium">${item.label}</span>
                    ${hasSubItems ? `
                        <svg class="w-4 h-4 ml-auto transform transition-transform ${isActive ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    ` : ''}
                </a>
                ${subItemsHtml}
            </li>
        `;
    }).join('');

    return `
        <aside class="fixed left-0 top-0 bottom-0 w-64 bg-slate-800 border-r border-slate-700 flex flex-col z-40">
            <!-- Logo -->
            <div class="p-6 border-b border-slate-700">
                <a href="dashboard.html" class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-lg font-bold text-white tracking-tight">Max Mortgage</h1>
                        <p class="text-xs text-slate-500">Lead Management</p>
                    </div>
                </a>
            </div>
            
            <!-- Navigation -->
            <nav class="flex-1 p-4 overflow-y-auto">
                <ul class="space-y-1">
                    ${navItemsHtml}
                </ul>
            </nav>
            
            <!-- User Profile -->
            <div class="p-4 border-t border-slate-700">
                <div class="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-700/50">
                    <div class="w-9 h-9 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                        ${getInitials(currentUser.name)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-slate-200 truncate">${currentUser.name}</p>
                        <p class="text-xs text-slate-500 truncate">${currentUser.role}</p>
                    </div>
                    <a href="index.html" class="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-600 transition-colors" title="Sign Out">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </aside>
    `;
};

/**
 * Render header HTML
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle
 * @returns {string} Header HTML
 */
const renderHeader = (title = 'Dashboard', subtitle = '') => {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
        <header class="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
            <div>
                <h1 class="text-2xl font-bold text-slate-800">${title}</h1>
                <p class="text-sm text-slate-500 mt-0.5">${subtitle || today}</p>
            </div>
            
            <div class="flex items-center gap-4">
                <!-- Search -->
                <div class="relative">
                    <input type="text" 
                           placeholder="Search projects..." 
                           class="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                    <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                
                <!-- Notifications -->
                <button class="relative p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <!-- Quick Add -->
                <button id="btn-quick-add" class="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    New Project
                </button>
            </div>
        </header>
    `;
};

/**
 * Initialize the layout by injecting sidebar and header
 * @param {Object} options - Layout options
 * @param {string} options.title - Page title
 * @param {string} options.subtitle - Page subtitle
 */
export const initLayout = (options = {}) => {
    const { title = 'Dashboard', subtitle = '' } = options;

    // Inject sidebar
    const sidebarContainer = document.getElementById('sidebar');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = renderSidebar();
    }

    // Inject header
    const headerContainer = document.getElementById('header');
    if (headerContainer) {
        headerContainer.innerHTML = renderHeader(title, subtitle);
    }

    // Add event listeners
    setupEventListeners();
};

/**
 * Setup global event listeners
 */
const setupEventListeners = () => {
    // Quick Add button
    const btnQuickAdd = document.getElementById('btn-quick-add');
    if (btnQuickAdd) {
        btnQuickAdd.addEventListener('click', () => {
            // TODO: Open new project modal
            alert('New Project modal coming in Phase 3!');
        });
    }

    // Toggle sub-navigation items
    document.querySelectorAll('[data-toggle-sub]').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = toggle.dataset.toggleSub;
            const subNav = document.getElementById(targetId);
            if (subNav) {
                subNav.classList.toggle('hidden');
            }
        });
    });
};

/**
 * Create a toast notification
 * @param {string} message - Toast message
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
export const showToast = (message, type = 'info') => {
    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-teal-500'
    };

    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-6 py-3 ${colors[type]} text-white rounded-xl shadow-lg transform translate-y-full opacity-0 transition-all duration-300 z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
    });

    // Animate out after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};
