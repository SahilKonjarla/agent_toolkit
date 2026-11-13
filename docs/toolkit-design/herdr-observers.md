# Herdr visibility and bounded observers

Status: implemented in adapter **0.4.0**, locally verified with **Herdr 0.9.5 / Pi 1.5.2 / pi-subagents 0.88.0** on macOS. Native task execution still uses the existing five-worker budget. Independent Pi chats, new workspaces and cross-chat orchestration remain deferred.

## Visibility without another lifecycle publisher

The upstream subagent bridge already publishes active worker counts and task-agent labels through Herdr metadata. The local sidebar now includes that summary:

```toml
[ui.sidebar.agents]
rows = [["state_icon", "workspace", "tab"], ["agent", "$summary"]]
```

This was merged into the current machine's Herdr config and applied with `herdr server reload-config`, which returned `status:applied` with no diagnostics. An actual active worker appeared in `herdr agent get <caller-pane>` as a summary token and state labels for working/idle/done. Therefore background work stays visible even when the lead's current turn is idle.

The lifecycle dot still represents the owning Pi session's turn; it is not falsely overwritten as aggregate working. The managed Herdr Pi integration remains untouched. Herdr notifications are generic and rate-limited for explicit native worker failures and actual Pi human-input dialogs. Ordinary success, intentional stops and generic worker attention do not trigger notifications. Plain prose questions without a Pi dialog hook are not automatically classified as blocked. Task prompts, logs and error bodies never enter notification text.

## Public tool

Use `agent_inspector`:

- `{ action: "open", id: "<exact-task-id>" }`: open or reuse a read-only viewer of a task dispatched by this toolkit session.
- `{ action: "status" }`: list owned viewer states and the two-view limit.
- `{ action: "close", id: "<exact-task-id>" }`: close only a verified owned viewer; the worker is not stopped.

The tool takes no arbitrary command, artifact path, pane ID, prompt or workspace argument. Model-driven native `inspector.open/close` is redirected to this policy; native fleet/history and status/command inspection remain available. Explicit human use of Herdr or the native Fleet UI is outside this automated two-view cap.

## Why a small read-only viewer

The installed runner exposes public inspector-provider registration and model-facing inspector actions, but no public lifecycle client with structured pane/open/reuse receipts. Its built-in inspector can also expose steering/stop controls. We do not import private dispatcher/binding modules or parse lifecycle prose to claim ownership.

Instead, `observer-view.mjs` only displays the runner's documented public `status.json` and bounded tail of `output-0.log`. It cannot launch a worker, steer, stop or submit a prompt. Terminal control sequences from logs are removed. Artifact/manifest/receipt reads are bounded, no-follow and non-blocking; FIFO/non-regular files cannot wedge the viewer before its type check. It polls these public artifacts once per second; the Pi footer and sidebar continue to use event-driven public status, not private-file scraping. q/Ctrl+C exits the viewer, never the worker.

This is an observer process, not another execution backend or a separate agent chat.

## Bounds and ownership

- At most **two** toolkit-owned view reservations per owning Pi session/server endpoint, including pending or unknown starts.
- Opens target the explicit caller pane with `--no-focus`; no workspace or agent is created.
- Reopening the same task reuses its verified viewer, including after `/reload`.
- Only exact IDs registered from successful native dispatch receipts are accepted. Task ownership is checked against native status/session identity; remembered task metadata is bounded to 100 entries, preserving viewed tasks.
- Reservations are persisted **before** topology mutations. Operations are serialized with a private manifest and an exclusive operation lock. Unknown/malformed state fails closed.
- A viewer must return its random-token handshake and be the pane's exact foreground PID. The binding also records terminal identity, process start time and the expected viewer argv identity. Every reuse/close rechecks the token-bound receipt against that process. Persisted entries are schema-validated before granting close authority; receipt tokens are confined UUIDs. Changed, missing or unverifiable occupants are not automatically closed/reused.
- Closing a view never invokes native worker stop. Execution state, view state and artifact retention are separate.
- Pane closure is checked afterward; externally confirmed closed panes can free view capacity. Unknown command outcomes retain reservations. No automatic close on worker completion, artifact deletion, server stop or dirty-worktree cleanup.

