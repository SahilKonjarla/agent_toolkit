# Agent Toolkit improvements

This is a research and design reference for [agent_toolkit](https://github.com/SahilKonjarla/agent_toolkit). It describes proposed behavior and skills. The repository currently provides five Markdown roles, six supervised delivery workflows, shared standards and report contracts, a FastAPI stack profile, and imported Matt Pocock skills. Pi is the primary runtime, Codex CLI is an optional worker, and Herdr is used for manual terminal sessions.

## Implementation status

The design sections below retain the original proposals. Toolkit release **0.3.0** includes the repository-side pieces and an optional locally verified Pi background adapter:

| Area | Status and source |
|---|---|
| Footer modernization | Implemented in the separate local `~/code/pi-extensions/` project; renderer tests pass, live visual confirmation remains a user check. |
| Eight task skills | Added under [agent-toolkit/skills/quality/](agent-toolkit/skills/quality/README.md); downstream initialization/skill sync exposes them alongside imports. Live GitHub/browser execution still requires tools, access and approved actions. |
| Focused reviews | [Specialist selection](agent-toolkit/standards/review-specialists.md) wired into review, feature and bug workflows; Standards/Spec axes preserved. |
| Logging/docs reminders | Added to [engineering principles](agent-toolkit/standards/engineering-principles.md) and implementation/review artifacts. |
| Cross-skill artifacts | Review, implementation and handoff contracts carry pinned targets, test matrices, browser evidence and optional worker evidence. |
| Background delegation policy | [Policy and dispatch/evidence rules](agent-toolkit/standards/delegation-policy.md) added; compatible external execution remains optional. |
| Background runtime and fleet/footer job UI | Installed locally: Pi 1.5.2 + pi-subagents 0.88.0 + [task-defined adapter](agent-toolkit/integrations/pi/README.md). Up to five concurrent workers, chosen as needed, can inspect, run approved tests/commands, or implement in isolated worktrees. Live checks verified five simultaneous test jobs, sixth-job rejection, slot reuse and an isolated implementation patch. Public job status is connected to the local footer; see [evidence and limitations](docs/toolkit-design/pi-background-verification.md). Visual acceptance remains a user check. |
| Delegation value tracking | Optional worker evidence/decision-impact fields added; no comparative run data collected yet. |

Imported `.agents/skills/` sources and vendor lock metadata remain unchanged. The task skills remain toolkit-owned guidance, not GitHub/browser tool implementations. The optional runtime adapter uses external public APIs rather than implementing a new runner. Tracked Python bytecode has also been removed, with cache/OS/runtime ignore rules added.

## Background agents in Pi

The toolkit's existing roles and workflows define the work. [pi-subagents](https://github.com/nicobailon/pi-subagents) is a candidate runtime for executing that work. It supports Markdown agent definitions, background jobs, a live fleet view, and managed worktrees. The upstream Pi subagent example is a smaller reference for how to launch children, but its parallel tool call waits for results before returning. A custom runner would mean owning cancellation, lifecycle state, result delivery, and compatibility with Pi.

Background delegation has two defaults that are worth tuning independently.

| Decision | Suggested default |
|---|---|
| When to delegate | Automatically delegate independent, bounded work with a clear output. Keep small edits and tightly coupled decisions in the lead session. |
| How to run it | Start eligible workers asynchronously, return a job ID immediately, and let Pi continue until it needs their results. Allow an explicit foreground run or a per-task opt-out. |
| When to collect | Collect at the next decision that uses the result. A final PR review should use the finished diff, while a regression scout can work from the issue and affected paths earlier. |
| Context | Start with fresh context. Pass the task, scope, repo/ref, relevant paths, acceptance criteria, and expected output. Share a parent session only when the task needs that context. |
| Fan-out | At most five concurrent background workers per lead session, with roles/tasks chosen as needed rather than a fixed roster. Each slot starts one child; only the lead delegates. Pick model tiers by task, with a lighter model for discovery and deeper reasoning for difficult reviews. |
| Permissions | Give analysis workers read/search tools. Keep shell, writes, worktree creation, tests, and other actions subject to the toolkit's existing approvals. |
| Parallel editing | Use an approved, separate worktree per writing worker. Have the lead review patches and integrate them deliberately. |
| Failure and cancellation | Show failures and cancellations in Pi. Let the lead retry one worker or proceed with a clearly stated evidence gap. Set a deadline for each job. |

Installing an extension makes delegation available. Project instructions determine when Pi should use it. The extension documents background defaults for workflow calls and a stronger `forceTopLevelAsync` setting that also suppresses its launch clarification. Explicit async dispatch or workflow defaults fit a supervised setup where launch clarification can still matter. Verify behavior against the installed Pi and extension versions. [Background configuration](https://github.com/nicobailon/pi-subagents/blob/main/docs/configuration.md) · [Workflow execution and worktrees](https://github.com/nicobailon/pi-subagents/blob/main/docs/workflows.md)

A typical feature run could start an Architect to check compatibility and a Quality Engineer to map regression cases while the lead prepares or implements the approved change. Once the diff is stable, a fresh reviewer checks that exact version. The lead reconciles findings and reports which checks actually ran.

## Pi interface for agents

Use the extension's existing fleet view for detailed inspection. Add a compact project-aware status to the existing Pi footer if the extension can supply the needed job state through a supported interface. The footer examples and layout below are proposed behavior.

| Surface | Information or action |
|---|---|
| Footer | Show the active count, a short role label, and elapsed time. For example, **Agents 2 running · QA 42s · Architect 18s**. Leave the footer quiet when no jobs need attention. |
| Fleet inspector | Show role, task, state, elapsed time, reviewed ref, and model tier. Select a job to inspect its transcript or result. Use the existing inspector's stop and steering controls where supported. |
| Completion notice | Show a short result when a job finishes, with a way to inspect the report. Group completions when several workers finish together. |
| Failure or cancellation | Show a short reason and whether the lead still needs the result. Expose an explicit retry for failures where restarting the job is appropriate. |
| Handoff | Keep the job ID, reviewed ref, findings, and validation evidence in the existing handoff or review artifact when another session needs them. |

The job lifecycle should be legible from queued through running to completed, failed, or canceled. If a worker reviewed an older commit, label the result with that commit and show that it may be stale. Keep detailed tool output in the inspector so the footer can still display branch, model, and context usage. Herdr remains useful for manually opening and arranging independent terminal sessions. [Fleet view and background jobs](https://github.com/nicobailon/pi-subagents) · [Extension integration reference](https://github.com/nicobailon/pi-subagents/blob/main/docs/extension-api.md)

### Modernize the existing footer before adding more status

The screenshots supplied on November 10, 2026 (`Screenshot 2026-11-10 at 8.32.47 PM.png` and `Screenshot 2026-11-10 at 8.32.58 PM.png`) showed that the footer needed a visual cleanup. The modernization pass has since been implemented in the separate local extension project; the points below preserve the design intent. Background-job status is now connected through the optional local runtime adapter; terminal appearance remains a user check.

- **Readable repository and branch state:** Some symbols next to the branch look like boxed question marks, and the adjacent counts or markers are hard to interpret. Check glyph rendering and provide readable fallbacks rather than relying on special fonts.
- **Clearer hierarchy:** Repository, branch, model, reasoning level, and context usage currently read as one dense strip separated by pipes. Use consistent spacing and grouping so the important state is easy to scan.
- **Quieter context display:** The context bar is visually prominent even at low usage. Consider a compact percentage by default, with stronger emphasis only as capacity becomes constrained. Keep warnings such as `compact soon` clear without crowding the rest of the footer.
- **Responsive layout:** Define which fields shorten or disappear at narrower terminal widths. Avoid clipping useful information or letting a long model name or context bar consume space needed for status.
- **Integrate agent status into the cleanup:** Do not simply append another segment to the existing dense footer. Give active jobs and actionable failures a predictable place while keeping the idle footer minimal.

Use both screenshots as the baseline for a future design pass. Evaluate the proposed footer at low and high context usage, with and without active agents, and at narrow terminal widths. Preserve access to detailed information through the inspector rather than putting everything in the footer.

## Proposed skills

These names describe toolkit-owned skills or adaptations. The imported skill source can remain intact. A skill should name its trigger, inputs, evidence to gather, and output so Pi can use it directly or hand it to a background worker.

| Skill | Trigger and inputs | Behavior and output |
|---|---|---|
| **`review-pr`** | GitHub PR URL, number, or current branch PR. | Capture the PR head SHA, base, linked issue or spec, diff, CI status, and relevant existing review context. Reuse the existing standards and spec checks. Add focused reviewers when the diff warrants them. Return a draft with severity, file and line, impact, and evidence. Recheck the head before treating the result as current. Posting the review is a separate user-authorized action. |
| **`triage-ci`** | Failing GitHub Actions check on a PR. | Identify the earliest actionable failure and affected job or matrix entry. Distinguish a code failure from an environment or dependency failure, or mark the cause uncertain. Return a short log excerpt, run link, and the smallest useful validation check. |
| **`review-feedback`** | Open PR review threads or a request to address feedback. | Read unresolved threads and compare each against the current diff. Show which comments appear addressed, which still need action, and which need clarification. Draft replies with evidence for review. |
| **`qa-preview`** | UI changes and a local or preview URL. | Map changed routes or components to user flows. Exercise the affected flows with a browser, capture evidence for failures, and propose focused regression coverage. For KineticFit, generate a workout, refresh, and verify that the saved plan is still available. |
| **`review-async-jobs`** | Changes to workers, queues, webhooks, retries, or outbox processing. | Trace enqueue, execution, durable writes, acknowledgement, and recovery. Check duplicate delivery, crashes between side effects and acknowledgement, and partial failure. Return a failure scenario and the smallest test or code seam that could verify each finding. |
| **`review-api-contract`** | Changes to routes, schemas, clients, CLI output, or serialized events. | Compare old and new behavior and trace affected callers. Check newly required fields, response shapes, error semantics, and compatibility during rollout. Return affected callers, concrete examples, and relevant tests or docs to update. |
| **`review-observability`** | Changes to failure paths, external integrations, workers, or incident-sensitive flows. | Walk one success and one failure path. Show how a request or job would be correlated, which events an operator would see, and where failures are invisible or logged repeatedly. Recommend the smallest change that makes diagnosis possible. |
| **`docs-drift`** | Behavior, configuration, CLI, schema, or deployment changes. | Compare the diff with README instructions, API examples, setup docs, runbooks, and nearby code documentation. Point to exact stale instructions and the behavior they should reflect. The existing `writing-for-agents` skill remains useful for writing and maintaining agent guidance. |

### PR review specialists

Keep the existing **Standards** and **Spec** review axes. Select any extra reviewer based on the changed behavior.

- **Silent failures** checks swallowed errors, misleading success responses, fallback behavior, and retries that hide terminal failure.
- **Regression coverage** checks whether the tests would catch a real user-visible break, especially at a changed boundary.
- **Async behavior and API compatibility** apply the focused skills when a diff changes jobs, webhooks, schemas, or callers.
- **Observability and docs** apply the diff-based reminders below and go deeper when the change merits it.

Two reviewers should use the same pinned diff. Findings should explain a concrete consequence and cite the evidence. For a missing spec, report that gap in the review. Existing checks and relevant prior comments can help the lead avoid duplicate findings.

## Built-in logging and documentation reminders

Put the short triggers in the engineering standards and reference them from implementation and review workflows. Apply them during the change and again when reading the diff. The dedicated observability and docs skills provide a deeper pass when the change is operationally significant.

| Diff trigger | Reminder |
|---|---|
| New or changed job, webhook, or external call | Use the project logger and existing field conventions. Include a correlation ID where available, the operation, and the outcome. Keep credentials, sensitive payloads, and personal data out of logs. |
| Retry, fallback, or error path | Make retry and terminal failure distinguishable. Check that a fallback which changes user-visible behavior is observable. Check for the same error being logged at multiple layers. |
| Public API, CLI, config, or setup behavior | Check whether examples, defaults, error behavior, and setup instructions still match what callers experience. |
| Non-obvious invariant or workaround | Explain the reason next to the code. For example, if completion must be recorded before acknowledging a queue message, explain what happens if a worker crashes between those operations. |
| Migration or operational change | Update the relevant runbook with rollout order, verification, and recovery steps. |

For example, a review of KineticFit's summary worker could check whether a single job ID connects enqueue, retry, and completion logs, and whether two deliveries produce one durable result. The final review can point to the specific missing event or invariant rather than list generic logging advice.

## Ideas to borrow from other toolkits

- **PyStack** scopes skills to the technology and task. Keep shared checks such as transaction ownership, duplicate delivery, and schema compatibility portable. Let the FastAPI profile supply SQLAlchemy/Pydantic examples and a Django or NestJS profile supply conventions appropriate to those stacks. Outbox guidance can activate only where the project uses one. [PyStack skills and architecture](https://github.com/denyszhak/pystack-skills)
- **gstack** passes useful artifacts between skills. Your existing spec, implementation, review, and handoff contracts are natural places to carry a test matrix, a pinned diff, or a browser QA result. [gstack skills](https://github.com/garrytan/gstack/blob/main/docs/skills.md)
- **Anthropic's PR Review Toolkit** shows the value of narrowly scoped reviewers for error handling and behavioral test coverage. Use the role ideas with Pi's worker interface. [PR Review Toolkit](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/pr-review-toolkit)
- **OpenAI's GitHub skills** are concrete references for fetching CI logs and reading review threads through GitHub CLI. [CI triage](https://github.com/openai/skills/tree/main/skills/.curated/gh-fix-ci) · [Review comments](https://github.com/openai/skills/tree/main/skills/.curated/gh-address-comments)
- **Microsoft's Playwright CLI skill** provides the browser interaction layer for preview QA. The toolkit can supply the project-specific behavior to verify. [Playwright CLI skill](https://github.com/microsoft/playwright/tree/main/packages/playwright-core/src/tools/skills/playwright-cli)

## How to tell if delegation is helping

Record a small amount of run evidence such as role, elapsed time, reviewed ref, terminal state, and whether the result changed a decision or caught a regression. Compare repeated tasks with and without the same specialist. If a worker regularly duplicates the lead's work or becomes the longest wait on small changes, narrow its trigger or scope. Keep summaries and handoff artifacts focused on evidence the next session can use.
