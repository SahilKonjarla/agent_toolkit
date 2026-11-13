# Pi background integration

Adapter **0.4.0**, verified locally with Pi **1.5.2** and `pi-subagents` **0.88.0**. The lead chooses independent tasks and roles as needed, with **at most five concurrent background workers per lead session**. There is no fixed specialist roster or cumulative five-launch limit.

## Task-defined dispatch

The parent calls `background_task` with:

- `role`: a short task-specific label, such as `auth-tests`, `API-compatibility` or `cache-fix`.
- `kind`: `analysis`, `tests` or `implementation` — a permission class, not a fixed specialist role.
- `task`: goal, bounded scope, approved commands/paths, source ref/snapshot, acceptance criteria, expected output and collection point.
- Optional `cwd` and `timeoutMs` (default ten minutes).

Each call registers an ephemeral worker through the runner's public API, launches one native child asynchronously and returns its job ID. The lead continues independent work, collecting results only when a later decision needs them. For example, launch approved regression tests while the lead updates unrelated documentation, or scout compatibility while the lead prepares a change.

| Kind | Child tools | Boundary |
|---|---|---|
| `analysis` | Read/search and supervisor contact | No shell or edits. |
| `tests` | Read/search, shell and supervisor contact | Exact approved finite commands; no edit/write tools. Shell is not a sandbox, so instructions/approval still matter. |
| `implementation` | Read/search, shell, edit/write and supervisor contact | Explicit write/worktree approval; mandatory managed worktree. Lead reviews/integrates the captured patch. |

Project instructions and approval/secrets/Git policies still apply. The lead may load canonical toolkit roles/skills when useful, but workers are no longer restricted to five predefined roles. Fresh context and the parent model remain defaults. Ambient extensions are disabled; no child receives nested delegation tools.

## How the five-worker ceiling works

`maxActiveAsyncRunsPerSession:5` supplies atomic native admission. A sixth occupied slot is rejected before a sixth runner starts. Completion with observed process retirement releases a slot for a later task; there is no cumulative session launch cap.

Each top-level slot admits **one child** (`maxSubagentSpawnsPerRun:1`, depth one). Model-driven composites, counted launches and retained resumption are blocked, and model-driven native async calls are redirected to `background_task` so permission kinds and implementation isolation cannot be skipped. Use separate calls for independent jobs instead of five workflows that could each spawn five children.

The profile's `globalConcurrencyLimit:1` is intentionally per run, not the overall limit. The overall limit is five simultaneous single-child runs. Foreground `subagent` calls remain an explicit `async:false` opt-out. Trusted external extensions using raw RPC must honor this profile; this is not a security boundary against arbitrary trusted code changing configuration or granting itself extra authority. The cap is per lead session, not a machine-wide limit across unrelated Pi sessions.

## Tests, snapshots and editing

Provide the exact approved test commands and identify what source they validate. Running tests against the lead's live checkout can race ongoing edits or generate files; report this evidence limitation, or use an approved stable snapshot/worktree. Test execution does not authorize fixes. Long-running servers/watchers are not finite tests.

Implementation starts from a clean source checkout in a managed worktree. A dirty source blocks native worktree allocation: do not commit/stash automatically or pretend current uncommitted changes are included. Ask for an approved snapshot strategy when a worker needs them. The lead reviews the saved patch/handoff and integrates deliberately; workers do not merge their own results.

## UI and results

`/subagents-fleet` provides native transcripts, model info, steering and stop controls. Native completion notices return results and surface failures. `subagent` status/control actions remain available. A retry is a fresh scoped task after inspecting failure/partial work, not an automatic duplicate dispatch.

Public RPC events drive `toolkit:agents-status:v1`; the separate local `~/code/pi-extensions/footer/` consumer shows `Agent`/`Agents`, active count, short role and elapsed time, with details yielding to warnings at narrow widths. The live agent segment disappears when active/attention counts reach zero. `fleetView:false` and `asyncWidget:false` hide duplicate persistent runner rows such as `Async runs`; `/subagents-fleet` and completion history remain available. No tasks or transcripts enter the footer, and no private runner files are scraped. The lead checks pinned refs and marks stale evidence; the public fleet DTO does not carry reviewed refs.

