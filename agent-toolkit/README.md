# Agent Toolkit

A reusable, project-agnostic software-delivery toolkit for supervised agent work in Pi using Codex models. It defines roles, workflows, standards, contracts, setup behavior, and safe integration guidance for imported Matt Pocock skills.

## What this toolkit is

- Generic Markdown definitions for agents, workflows, policies, and contracts.
- A supervised bootstrap/update/inventory script set.
- A project-local configuration model using `agent-project.yaml`.
- Guidance for manually coordinating Pi, Codex CLI, and Herdr sessions.

## What this toolkit is not

- Not a multi-agent runtime; optional approved delegation uses an external runner or manual sessions.
- Not automatic Herdr pane creation.
- Not a deployment/infrastructure/provisioning system.
- Not a secret store.
- Not tied to one model name or proprietary command syntax.

## Responsibilities

- **Pi** runs customized agent workflows.
- **Codex models** provide reasoning and coding capability to Pi.
- **Codex CLI** may be launched separately as an implementation or review worker.
- **Herdr** manages terminal sessions only; it does not provide intelligence or Git isolation.
- **The toolkit** defines reusable roles, standards, workflows, skills, contracts, and setup behavior.

## Repository structure

```text
agent-toolkit/
  agents/        canonical role definitions
  workflows/     six primary delivery workflows
  standards/     safety, approval, git, secrets, model policies
  contracts/     specs, reports, handoffs, model plans
  templates/     generated project files
  scripts/       bootstrap, update, skill inventory
  profiles/      stack/deployment/compliance overlays
  adaptations/   wrapper docs for imported skills
  skills/        toolkit-owned task skills (separate from vendor imports)
```

Imported skills live outside toolkit-owned content at `.agents/skills/`.

## Agent roles

- Architect: read-only planning, specs, model execution plans.
- Application Engineer: approved scoped implementation.
- Quality Engineer: read-only first testing, review, bug reproduction.
- Platform Engineer: approved Docker/CI/CD/local environment work.
- Production Readiness Engineer: read-only go/no-go audit.

## Workflows

Primary workflows are outcome-oriented:

1. Initialize Project
2. Deliver Feature
3. Fix Bug
4. Review Change
5. Platformize Project
6. Prepare Production Release

Each workflow defines inputs, roles, phases, approval gates, artifacts, model-selection considerations, cost controls, rollback behavior, and completion criteria.

## Toolkit-owned quality skills

See `skills/quality/README.md` for `review-pr`, `triage-ci`, `review-feedback`, `qa-preview`, `review-async-jobs`, `review-api-contract`, `review-observability`, and `docs-drift`. Initializing a downstream project or running `init_project.py skills sync` exposes owned skills alongside locked imports, preserving existing project-owned paths. Imported lock/inventory metadata remains unchanged.

Reviews retain Standards/Spec axes and select focused passes through `standards/review-specialists.md`. Implementation and review apply diff-triggered logging/docs checks in `standards/engineering-principles.md`. Reports carry pinned targets, test matrices, browser evidence and optional worker evidence.

For independent background tasks, follow `standards/delegation-policy.md`. The optional [Pi adapter](integrations/pi/README.md) integrates a pinned external runtime with up to five concurrent task-defined workers, approved background tests/tasks, isolated implementation and public job-status events. It has been installed and smoke-tested locally; see `docs/toolkit-design/pi-background-agents.md` for evidence and the upstream immediate-stop limitation. Other machines opt in explicitly; workflows remain usable sequentially.

## Imported Matt Pocock skills

The imported skills are inventoried in `docs/toolkit-design/imported-skills-inventory.md`. They are not modified automatically. Use adaptations under `agent-toolkit/adaptations/matt-pocock/` when upstream behavior conflicts with toolkit policy.

Adaptation preference:

1. Reuse directly
2. Reference from a workflow
3. Wrap with toolkit instructions
4. Fork only with explicit approval

## Model selection and rate-limit controls

Configure capability tiers in `agent-project.yaml`:

