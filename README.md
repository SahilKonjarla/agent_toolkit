# Agent Toolkit

Reusable, project-agnostic software-delivery agent toolkit for supervised work in **Pi using OpenAI Codex models**, with optional manual use of **Codex CLI** and **Herdr**.

This repository contains both:

- Imported Matt Pocock skills under `.agents/skills/`
- Original toolkit content under `agent-toolkit/`

The toolkit is designed to be copied, submoduled, or subtree-included into future project repositories and then made project-specific through local configuration files.

## What is in this repository

```text
.
├── .agents/skills/                 # Imported upstream Matt Pocock skills; do not edit casually
├── agent-toolkit/                  # Original reusable toolkit
│   ├── agents/                     # Canonical agent role definitions
│   ├── workflows/                  # Six primary delivery workflows
│   ├── standards/                  # Safety, approval, Git, secrets, model policies
│   ├── contracts/                  # Specs, reports, handoffs, model execution plans
│   ├── templates/                  # Generated project-local files
│   ├── scripts/                    # Init, update, and skill inventory scripts
│   ├── tests/                      # Python script tests
│   ├── profiles/                   # Stack/deployment/compliance guidance overlays
│   ├── adaptations/                # Wrappers for imported skills
│   ├── examples/                   # Example generated files and workflow session
│   ├── README.md                   # Full toolkit user guide
│   ├── CONTRIBUTING.md
│   ├── CHANGELOG.md
│   └── VERSION
├── docs/toolkit-design/            # Toolkit architecture, inventory, adaptation docs
├── CODEX_BUILD_INSTRUCTIONS.md     # Original build requirements
└── skills-lock.json                # Imported skill source/hash metadata
```

## Main concepts

### Pi, Codex, Codex CLI, and Herdr

- **Pi** runs the customized agent workflows.
- **Codex models** provide reasoning and coding capability to Pi.
- **Codex CLI** can be used separately as an implementation or review worker.
- **Herdr** organizes terminal sessions and can manage worktree-backed workspaces. Pi owns native execution, budgets and task lifecycle; toolkit-created observer panes provide visibility, not extra workers. A pane alone is not Git isolation.
- **The toolkit** defines roles, standards, workflows, contracts, skills, templates, and setup behavior.

### Human-supervised by default

The toolkit defaults to supervised operation. Agents may inspect and propose freely, but approval is required before meaningful state changes such as:

- Writing files
- Moving workflow phases
- Dependency changes
- Migrations
- API/platform/infrastructure changes
- Broad tests
- Secret or `.env` access
- Git branch/worktree/commit/push/merge operations
- Remediation after reviews
- Deployments or destructive commands

See `agent-toolkit/standards/approval-policy.md`.

## Canonical agent roles

The five reusable role definitions live in `agent-toolkit/agents/`:

- `architect.md` — read-only planning, specs, model execution plans
- `application-engineer.md` — approved scoped application implementation
- `quality-engineer.md` — review, testing, bug reproduction, verification
- `platform-engineer.md` — Docker, CI/CD preparation, local environment, release mechanics
- `production-readiness-engineer.md` — read-only release readiness audit and go/no-go recommendation

## Primary workflows

The six version-one workflows live in `agent-toolkit/workflows/`:

1. `initialize-project.md`
2. `deliver-feature.md`
3. `fix-bug.md`
4. `review-change.md`
5. `platformize-project.md`
6. `prepare-production-release.md`

Users should generally invoke workflows by outcome, not by manually choosing agents.

## Toolkit-owned quality skills

Eight task skills under `agent-toolkit/skills/quality/` cover PR review, CI triage, review feedback, preview QA, async jobs, API compatibility, observability and documentation drift. See [the skill index](agent-toolkit/skills/quality/README.md). Downstream initialization/skill sync exposes them alongside imported skills without changing vendor metadata.

Implementation/review workflows now use focused review selection, diff-triggered logging/docs checks and richer evidence artifacts. [Delegation policy](agent-toolkit/standards/delegation-policy.md) defines optional background work. The [Pi runtime adapter](agent-toolkit/integrations/pi/README.md) is installed and smoke-tested locally with up to five concurrent task-defined workers, approved test/shell work, isolated implementation and event-driven footer status; see [integration evidence and limitations](docs/toolkit-design/pi-background-agents.md). Installation on other machines remains opt-in.

## Herdr visibility and project updates

The optional Pi adapter provides `agent_inspector` open/status/close for at most two owned read-only views of existing tasks, with no extra worker or focus change. Herdr's sidebar can show native worker summaries even while the lead is idle. Automatic independent Pi chats/workspaces remain deferred. See [observer behavior and verification](docs/toolkit-design/herdr-observers.md).

`/reload` affects one Pi instance. Global extensions share files, but each open chat reloads separately. Updating that runtime does not update another project's checked-in toolkit, skills or generated guidance. `update_toolkit.py` inspects/fetches only; preserve local changes and update the actual checkout separately, then synchronize skills as appropriate.

