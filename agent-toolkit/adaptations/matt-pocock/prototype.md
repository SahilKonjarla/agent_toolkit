# prototype Adaptation

## Upstream skill name

prototype

## Upstream path

`.agents/skills/prototype/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/prototype/SKILL.md`, hash `73862de6cd32acf30799bfb2220357b96c1a58ab0e3d01126b769fd659d6555a`.

## Why adaptation was required

The upstream skill supports throwaway prototypes and mentions branch/commit capture. This toolkit requires approval before file writes and Git operations, and it separates temporary work from durable project artifacts.

## Toolkit prototype behavior

Use prototypes to answer a specific design question, not to sneak production implementation into the repository.

Before writing prototype code, state:

- the question the prototype will answer
- whether it is a logic/state prototype or UI prototype
- proposed file location
- how to run or view it
- how it will be removed or promoted later
- risks, including persistence, security, or user-data risks

Then ask approval before creating files.

## Prototype locations

Preferred temporary location:

```text
.agent-work/temporary/prototypes/<topic>/
```

A prototype may live near production code only when proximity materially improves evaluation and the user approves that placement.

All prototype files should be clearly marked:

```text
PROTOTYPE — not production code
```

## Git behavior override

Do not create throwaway branches, stage, commit, push, or open PRs unless separately approved.

If preserving the prototype is useful, recommend one of these options and wait for user choice:

1. keep it temporarily under `.agent-work/temporary/prototypes/`
2. summarize the decision into a spec/ADR and delete the prototype
3. promote selected behavior into production code through an approved implementation workflow
4. create a user-approved branch/worktree for prototype preservation

## Persistence and secrets rules

- No production data.
- No real credentials.
- No `.env` access without approval.
- No external writes unless explicitly approved.
- Use in-memory or local disposable state by default.
- Clearly label scratch databases/files as disposable.

## Validation and handoff

A prototype is complete when it answers the question or proves that the question cannot be answered cheaply. Produce a short report containing:

- question answered
- files created
- how to run/view it
- observed result
- recommendation: discard, iterate, document, or implement
- cleanup instructions

If decisions are validated, capture them in `docs/specs/`, `docs/adr/`, or the active feature specification rather than relying on prototype code as the only record.

## Personalization hooks

Projects may define prototype preferences in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/prototypes.md
```

Useful preferences include allowed prototype directories, preferred UI demo route conventions, screenshot expectations, max prototype lifetime, and cleanup policy.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/prototype/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
