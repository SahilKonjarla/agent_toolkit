# Delegation Policy

## Availability and approval

Delegation is an optional execution strategy, not a dependency of any workflow. The lead checks the installed runtime, supported tools, permissions and approved model/session budget before launching workers. This toolkit does not install or implement a runner. Use `docs/toolkit-design/pi-background-agents.md` in the toolkit checkout for the runtime acceptance checklist.

When asynchronous delegation is available and covered by the approved plan, automatically delegate independent, bounded work with a clear output. Keep small edits and coupled decisions in the lead session. An explicit foreground request or per-task opt-out takes precedence. Without a compatible runner or launch approval, run sequentially or propose manual sessions; report which mode was actually used.

## Dispatch contract

Before dispatch, give each worker:

- Task, role and bounded scope; excluded actions and approval limits.
- Repository and pinned ref/diff snapshot; relevant paths and spec/acceptance criteria.
- Required output contract and artifact location (saving requires approval).
- Model capability tier, deadline and result-collection decision point.

Start with fresh context; share parent context only when needed and within the approved information scope. Default to at most **two active children** within the approved budget. Only the lead delegates; children return results instead of launching more workers. Use economical discovery and deeper reasoning only where warranted by risk.

Analysis workers receive read/search tools by default. Shell commands, writes, tests, network side effects, worktree creation and access to secrets remain subject to existing approval policy; delegating does not grant permission. Use a separately approved worktree for each writing worker. The lead reviews patches and integrates deliberately; workers do not merge or overwrite each other's edits.

## Async lifecycle

Eligible background dispatch returns a job ID immediately so the lead can continue independent work. Track queued → running → completed/failed/canceled with elapsed time and deadline. If the runner blocks until completion, report foreground behavior rather than calling it asynchronous.

Collect results at the next decision that needs them. Discovery or regression scouting may start early; final review uses the finished pinned diff. Recheck the reviewed target before accepting a result. An old-ref result is stale until its findings are reconciled with the new diff.

Expose failures and cancellations with a short reason. At deadline, request cancellation through the supported runner and confirm terminal state; if cancellation is unavailable or unconfirmed, report the job as outstanding rather than canceled. Retry one failed worker only within approval and cost limits. Otherwise proceed only with a clearly named evidence gap. The lead remains accountable for reconciling findings and reporting actual validation.

## Evidence and value

Use the optional worker tables in review/handoff contracts: job ID, role/task, mode, model tier, pinned target, start/end/elapsed time, terminal state, report path, validation, staleness and decision impact. Report outstanding jobs before handoff; identify who will collect or stop them.

For repeated comparable tasks, compare runs with and without the specialist. Record whether it changed a decision or caught a regression. Narrow triggers when a worker duplicates the lead or becomes the longest wait on small changes. These records are task artifacts, not a new telemetry service.
