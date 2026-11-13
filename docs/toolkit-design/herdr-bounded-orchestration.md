# Bounded Herdr workspaces and Pi task chats

Status: **research and proposed design** for cross-chat/workspace orchestration, not enabled peer execution. The later visibility/on-demand observer slice is implemented separately in [Herdr observers](herdr-observers.md); shared cross-chat admission and independent Pi task chats remain deferred. The user approved investigating task-appropriate Herdr spaces and independent Pi prompts, with heavy bounds, and the earlier visibility/inspection proposals. At the time of this investigation, no workspaces, panes, worktrees, peer chats or peer prompts were launched; only this research note was added. Subsequent owned observer smoke tests are recorded separately.

## Recommendation

Keep Pi/pi-subagents responsible for native work execution and lifecycle. Use Herdr for workspace organization, on-demand inspection, and deliberately admitted independent Pi task chats. A new terminal is not a new authority or a new five-worker allowance.

Prefer headless `background_task` for ordinary tests, reviews and scoped edits. Request an inspector when a person needs visibility into an existing run. Request an independent task chat only when a separate persistent/interactive conversation materially helps the approved task. Do not create one pane per worker automatically.

## Evidence and current gaps

Checked locally: **Herdr client/server 0.9.5**, compatible protocol **22**, Pi **1.5.2**, pi-subagents **0.88.0**, toolkit adapter **0.3.1**. Sources are installed first-party CLI/skill/schema and package docs, not inferred product claims. This is an interface/design assessment, not a live topology or cross-chat verification.

| Fact | Source and consequence |
|---|---|
| Herdr can create workspaces, tabs, panes and Git-worktree-backed workspaces. | `herdr --help`, `workspace create --help`, `pane split --help`, `worktree create --help`, `worktree open --help`. The toolkit's older categorical claim that Herdr does not provide Git isolation is inaccurate for this version; the toolkit merely chose not to integrate it. |
| `agent start` starts a supported interactive agent in an existing shell pane and waits for detected readiness. It does not allocate layout. | `herdr --skill`, `herdr agent start --help`. Allocate only an owned empty pane, then verify the expected Pi occupant before prompting. |
| Herdr prompt submission and waits do not identify one exact task/turn. A timeout/stalled submission may already have delivered input. | `herdr --skill`, `herdr agent prompt --help`; schema `AgentPromptParams` and `agent_prompted` response. Never equate idle/done with an authenticated task receipt or blindly resend after timeout. |
| Pane IDs are opaque/server-scoped; moving a pane can change its workspace-qualified ID. | `herdr --skill`. Retain returned IDs, session identity and ownership; do not derive IDs from layout or names. |
| Normal pane/workspace close is not a safe task-stop protocol. CLI closes do not inherit all interactive TUI confirmation. | `herdr --skill`, `pane close --help`, `workspace close --help`. Closing a view, stopping work and deleting worktrees are separate operations. |
| Native Herdr inspectors display existing run artifacts; they are not attached child Pi sessions. Closing an inspector does not stop its run. | pi-subagents installed `docs/extension-api.md`, “Inspect integration” / “Herdr inspector plugin”. Reuse this surface instead of launching a second agent for visibility. |
| `project.open` creates an independent project Pi session whose children belong to that peer, not to the initiating lead. | pi-subagents `docs/extension-api.md`, “Project panes”. It is not a shared-budget task-chat factory or proof of inherited permissions. |
| Current toolkit limits are per lead session, not cross-process orchestration limits. | `agent-toolkit/integrations/pi/runner-config.json`, `background-task.ts`, `index.ts`. A new peer can otherwise obtain another five slots. Shared accounting is new work. |
| The upstream bridge already publishes native background counts/attention as Herdr metadata and emits `herdr:busy`; the managed Herdr Pi hook does not consume that busy event. | pi-subagents `docs/extension-api.md`, “Herdr integration”; installed `~/.pi/agent/extensions/herdr-agent-state.ts`. Do not create competing lifecycle publishers or edit the managed hook, which updates overwrite. |

