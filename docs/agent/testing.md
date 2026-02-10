# Testing Strategy

## Mockup Validation Checklist

1. All 7 pages load and navigate correctly
2. Role toggle changes sidebar navigation and data visibility
3. Kanban drag moves cards forward, blocks backward drag
4. Document sections conditionally hide for Salaried borrowers
5. Commission tab shows/hides based on stage and role
6. Filters and search work on all list views
7. Modals open/close without errors

## Production Testing (v1 Scope)

- Vitest for unit tests (utils, calculations, validation, commission formulas)
- Playwright for e2e tests (critical flows: login, create project, drag card, upload doc, verify doc, create commission)
- Test RBAC: Agent sees only assigned projects, Viewer can't edit, Admin has full access
- Test conditional document visibility: Salaried borrowers hide Section B + D2
- Full test coverage is v2 — setup only for v1

## UI Testing with agent-browser

**agent-browser CLI** — Fast browser automation for testing the HTML mockup and production app.

**Setup:**

```bash
# Check if agent-browser is installed, install if not found
command -v agent-browser >/dev/null 2>&1 || npm install -g agent-browser

# Install browser binaries (only if not already installed)
# Run 'agent-browser install' first time, or skip if browsers already present
agent-browser --version && echo "agent-browser ready" || agent-browser install

# Start local server for mockup testing
cd html && npx serve . &
# Server typically runs at http://localhost:3000
```

**Core Testing Workflow:**

1. **Navigation & Snapshot:**

```bash
# Open mockup and get interactive elements
agent-browser open http://localhost:3000
agent-browser snapshot -i              # Interactive elements with refs
agent-browser screenshot mockup.png    # Visual verification
```

2. **Login Flow:**

```bash
# Fill login form and submit
agent-browser fill "#email" "admin@maxmortgage.com"
agent-browser fill "#password" "admin123"
agent-browser click "button[type='submit']"
agent-browser wait 1000
agent-browser get url                  # Verify redirect to dashboard
```

3. **Role Toggle Testing:**

```bash
# Test role switching in mockup
agent-browser click "#role-toggle"     # Open role selector
agent-browser click "[data-role='agent']"
agent-browser get text ".role-badge"   # Should show "Agent"
agent-browser snapshot -i              # Verify UI updates
```

4. **Kanban Drag & Drop:**

```bash
# Test forward-only drag rules
agent-browser drag "[data-project='MM-0001']" "[data-stage='wip']"
agent-browser wait ".toast-success"    # Wait for success toast
agent-browser get text "[data-project='MM-0001'] .stage-indicator"
```

5. **Form Interactions:**

```bash
# New Project modal
agent-browser click "button:has-text('New Project')"
agent-browser wait "#new-project-modal"
agent-browser fill "@clientName" "John Doe"  # Using ref from snapshot
agent-browser select "@borrowerType" "salaried"
agent-browser select "@bank" "Emirates NBD"
agent-browser fill "@loanAmount" "2500000"
agent-browser click "button:has-text('Create Project')"
```

6. **Document Upload Simulation:**

```bash
# Click upload button and verify status change
agent-browser click "[data-doc='A1'] .upload-btn"
agent-browser wait ".file-input"
agent-browser click "[data-doc='A1'] .mark-uploaded"  # Mockup simulation
agent-browser get text "[data-doc='A1'] .status"      # Should be "Uploaded"
```

7. **Filter & Search:**

```bash
# Test Kanban filters
agent-browser select "#filter-agent" "Sarah Agent"
agent-browser fill "#search-projects" "MM-0001"
agent-browser wait 500
agent-browser get count ".kanban-card"   # Count visible cards
```

8. **Assertions with `is` command:**

```bash
# Verify element states
agent-browser is visible ".commission-tab"      # Should be hidden pre-disbursement
agent-browser is enabled "button.new-project"   # Should be disabled for Viewer
agent-browser is checked "#filter-active"       # Filter checkbox state
```

9. **Get Element Data:**

```bash
# Extract text/attributes for validation
agent-browser get text ".project-code"
agent-browser get attr ".kanban-card" "data-stage"
agent-browser get value "#loan-amount"
agent-browser get html ".document-section"
```

