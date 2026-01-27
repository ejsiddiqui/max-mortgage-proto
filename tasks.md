# Max Mortgage - Production Implementation Tasks

## Phase 1: Project Setup & Infrastructure
- [ ] Initialize React project using React Starter Kit
- [ ] Set up Convex backend (`npx convex dev`)
- [ ] Configure Clerk authentication
  - [ ] Create Clerk application
  - [ ] Set up JWT template for Convex
  - [ ] Configure environment variables
- [ ] Install core dependencies
  - [ ] ShadCN UI base components
  - [ ] Lucide React icons
  - [ ] TanStack React Table
  - [ ] @hello-pangea/dnd (drag-drop)
  - [ ] Sonner (toast notifications)
- [ ] Configure Tailwind theme (match prototype colors)
- [ ] Set up project file structure

## Phase 2: Database Schema & Core Backend
- [ ] Define complete Convex schema (`convex/schema.ts`)
  - [ ] Projects table with indexes
  - [ ] Banks table
  - [ ] Referral Companies table
  - [ ] Users table
  - [ ] Templates table
  - [ ] Documents table
  - [ ] Audit Events table
  - [ ] Project Facts table
- [ ] Set up Clerk webhook handler (`convex/http.ts`)
- [ ] Create user sync mutations (`convex/users.ts`)
- [ ] Test schema deployment and user sync

## Phase 3: Authentication & RBAC
- [ ] Implement Clerk integration in React app
- [ ] Create protected route layouts
  - [ ] Agent layout
  - [ ] Admin layout
- [ ] Implement RBAC helper functions
- [ ] Create user role middleware for Convex queries/mutations
- [ ] Test authentication flow
- [ ] Test role-based access restrictions

## Phase 4: Master Data Management (Admin)
- [ ] Banks Management
  - [ ] Create banks CRUD mutations
  - [ ] Build banks admin page
  - [ ] Add/Edit/Delete bank forms
- [ ] Referral Companies Management
  - [ ] Create referral companies CRUD mutations
  - [ ] Build referral companies admin page
  - [ ] Add/Edit/Delete referral company forms
- [ ] Agents Management
  - [ ] Create agents list query
  - [ ] Build agents admin page
  - [ ] Agent activation/deactivation
  - [ ] Commission rate configuration

## Phase 5: Project Management Core
- [ ] Project Creation
  - [ ] Create project mutation with business rules
    - [ ] Enforce One-Bank Rule
    - [ ] Auto-generate project code
    - [ ] Set initial timestamps
  - [ ] Build project creation form
  - [ ] Implement template selection
  - [ ] Test project creation flow
- [ ] Project Queries
  - [ ] `getMyProjects` (Agent - scoped to user)
  - [ ] `getAllProjects` (Admin - global access)
  - [ ] `getProject` (with RBAC check)
  - [ ] `getProjectsByStage`
  - [ ] `getProjectsByStatus`
- [ ] Project Updates
  - [ ] Stage change mutation (with Stage/Status Lock)
  - [ ] Status change mutation (with On-Hold tracking)
  - [ ] Loan amount update (with audit log)
  - [ ] Outcome selection (for Closed status)

## Phase 6: Dashboard & Analytics
- [ ] KPI Calculations
  - [ ] Active projects count
  - [ ] Total loan amount in pipeline
  - [ ] Commission summary
  - [ ] Success rate calculation
- [ ] Dashboard Components
  - [ ] KPI cards with gradients
  - [ ] Active projects table
  - [ ] Recent activity feed
  - [ ] Pipeline by stage breakdown
  - [ ] Agent performance widget
  - [ ] Pending actions list
- [ ] Dashboard page assembly
- [ ] Test dashboard with mock data
- [ ] Test dashboard with real Convex data

## Phase 7: Projects List & Kanban Views
- [ ] Projects List View
  - [ ] Build data table with TanStack React Table
  - [ ] Implement sorting
  - [ ] Implement filtering
  - [ ] Add search functionality
  - [ ] Status/Stage badge components
  - [ ] Row click navigation to detail
- [ ] Kanban Board View
  - [ ] Build kanban columns for each stage
  - [ ] Implement drag-drop with @hello-pangea/dnd
  - [ ] Project card component
  - [ ] Stage change on drop (with validation)
  - [ ] Optimistic updates
  - [ ] Test drag-drop flow

## Phase 8: Project Detail Page
- [ ] Project Header Component
  - [ ] Project code, client name, business type
  - [ ] Status/Stage badges
  - [ ] Action buttons (Pre-approve, Decline, etc.)
- [ ] Milestone Timeline Component
  - [ ] T1-T4 milestone display
  - [ ] Duration calculations
  - [ ] On-Hold duration tracking
  - [ ] Visual timeline
- [ ] Project Information Tabs
  - [ ] Client details tab
  - [ ] Financial details tab
  - [ ] Bank information tab
  - [ ] Referral information tab
- [ ] Dynamic form fields (from template)
- [ ] Edit functionality (with RBAC)
- [ ] Test detail page navigation

## Phase 9: Document Management
- [ ] Document Upload
  - [ ] Generate upload URL mutation
  - [ ] File upload component
  - [ ] Save document metadata mutation
  - [ ] Progress indicator
  - [ ] File type validation
  - [ ] File size limits
