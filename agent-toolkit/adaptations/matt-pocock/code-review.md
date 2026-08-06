# code-review Adaptation

## Upstream skill name

code-review

## Upstream path

`.agents/skills/code-review/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/code-review/SKILL.md`, hash `1d5e7242a98674635be79ab310cdda0e555d36a9903d2526ebf4263d0b7997ca`.

## Why adaptation was required

The upstream skill assumes parallel sub-agents and a tracker setup file under `docs/agents/issue-tracker.md`. This toolkit supports manual sessions, uses `agent-project.yaml` for tracking configuration, and requires review findings to use shared severity and report contracts.

## Toolkit review behavior

Use the upstream two-axis review idea:

- Standards: does the diff follow documented repository/toolkit standards?
- Spec: does the diff implement the approved spec or ticket?

But adapt it to this supervised flow:

1. Identify review scope: uncommitted diff, fixed point, commit range, branch comparison, or PR working tree.
2. Confirm the Git comparison command before relying on it.
3. Locate spec/ticket source from user-provided path, `docs/specs/`, `.agent-work/tickets/`, issue tracker configuration, or commit references.
4. Locate standards from project docs, `AGENTS.md`, `agent-project.yaml`, and `agent-toolkit/standards/`.
5. Decide whether platform or production-readiness review is relevant.
6. Produce `agent-toolkit/contracts/review-report.md`.
7. Stop for human approval before any remediation.

## Manual-session policy

Do not assume automatic parallel sub-agents. If separate review axes would help, recommend manual sessions such as:

```text
Quality Engineer — Standards Review
Quality Engineer — Spec Review
Platform Engineer — Platform Review, if relevant
Production Readiness Engineer — Release Risk Review, if relevant
```

The user decides whether to launch additional sessions.

## Severity and finding rules

Use `agent-toolkit/standards/severity-levels.md`.

Separate findings into:

- confirmed defects
- likely risks
- suggestions
- style-only observations

Style-only observations should usually be `NIT`. Do not inflate severity without evidence. For `HIGH` or `BLOCKER`, include concrete impact and validation evidence or explain what evidence is missing.

## Remediation policy

Code review is read-only by default. Do not edit files as part of review. After reporting findings, ask the user whether to remediate and which findings to address.

## Tracking mapping

When upstream instructions mention `docs/agents/issue-tracker.md`, use:

```text
agent-project.yaml tracking section
.agent-config/overrides/tracking.md
```

If no spec or tracker source exists, explicitly report that the Spec axis was skipped or limited.

## Personalization hooks

Projects may define review preferences in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/review.md
```

Useful preferences include severity calibration, maximum review length, whether to include nits, default fixed point, required evidence for blockers, and preferred branch comparison style.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/code-review/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
