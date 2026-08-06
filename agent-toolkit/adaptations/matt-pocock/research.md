# research Adaptation

## Upstream skill name

research

## Upstream path

`.agents/skills/research/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/research/SKILL.md`, hash `bd3e2c6826671d82c86ed0da3dac3370ebcf63b0fe847f91bb444e1fb7dac21b`.

## Why adaptation was required

The upstream skill assumes a background agent can be spawned and that research findings are written into the repository. Version one of this toolkit supports manually launched sessions only and requires approval before file writes.

## Toolkit research behavior

Use the upstream research quality bar:

- prefer primary sources
- cite claims
- distinguish facts from interpretation
- save durable findings when approved

But adapt execution to supervised/manual operation:

1. Clarify the research question and intended use.
2. Identify whether research is needed or whether repository inspection is enough.
3. Propose scope, sources, model tier, expected artifact path, and cost/rate-limit impact.
4. Ask approval before launching a separate Codex CLI/Pi session or writing a research file.
5. Research from primary sources where available: official docs, source code, specs, standards, first-party APIs, release notes.
6. Record citations for each material claim.
7. Produce a concise Markdown research report or inline summary, depending on approval and workflow needs.

## Manual-session policy

Do not assume automatic background agents. If parallel research would help, recommend a manual session such as:

```text
Herdr pane: Research
Role: Research / Architect support
Artifact: .agent-work/reports/YYYY-MM-DD-<topic>-research.md
```

The user decides whether to launch that session.

## Artifact locations

Preferred repo-local research artifact path:

```text
.agent-work/reports/YYYY-MM-DD-<topic>-research.md
```

If the research becomes durable project context, summarize the stable conclusions into one of:

```text
docs/context/PROJECT_CONTEXT.md
docs/adr/
docs/specs/
docs/runbooks/
```

Do not put raw research dumps into long-lived context files.

## Source quality rules

Prefer:

- official documentation
- source repositories
- specifications/RFCs
- first-party API references
- release notes/changelogs

Treat blogs, forum posts, generated answers, Stack Overflow, and third-party tutorials as secondary sources unless they point to primary evidence.

## Approval and safety rules

- Ask before writing research files.
- Ask before broad web/API work that may have billing, rate-limit, or authentication implications.
- Do not access private dashboards, accounts, `.env`, credentials, or secret-bearing docs without approval.
- Redact sensitive data in reports.
- Do not commit or push research artifacts unless separately approved.

## Personalization hooks

Projects may define preferred research destinations and citation style in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/research.md
```

Useful preferences include trusted source lists, citation format, max report length, and whether research artifacts should usually be temporary or durable.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/research/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
