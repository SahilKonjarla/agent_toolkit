# codebase-design Adaptation

## Upstream skill name

codebase-design

## Upstream path

`.agents/skills/codebase-design/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/codebase-design/SKILL.md`, hash `e6394592ecf4b5aa5bc93f95a20d0a56314788bde2e1221f87296d3becb734a2`.

## Why adaptation was required

The upstream skill is a useful shared vocabulary for deep modules. This adaptation binds that vocabulary to the toolkit's project context paths, approval gates, and manual-session model.

## Toolkit design vocabulary

Use upstream terms consistently:

- module
- interface
- implementation
- depth
- seam
- adapter
- leverage
- locality
- deletion test

Do not substitute vague terms when designing or reviewing code. If the project already uses terms like `component`, `service`, or `boundary`, map them carefully to the codebase-design vocabulary before making decisions.

## Context mapping

Before design work, inspect when relevant:

```text
docs/context/DOMAIN_MODEL.md
docs/context/PROJECT_CONTEXT.md
docs/adr/
```

Use domain terms from `DOMAIN_MODEL.md` to name seams and modules where appropriate. Respect ADRs; if a design would contradict an ADR, call that out before recommending it.

## Supervised design flow

1. Clarify the design question: new interface, seam placement, testability, deepening, or refactor candidate.
2. Inspect existing patterns before inventing abstractions.
3. Identify current callers, tests, adapters, invariants, and change hotspots.
4. Describe the current module/interface/seam shape.
5. Propose one or more alternatives with trade-offs.
6. Ask approval before writing ADRs, specs, code, tests, diagrams, or reports.
7. If implementation is needed, hand off to an approved workflow such as `deliver-feature`, `fix-bug`, or `platformize-project`.

## Parallel design policy

The upstream `DESIGN-IT-TWICE.md` references parallel sub-agents. In this toolkit, treat that as a manual-session recommendation. The user chooses whether to launch separate Pi/Codex CLI sessions.

Suggested manual layout:

```text
Architect — option framing
Design A — conservative/locality-first
Design B — deeper-interface/testability-first
Quality Engineer — test seam review
```

## Testability policy

The interface is the preferred test surface. If tests need to reach through an interface or mock internals heavily, report that as a design smell and consider whether the seam is wrong.

Avoid introducing seams only for hypothetical variation. One adapter means the seam may be speculative; two real adapters make it more justified.

## Artifact policy

Design notes may be captured in:

```text
docs/specs/
docs/adr/
.agent-work/reports/
```

Use ADRs only for decisions that are hard to reverse, surprising without context, and the result of a real trade-off. Do not create ADRs for routine design notes.

## Personalization hooks

Projects may define design preferences in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/codebase-design.md
```

Useful preferences include naming vocabulary, preferred seam style, testing boundaries, acceptable abstraction level, ADR threshold, and whether to prioritize simplicity, speed, type safety, performance, or testability.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/codebase-design/SKILL.md`, `DEEPENING.md`, `DESIGN-IT-TWICE.md`, or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