10. **Network & Console Debugging:**

```bash
# Monitor console for errors
agent-browser console                  # View console logs
agent-browser errors                   # View JavaScript errors
agent-browser network requests         # View network activity
```

**Common Test Scenarios:**

#### Test: Commission Tab Visibility (Stage-based)

```bash
# Pre-disbursement: tab should be hidden
agent-browser open http://localhost:3000/project-detail.html
agent-browser is visible "#tab-commission"  # Should return false
# Move to Disbursed stage
agent-browser drag "[data-project='MM-0001']" "[data-stage='disbursed']"
agent-browser click ".kanban-card[data-project='MM-0001']"
agent-browser is visible "#tab-commission"  # Should return true
```

#### Test: Salaried vs Self-Employed Document Visibility

```bash
# Salaried: Section B should be hidden
agent-browser select "#borrowerType" "salaried"
agent-browser wait 500
agent-browser is visible "[data-section='B']"  # Should return false
# Self-Employed: Section B should be visible
agent-browser select "#borrowerType" "self_employed"
agent-browser wait 500
agent-browser is visible "[data-section='B']"  # Should return true
```

#### Test: Forward-Only Kanban Drag

```bash
# Try backward drag (should fail)
agent-browser drag "[data-stage='submitted']" "[data-stage='wip']"
agent-browser wait ".toast-error"              # Should show error
agent-browser get text "[data-project='MM-0002']" "data-stage"  # Stage unchanged
# Forward drag (should succeed)
agent-browser drag "[data-stage='wip']" "[data-stage='docs_completed']"
agent-browser wait ".toast-success"
```

#### Test: RBAC - Agent sees only assigned projects

```bash
# Switch to Agent role
agent-browser click "[data-role='agent']"
agent-browser wait 500
agent-browser get count ".kanban-card"         # Count visible cards
agent-browser get text ".kanban-card:first .agent-name"  # Should match logged-in agent
```

**Useful Commands:**

```bash
# Multiple actions in sequence
agent-browser open localhost:3000 && \
  agent-browser snapshot -i && \
  agent-browser click @loginBtn && \
  agent-browser screenshot after-login.png

# Session management (isolated tests)
agent-browser --session test1 open localhost:3000
agent-browser --session test2 open localhost:3000
agent-browser session list

# Visual debugging
agent-browser highlight "#target-element"   # Highlight element
agent-browser --headed open localhost:3000  # Show browser window
agent-browser --debug click @submitBtn      # Debug output

# Find elements by role/text
agent-browser find role button click --name "New Project"
agent-browser find text "John Doe" click
agent-browser find placeholder "Search projects..." type "MM-0001"

# Viewport testing (responsive)
agent-browser set viewport 768 1024        # Tablet
agent-browser set viewport 1920 1080       # Desktop
agent-browser screenshot tablet-view.png

# Save full page screenshots
agent-browser screenshot --full dashboard-full.png

# Export PDF
agent-browser pdf project-report.pdf
```

**Integration with CI/CD:**

```bash
# Test script example (test-mockup.sh)
#!/bin/bash
set -e
cd html && npx serve . -p 3000 &
SERVER_PID=$!
sleep 2

# Run tests
agent-browser --session ci-test open http://localhost:3000
agent-browser snapshot -i > snapshot.txt
agent-browser screenshot ci-test.png
agent-browser click "button:has-text('Login')"
agent-browser wait ".dashboard"

# Cleanup
kill $SERVER_PID
exit 0
```

**Best Practices:**

1. Use `snapshot -i` to get element refs before interactions
2. Always `wait` after actions that trigger async updates (toast, redirects)
3. Use `--session` flag for isolated parallel tests
4. Verify state with `is visible/enabled/checked` before assertions
5. Use `get count` to verify filter results
6. Capture screenshots before/after critical actions for debugging
7. Check `console` and `errors` after page load to catch JavaScript issues
8. Use `find role/text` for semantic element selection (more robust than CSS selectors)

**Production Testing Notes:**

- For production React app, use same commands with production URL
- Combine with Playwright for more complex scenarios (file upload, dialogs)
- Use `--state` flag to load pre-authenticated session state
- Use `network route` to mock API responses for isolated frontend testing