Herdr's skill also requires caller context (`HERDR_ENV=1`), explicit IDs/`--current`, and `--no-focus` unless the user asks to switch. Client/server capability checks must precede reliance on a feature. Neither failed discovery nor a missing API authorizes installation, upgrade, trust acceptance or server restart.

## Three execution/view choices

| Choice | When justified | Authority and cost |
|---|---|---|
| Native background task | Independent analysis, finite tests/checks, approved isolated implementation. | Existing runner-owned job; one execution slot; deadline and native result/stop semantics. |
| Observer/inspector pane | Inspect output or progress of an already-owned run. | Zero additional worker slots, but consumes a UI pane allowance. No new model/session, no new execution grant. Built-in inspector controls retain their documented owner scope; a proposed read-only observer must be tested as actually read-only. |
| Independent Pi task chat | A persistent/interactive conversation genuinely helps a bounded task, or another approved repository requires its own context. | One execution slot from the **same** orchestration budget, even though it has a different Pi UUID. Fresh scope, verified identity and an explicit result contract. No peer delegation by default. |

Raw command panes are not a way around admission: a new command doing independent task work must be tracked and bounded too. In the initial implementation, prefer native test workers plus observer panes; do not add a second raw-command execution backend.

## Proposed defaults — approve before implementation

These are conservative design values, not installed configuration:

| Limit | Proposed value |
|---|---|
| Shared active execution slots | **5 total** across the initiating lead's native children and participating Pi task chats. A peer is not entitled to another five. |
| Open toolkit-created Pi task chats | **2**, both subject to the shared five-slot limit while executing. |
| Additional toolkit-created workspaces | **2** per approved orchestration; preserve the human's original workspace. |
| Total toolkit-created panes | **4** across those workspaces and any sibling panes in the original workspace. Workspace/tab root panes count too. |
| Observer panes | **2** within the total pane cap; reuse/focus an existing owned inspector rather than duplicate it. |
| Tabs | One per created workspace initially; additional tabs require an explicit topology expansion. |
| Startup/handshake deadline | **30 seconds**, bounded and configurable only within the approved plan. |
| Execution deadline | **10 minutes** by default, or a specific approved task deadline. A timeout requests supported cancellation; it is not proof of termination. |
| Focus | Always `--no-focus` unless requested. |
| Peer descendants | **None** initially. Both native delegation tools and managed peer-opening surfaces must reject attempts from an admitted peer. |
| Remote machines | Off initially; require a separate explicit host/repository/credentials policy and verification. |
| Relaunch after uncertain outcome | Zero automatic retries. Inspect/reconcile first; an approved retry gets a new attempt identity. |

Completed tasks can free execution capacity only after authoritative retirement evidence, while an idle retained chat still occupies its UI/chat allowance. There is no five-total-launch lifetime limit. Hitting a UI cap prompts reuse or an approved close; it does not justify silently deleting an old conversation.

## Approval without constant interruptions

Approve a bounded launch plan, not arbitrary terminal automation. The plan names canonical repositories/paths, allowed surfaces and maximum counts, task purposes, model/cost budget, permission classes, approved finite commands/write scope, deadlines, result collection and cleanup owner. The lead may generate task-specific prompts and open permitted surfaces within that grant; a verbatim approval of every harmless prompt is unnecessary.

Fresh approval is required for a new repository/machine, broader task or write scope, additional authority/tools, increased UI/model budget, trust acceptance, dependencies, secret access, Git mutations, destructive cleanup, or a change from observing work to executing new work. The user's consent to this investigation is not consent to launch an unrelated task now.

Independent chats never hijack an existing human chat, even if Herdr reports it idle. Create a fresh owned session or attach only to an explicitly designated toolkit peer. Pass a narrow brief, not the complete parent transcript or secrets. Record the exact generated prompt and its digest in an approved private artifact; keep task text out of public metadata.

## Admission and identity: required before automatic peers

The five-slot native cap cannot enforce a budget across independent Pi processes by itself. A toolkit-owned shared admission module is required before enabling automatic task chats:

