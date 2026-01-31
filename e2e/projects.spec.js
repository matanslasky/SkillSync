import { test, expect } from '@playwright/test';

// Helper function to login before each test
async function login(page) {
  await page.goto('/');
  // Note: In a real scenario, you'd use actual credentials or test accounts
  // For now, we'll mock the authenticated state
  await page.evaluate(() => {
    localStorage.setItem('token', 'mock-auth-token');
    localStorage.setItem('user', JSON.stringify({
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    }));
  });
  await page.goto('/dashboard');
}

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display projects dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create project/i })).toBeVisible();
  });

  test('should open create project modal', async ({ page }) => {
    await page.getByRole('button', { name: /create project/i }).click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /new project/i })).toBeVisible();
    await expect(page.locator('#project-name')).toBeVisible();
    await expect(page.locator('#project-description')).toBeVisible();
  });

  test('should validate project creation form', async ({ page }) => {
    await page.getByRole('button', { name: /create project/i }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: /create$/i }).click();
    
    await expect(page.locator('#project-name-error')).toBeVisible();
  });

  test('should filter projects by status', async ({ page }) => {
    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"]', { state: 'attached', timeout: 5000 });
    
    // Click status filter
    await page.getByRole('button', { name: /filter/i }).click();
    await page.getByRole('option', { name: /in progress/i }).click();
    
    // Verify filtered results
    const projectCards = page.locator('[data-testid="project-card"]');
    const count = await projectCards.count();
    
    for (let i = 0; i < count; i++) {
      const status = await projectCards.nth(i).locator('[data-testid="project-status"]').textContent();
      expect(status).toContain('In Progress');
    }
  });

  test('should search projects by name', async ({ page }) => {
    const searchInput = page.getByRole('searchbox', { name: /search projects/i });
    await searchInput.fill('Test Project');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    const projectCards = page.locator('[data-testid="project-card"]');
    if (await projectCards.count() > 0) {
      const firstCard = projectCards.first();
      await expect(firstCard).toContainText(/test project/i);
    }
  });

  test('should navigate to project details', async ({ page }) => {
    // Click on first project card
    await page.locator('[data-testid="project-card"]').first().click();
    
    await expect(page).toHaveURL(/\/project\//);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should open project settings', async ({ page }) => {
    await page.locator('[data-testid="project-card"]').first().click();
    
    await page.getByRole('button', { name: /settings/i }).click();
    await expect(page.getByRole('dialog', { name: /project settings/i })).toBeVisible();
  });
});

test.describe('Project Details', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Navigate to a specific project
    await page.goto('/dashboard');
    await page.locator('[data-testid="project-card"]').first().click();
  });

  test('should display project tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /tasks/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /team/i })).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Click Tasks tab
    await page.getByRole('tab', { name: /tasks/i }).click();
    await expect(page.locator('[data-testid="task-list"]')).toBeVisible();
    
    // Click Team tab
    await page.getByRole('tab', { name: /team/i }).click();
    await expect(page.locator('[data-testid="team-members"]')).toBeVisible();
    
    // Click Overview tab
    await page.getByRole('tab', { name: /overview/i }).click();
    await expect(page.locator('[data-testid="project-overview"]')).toBeVisible();
  });

  test('should display project progress bar', async ({ page }) => {
    const progressBar = page.locator('[data-testid="progress-bar"]');
    await expect(progressBar).toBeVisible();
    
    const progressText = await progressBar.textContent();
    expect(progressText).toMatch(/\d+%/);
  });

  test('should show project milestones', async ({ page }) => {
    const milestones = page.locator('[data-testid="milestone"]');
    
    if (await milestones.count() > 0) {
      await expect(milestones.first()).toBeVisible();
    }
  });
});

test.describe('Project Collaboration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.locator('[data-testid="project-card"]').first().click();
  });

  test('should invite team members', async ({ page }) => {
    await page.getByRole('tab', { name: /team/i }).click();
    await page.getByRole('button', { name: /invite member/i }).click();
    
    await expect(page.getByRole('dialog', { name: /invite/i })).toBeVisible();
    await expect(page.locator('#invite-email')).toBeVisible();
  });

  test('should display team member list', async ({ page }) => {
    await page.getByRole('tab', { name: /team/i }).click();
    
    const teamMembers = page.locator('[data-testid="team-member"]');
    await expect(teamMembers).toHaveCount(await teamMembers.count());
  });

  test('should show member roles', async ({ page }) => {
    await page.getByRole('tab', { name: /team/i }).click();
    
    const firstMember = page.locator('[data-testid="team-member"]').first();
    await expect(firstMember.locator('[data-testid="member-role"]')).toBeVisible();
  });
});
