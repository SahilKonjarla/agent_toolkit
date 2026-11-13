# Changelog

## 0.4.0

- Add on-demand `agent_inspector` read-only Herdr views, capped at two with persisted owner/task/process proof, reuse across reload, and close independent from worker execution.
- Show existing native worker summaries in Herdr; add rate-limited failure/human-dialog notifications without competing lifecycle publishers.
- Guard against unknown launch outcomes, malformed authority, terminal-control injection and non-regular/FIFO artifacts; verify owned view open/reuse/reload/close while a real worker continues.
- Keep five-worker execution unchanged and automatic peer chats/workspaces deferred. Clarify per-chat reload versus separately updating project toolkit checkouts.

## 0.3.1

- Keep one live Agent/Agents footer surface and hide duplicate persistent Async runs/FleetView rows; preserve the fleet inspector and completion history.
- Verify that the live footer segment clears when the last worker completes.

## 0.3.0

- Replace the fixed read-only runtime roster with task-defined `background_task` workers for analysis, approved shell/test work and isolated implementation.
- Permit five concurrent workers per lead session, with reusable slots and no cumulative five-launch limit. Keep each slot to one child to prevent composite/nested fan-out from multiplying the cap.
- Verify five real simultaneous test jobs, rejection of a sixth, reload recovery, capacity reuse, and an implementation patch isolated from the lead checkout.

## 0.2.1

- Add an optional Pi adapter for the pinned pi-subagents runtime, canonical read-only role registration, bounded delegation and public event-driven footer status.
- Verify native async results, reload recovery, stop/process proof, steering, worktree isolation, parallel and foreground execution, and deadlines; document the upstream pre-start stop/capacity limitation.
- Remove tracked Python bytecode and ignore generated cache/OS/runtime files.

## 0.2.0

- Add eight toolkit-owned quality skills and downstream skill sync support without modifying vendor metadata.
- Add diff-triggered logging/docs reminders and focused review selection while preserving Standards/Spec axes.
- Carry pinned targets, behavior-to-test matrices, browser QA and optional worker evidence through reports and handoffs.
- Define supervised optional delegation and document pending Pi background-runtime/fleet integration; no runner is installed automatically.

## 0.1.0

- Initial toolkit foundation.
