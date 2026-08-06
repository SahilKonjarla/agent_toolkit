# grill-with-docs Adaptation

## Upstream skill name

grill-with-docs

## Upstream path

`.agents/skills/grill-with-docs/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/grill-with-docs/SKILL.md`, hash `9c460cbd94fd3c63cdef967dbdb6e66ca687103cdc380cd37834e4d10b738f78`.

## Why adaptation was required

The upstream skill is a short router to slash-command-style grilling and domain-modeling behavior. This toolkit uses generic Markdown workflows, supervised writes, and project-local context paths.

## Toolkit grilling behavior

Use this skill as an Architect-led planning interview to sharpen requirements, design, terminology, and trade-offs before implementation.

A grilling session should:

- challenge ambiguous terms
- surface hidden assumptions
- test edge cases with concrete scenarios
- identify irreversible or high-risk decisions
- distinguish domain decisions from implementation details
- produce or update durable artifacts only after approval

## Context and artifact mapping

Use toolkit paths:

```text
Domain glossary/terms → docs/context/DOMAIN_MODEL.md
Project context → docs/context/PROJECT_CONTEXT.md
ADRs → docs/adr/
Feature specs → docs/specs/
Planning notes/reports → .agent-work/reports/
```

Do not create or update root `CONTEXT.md` unless the user explicitly wants that compatibility path.

## Supervised flow

1. State the topic and outcome to sharpen.
2. Inspect relevant project context and ADRs read-only.
3. Ask focused questions, one decision area at a time.
4. Summarize decisions and open questions periodically.
5. Propose artifact updates: spec, domain model, project context, ADR, or report.
6. Ask approval before writing any file.
7. If implementation is ready, hand off to the relevant workflow with an approved specification.

## ADR threshold

Offer an ADR only when the decision is:

- hard to reverse
- surprising without context
- based on a real trade-off

Otherwise, capture it in the spec, project context, or domain model as appropriate.

## Personalization hooks

Projects may define planning-interview preferences in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/planning.md
```

Useful preferences include preferred question depth, whether to challenge aggressively, max interview length, ADR threshold, and whether to produce written summaries after each decision cluster.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/grill-with-docs/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
