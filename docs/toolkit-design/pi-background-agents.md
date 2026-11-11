# Pi background-agent runtime integration

Status: **installed and locally smoke-tested**. Current adapter **0.3.1** supports **five concurrent task-defined workers per lead session**, using Pi **1.5.2** and `pi-subagents` **0.88.0**. See [usage/configuration](../../agent-toolkit/integrations/pi/README.md) and [evidence](pi-background-verification.md).

## Execution model

The lead calls `background_task`, choosing the role and bounded brief as needed. There is no fixed runtime roster. Canonical toolkit roles and skills remain optional task guidance. Each dispatch returns a job ID immediately, letting the lead continue independent work until it needs the result.

Permission classes are independent of role: analysis has read/search tools, approved test/check work adds shell, and approved implementation adds edits in a mandatory managed worktree. Children cannot delegate. Ambient extensions are disabled. These are tool boundaries, not an OS sandbox; shell commands and file reads still require scope/secret discipline.

The native runner atomically admits at most five occupied top-level background slots. Each slot can start only one child; composite/counted/nested fan-out cannot multiply five slots into 25 agents. Model-driven async calls go through the task adapter. There is no cumulative session launch cap: completed/retired jobs release slots for new tasks. The limit is per lead session, not across unrelated Pi processes. Trusted raw RPC clients must preserve the profile's single-child bounds.

The runner owns processes, session/artifact lifecycle, deadlines, completion delivery, steering, stop and worktrees. The adapter uses public runtime-agent registration, capability-ceiling and event-bus RPC APIs; installed runner source is unchanged. Scheduling and automatic workflow resumption remain off; foreground remains an explicit opt-out.

## Verified current behavior

The current live smoke launched five differently named test workers concurrently and observed the native cap reject a sixth. All five ran the approved fixture unittest command with successful native tool-output evidence. They survived reload. A later analysis job reused capacity, proving this is not five total launches. A dynamically named implementation worker wrote an approved canary only in its managed worktree, captured a patch/handoff, and left the main fixture checkout clean.

Footer status events reported five active children. Appearance and interactive fleet controls remain human terminal checks. The earlier 0.2.1 smoke additionally recorded active-child stop with observed process proof, steering receipt, foreground execution and deadline failure; those records are historical checks, not claims that the old two-child workflow policy remains enabled.

## Evidence integrity and worktree limits

The lead pins task refs/snapshots and reconciles stale results in review/handoff artifacts. The public fleet DTO lacks reviewed refs; the footer invents no freshness labels. Background tests on a live checkout may race lead edits, so the brief and result must name that limitation or use an approved stable snapshot.

Implementation worktrees start from a clean source checkout. They do not silently include uncommitted changes. Dirty sources require an approved snapshot strategy; neither adapter nor worker may auto-commit/stash the user's work. The lead reviews/integrates saved patches deliberately.

## UI and activation

The local `~/code/pi-extensions/` consumer displays sanitized role, active count and elapsed time from the documented `ping`/`status` event API, with coalesced refresh and lifecycle cleanup. The footer uses `Agent`/`Agents` and clears the live segment when no work needs attention. Duplicate persistent FleetView/async-widget rows are disabled; `/subagents-fleet` still retains transcripts, model metadata, native steering and stop. Herdr remains optional manual terminal layout/inspection.

The current machine has the pinned runtime/local adapter in `~/.pi/agent/settings.json` and the five-slot profile in `~/.pi/agent/extensions/subagent/config.json`. **Run `/reload`** after this update. If an old recorded session lacks the new `background_task` tool, restart Pi, resume and `/reload`. Compiled upstream upgrades still require restart.

## Known upstream limitation

An immediate stop before child initialization, or a deadline shorter than startup, can retain a slot with `process-terminal:unknown` (`writer-close-unverified`) in 0.88.0. The adapter preserves fail-closed accounting; it does not rewrite proof, silently widen capacity or call an unknown process state observed. Inspect exact run/proof, use a fresh independent session if necessary, or apply a separately reviewed upstream fix.

## Scope and references

Local native managed/npm Pi is verified. Standalone Linux, remote-machine execution, arbitrary future versions and OS-level secret confinement are not claimed.

Before upgrades, read the installed version's documentation:

- <https://github.com/nicobailon/pi-subagents/blob/main/docs/configuration.md>
- <https://github.com/nicobailon/pi-subagents/blob/main/docs/agents.md>
- <https://github.com/nicobailon/pi-subagents/blob/main/docs/workflows.md>
- <https://github.com/nicobailon/pi-subagents/blob/main/docs/observability.md>
- <https://github.com/nicobailon/pi-subagents/blob/main/docs/extension-api.md>
