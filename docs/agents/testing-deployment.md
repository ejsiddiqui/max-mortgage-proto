# Testing & Deployment Guide

This document covers testing strategies and deployment procedures for the production application.

## Testing Strategy

### Unit Tests (Vitest)

Test business logic, utilities, and Convex validators:

```typescript
// tests/commission.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCommissionSplits } from '../utils/commission';

describe('Commission Calculations', () => {
  it('should calculate agent and referral splits correctly', () => {
    const result = calculateCommissionSplits({
      totalCommission: 10000,
      agentRate: 0.6,
      referralRate: 0.2,
    });
    
    expect(result.agentShare).toBe(6000);
    expect(result.referralShare).toBe(2000);
    expect(result.companyShare).toBe(2000);
  });
  
  it('should handle no referral case', () => {
    const result = calculateCommissionSplits({
      totalCommission: 10000,
      agentRate: 0.6,
    });
    
    expect(result.agentShare).toBe(6000);
    expect(result.referralShare).toBe(0);
    expect(result.companyShare).toBe(4000);
  });
});
```

### Integration Tests (Playwright)

Test critical user flows:

```typescript
// e2e/project-flow.spec.ts
import { test, expect } from '@playwright/test';

test('Agent can create and manage project', async ({ page }) => {
  // 1. Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'agent@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  
  // 2. Create project
  await page.goto('/projects/new');
  await page.fill('[name="clientName"]', 'Test Client');
  await page.fill('[name="clientEmail"]', 'client@example.com');
  await page.fill('[name="loanAmount"]', '500000');
  await page.click('button[type="submit"]');
  
  // 3. Verify creation
  await expect(page.locator('text=Project created successfully')).toBeVisible();
  
  // 4. View project
  await page.goto('/projects');
  await expect(page.locator('text=Test Client')).toBeVisible();
});

test('Agent cannot view another agents project', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'agent1@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Try to access another agent's project
  await page.goto('/projects/agent2-project-id');
  await expect(page.locator('text=Access denied')).toBeVisible();
});
```

## Deployment Checklist

### Environment Setup

```bash
# 1. Convex Environment Variables
npx convex env set CLERK_JWT_ISSUER_DOMAIN <your-clerk-domain>
npx convex env set CLERK_WEBHOOK_SECRET <webhook-secret>

# 2. Deploy Convex
npx convex deploy --prod
```

### Clerk Configuration

1. Add Convex JWT Template in Clerk Dashboard
2. Configure Webhook: `https://<your-convex-site>.convex.cloud/clerk-webhook`
3. Enable events: `user.created`, `user.updated`, `user.deleted`

### Pre-Deployment Verification

- [ ] All Convex functions have RBAC checks
- [ ] Audit events logged for critical actions
- [ ] File upload size limits configured
- [ ] CORS settings allow uploads
- [ ] Environment variables set
- [ ] Database indexes created

### Common Commands

```bash
# Development
npx convex dev
npm run dev

# Testing
npm run test
npm run test:e2e

# Type checking
npm run type-check

# Deployment
npx convex deploy --prod
```
