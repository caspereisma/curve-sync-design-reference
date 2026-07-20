# Session handoff — curve-sync prototype redesign (2026-07-20)

Context for continuing in a fresh Claude Code session. This session was almost entirely **prototype UI work** in `~/code/curve-sync-design-reference` (the React/MUI "design reference"), driven by a series of Figma designs. The `neighbouring-rights` skill + the `nr-product-sdd-confluence-publishing` memory carry the broader domain/publishing context.

## Commit status (as of end of session 2026-07-20)

The session work is now **committed locally (not pushed)**:
- **`curve-sync-design-reference`** → commit **`c4394be`** on `feat/curve-sync-tables-cmo-overrides` ("Client detail + Curve-sync surfaces: Figma-driven redesign", 6 files, +798/−412). `tsc` clean, prototype runs.
- **`nr-product`** → commit **`c9aac5b`** on `meetings/drive-capture-2026-07-20` ("NR-SPEC-003: refresh Curve-sync design-reference screenshots", 4 assets: `02`, `03`, and new `sync-dialog-territory-deals-1008b/-1008c.png`).

Neither branch is pushed — push when ready.

### Still uncommitted (lower risk)
- **curve-sync:** `HANDOFF.md` (this file, untracked), plus ignorable `.DS_Store`, `.claude/`, `.playwright-mcp/`.
- **nr-product (NOT mine — the user is managing these manually; do NOT touch without asking):** `design-reference.md` (M), deletions of `assets/04-sync-dialog-territory-deals.png` / `07-statements-tab.png` / `08-cmos-tab.png`, several `Pasted image *.png` (untracked), and `docs/` (untracked).
- Note the 4 spec assets landed on the **meetings** branch (that's where the repo was checked out); move/cherry-pick to a spec branch later if the team prefers.

## Run the prototype
Preview server `curve-sync-dev` on `http://localhost:3101` (config in `.claude/launch.json`). Use `preview_start {name:"curve-sync-dev"}`; verify via the Browser pane. Client detail pages: `#/rights-holder-page/172` (1008B) and `/173` (1008C). Events: `#/events`.

## What this session built (all in curve-sync, uncommitted)

**Client detail page** (`ReferenceClientPage.tsx` + `reference-ui.css`):
1. **Advance field** — data-driven from `details.advanceAmount` + `advanceRecoupment` (`recouped` green dot / `in-recoupment` orange dot / empty). Was hardcoded.
2. **Auto-extend field** — replaced checkbox + fake selects with MUI `Select` dropdowns: frequency (No autoextend, 1–6) + period (Month(s)/Year(s)); period appears only after a frequency is chosen.
3. **Territory Deals table** — sync icon moved to first column (green `synced` / amber `requires-sync`), removed yellow row bg, removed the stray "dots" (they were a `text-overflow: ellipsis` on a too-narrow status cell), edit/delete icons disabled in view mode.
4. **Field-level out-of-sync markers** — text changed to "Sync with Curve" (icon removed), gated on `client.syncState === 'requires-sync'` (so synced clients show none).
5. **Sync state indicator** (`SyncStateIndicator.tsx`) — label "Curve: requires sync / synced / Not synced", removed the click-to-open-modal link, removed unused `plural` prop.
6. **Highlights bar** — clients with a sliding-scale deal show a "Sliding scale rate" tile instead of the Advance progress tile.
7. **Masthead icons** — forced white (`.reference-topbar-icon .MuiSvgIcon-root { color:#fff }`); MUI was rendering them grey.

**Sync-with-Curve dialog** (`ReferenceClientPage.tsx`):
- **Client data tab** — description "Fields apply to Payee's…", header "Curve value will be overridden", status chips "No change" / "Override".
- **Territory deals tab (CMO rate overrides)** — now **per-client** via `cmoRateOverridesByClient` map (keyed by client id: `172`, `173`), each `{ note, sections }`. Latest design = white bordered card per territory: `Rate:` + caption ("Flat rate" or "Sliding scale rate: …"), "CMO-territories" list with expand toggle on the long base list, nested overrides table (override rows or "No overrides"); the base/catch-all territory has no overrides table.

**Curve sync details dialog** (`App.tsx` `EventDetailsDialog`) — matches Figma `10702-24581`:
- Table layout (Client · Total assets · Created · Updated · Existing skipped · Status), inline legend ("Created - 6,058 · 50%" …), NR palette (`--nr-success`/`--nr-info`/`--nr-warning`), status chips "PARTIALLY SYNCED" / "SYNC COMPLETE". Replaced the earlier collapsible-cards layout.
- **Events page** first row updated to `"Curve sync 12,040 tracks for 5 clients"` with 5-client summary data.

**Data** (`referenceUiData.json` / `.ts`):
- New `details.advanceRecoupment`; loader now merges `emptyDetails` over partial `client.details`.
- **1008B (172):** dealEndDate `2026-12-31`, advance emptied, both territory deals now sliding 12.5% / 5%.
- **1008C (173):** dates `2020-01-01` → `2027-12-31`, 3 synced deals (World excl ES,UK 5%; ES 8%; UK 6%), advance €50,000 in-recoupment, `syncState: synced`.

**Figma export:** an earlier version of the Curve sync details dialog was built into Figma page "Client deal enhancements" (node `10690:33`, file `wO6osFhV4x5DPfU0pCqYfc`) using Status V2 chips + NR text-color variables + Nunito Sans. **Note: it's now stale** — the prototype dialog was subsequently redesigned to the table layout (`10702-24581`). Re-export if a current Figma copy is needed.

## Open threads / next steps
1. **Push** the two local commits (`c4394be` curve-sync, `c9aac5b` nr-product) when ready; open PRs if desired.
2. **Stale spec assets** in nr-product for NR-SPEC-003: `02-client-detail-main.png` (advance / out-of-sync / territory-deals changed after capture), `04-sync-dialog-territory-deals.png` (deleted by user), `11-event-details-dialog.png` (dialog fully redesigned). Re-capture via Playwright MCP at 1440-wide when needed (see prior captures for framing).
3. **Known consistency gaps** (flagged to user, deferred):
   - Events **table** Status column shows "Sync completed" while the **dialog** chip shows "SYNC COMPLETE".
   - Highlights bar (Income/Total/counts) is still hardcoded and shared across all clients.
   - Sync dialog **Client data tab** still uses hardcoded 1008B payee data (`referenceCurveSyncData`) for all clients.
   - Sync-details bar segment widths are proportional at fixed width; they don't reflow if the frame is resized.

## Broader initiative (unchanged from prior handoff)
SDD pipeline for "client deal terms → Curve sync": Strategy NRPD-31 · Epic DNRP-284. The spec (`nr-product/specs/NR-SPEC-003-…/spec.md`) is still gated on the prod/dev **rate→sales-term mapping** refinement (Curve mapping Q1–Q10). This session did not touch that; it was all prototype/design-reference work feeding the design-reference.md + assets.
