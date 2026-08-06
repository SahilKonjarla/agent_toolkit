# domain-modeling Adaptation

## Upstream skill name

domain-modeling

## Upstream path

`.agents/skills/domain-modeling/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/domain-modeling/SKILL.md`, hash `363cb0f53b0b431e7c00086ad1f823500b7e1b70b5616ee969c979f0934e9e6e`.

## Why adaptation was required

The upstream skill assumes a root `CONTEXT.md` for domain glossary and context. This toolkit separates stable project context from domain terminology and uses generated project-local documentation paths.

## Toolkit context mapping

When upstream instructions mention `CONTEXT.md`, use this mapping unless the project defines a different one in `agent-project.yaml`:

```text
CONTEXT.md glossary/domain terms → docs/context/DOMAIN_MODEL.md
CONTEXT.md broader project context → docs/context/PROJECT_CONTEXT.md
ADRs → docs/adr/
```

The default project configuration paths are:

```yaml
paths:
  context: docs/context/PROJECT_CONTEXT.md
  domain_model: docs/context/DOMAIN_MODEL.md
  adr: docs/adr
```

## Domain model behavior

Use `docs/context/DOMAIN_MODEL.md` for:

- canonical terms
- glossary entries
- domain relationships
- business rules expressed without implementation details
- ambiguous or overloaded terminology that has been resolved

Do not turn the domain model into:

- an implementation spec
- a scratchpad
- a task list
- a code architecture document
- a place for secrets or environment details

## Project context behavior

Use `docs/context/PROJECT_CONTEXT.md` for:

- repository purpose
- high-level architecture summary
- important integrations by name only
- operating constraints
- known non-secret project conventions
- links to specs, ADRs, runbooks, or external docs

Do not store credentials, account IDs, private customer data, or `.env` values.

## ADR behavior

Use `docs/adr/` for decisions that are hard to reverse, surprising without context, and the result of a real trade-off. Do not create ADRs for routine implementation details.

## Approval and write rules

- Domain/context updates are file writes and require approval unless the active workflow already approved those artifacts.
- Before writing, state the exact terms or decisions being added and which files will change.
- Prefer small, immediate updates when terminology is resolved.
- If a term is still ambiguous, record it as an open question in the active spec/report instead of canonizing it.

## Personalization hooks

Projects may override paths in `agent-project.yaml`. Personal terminology preferences or glossary style can be documented in `.agent-config/overrides/`, but the canonical project-wide terms should live in `docs/context/DOMAIN_MODEL.md`.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/domain-modeling/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
