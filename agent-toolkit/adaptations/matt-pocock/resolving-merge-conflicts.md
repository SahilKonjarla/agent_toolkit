# resolving-merge-conflicts Adaptation

## Upstream skill name

resolving-merge-conflicts

## Upstream path

`.agents/skills/resolving-merge-conflicts/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/resolving-merge-conflicts/SKILL.md`, hash `28aad6f8b1b7025abc8892fa8890f68fe1533499b28a565f416b159131d22fad`.

## Why adaptation was required

The upstream skill says to always resolve, never abort, stage, and commit. This toolkit keeps Git strategy under user control. Merge/rebase conflict resolution can be high-risk, so resolving, aborting, staging, committing, or continuing a rebase all require explicit user approval.

## Toolkit conflict-resolution behavior

Use the upstream investigation discipline:

- inspect merge/rebase state
- inspect conflicting files
- understand both sides' intent
- preserve both intents where compatible
- avoid inventing new behavior
- validate after resolution

But use this supervised flow:

1. Inspect Git state read-only with approved-safe commands such as `git status`, `git diff`, and `git log` when permitted.
2. List conflicted files and summarize each conflict's likely intent.
3. Identify whether the operation is a merge, rebase, cherry-pick, revert, or other state.
4. Present resolution options, including risks and reversibility.
5. Ask the user whether to resolve, pause, or abort/continue using their chosen Git strategy.
6. Only edit conflict files after approval.
7. Run approved validation commands.
8. Produce a handoff or implementation report with files changed, conflicts resolved, commands run, tests run, risks, and exact next action.

## Git behavior override

Do not perform these actions unless separately approved:

- `git merge --abort`
- `git rebase --abort`
- `git rebase --continue`
- `git cherry-pick --continue`
- `git add`
- `git commit`
- `git push`
- creating branches or worktrees
- deleting files solely to resolve conflicts

If a commit is needed, suggest the command and message rather than running it.

## Resolution policy

When both sides are compatible, preserve both intents. When they conflict, explain the trade-off and ask which behavior should win unless the active merge goal makes it unambiguous.

Never resolve by blindly accepting ours/theirs across a file. If using ours/theirs for a hunk, explain why that hunk's intent should win.

## Validation policy

Discover project checks from `agent-project.yaml` and repository files. Ask before broad or expensive checks. Report commands exactly as run and include failures honestly.

## Personalization hooks

Projects may document preferred merge strategy in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/git.md
```

Examples: current-branch only, feature branches, worktrees for parallel agents, squash merges, or rebase preference.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/resolving-merge-conflicts/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
