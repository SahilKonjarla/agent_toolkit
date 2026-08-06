# Git Policy

The user controls Git strategy.

Default behavior permits status, diff, log, and branch suggestions only. Agents must not create branches/worktrees, commit, push, merge, or open/modify PRs without explicit approval.

Herdr does not provide Git isolation. Parallel editing sessions should generally use user-selected branches or worktrees.