```yaml
models:
  economical: null
  standard: null
  high_reasoning: null
  long_context: null
  fast_review: null
```

Architects should use the lowest reliable tier, avoid repeated full-repository scans, reuse durable artifacts, estimate sessions before multi-phase work, and ask before materially increasing cost or changing provider/auth/billing assumptions.

## Human approval system

Default mode is supervised. Approval is required before file writes, phase transitions, dependencies, migrations, API/platform changes, broad tests, env/secret access, git operations, destructive commands, remediation, deployments, and infrastructure changes.

Read-only inspection may proceed without approval.

## Project initialization

Recommended downstream installation as a submodule:

```bash
git submodule add <toolkit-repository-url> agent-toolkit
git submodule update --init --recursive
python agent-toolkit/scripts/init_project.py
```

Other modes:

```bash
python agent-toolkit/scripts/init_project.py --config answers.yaml
python agent-toolkit/scripts/init_project.py --quick
python agent-toolkit/scripts/init_project.py --dry-run
```

Project-specific changes belong outside a submodule:

```text
agent-project.yaml
AGENTS.md
.agent-config/
docs/context/
```

If `.gitignore` already exists, the initializer appends an Agent Toolkit block for local/runtime agent files such as `.agent-work/` and `.agent-config/` so they are not accidentally tracked.

## Git subtree notes

A subtree/vendor-copy can work, but updates are harder to reason about. `update_toolkit.py` detects subtree-like copies and prints manual guidance rather than changing files automatically.

## Local overrides

Use `.agent-config/` for project-local, non-secret overrides. Do not edit submodule contents for client-specific behavior.

## Updating the toolkit

```bash
python agent-toolkit/scripts/update_toolkit.py --check
python agent-toolkit/scripts/update_toolkit.py --dry-run
python agent-toolkit/scripts/update_toolkit.py
```

The updater never updates automatically, never commits or pushes, and never modifies `.agents/skills/`.

## Running workflows

Start with the requested outcome, read the matching workflow, inspect read-only, produce or update the relevant contract artifact, and request approval before state changes or major phase transitions.

## Handoff artifacts

Use stable handoff reports under `.agent-work/handoffs/` in initialized projects. Handoffs should reference existing specs/reports rather than duplicating them and must redact sensitive data.

## Security and secrets

Never store secret values in `agent-project.yaml`, reports, handoffs, examples, or docs. Do not read `.env` or secret-bearing files without approval. Refer to secrets by variable name or secret-manager path only.

## Supported operating systems

- macOS
- Linux
- Windows through WSL documentation only

Required runtime: Git, Python 3.11+, PyYAML for initialization/config YAML behavior.

## Herdr manual-session scope

Version one supports manual Herdr layouts only, for example:

```text
Lead / Architect
Application Engineer
Quality Engineer
Platform Engineer
Production Readiness
Tests or Logs
```

Herdr does not provide model intelligence, automatic delegation, or Git isolation. Transfer outputs through stable artifacts, not full chat histories.

## Troubleshooting

- Missing PyYAML: `python -m pip install PyYAML`
- Existing generated files: initializer preserves them and refuses silent overwrite.
- Submodule customization: move project-specific changes to `agent-project.yaml`, `AGENTS.md`, `.agent-config/`, or `docs/context/`.
- Rate limits: lower model tier, narrow scope, reuse reports, avoid unnecessary specialists.

## Example setup

```bash
git clone <project>
cd <project>
git submodule add <toolkit-repository-url> agent-toolkit
python agent-toolkit/scripts/init_project.py --dry-run
python agent-toolkit/scripts/init_project.py
```

## Customization guide

Add generic reusable guidance under `agent-toolkit/` only when it benefits many projects. Add project/client specifics under initialized project files. Keep compliance overlays non-secret.

## Contribution guide

See `CONTRIBUTING.md`. Keep changes small, generic, tested, and documented. Preserve vendor boundaries.

## Versioning policy

Toolkit versions follow semantic versioning. See `VERSION` and `CHANGELOG.md`. Imported upstream skills are updated manually by maintainers, not by project update scripts.
