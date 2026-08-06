# AGENTS.md

## Project summary

Generated from `agent-project.yaml` and project context docs.

## Architecture summary

See `docs/context/PROJECT_CONTEXT.md` and `docs/context/DOMAIN_MODEL.md`.

## Source-of-truth paths

- Configuration: `agent-project.yaml`
- Toolkit workflows: `agent-toolkit/workflows/`
- Standards: `agent-toolkit/standards/`
- Contracts: `agent-toolkit/contracts/`

## Development commands

Use commands from `agent-project.yaml`. Do not invent commands without inspecting the repository.

## Shared engineering rules

Inspect before editing, prefer existing patterns, keep changes scoped, test behavioral changes, and report honestly.

## Approval policy

Supervised mode. Ask before writes, phase transitions, dependencies, migrations, API/platform changes, tests, env access, git operations, destructive commands, deployments, or remediation.

## Git restrictions

Do not create branches/worktrees, commit, push, merge, or open/modify PRs without approval.

## Secrets restrictions

Do not access `.env` or store secret values. Redact secrets in reports and handoffs.

## Completion reports

Include summary, files changed, behavior implemented, commands/tests run, assumptions, limitations, risks, and next step.
