# improve-codebase-architecture Adaptation

## Upstream skill name

improve-codebase-architecture

## Upstream path

`.agents/skills/improve-codebase-architecture/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/improve-codebase-architecture/SKILL.md`, hash `bce096b49db40761adb1d5348f064c303fc152e4e50fc3fd81b79df8b6cf137f`.

## Why adaptation was required

The upstream skill assumes sub-agents, writes a temporary HTML report, and opens a browser. This toolkit supports manual sessions only, requires approval before file writes or browser-opening commands, and prefers stable artifacts when results need to be reused.

## Toolkit architecture-review behavior

Use the upstream architectural vocabulary from `codebase-design`:

- module
- interface
- depth
- seam
- adapter
- leverage
- locality
- deletion test

Use this supervised process:

1. Clarify the review scope: whole repo, hot spots, recent changes, or user-named area.
2. Inspect read-only first, including project context, domain model, ADRs, and relevant history when Git policy allows.
3. Propose whether the review should be single-session or manually split into separate Pi/Codex CLI sessions.
4. Ask approval before launching separate sessions, writing reports, or opening browser windows.
5. Produce architecture candidates with files, problem, proposed direction, benefits, risks, and recommendation strength.
6. Ask which candidate to explore before designing detailed interfaces or implementation steps.

## Manual-session policy

Do not assume automatic sub-agents. If parallel exploration is useful, recommend a manual Herdr layout such as:

```text
Lead / Architect
Architecture Explorer A
Architecture Explorer B
Tests or History
```

The user chooses whether to launch those sessions and how to isolate Git work.

## Report location

For reusable reports, prefer:

```text
.agent-work/reports/YYYY-MM-DD-architecture-review.md
```

For rich HTML reports, use one of these options:

- OS temp directory for disposable exploration, only after approval
- `.agent-work/reports/architecture-review.html` for repo-local review artifacts, only after approval

Do not automatically open a browser. Provide the path and ask whether to open it.

## Candidate quality bar

Each candidate should include:

- files/modules involved
- current friction
- proposed deepening direction
- expected benefit in locality/leverage/testability
- risks and reversibility
- affected domain terms
- ADR conflicts, if any
- recommendation strength: Strong, Worth exploring, or Speculative

Do not propose broad rewrites without evidence. Prefer small architecture deepening opportunities that make future changes easier.

## Approval and safety rules

- Architecture review may inspect freely but must not edit without approval.
- Do not create diagrams, reports, or HTML files without approval unless the workflow already approved artifact creation.
- Do not open browsers or external tools without approval.
- Do not change code, dependencies, directories, tests, or ADRs as part of review unless a separate remediation/implementation phase is approved.

## Personalization hooks

Projects may define architecture review preferences in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/architecture-review.md
```

Useful preferences include preferred report format, whether HTML reports are allowed, hot-spot heuristics, diagram style, maximum candidate count, and whether to prioritize testability, speed, cost, or simplicity.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/improve-codebase-architecture/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
