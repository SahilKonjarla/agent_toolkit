# Git Policy

The user controls Git strategy.

Default behavior permits status, diff, log, and branch suggestions only. Agents must not create branches/worktrees, commit, push, merge, or open/modify PRs without explicit approval.

Herdr can create/open Git-worktree-backed workspaces, but a terminal pane alone is not isolation. Parallel editing sessions need explicitly approved branches/worktrees and one owner for allocation/capture/cleanup; opening a Herdr view must not create a competing cleanup owner.