1. Root lead creates an `orchestrationId` and bounded launch grant. All participating workers carry that identity; a peer cannot silently become a new root by generating another session UUID.
2. Atomically reserve a slot **before** native dispatch or peer launch. Route all participating native/peer launches through the same admission interface. Pending starts and unknown outcomes retain their claims.
3. Persist logical task/worker/attempt IDs, root owner session UUID/file, execution session UUID/file, canonical cwd/source snapshot, granted scope, deadline, native run ID if applicable, and Herdr server/session/workspace/tab/pane bindings.
4. A peer extension must start fail-closed, validate its admission grant and report its actual session identity/effective tools before accepting the task prompt. Disable peer `background_task`, native subagent launch, nested peer launch and unsupported external execution paths. Inherited environment alone is not permission proof.
5. Release only on authoritative completion/cancellation/process evidence, never on pane disappearance, an expired heartbeat, or Herdr idle. Crash/reload/resume reconciliation must prevent both leaked authority and duplicate execution.

This is admission/identity coordination, not a replacement process runner. Native lifecycle remains package-owned; Herdr topology remains Herdr-owned. An `orchestrationId` or nonce is correlation, not authentication against arbitrary trusted code with filesystem/shell access. Strong adversarial containment would need a separate OS/command policy; this design does not claim it.

### Small caller interface

Extend task dispatch with an execution/view choice and an approved launch-grant reference rather than exposing arbitrary pane commands to the model. Conceptually:

- Start a bounded task with `surface: headless | task-chat`.
- Open/reuse an inspector for an existing owned task.
- Inspect task/result state, request stop, or close an owned surface through distinct owner-checked operations.

The caller should not supply raw shell launch strings, arbitrary Pi arguments, workspace IDs to take over, or an unrestricted new-agent prompt transport. Internal native-task and Herdr-peer adapters may differ while preserving one admission/result interface. Prefer the package's public inspector/project-pane seams where they satisfy the contract; do not pretend the current project-pane API already provides task-scoped peer leases.

## Prompt delivery and results

Herdr can transport a prompt, but `agent prompt --wait` tracks lifecycle changes, not one exact turn. A peer needs an explicit handshake and task protocol:

- Verify owned pane, expected Pi occupant, exact peer session and idle/unblocked state before first submission.
- Bind one outstanding prompt to task/attempt ID and content digest. Persist dispatch intent before submission; record acceptance and completion separately.
- Have the peer integration acknowledge receipt with the same identity and publish the result through an approved artifact/owner channel. Only then treat that prompt as collected.
- If submission times out or status is unknown, preserve the reservation and reconcile. Do not paste the same prompt again just because Herdr did not return a successful wait.
- Terminal screenshots/text are useful inspection evidence, not authoritative success or authorization. A test worker finishing normally still may report failed tests.

Native `pi.events` is process-local; it does not carry this protocol between independent chats. The cross-process channel and restart reconciliation must be explicitly implemented and tested. No delivery or exactly-once guarantee is inferred from existing CLI prompt commands.

## Worktree ownership and cleanup

One writer per checkout. Give writing peers an approved managed worktree; bind Herdr views to that checkout rather than allowing both systems to independently allocate/delete it. Initially keep pi-subagents as the native worktree owner and use Herdr `worktree open` only as an approved view of an existing worktree where compatible. Opening may perform Git operations/trust checks and is not automatically a read-only operation.

A peer writer's worktree owner must be explicit before launch. The lead reviews/integrates patches; closing its chat does not merge or discard anything. Dirty/uncaptured work, unknown process state, changed ownership or missing handoff retains the worktree for reconciliation. Worktrees do not silently include the lead's uncommitted diff; choose an approved snapshot strategy.

Stop execution, close UI, and delete artifacts/checkouts are separate decisions:

- Inspector close removes the view, not the native job.
- For a peer, settle/stop its task and account for any descendants before considering closure. Project-pane `idle` close checks alone are insufficient for detached work.
- Close only resources recorded as toolkit-created and still owned by the expected session/process. Never act on an unrelated/replaced occupant, a human pane, the original workspace, or a whole workspace group by default.
- Do not auto-close retained peer conversations initially. They remain inside the two-chat/four-pane caps; request an approved close/reuse when full. Preserve Pi session/result artifacts under normal retention.
- Never kill the main Herdr process, stop its server, force trust, delete capacity/proof records, discard dirty worktrees or infer retirement from UI closure.

