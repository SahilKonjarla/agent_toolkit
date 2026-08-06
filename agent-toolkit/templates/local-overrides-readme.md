# Local Overrides

Use this directory for project-specific or personal preferences that should not live inside the reusable toolkit.

These files must stay non-secret. Do not store API keys, passwords, tokens, `.env` values, account IDs, private customer data, or credentials here.

## Recommended override files

Create only the files you need:

```text
.agent-config/overrides/personal.md              # communication and working style preferences
.agent-config/overrides/git.md                   # branch/worktree/commit preferences
.agent-config/overrides/testing.md               # preferred test commands and boundaries
.agent-config/overrides/review.md                # severity calibration and review style
.agent-config/overrides/debugging.md             # repro/debug rules and HITL preferences
.agent-config/overrides/specs.md                 # spec format and tracker publishing preferences
.agent-config/overrides/tickets.md               # ticket granularity and local/tracker behavior
.agent-config/overrides/tracking.md              # GitHub/Linear/Jira/local markdown conventions
.agent-config/overrides/context.md               # project context/domain model path conventions
.agent-config/overrides/research.md              # trusted sources and citation style
.agent-config/overrides/prototypes.md            # prototype locations and cleanup rules
.agent-config/overrides/architecture-review.md   # architecture review/report preferences
.agent-config/overrides/wizards.md               # manual wizard conventions
.agent-config/overrides/secrets.md               # secret manager references; no secret values
.agent-config/overrides/writing-for-agents.md    # agent-facing doc style preferences
```

## Suggested `personal.md`

```md
# Personal Preferences

- Be concise, but explicit about risks and uncertainty.
- Prefer a short plan before code changes.
- Work one step at a time and report what changed after each step.
- Ask before adding dependencies, directories, conventions, or architecture.
- Prefer small vertical slices over broad rewrites.
- Do not commit, push, deploy, stage files, create branches, or create worktrees unless explicitly approved.
- Suggest commit messages when useful, but stop before Git mutations.
- If tests cannot be run, say why and what should be run next.
- If requirements are ambiguous, ask rather than guessing irreversible details.
```

## Suggested `git.md`

```md
# Git Preferences

- The user controls branch strategy.
- Current branch is acceptable for simple read-only or single-session work.
- Parallel editing sessions should use user-approved branches or worktrees.
- Agents may inspect status/diff/log but must not stage, commit, push, merge, or create branches/worktrees without approval.
```

## Suggested `testing.md`

```md
# Testing Preferences

- Prefer the fastest meaningful test first.
- Ask before broad test suites, e2e tests, networked tests, destructive tests, or expensive commands.
- For behavioral changes, add or update tests at approved seams.
- Report exact commands and results.
```

## How agents should use overrides

Agents should read relevant override files when the active task triggers them. Do not load every override for every task. `AGENTS.md` should point to this directory rather than duplicating all override content.
