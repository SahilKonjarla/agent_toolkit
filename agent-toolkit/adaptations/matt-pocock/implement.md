# implement Adaptation

## Upstream skill name

implement

## Upstream path

`.agents/skills/implement/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/implement/SKILL.md`, hash `2139cfedf24791adbc839aaab6019cff158af1e28bfead020ec6e0ce01b3e74d`.

## Why adaptation was required

The upstream skill says to commit work to the current branch. This toolkit keeps Git strategy under user control and prohibits commits, pushes, branch creation, worktree creation, merges, and PR actions unless explicitly approved.

## Toolkit implementation behavior

Use the upstream implementation discipline, especially:

- implement from an approved spec or ticket
- prefer TDD where practical
- run focused checks regularly
- run broad checks only when approved
- review the work before declaring completion

But replace the upstream commit behavior with this supervised flow:

1. Confirm there is an approved specification, ticket, bug diagnosis, or explicit implementation scope.
2. State the planned files/areas to inspect or modify.
3. Request approval before writing files if approval has not already been granted for this scope.
4. Implement in small vertical slices.
5. Add or update tests for behavioral changes.
6. Run approved validation commands.
7. Produce `agent-toolkit/contracts/implementation-report.md`.
8. Stop for user review. Do not commit unless the user separately approves a commit.

## Git behavior override

Do not perform these actions as part of implementation unless separately approved:

- create branch
- create worktree
- stage files
- commit
- push
- merge
- open or update pull request

If a commit would be useful, suggest a commit message in the implementation report instead of committing.

## Testing behavior

Use `agent-project.yaml` commands when available. If commands are unknown, inspect the repository first. Do not invent test commands. Ask before broad, slow, expensive, or potentially destructive test runs.

For TDD, agree on seams before writing tests. Prefer tests that verify behavior through public interfaces and avoid implementation-coupled assertions.

## Required implementation report

Use `agent-toolkit/contracts/implementation-report.md` and include:

- Summary
- Files changed
- Decisions made
- Commands run
- Tests run
- Deviations from specification
- Known limitations
- Open questions
- Suggested commit message, if useful

## Personalization hooks

Project-specific implementation preferences belong in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/
```

Useful customizations include preferred test commands, code style conventions, package manager, branching policy, and whether the user wants commit-message suggestions.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/implement/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