## Visibility and notification ownership

Reuse the existing native background metadata bridge. Each Pi session alone reports its own lifecycle; an orchestration aggregate is display-only and must not overwrite peer lifecycle authority. Start with correct shared active/attention counts and bounded summaries; the managed root dot currently follows the lead's turn rather than `herdr:busy`. Fixing that requires a supported integration/upstream change, not competing `pane.report_agent` publishers.

Notify for terminal failure, a decision requiring the human, or explicit user preference. Ordinary successful completions stay quiet. Keep detailed tool output in native/Herdr inspectors and clear live labels on retirement. An observer or child question that the lead can resolve is not automatically a human-blocked state.

## Phased implementation gates

1. **Visibility and on-demand inspection:** consume existing metadata correctly, add bounded observer reuse/ownership and failure/human-attention notifications. Verify no duplicate workers or lost native stop controls. Keep the current clean Pi footer.
2. **Shared admission:** cross-process five-slot accounting, leaf peer startup gate, scope/identity binding and crash/reload reconciliation. Prove a peer cannot obtain its own five-child allowance. No automatic peer prompts before this gate passes.
3. **One local read-only Pi task chat:** disposable repository, approved prompt, fresh session handshake, precise result collection and safe close. Preserve focus and the original workspace.
4. **Approved tests and isolated peer writing:** only after finite-command/snapshot, worktree handoff and stop/cleanup tests pass. Remote peers and recursive coordinators remain separate future proposals.

Acceptance tests must cover: five mixed native/peer executions plus rejected sixth; simultaneous admission races; no peer fan-out; dropped launch/prompt replies without duplicates; full UI caps; ready/blocked/wrong-occupant handling; deadline with unknown exit proof; root/peer crash and reload; pane move/close without false task completion; read-only observer controls; dirty worktree retention; source-diff races; metadata authority; and absence of secrets in prompts/public notifications. These tests have **not** been run by this research.

## Source index

- Installed **Herdr 0.9.5** first-party skill: `herdr --skill` (including layout, prompt-state semantics, ownership, trust and close rules).
- Installed CLI help: `herdr --help`; `workspace create --help`; `worktree create --help`; `worktree open --help`; `pane split --help`; `pane run --help`; `pane process-info --help`; `pane report-metadata --help`; `pane close --help`; `workspace close --help`; `agent start --help`; `agent prompt --help`; `agent wait --help`; `notification show --help`.
- Bundled API schema: `herdr api schema --json`, schema version 1/protocol 22; request definitions `AgentStartParams`, `AgentPromptParams`, `PaneSplitParams`, `PaneProcessInfoParams`; response `agent_prompted`.
- Installed pi-subagents **0.88.0** `docs/extension-api.md`: “In-process event-bus RPC”, “Capability ceilings”, “Inspect integration”, “Herdr integration”, “Project panes”, “Host session lifetime and completion wakes”. Public reference: <https://github.com/nicobailon/pi-subagents/blob/main/docs/extension-api.md> (installed version is authoritative for these findings).
- Installed `~/.pi/agent/extensions/herdr-agent-state.ts`: managed Pi hook, root-turn lifecycle and `herdr:blocked` handling; no `herdr:busy` listener in the inspected version.
- Toolkit: `agent-toolkit/standards/{approval-policy,delegation-policy,git-policy,secrets-policy}.md`; `agent-toolkit/integrations/pi/{index,background-task}.ts`; `runner-config.json`; `docs/toolkit-design/{architecture,herdr-manual-sessions,pi-background-agents}.md`.

A read-only background audit independently reviewed repository/package policy and reached the same key gap: existing project panes and capability ceilings do not mechanically enforce a shared cross-peer budget. Its report was returned in text; this note consolidates that audit with installed CLI/skill/schema evidence.
