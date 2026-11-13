# Herdr Manual Sessions

Recommended layout:

```text
Lead / Architect
Application Engineer
Quality Engineer
Platform Engineer
Production Readiness
Tests or Logs
```

Herdr organizes terminals and can manage worktree-backed workspaces; terminal layout alone does not grant reasoning, approval enforcement or Git isolation. Pi retains task execution/budget ownership. Use approved worktrees for parallel writing and keep one owner for their capture/cleanup. Transfer state via specs, reports and handoff artifacts.

The optional Pi adapter now offers at most two on-demand, read-only `agent_inspector` views of owned tasks. These reuse across reload, do not steal focus, and closing them does not stop the worker. See [observer behavior](herdr-observers.md). Automatic independent Pi chats and workspaces remain deferred; the [cross-chat design](herdr-bounded-orchestration.md) is a proposal, not a launch grant.
