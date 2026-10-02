@AGENTS.md

## Claude Code

For design QA, use `.claude/agents/design-qa.md` when available (local,
gitignored). The original handoff recommended Fable with high effort.

When `.claude/launch.json` defines `curve-sync-dev`, start the prototype with
`preview_start {name:"curve-sync-dev"}` at `http://localhost:3101` instead of
Bash. Shared project context and instructions live in AGENTS.md.