## Herdr visibility and on-demand inspection

`agent_inspector` accepts `action:open|status|close` and an exact owned task ID for open/close. At most two read-only viewers are reserved per owning chat/server. Opens use the caller pane and `--no-focus`; repeated opens reuse the same verified viewer, including after reload. Closing a view does not stop its worker. Task/nonce/receipt, terminal identity, foreground PID and process-start identity must agree; unknown launches or changed occupants fail closed.

The viewer displays documented public native status/output artifacts only. It cannot execute, steer or stop tasks. File reads are bounded/non-blocking and reject non-regular files; terminal control sequences are removed. Native fleet/history remains available for controls. Model-driven native inspector open/close calls are redirected to the bounded tool; manual human panes remain outside its cap.

Herdr's sidebar can display the existing native `$summary` token, including active worker labels while the lead is idle. Generic, rate-limited failure and real human-input-dialog notifications complement that display; ordinary successful completions stay quiet. The managed Herdr Pi lifecycle hook is unchanged. Independent Pi chats/workspaces remain deferred. See [setup, safety limits and live evidence](../../../docs/toolkit-design/herdr-observers.md).

## Installation and activation

```bash
pi install npm:pi-subagents@0.88.0
pi install /absolute/path/to/agent_toolkit/agent-toolkit/integrations/pi
```

Merge `runner-config.json` into `~/.pi/agent/extensions/subagent/config.json`, preserving unrelated existing settings. Merge these user settings into `~/.pi/agent/settings.json`:

```json
{ "subagents": { "defaultExtensions": [], "defaultModel": "inherit", "defaultThinking": "low" } }
```

The current machine is already configured. Moving the checkout breaks the installed local adapter path. After this adapter/config update, run **`/reload` in each open Pi chat**; it does not broadcast to other instances. A project's separate toolkit checkout/skills/guidance still needs its own deliberate update, and `update_toolkit.py` inspects/fetches rather than applying upgrades. If the new `background_task` tool is missing in an old recorded session, restart Pi, resume it and `/reload`. Upstream compiled-package upgrades require restart.

## Verification

```bash
cd agent-toolkit/integrations/pi
npm test
node verify-runtime.mjs --live
```

Tests use the current managed Pi install; set `PI_NODE_MODULES` for another layout. `node verify-herdr.mjs --live` separately authorizes one no-focus observer and a finite fixture worker inside Herdr, verifying view reuse, reload recovery and close without stopping execution. The opt-in live smoke uses existing authentication and the approved `PI_PROVIDER`/`PI_MODEL`, finite fixture commands and disposable Git/worktree edits. It verifies five simultaneous task-defined test workers, rejection of a sixth, reload survival, actual unittest output, tool restrictions, slot reuse beyond five total launches, and isolated implementation with a captured patch. Reports are retained in the private temporary fixture. See [evidence](../../../docs/toolkit-design/pi-background-verification.md).

## Known upstream limitation and rollback

In 0.88.0, stopping before initialization or using a deadline shorter than startup can persist `process-terminal:unknown` (`writer-close-unverified`) and retain a capacity slot. Do not delete proof/capacity files or widen limits to fabricate cleanup. Inspect the run, use a fresh independent session if necessary, or apply a separately reviewed upstream fix. Active-child stop was separately verified with observed exit proof in the earlier smoke.

Before uninstalling, stop or collect outstanding work. Use `pi remove` for this local adapter and, if no other setup needs it, `npm:pi-subagents@0.88.0`; review/revert only settings added here and restart Pi. Removing the adapter removes its tool ceiling and model-call policy too. No CI, doctor command or skill-evaluation suite is added by this integration.
