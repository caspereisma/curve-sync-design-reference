import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression config for the curve-sync-design-reference Vite app.
 *
 * - `webServer` runs `pnpm dev` on the project's pinned port (3101).
 *   reuseExistingServer is true locally so iterating doesn't keep re-spawning
 *   Vite; CI always starts a fresh server.
 */
export default defineConfig({
  testDir: 'tests',
  snapshotDir: 'screenshots/baseline',
  snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'html',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  use: {
    baseURL: 'http://127.0.0.1:3101',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:3101',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
