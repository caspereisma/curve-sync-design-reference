# Session handoff — curve-sync prototype (updated 2026-08-26)

Context for continuing in a fresh Claude Code session. The `neighbouring-rights` skill + the `nr-product-sdd-confluence-publishing` memory carry the broader domain/publishing context. Spec documentation lives in `~/code/nr-product` (`specs/NR-SPEC-003-deal-terms-curve-sync/`) — the repo is the source of truth; Confluence holds mirrors.

## Commit status (as of 2026-08-26)

All earlier session work is **merged and pushed** (PRs #1–#9 on `caspereisma/curve-sync-design-reference`; `main` = `7ffa63a`). The Songtrust upstream (`Songtrust/curve-sync-design-reference`) is ~3 months stale — only its PR #1 (May 6) ever landed there.

### Uncommitted working tree (2026-08-26)

- **New client-data fields (RH page):** `Country of Residence` (General, ISO select) + `Minimum royalty payout` (Deal Terms, currency-dependent numeric) — both Curve-synced with **per-field drift markers** vs the last-synced snapshot, both added to the sync dialog's Client data tab (now **ten rows**). `Currency` is now a **EUR/GBP/USD select**.
- **Performer client detail page** (`#/performer-page/:id`, seeded `p1`–`p3`): staging-parity General/Identifiers/Bio sections, shared Deal Terms/sync/Billing/Comments. Folded into **NR-BRIEF-004 scope** (PM decision 2026-08-26).
- **Masthead Clients dropdown** (Rights Holders / Performers) — **prototype-only navigation, deliberately undocumented** (see memory `prototype-only-ui-not-for-docs`).
- **Pre-existing WIP from an earlier session (do not fold into the above):** clients-list deal-end/indicator columns (`ReferenceClientsPage.tsx`, `SlidingScaleDiamond.tsx`, parts of `reference-ui.css`, `capture-spec-assets.mjs` `--only` flag). This WIP breaks 9 list-page visual baselines (`npm run test:visual`); the suite passes without the working tree. Commit + rebaseline or revert — user's call.

## Docs state (nr-product, updated 2026-08-26 — Confluence sync PENDING PM REVIEW)

The 2026-08-26 doc pass updated: `NR-BRIEF-004` (scope bullet), `NR-SPEC-003-MAP-01` (Ex 1.6, **Q14 opened** — Curve keys for the new fields), `NR-SPEC-003` main spec (scope, Story 3 row count, Gate-2 note, validator re-run flagged), `NR-SPEC-003-DESIGN-01` (§3.3, §4.1–4.2, §6.2 ten rows, **new §12 Performer surface**, renumbered §13–15), `NR-INIT-003` (action log + open actions). Spec assets re-captured (`pnpm snap:spec`, 14 shots incl. `12-performer-detail-main.png`). **Do not sync Confluence mirrors until Casper has reviewed the pass** — tracked as an open action in NR-INIT-003.

## Run the prototype

Preview server `curve-sync-dev` on `http://localhost:3101` (config in `.claude/launch.json`). Use `preview_start {name:"curve-sync-dev"}`; verify via the Browser pane. Key pages: `#/rights-holder-page/172` (sliding, requires-sync) · `/173` (flat, synced) · `/174` (never synced) · `#/performer-page/p1` (performer, synced) · `#/events`. Screenshots regenerate with `pnpm snap:spec` (writes into nr-product's spec assets dir; `--only <fragment,…>` limits the run).
