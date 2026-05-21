import { test, expect, type Page } from '@playwright/test';

/**
 * Visual regression suite for the curve-sync-design-reference Vite app.
 *
 * Captures the four static routes at three viewports — 12 snapshots. Add new
 * routes here as you build pages; parametric routes (e.g. /rights-holders/:id)
 * are intentionally excluded for now.
 */

const VIEWPORTS = {
  desktop: { width: 1440, height: 1024 },
  tablet:  { width: 768,  height: 1024 },
  mobile:  { width: 375,  height: 812 },
};

const ROUTES: Array<{ name: string; path: string }> = [
  { name: 'home',           path: '/' },
  { name: 'clients',        path: '/clients' },
  { name: 'rights-holders', path: '/rights-holders' },
  { name: 'events',         path: '/events' },
];

async function gotoReady(page: Page, path: string) {
  await page.goto(path);
  // App root mounts inside #root — wait until it has children before capturing.
  await page.waitForFunction(() => {
    const root = document.getElementById('root');
    return root !== null && root.childElementCount > 0;
  });
  await page.evaluate(() => document.fonts.ready);
}

for (const [vp, size] of Object.entries(VIEWPORTS)) {
  test.describe(`viewport ${vp} (${size.width}x${size.height})`, () => {
    test.use({ viewport: size });

    for (const route of ROUTES) {
      test(`${route.name} (${route.path})`, async ({ page }) => {
        await gotoReady(page, route.path);
        await expect(page).toHaveScreenshot(`${route.name}-${vp}.png`, { fullPage: true });
      });
    }
  });
}
