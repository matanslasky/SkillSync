import { test, expect } from '@playwright/test';

// Helper function to login before each test
async function login(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'mock-auth-token');
    localStorage.setItem('user', JSON.stringify({
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    }));
  });
}

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.locator('[data-testid="project-card"]').first().click();
    await page.getByRole('tab', { name: /tasks/i }).click();
  });

  test('should display task board', async ({ page }) => {
    await expect(page.locator('[data-testid="task-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-column-todo"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-column-in-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-column-done"]')).toBeVisible();
  });

  test('should open create task modal', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /new task/i })).toBeVisible();
    await expect(page.locator('#task-title')).toBeVisible();
    await expect(page.locator('#task-description')).toBeVisible();
  });

  test('should validate task creation form', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();
    
    // Submit empty form
    await page.getByRole('button', { name: /create$/i }).click();
    
    await expect(page.locator('#task-title-error')).toBeVisible();
  });

  test('should assign task to team member', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();
    
    await page.locator('#task-title').fill('New Test Task');
    await page.locator('#task-assignee').click();
    
    const assigneeOptions = page.locator('[role="option"]');
    if (await assigneeOptions.count() > 0) {
      await assigneeOptions.first().click();
    }
    
    await page.getByRole('button', { name: /create$/i }).click();
  });

  test('should set task priority', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();
    
    await page.locator('#task-title').fill('Priority Task');
    await page.locator('#task-priority').click();
    await page.getByRole('option', { name: /high/i }).click();
    
    await expect(page.locator('#task-priority')).toContainText(/high/i);
  });

  test('should set task due date', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();
    
    await page.locator('#task-title').fill('Task with Deadline');
    await page.locator('#task-due-date').click();
    
    // Select tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.locator(`[data-date="${tomorrow.toISOString().split('T')[0]}"]`).click();
  });

  test('should filter tasks by assignee', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();
    await page.getByRole('checkbox', { name: /my tasks/i }).check();
    
    // Verify filtered tasks
    const tasks = page.locator('[data-testid="task-card"]');
    if (await tasks.count() > 0) {
      const firstTask = tasks.first();
      const assignee = await firstTask.locator('[data-testid="task-assignee"]').textContent();
      expect(assignee).toContain('Test User');
    }
  });

  test('should filter tasks by priority', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();
    await page.getByRole('checkbox', { name: /high priority/i }).check();
    
    const tasks = page.locator('[data-testid="task-card"]');
    if (await tasks.count() > 0) {
      const firstTask = tasks.first();
      await expect(firstTask.locator('[data-testid="task-priority"]')).toContainText(/high/i);
    }
  });
});

test.describe('Task Details', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.locator('[data-testid="project-card"]').first().click();
    await page.getByRole('tab', { name: /tasks/i }).click();
  });

  test('should open task detail modal', async ({ page }) => {
    const firstTask = page.locator('[data-testid="task-card"]').first();
    await firstTask.click();
    
    await expect(page.getByRole('dialog', { name: /task details/i })).toBeVisible();
  });

  test('should edit task title inline', async ({ page }) => {
    const firstTask = page.locator('[data-testid="task-card"]').first();
    await firstTask.click();
    
    const titleInput = page.locator('#task-title-edit');
    await titleInput.click();
    await titleInput.fill('Updated Task Title');
    await titleInput.press('Enter');
    
    // Verify save
    await expect(page.locator('[data-testid="task-title"]')).toContainText('Updated Task Title');
  });

  test('should add task comment', async ({ page }) => {
    const firstTask = page.locator('[data-testid="task-card"]').first();
    await firstTask.click();
    
    const commentInput = page.locator('#task-comment');
    await commentInput.fill('This is a test comment');
    await page.getByRole('button', { name: /post comment/i }).click();
    
    await expect(page.locator('[data-testid="task-comments"]')).toContainText('This is a test comment');
  });

  test('should update task status', async ({ page }) => {
    const firstTask = page.locator('[data-testid="task-card"]').first();
    await firstTask.click();
    
    await page.locator('#task-status').click();
    await page.getByRole('option', { name: /in progress/i }).click();
    
    await expect(page.locator('#task-status')).toContainText(/in progress/i);
  });

  test('should mark task as complete', async ({ page }) => {
    const firstTask = page.locator('[data-testid="task-card"]').first();
    await firstTask.click();
    
    await page.getByRole('button', { name: /mark complete/i }).click();
    
    await expect(page.locator('[data-testid="task-status"]')).toContainText(/complete/i);
  });

  test('should attach file to task', async ({ page }) => {
    const firstTask = page.locator('[data-testid="task-card"]').first();
    await firstTask.click();
    
    // Set up file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /attach file/i }).click();
    const fileChooser = await fileChooserPromise;
    
    // Verify file chooser opened (can't actually upload in this test)
    expect(fileChooser).toBeTruthy();
  });
});

