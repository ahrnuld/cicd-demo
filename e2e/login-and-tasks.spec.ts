import { expect, test } from '@playwright/test';

// End-to-end: open the real (web) app and walk through it like a user.
test('shows an error when the login form is empty', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('login-error')).toHaveText('Please enter your email and password.');
});

test('user can log in and add a task', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('email-input').fill('student@school.nl');
  await page.getByTestId('password-input').fill('secret123');
  await page.getByTestId('login-button').click();

  await expect(page.getByText('Welcome')).toBeVisible();

  await page.getByTestId('task-input').fill('Write tests');
  await page.getByTestId('add-task-button').click();

  await expect(page.getByText('Write tests')).toBeVisible();
  await expect(page.getByTestId('open-count')).toHaveText('1 open');
});
