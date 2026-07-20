#!/usr/bin/env node
/**
 * Curated design-archive capture.
 *
 *   pnpm snap <slug> "<summary>" [route ...]
 *
 * Spins up `pnpm dev` (if not already running on :3101), captures each route
 * at three viewports, writes full-page PNGs into
 *   screenshots/archive/<YYYY-MM-DD>_<slug>/
 * alongside a meta.json describing the moment, then rebuilds INDEX.md.
 *
 * Examples:
 *   pnpm snap clients-redesign "New Clients table layout"
 *   pnpm snap events-detail "Event detail dialog v2" /events
 */

import { chromium } from '@playwright/test';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ARCHIVE_DIR = join(ROOT, 'screenshots', 'archive');

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 1024 },
  { name: 'tablet-768',   width: 768,  height: 1024 },
  { name: 'mobile-375',   width: 375,  height: 812 },
];

const DEFAULT_ROUTES = ['/'];
const BASE = 'http://127.0.0.1:3101';

function bail(msg) { console.error('snap: ' + msg); process.exit(1); }

function todayStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function gitInfo() {
  const sh = (...args) =>
    spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
  return {
    branch: sh('rev-parse', '--abbrev-ref', 'HEAD'),
    commit: sh('rev-parse', '--short', 'HEAD'),
    remote: sh('config', '--get', 'remote.origin.url'),
  };
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok || res.status < 500) return true;
    } catch { /* not yet */ }
    await sleep(400);
  }
  return false;
}

async function ensureServer() {
  if (await waitForServer(BASE, 500)) return null;
  const child = spawn('pnpm', ['dev'], {
    cwd: ROOT, stdio: 'ignore', detached: true,
  });
  child.unref();
  if (!await waitForServer(BASE, 60_000)) bail('dev server did not start on :3101');
  return child;
}

function safeName(route) {
  return route.replace(/^\/+/, '').replace(/[^a-zA-Z0-9_-]+/g, '-') || 'home';
}

async function captureAll(targetDir, routes) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const captures = [];
  for (const route of routes) {
    const label = safeName(route);
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(BASE + route);
      await page.waitForFunction(() => {
        const root = document.getElementById('root');
        return root !== null && root.childElementCount > 0;
      });
      await page.evaluate(() => document.fonts.ready);
      const fileName = `${label}-${vp.name}.png`;
      await page.screenshot({ path: join(targetDir, fileName), fullPage: true });
      captures.push({ route, viewport: vp.name, file: fileName,
                      width: vp.width, height: vp.height });
    }
  }
  await browser.close();
  return captures;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) bail('usage: pnpm snap <slug> "<summary>" [route ...]');
  const slug = args[0];
  const summary = args[1] || '';
  const routes = args.length > 2 ? args.slice(2) : DEFAULT_ROUTES;

  const date = todayStamp();
  const folder = `${date}_${slug}`;
  const targetDir = join(ARCHIVE_DIR, folder);
  if (existsSync(targetDir)) bail(`already exists: ${targetDir} — pick a different slug`);

  mkdirSync(targetDir, { recursive: true });
  console.log(`snap: capturing into ${targetDir} …`);

  await ensureServer();
  const captures = await captureAll(targetDir, routes);

  const meta = {
    slug, summary, date,
    captured_at: new Date().toISOString(),
    base_url: BASE,
    routes,
    git: gitInfo(),
    captures,
  };
  writeFileSync(join(targetDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log(`snap: wrote ${captures.length} captures + meta.json`);

  const upd = spawnSync('node', [join(ROOT, 'scripts', 'update-index.mjs')],
    { stdio: 'inherit', cwd: ROOT });
  if (upd.status !== 0) bail('snap:index step failed');

  console.log(`snap: done. View ${join('screenshots', 'archive', 'INDEX.md')}`);
}

main().catch((err) => bail(err?.stack || String(err)));