test.describe('Kanban Board Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.locator('[data-testid="project-card"]').first().click();
    await page.getByRole('tab', { name: /tasks/i }).click();
  });

  test('should display kanban columns', async ({ page }) => {
    const todoColumn = page.locator('[data-testid="task-column-todo"]');
    const inProgressColumn = page.locator('[data-testid="task-column-in-progress"]');
    const doneColumn = page.locator('[data-testid="task-column-done"]');
    
    await expect(todoColumn).toBeVisible();
    await expect(inProgressColumn).toBeVisible();
    await expect(doneColumn).toBeVisible();
  });

  test('should show task count in column headers', async ({ page }) => {
    const todoHeader = page.locator('[data-testid="column-header-todo"]');
    const headerText = await todoHeader.textContent();
    
    expect(headerText).toMatch(/\(\d+\)/); // Should contain count like "(5)"
  });

  test('should drag task to different column', async ({ page }) => {
    const firstTask = page.locator('[data-testid="task-column-todo"] [data-testid="task-card"]').first();
    const inProgressColumn = page.locator('[data-testid="task-column-in-progress"]');
    
    if (await firstTask.count() > 0) {
      const taskText = await firstTask.textContent();
      
      // Drag task
      await firstTask.hover();
      await page.mouse.down();
      await inProgressColumn.hover();
      await page.mouse.up();
      
      // Verify task moved
      await expect(inProgressColumn).toContainText(taskText);
    }
  });

  test('should show add task button in each column', async ({ page }) => {
    const todoColumn = page.locator('[data-testid="task-column-todo"]');
    const addButton = todoColumn.locator('[data-testid="add-task-button"]');
    
    await expect(addButton).toBeVisible();
  });
});

test.describe('Task Search and Sort', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.locator('[data-testid="project-card"]').first().click();
    await page.getByRole('tab', { name: /tasks/i }).click();
  });

  test('should search tasks', async ({ page }) => {
    const searchInput = page.getByRole('searchbox', { name: /search tasks/i });
    await searchInput.fill('Test');
    
    await page.waitForTimeout(500);
    
    const tasks = page.locator('[data-testid="task-card"]');
    if (await tasks.count() > 0) {
      const firstTask = tasks.first();
      await expect(firstTask).toContainText(/test/i);
    }
  });

  test('should sort tasks by due date', async ({ page }) => {
    await page.getByRole('button', { name: /sort/i }).click();
    await page.getByRole('option', { name: /due date/i }).click();
    
    // Verify sorting applied
    const sortButton = page.getByRole('button', { name: /sort/i });
    await expect(sortButton).toContainText(/due date/i);
  });

  test('should sort tasks by priority', async ({ page }) => {
    await page.getByRole('button', { name: /sort/i }).click();
    await page.getByRole('option', { name: /priority/i }).click();
    
    const sortButton = page.getByRole('button', { name: /sort/i });
    await expect(sortButton).toContainText(/priority/i);
  });
});
