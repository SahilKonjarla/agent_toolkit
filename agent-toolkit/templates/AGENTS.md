# AGENTS.md

## Project summary

Generated from `agent-project.yaml` and project context docs.

## Architecture summary

See `docs/context/PROJECT_CONTEXT.md` and `docs/context/DOMAIN_MODEL.md`.

## Personal operating preferences

Project maintainers may customize this section after initialization. Keep preferences concise, explicit, and non-secret.

Recommended defaults:

- Be concise but explicit about risks and uncertainty.
- Prefer a short implementation plan before code changes.
- Ask before inventing new architecture, dependencies, directories, or conventions.
- Prefer small vertical slices over broad rewrites.
- Never commit, push, deploy, stage files, access `.env`, create branches/worktrees, or change infrastructure unless explicitly approved.
- If requirements are ambiguous, ask clarifying questions before making irreversible changes.
- If a command was not run, say so clearly.

## Personalization overrides

Project-specific and personal preferences live under `.agent-config/overrides/` and are referenced from the `personalization` section of `agent-project.yaml`.

Agents should read only the override files relevant to the active task. Do not load every override file by default.

Common override triggers:

- General working style → `.agent-config/overrides/personal.md`
- Git strategy or branch/worktree questions → `.agent-config/overrides/git.md`
- Tests, TDD, validation, or CI checks → `.agent-config/overrides/testing.md`
- Reviews or severity calibration → `.agent-config/overrides/review.md`
- Bugs, repros, logs, or debugging → `.agent-config/overrides/debugging.md`
- Specs or requirements → `.agent-config/overrides/specs.md`
- Tickets or work breakdown → `.agent-config/overrides/tickets.md`
- Issue tracker behavior → `.agent-config/overrides/tracking.md`
- Domain/context paths or glossary style → `.agent-config/overrides/context.md`
- Research tasks → `.agent-config/overrides/research.md`
- Prototypes → `.agent-config/overrides/prototypes.md`
- Architecture reviews → `.agent-config/overrides/architecture-review.md`
- Manual setup wizards → `.agent-config/overrides/wizards.md`
- Secret handling conventions → `.agent-config/overrides/secrets.md`
- Agent-facing documentation → `.agent-config/overrides/writing-for-agents.md`

Override files must not contain secret values, credentials, tokens, account IDs, private customer data, or `.env` contents.

## Source-of-truth paths

- Configuration: `agent-project.yaml`
- Toolkit workflows: `agent-toolkit/workflows/`
- Standards: `agent-toolkit/standards/`
- Contracts: `agent-toolkit/contracts/`
- Imported skill adaptations: `agent-toolkit/adaptations/matt-pocock/`
- Project-local overrides: `.agent-config/`

When imported skills mention `CONTEXT.md`, use `docs/context/DOMAIN_MODEL.md` for glossary/domain terms and `docs/context/PROJECT_CONTEXT.md` for broader project context unless this project defines another mapping.

## Development commands

Use commands from `agent-project.yaml`. Do not invent commands without inspecting the repository.

## Shared engineering rules

Inspect before editing, prefer existing patterns, keep changes scoped, test behavioral changes, and report honestly.

When using imported Matt Pocock skills, apply toolkit standards first. Treat slash-command, sub-agent, commit, branch, temp-file, or root-`CONTEXT.md` assumptions as guidance that must be adapted to this project's approval, Git, handoff, and context policies.

## Approval policy

Supervised mode. Ask before writes, phase transitions, dependencies, migrations, API/platform changes, tests, env access, git operations, destructive commands, deployments, or remediation.

## Git restrictions

Do not create branches/worktrees, commit, push, merge, or open/modify PRs without approval.

## Secrets restrictions

Do not access `.env` or store secret values. Redact secrets in reports and handoffs.

## Completion reports

Include summary, files changed, behavior implemented, commands/tests run, assumptions, limitations, risks, and next step.
