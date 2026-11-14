import { defineConfig, devices } from '@playwright/test';

// Playwright runs against the exported web build in ./dist.
// Build it first with: npm run build:web
export default defineConfig({
  testDir: './e2e',
  // Fail the CI run if someone left test.only in the code
  forbidOnly: !!process.env.CI,
  // Retry once on CI to deal with the odd flaky run
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    // Record a trace when a test is retried: open it with `npx playwright show-trace`
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Safari's engine on an iPhone-sized screen
    { name: 'iphone', use: { ...devices['iPhone 15'] } },
  ],
  // Start a static file server for the web build before the tests run
  webServer: {
    command: 'npx serve dist -l 3000 --no-request-logging',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
