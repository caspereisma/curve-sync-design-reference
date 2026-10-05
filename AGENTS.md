# Shared repository guidance

AGENTS.md is the shared source of truth for repository instructions and design
QA context across assistants. Update shared guidance here; keep CLAUDE.md for
Claude Code setup only. HANDOFF.md points here for existing entry points.

## Working preferences

- Write for a product designer: visible consequences and decisions first;
  place technical detail in an appendix when needed.
- Chat is authority. Commit only when requested. Pushes, PRs, merges,
  Confluence changes, Figma library edits, and other outward actions require
  explicit authorization. Propose the result and let Casper edit it first.
- Work in `caspereisma/curve-sync-design-reference`; `Songtrust` is the
  read-only upstream. The GitHub account is `caspereisma`.
- For branch, commit, and PR work, use an isolated Git worktree and
  `git -C <path>`; do not switch branches in the shared checkout.
- For Confluence writes and attachments, use the REST API at
  `https://songtrust.atlassian.net/wiki/rest/api/content` with
  `CONFLUENCE_USER` and `CONFLUENCE_API_TOKEN`. Never print the token.
- Install global CLI tools with `brew install`.
- Verify Figma and tool capability claims against current release notes.

## Design QA context

Compare the NRP build against Figma and this prototype with the `design-qa`
agent. Codex agent instructions live in `.codex/agents/design-qa.toml`;
Claude Code may use `.claude/agents/design-qa.md` (local, gitignored).
The agent carries the process: input contract, capture matrix, comparison
passes, verification, report format, and exclusions. The sections below carry
its source inputs. Broader domain context comes from the `neighbouring-rights`
skill and, where available, the `nr-product-sdd-confluence-publishing` memory.

Use one surface per pass to keep screenshot context manageable. Confirm the
explicit target, sources, scope, and exclusions before starting a QA pass.

## Historical repo/docs snapshot (2026-09-17)

This section records the original handoff snapshot. Verify current Git, ticket,
and publishing state before relying on these status claims.

Everything is merged and pushed: this repo `main` = `cd709ed` (PRs #1–#10 on
`caspereisma/curve-sync-design-reference`); the nr-product 2026-08-26 doc pass
is merged (Songtrust/nr-product PR #71) and all Confluence mirrors are synced.
Example-map red cards are clear (Q14 resolved 2026-08-26). Remaining spec
action: validator re-run. The Songtrust fork of *this* repo is stale — the
caspereisma repo is canonical.

## QA targets and sources of truth

**Target (the build):** `https://nr-stag.downtownmusic.com` — needs the
user's logged-in Chrome through the available browser tools.
Routes: `/rights-holders`, `/rights-holder-page/:id`, `/performers`,
`/performer-page/:id`. Staging clients must be driven into states matching
the prototype's seeds (Phase 0 of the agent process).

**Source — prototype (interaction/state truth):** `http://localhost:3101`
(see Run the prototype below). Seeded states:

| Client | Route | State |
| --- | --- | --- |
| 1008B Records s | `#/rights-holder-page/172` | sliding scale, requires-sync (tiers, CMO overrides) |
| 1008C Records | `#/rights-holder-page/173` | flat, synced (base + ES/UK exclusion cards) |
| 1008D Records | `#/rights-holder-page/174` | flat, never synced |
| Example Performing Artist A | `#/performer-page/p1` | performer, sliding, synced (full Bio/IPN/Spotify) |
| Example Performing Artist B | `#/performer-page/p2` | performer, sparse, not-synced, session artist |
| Example Performing Artist C | `#/performer-page/p3` | performer, flat Europe deal, requires-sync |

Scripted state walkthroughs: `scripts/capture-spec-assets.mjs`
(`pnpm snap:spec`, `--only <fragment,…>`).

**Source — Figma (visual truth):** file `wO6osFhV4x5DPfU0pCqYfc` (NR-Working).
Node map: rights-holder list `10731-19697` · sync dialog `10722-10703`,
`10840-35902`, `10620-10309` · dialog details `10841-36612 / -37514 / -42545 /
-43042 / -43331`, `10840-34219` · rate tiers `10843-44142 / -46316 / -47213` ·
single-client sync details dialog `10702-25140` · event details `10702-24581`.

**Source — written spec (behavioral truth / checklist):**
`~/code/nr-product/specs/NR-SPEC-003-deal-terms-curve-sync/NR-SPEC-003-DESIGN-01-design-reference.md`
(surface inventory §1, per-surface behavior §2–§12). Confluence mirrors:
design ref `4994138140` · spec `4993449986` · example map `4957011970` ·
business logic `4993548292` · initiative hub `4957143041`.

## Surface ↔ ticket map (findings attach here)

Epic [DNRP-284]. Client list: DNRP-672 (subtasks 673/674/675). Client detail
+ dialog: DNRP-497 tree — 511 (indicators), 517 (state response), 518
(dialog comparison view), 679 (Deal Terms section), 687 (CMO overrides), 688
(rate tiers), 689 (preview endpoint), 695 (edit-deal dialog), 696 (override
storage), 705 (guard surfaces). New-field work: 699 (BE) / 700 (FE).
Performer parity: 701. Custody: 702 (post-registration unlock), 703 (M1
validation), 704 (sequential advance). Engine: 504 tree, 519 (guarded push).
SSE: 683/684/685. **Phase 0: check ticket statuses first and QA only shipped
surfaces.**

## Known false positives (also in the QA agent files — keep in sync)

- Masthead **Clients dropdown** = prototype-only navigation (memory
  `prototype-only-ui-not-for-docs`). Its absence in the build is never a
  finding.
- Header **KPI tiles carry hardcoded demo values** in the prototype — compare
  tile structure/states, never the numbers.
- Mock client names/amounts differ by design — compare labels, layout,
  derived states; not data values.
- `assets/10-events-page.png` is referenced in DESIGN-01 §1 but absent from
  nr-product — a docs gap, not a build gap.
- Empty form fields show their label (unshrunk) in the value position — this
  is the standard NR form-field design in view and edit mode, never a finding
  (Casper, 2026-09-23).

## Run the prototype

Run `npm run dev` from the repository to serve the prototype at
`http://localhost:3101` (see `package.json`). In environments with the local
Claude preview configuration, use the Claude-specific setup in `CLAUDE.md`.
Visual suite: `npm run test:visual`; the original handoff recorded 12 green
baselines at `cd709ed`. Re-run checks before claiming current results.
