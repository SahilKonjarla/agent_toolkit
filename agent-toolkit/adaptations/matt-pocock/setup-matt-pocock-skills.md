# setup-matt-pocock-skills Adaptation

## Upstream skill name

setup-matt-pocock-skills

## Upstream path

`.agents/skills/setup-matt-pocock-skills/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/setup-matt-pocock-skills/SKILL.md`, hash `f9c2b933dda18eea572e96f6ebbcd5b30e0d1bfdc074af53cc99728dc5f0bdac`.

## Why adaptation was required

The upstream skill scaffolds Matt Pocock skill assumptions directly into a repo. This toolkit has its own initializer, project configuration, context paths, approval policy, and imported-skill adaptation layer. Running both setup systems independently can create duplicate or conflicting conventions.

## Toolkit setup behavior

Prefer the toolkit initializer:

```bash
python agent-toolkit/scripts/init_project.py --dry-run
python agent-toolkit/scripts/init_project.py
```

Use upstream setup guidance only as a reference for issue tracker, triage labels, and domain-doc ideas. Do not run or follow it as the primary bootstrap flow unless the user explicitly chooses Matt Pocock's original repo layout.

## Convention mapping

Map upstream setup concepts to toolkit files:

```text
AGENTS.md / CLAUDE.md agent skills block → AGENTS.md
CONTEXT.md → docs/context/DOMAIN_MODEL.md and docs/context/PROJECT_CONTEXT.md
docs/agents/issue-tracker.md → agent-project.yaml tracking section or .agent-config/overrides/tracking.md
docs/agents/domain.md → agent-project.yaml paths + docs/context/README/context files
docs/agents/triage-labels.md → agent-project.yaml tracking or .agent-config/overrides/tracking.md
.scratch/ local issues → .agent-work/tickets/
docs/adr/ → docs/adr/
```

## Issue tracker behavior

Configure tracking in `agent-project.yaml`:

```yaml
tracking:
  provider: auto
  fallback: local_markdown
```

If using local Markdown, prefer:

```text
.agent-work/tickets/
docs/specs/
```

If using GitHub Issues, document the requirement for `gh` CLI and label conventions in `.agent-config/overrides/tracking.md` or project docs. Do not create labels, issues, or tracker configuration without approval.

## Domain docs behavior

Use the toolkit context layout:

```text
docs/context/PROJECT_CONTEXT.md
docs/context/DOMAIN_MODEL.md
docs/adr/
```

Do not create a root `CONTEXT.md` unless the user explicitly wants compatibility with upstream skills at that path.

## Approval and safety rules

- Do not modify `AGENTS.md`, tracking config, docs, labels, or issue trackers without approval.
- Do not create GitHub/GitLab issues or labels without approval.
- Do not install `gh`, `glab`, or any other tools automatically.
- Preserve existing `AGENTS.md`, `CLAUDE.md`, context docs, ADRs, and tracker docs.
- If conventions conflict, produce a proposed mapping and ask the user to choose.

## Personalization hooks

Project-specific setup preferences belong in:

```text
agent-project.yaml
AGENTS.md
.agent-config/overrides/tracking.md
.agent-config/overrides/context.md
```

Useful preferences include default tracking provider, local ticket path, issue label vocabulary, whether to support `CLAUDE.md`, and whether to maintain root `CONTEXT.md` compatibility.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/setup-matt-pocock-skills/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
