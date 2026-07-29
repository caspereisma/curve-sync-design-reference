#!/usr/bin/env node
/**
 * Design-reference asset capture for NR-SPEC-003 (deal terms → Curve sync).
 *
 *   pnpm snap:spec [--out <dir>] [--list]
 *
 * Unlike `pnpm snap` — which archives whole routes at three viewports — this
 * script drives the Sync-with-Curve dialog through its *interactive* states
 * (never synced → synced → edited → override → tier crossing) and writes one
 * PNG per state, so the design reference documents real UI rather than mock-ups.
 *
 * Output defaults to the nr-product spec directory:
 *   ../nr-product/specs/NR-SPEC-003-deal-terms-curve-sync/assets
 * Override with --out when that repo lives elsewhere.
 *
 * Conventions (match the existing assets):
 *   - dialog shots  1440 wide × 1024 tall, or taller where content would clip
 *   - page shots    1440 wide, full page
 *
 * Seeded clients: 172 = 1008B (sliding, requires-sync) · 173 = 1008C (flat,
 * synced) · 174 = 1008D (flat, never synced).
 */

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const BASE = 'http://127.0.0.1:3101';
const DEFAULT_OUT = resolve(
    ROOT,
    '..',
    'nr-product',
    'specs',
    'NR-SPEC-003-deal-terms-curve-sync',
    'assets'
);

const SHOTS = [
    ['02-client-detail-main.png', '1008D main details, full page (no progress tile)'],
    ['territory-deals-table-1008b.png', '1008B territory deals table (element clip)'],
    ['sync-client-data-never-synced-1008d.png', 'client data tab, never synced'],
    ['sync-territory-deals-never-synced-1008d.png', 'territory deals tab, never synced'],
    ['sync-client-data-sync-required-1008d.png', 'client data tab after renaming the client'],
    ['sync-client-data-in-sync-1008c.png', 'client data tab, all rows in sync'],
    ['sync-territory-deals-1008c.png', 'base + ES/UK exclusion cards, in sync'],
    ['sync-territory-cmo-rate-edit-1008c.png', 'AIE ES rate in edit mode'],
    ['sync-territory-cmo-override-1008c.png', 'AIE ES saved at 4% with the override warning'],
    ['sync-tiers-active-1008b.png', 'tier 1 active/expanded, tier 2 collapsed'],
    ['sync-tiers-inactive-expanded-1008b.png', 'tier 2 expanded and disabled'],
    ['sync-tiers-after-crossing-1008b.png', 'tier 2 active after crossing, rows Sync required']
];

function bail(msg) {
    console.error('capture-spec-assets: ' + msg);
    process.exit(1);
}

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.includes('--list')) {
        SHOTS.forEach(([file, what]) => console.log(`${file.padEnd(46)} ${what}`));
        process.exit(0);
    }
    const outIndex = args.indexOf('--out');
    const out = outIndex === -1 ? DEFAULT_OUT : args[outIndex + 1];
    if (!out) bail('--out needs a directory');
    if (!existsSync(out)) bail(`output directory does not exist: ${out}`);
    return { out };
}

async function waitForServer(url, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok || res.status < 500) return true;
        } catch {
            /* not yet */
        }
        await sleep(400);
    }
    return false;
}

async function ensureServer() {
    if (await waitForServer(BASE, 500)) return;
    const child = spawn('pnpm', ['dev'], { cwd: ROOT, stdio: 'ignore', detached: true });
    child.unref();
    if (!(await waitForServer(BASE, 60_000))) bail('dev server did not start on :3101');
}

const { out: OUT } = parseArgs();
await ensureServer();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
const captured = [];

async function goto(path) {
    await page.goto(`${BASE}/#${path}`);
    await page.waitForFunction(() => {
        const root = document.getElementById('root');
        return root !== null && root.childElementCount > 0;
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
}

async function shot(name, opts = {}) {
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(OUT, name), ...opts });
    captured.push(name);
    console.log('•', name);
}

const headerButton = (name) =>
    page.locator('.reference-actions').getByRole('button', { name, exact: true });
const dialogAction = (name) =>
    page.locator('.MuiDialogActions-root').getByRole('button', { name, exact: true });
const tab = (name) => page.getByRole('tab', { name });
const setHeight = (height) => page.setViewportSize({ width: 1440, height });