Private state lives under `~/.pi/agent/toolkit-observers/<session-uuid>/`, with owner-only directory/file modes. Task/session/server identity binds reload recovery. The registry is trusted local state, not authentication against arbitrary trusted code or an OS sandbox. Process/pane checks are point-in-time checks: Herdr has no atomic compare-occupant-and-close command in the inspected interface. Avoid repurposing a toolkit view concurrently with a close request; an observed ownership change blocks the operation.

If q/Ctrl+C exits a viewer but leaves its shell pane, the toolkit will not close that now-unverified occupant automatically. Close it manually in Herdr; the next owner-scoped operation can reclaim its confirmed-missing pane reservation. A lock left by a crashed operation or an unidentified pending pane needs deliberate reconciliation, not deletion of records to manufacture proof.

## Lost acknowledgement recovery

Herdr `pane run` can return a successful plain-text/empty acknowledgement. That is admission, not proof of execution. The observer requires its own receipt plus matching terminal/process identity.

The live smoke exposed this distinction. An initial command had already started its viewer before the response parser rejected the acknowledgement. Its reservation was preserved. After correcting the contract, the toolkit verified the existing token/foreground process, reused it without redispatching, and closed only that owned pane. No unrelated panes or native job artifacts were removed.

## Verification evidence

```bash
cd agent-toolkit/integrations/pi
npm test
node verify-herdr.mjs --live
```

The opt-in live probe requires Herdr caller context and normal existing model authentication. It authorizes one view, one finite fixture test worker and owner-checked cleanup. The disposable SDK parent suppresses its own upstream metadata bridge so it cannot overwrite the real caller chat's Herdr summary.

Successful probe: `/tmp/toolkit-herdr-verification.log`, private fixture `toolkit-herdr-smoke-Mfxdpn/verification.json`:

| Check | Observed |
|---|---|
| No-focus open/reuse | One pane `wA:p5` bound to task `ec5460d7-d042-44ae-9c38-88e8586c12d8`, then reused. |
| Reload | Ownership/status remained verified after replacing the extension runtime. |
| Close | The pane closed while native worker status remained `running`. |
| Result | Worker later completed and emitted `OBSERVER_WORKER_OK`. |
| Config | Herdr config reload returned no diagnostics; an active real worker's summary was visible in its owning pane metadata. |

Final local checks passed: **26 Python tests, 23 adapter tests and 15 footer tests (64 total)**, Python script compilation, and `git diff --check`. Logs are `/tmp/toolkit-final-python.log`, `/tmp/toolkit-final-adapter.log` and `/tmp/toolkit-final-footer.log`.

An independent read-only safety pass identified malformed persisted authority and blocking FIFO opens; both received failing regression tests before correction. Strict entry/receipt/process validation and non-blocking regular-file reads now pass those regressions. The post-fix live probe above passed too.

Automated tests exercise the public manager/tool behavior with a fake external Herdr host, real private-state files and real viewer rendering: reuse, two-view cap, reload persistence, foreign task rejection, changed occupants, malformed/prototype-shaped authority, terminal-sequence removal, forged receipt/process rejection, FIFO rejection, lost-reply reconciliation, and notification filtering. They do not establish atomic control against a human concurrently replacing terminal occupants. No peer chats/workspaces or cross-process worker budget was enabled or tested.

## Reload versus project updates

`/reload` applies only to the Pi instance where it runs. Global extensions/local packages are shared source files, but each already-open chat must reload separately. Herdr sidebar configuration is server configuration; it uses Herdr's config reload, not Pi `/reload`.

An older toolkit checkout inside another project is separate. Updating a global Pi adapter does not update that project's Markdown roles/workflows, generated guidance or skill links. The updater script inspects/fetches; it does not apply an upgrade or overwrite project-owned files. Preserve local modifications, publish/select the desired toolkit revision, update that checkout through its actual Git layout, then run the updated skill-sync script if appropriate. Existing generated guidance needs a deliberate merge rather than blind replacement.