- [ ] Document List
  - [ ] Query documents by project (with RBAC)
  - [ ] Required docs vs Other docs separation
  - [ ] Document status badges
  - [ ] Download functionality
- [ ] Document Verification (Admin)
  - [ ] Verify document mutation
  - [ ] Reject document mutation
  - [ ] Verification UI
  - [ ] Rejection reason input
- [ ] Test document flow end-to-end

## Phase 10: Financial & Commission Management
- [ ] Commission Calculation Logic
  - [ ] Calculate expected commission
  - [ ] Calculate agent/referral splits
  - [ ] Update project facts table
- [ ] Commission Display (Agent)
  - [ ] View own commission summary
  - [ ] Filter by closed projects only
- [ ] Commission Management (Admin)
  - [ ] Update final commission mutation
  - [ ] Recalculate splits on update
  - [ ] Commission edit UI
  - [ ] Audit log for commission changes
- [ ] Financial Reports
  - [ ] Total commissions by agent
  - [ ] Total commissions by referral company
  - [ ] Commission trends

## Phase 11: Audit Trail & History
- [ ] Audit Event Logging
  - [ ] Ensure all critical mutations log events
  - [ ] Test audit events are append-only
- [ ] Audit Log Viewer (Admin)
  - [ ] Query audit events by project
  - [ ] Timeline display component
  - [ ] Filter by action type
  - [ ] User information display
  - [ ] Before/After value display
- [ ] Project History Tab
  - [ ] Integrate audit timeline
  - [ ] Test audit log display

## Phase 12: Template System
- [ ] Template Schema Implementation
  - [ ] Define template structure
  - [ ] Version management
- [ ] Template CRUD (Admin)
  - [ ] Create template mutation
  - [ ] Update template mutation
  - [ ] Template builder UI
  - [ ] Screen/Field configuration
  - [ ] Required docs configuration
- [ ] Template Application
  - [ ] Apply template to project
  - [ ] Render dynamic fields
  - [ ] Validate required fields
- [ ] Template versioning
  - [ ] Lock projects to template version
  - [ ] Test backward compatibility

## Phase 13: Business Rules Enforcement
- [ ] Verify One-Bank Rule enforcement
- [ ] Verify Stage/Status Lock enforcement
- [ ] Verify Chronological Milestones validation
- [ ] Verify Backdating permissions (Admin only)
- [ ] Verify On-Hold clock tracking
- [ ] Verify Commission edit permissions (Admin only)
- [ ] Test all business rules with edge cases

## Phase 14: Error Handling & UX Polish
- [ ] Loading States
  - [ ] Skeleton components for all queries
  - [ ] Loading spinners for mutations
- [ ] Error Handling
  - [ ] Toast notifications for all mutations
  - [ ] Error boundaries
  - [ ] Graceful error messages
- [ ] Optimistic Updates
  - [ ] Kanban drag-drop
  - [ ] Quick status changes
- [ ] Responsive Design
  - [ ] Test mobile layout
  - [ ] Test tablet layout
  - [ ] Test desktop layout
- [ ] Accessibility
  - [ ] Keyboard navigation
  - [ ] ARIA labels
  - [ ] Focus management

## Phase 15: Testing
- [ ] Unit Tests (Vitest)
  - [ ] Commission calculation logic
  - [ ] Date/time utilities
  - [ ] Business rule validators
  - [ ] Badge color logic
- [ ] Integration Tests (agent-browser)
  - [ ] Authentication flow
  - [ ] Project CRUD flow
  - [ ] Document upload/verify flow
  - [ ] RBAC restrictions
  - [ ] Kanban drag-drop
  - [ ] Commission calculations
- [ ] Test Coverage
  - [ ] Aim for >80% coverage on critical paths
  - [ ] Test all business rules
  - [ ] Test all RBAC scenarios

## Phase 16: Deployment & Production Setup
- [ ] Environment Configuration
  - [ ] Set Convex production environment variables
  - [ ] Configure Clerk production settings
  - [ ] Set up webhook endpoints
- [ ] Deployment
  - [ ] Deploy Convex to production (`npx convex deploy --prod`)
  - [ ] Deploy React app to hosting (Vercel/Netlify)
  - [ ] Verify webhook connectivity
- [ ] Production Verification
  - [ ] Test authentication in production
  - [ ] Test file uploads in production
  - [ ] Test webhook delivery
  - [ ] Monitor Convex dashboard for errors
- [ ] Performance Optimization
  - [ ] Review and optimize slow queries
  - [ ] Add additional indexes if needed
  - [ ] Optimize bundle size
- [ ] Documentation
  - [ ] Deployment runbook
  - [ ] Admin user guide
  - [ ] Agent user guide
  - [ ] Troubleshooting guide

## Phase 17: Post-Launch
- [ ] User Training
  - [ ] Admin training session
  - [ ] Agent training session
- [ ] Monitoring Setup
  - [ ] Set up error tracking
  - [ ] Set up performance monitoring
  - [ ] Set up usage analytics
- [ ] Feedback Collection
  - [ ] Gather user feedback
  - [ ] Prioritize improvements
- [ ] Iteration Planning
  - [ ] Plan Phase 2 features
  - [ ] Address technical debt

---

## Notes
- Each phase builds on the previous one
- Test thoroughly before moving to next phase
- Refer to `/docs/agents/` for detailed implementation guidance
- Follow the migration protocol in `agents.md`
- Ensure all PRD requirements are met