async function openSyncDialog() {
    await headerButton('Sync with Curve').click();
    await page.locator('.reference-sync-modal').waitFor();
    await page.waitForTimeout(300);
}

// ── 1008D Records (174): never synced → synced → renamed ────────────────────
await goto('/rights-holder-page/174');
await shot('02-client-detail-main.png', { fullPage: true });

await openSyncDialog();
// The dialog keeps its last-selected tab across opens, so always select it.
await tab('CLIENT DATA').click();
await shot('sync-client-data-never-synced-1008d.png');
await tab('TERRITORY DEALS').click();
await shot('sync-territory-deals-never-synced-1008d.png');

// Syncing takes the snapshot the row diff compares against; then rename the
// client so exactly one row falls out of sync.
await dialogAction('Sync with Curve').click();
await page.waitForTimeout(400);
await headerButton('Edit').click();
await page.getByRole('textbox', { name: /Client Name/i }).first().fill('1008D Records BV');
await headerButton('Save').click();
await page.waitForTimeout(400);
await openSyncDialog();
await tab('CLIENT DATA').click();
await shot('sync-client-data-sync-required-1008d.png');
await dialogAction('Cancel').click();

// ── 1008C Records (173): flat rates, loads synced, CMO override workflow ────
await goto('/rights-holder-page/173');
await openSyncDialog();
await tab('CLIENT DATA').click();
await shot('sync-client-data-in-sync-1008c.png');

await tab('TERRITORY DEALS').click();
await setHeight(1400); // three cards do not fit in 1024
await shot('sync-territory-deals-1008c.png');
await setHeight(1024);

await page.getByRole('button', { name: 'Edit AIE ES rate override' }).click();
await page.getByRole('textbox', { name: 'AIE ES NRP rate' }).fill('4');
await shot('sync-territory-cmo-rate-edit-1008c.png');
await page.getByRole('button', { name: 'Save AIE ES rate override' }).click();
await shot('sync-territory-cmo-override-1008c.png');
await dialogAction('Cancel').click();

// ── 1008B Records s (172): sliding scale rate tiers ─────────────────────────
await goto('/rights-holder-page/172');
await page.locator('.reference-territory-table').screenshot({
    path: join(OUT, 'territory-deals-table-1008b.png')
});
captured.push('territory-deals-table-1008b.png');
console.log('•', 'territory-deals-table-1008b.png');

// Sync first, otherwise every tier row reads "Not yet synced" and the
// in-sync / Sync required contrast the tier shots exist to show is invisible.
await openSyncDialog();
await tab('TERRITORY DEALS').click();
await dialogAction('Sync with Curve').click();
await page.waitForTimeout(400);

await openSyncDialog();
await tab('TERRITORY DEALS').click();
await setHeight(1500);
await shot('sync-tiers-active-1008b.png');

// Collapse the active tier so the inactive tier's disabled cards are in frame.
await page.getByRole('button', { name: /Collapse Rate tier 1/ }).click();
await page.getByRole('button', { name: /Expand Rate tier 2/ }).click();
await shot('sync-tiers-inactive-expanded-1008b.png');
await setHeight(1024);
await dialogAction('Cancel').click();

// Cross the switch point. Income is not editable in the prototype, so lower
// the threshold below the €14,543 account balance instead — same end state.
await headerButton('Edit').click();
await page.getByRole('button', { name: /^Edit World excluding US .* deal$/ }).click();
await page.locator('.reference-deal-dialog-paper').waitFor();
await page.getByRole('textbox', { name: 'Sliding scale threshold' }).fill('10000');
await page.locator('.reference-deal-dialog-paper').getByRole('button', { name: 'Save' }).click();
await page.waitForTimeout(300);
await headerButton('Save').click();
await page.waitForTimeout(400);
await openSyncDialog();
await tab('TERRITORY DEALS').click();
await setHeight(1500);
await shot('sync-tiers-after-crossing-1008b.png');

await browser.close();

const expected = SHOTS.map(([file]) => file);
const missing = expected.filter((file) => !captured.includes(file));
if (missing.length) bail(`missing captures: ${missing.join(', ')}`);
console.log(`\ncapture-spec-assets: ${captured.length} shots written to ${OUT}`);