## Imported skills

Imported Matt Pocock skills are under `.agents/skills/` and are inventoried in:

```text
docs/toolkit-design/imported-skills-inventory.md
```

Do not modify imported skill files unless explicitly approved. Toolkit-specific wrappers and behavior differences are documented under:

```text
agent-toolkit/adaptations/matt-pocock/
```

## How to use this toolkit in another project

Recommended downstream usage is as a Git submodule:

```bash
git submodule add <toolkit-repository-url> agent-toolkit
git submodule update --init --recursive
python agent-toolkit/scripts/init_project.py --dry-run
python agent-toolkit/scripts/init_project.py
```

Project-specific customization should live outside the toolkit directory:

```text
agent-project.yaml
AGENTS.md
.agent-config/
docs/context/
docs/adr/
docs/specs/
docs/runbooks/
.agent-work/
```

Do **not** put client/project-specific changes inside `agent-toolkit/` if it is a submodule.

## Project initialization script

The initializer is:

```bash
python agent-toolkit/scripts/init_project.py
```

Supported modes:

```bash
python agent-toolkit/scripts/init_project.py --dry-run
python agent-toolkit/scripts/init_project.py --quick
python agent-toolkit/scripts/init_project.py --config answers.yaml
```

It creates or proposes project-local files such as:

- `agent-project.yaml`
- `AGENTS.md`
- `docs/context/PROJECT_CONTEXT.md`
- `docs/context/DOMAIN_MODEL.md`
- `docs/adr/README.md`
- `docs/specs/README.md`
- `docs/runbooks/README.md`
- `.agent-config/README.md`
- `.agent-config/overrides/`
- `.agent-work/tickets/`
- `.agent-work/reports/`
- `.agent-work/handoffs/`
- `.agent-work/temporary/`

The script preserves existing files and refuses silent overwrites. If a downstream project already has a `.gitignore`, the initializer adds an Agent Toolkit block so local/runtime agent files such as `.agent-work/` and `.agent-config/` are not accidentally tracked.

> Note: `PyYAML` is required for YAML generation/config-driven initialization.

Install if needed:

```bash
python -m pip install PyYAML
```

## Updating a downstream toolkit copy

Use:

```bash
python agent-toolkit/scripts/update_toolkit.py --check
python agent-toolkit/scripts/update_toolkit.py --dry-run
python agent-toolkit/scripts/update_toolkit.py
```

The updater:

- Detects submodule, standalone checkout, or subtree-like copy
- Reports current version/commit
- Never updates automatically
- Never commits or pushes
- Never modifies `.agents/skills/`
- Provides manual guidance when automatic handling is unsafe

## Refreshing the imported skills inventory

Use:

```bash
python agent-toolkit/scripts/inventory_skills.py
python agent-toolkit/scripts/inventory_skills.py --check
```

This scans `.agents/skills/`, finds `SKILL.md` files, and refreshes:

```text
docs/toolkit-design/imported-skills-inventory.md
```

It does not modify vendor skill files.

## Development and verification

Run script syntax checks:

```bash
python -m py_compile agent-toolkit/scripts/*.py
```

Run tests:

```bash
python -m unittest discover -s agent-toolkit/tests
```

Validate inventory:

```bash
python agent-toolkit/scripts/inventory_skills.py --check
```

Inspect toolkit update status:

```bash
python agent-toolkit/scripts/update_toolkit.py --check
```

## Current implementation status

Implemented:

- Five canonical agent definitions
- Six primary workflows
- Shared standards and contracts
- Model tier policy and model execution plan contract
- Project configuration template
- Bootstrap script
- Toolkit update script
- Skills inventory script
- Unit tests for scripts
- Imported skills inventory
- Adaptation docs
- Profiles and examples
- Toolkit README and design docs

Known limitations:

- The initializer is conservative and can be expanded with richer educational interactive prompts.
- Python YAML paths require `PyYAML` to be installed.
- Background analysis requires the optional external runtime/adapter and retains documented upstream lifecycle limitations. Deployment, user-repository Git mutations and Herdr pane creation remain approval-gated; the toolkit does not automate them.

## Security

Never store secret values in toolkit or project configuration. Do not read `.env` files without approval. Reports and handoffs must redact sensitive values and should refer to secrets only by variable name or secret-manager path.

## Version

Current toolkit version is stored in:

```text
agent-toolkit/VERSION
```

Changes are tracked in:

```text
agent-toolkit/CHANGELOG.md
```

## More documentation

Start with:

- `agent-toolkit/README.md`
- `docs/toolkit-design/architecture.md`
- `docs/toolkit-design/imported-skills-inventory.md`
- `agent-toolkit/standards/approval-policy.md`
- `agent-toolkit/templates/agent-project.yaml`
