# Pi background-agent runtime integration

Status: **runtime integration pending**. Toolkit delegation policy and report fields are implemented; automatic job execution, fleet controls and job-status footer integration are not installed by those Markdown files.

## Candidate and boundaries

`pi-subagents` is the candidate runtime: <https://github.com/nicobailon/pi-subagents>. Keep toolkit roles/workflows canonical and adapt them to the installed runner rather than building cancellation and process management into toolkit scripts. Pi's bundled subagent example is a smaller reference, not evidence of non-blocking execution. Herdr remains manual terminal layout management.

Before installing/configuring a runner, read the installed Pi extension/TUI documentation and the candidate's current configuration, workflow, worktree and extension API documentation. Capture exact Pi/runner versions. Treat upstream config keys and integration surfaces as unverified until checked against those versions; this document is not executable configuration.

## Acceptance checklist

Use disposable tasks and approved paths, with no production access or secrets:

- [ ] User approves dependency/extension installation and launch/model budget.
- [ ] Existing toolkit roles load with expected scope and read-only tools for analysis.
- [ ] Background launch returns a job ID before the task finishes; the lead can continue.
- [ ] Explicit foreground and per-task opt-out work.
- [ ] At most two active children by default, lead-only delegation and deadlines are enforced.
- [ ] Completion/failure/cancellation are visible; an outstanding job is not mislabeled canceled.
- [ ] Retry targets one job without accidentally relaunching completed work.
- [ ] Analysis cannot silently gain shell/write/secret permissions.
- [ ] Approved writing workers have separate worktrees; the lead can inspect patches before integration.
- [ ] Results include the reviewed ref and are marked stale after the lead changes that target.
- [ ] Reports and handoffs preserve job IDs, results, validation and outstanding-job ownership.
- [ ] Shutdown/reload behavior is understood: jobs are either deliberately preserved/reconnected or stopped, never silently orphaned.

Prefer explicit async dispatch or supported workflow defaults that retain necessary launch clarification. Do not enable stronger clarification-suppression settings just to make a demo non-blocking.

## UI follow-up

The separate local extension project `~/code/pi-extensions/` has received a footer modernization pass (readable branch labels, compact context percentage, themed width-aware layout). Visual confirmation remains a user check.

After the runner checklist passes, use only a supported job-state interface to connect active/attention-needed jobs to that footer. Show active count, short role and elapsed time; remain quiet when idle. Keep transcript/tool details in the existing fleet inspector. Support completion summaries, failure reason and explicit retry where the runner provides it. Label old-ref results stale. Test narrow terminals, multiple completions and failed/canceled jobs.

If the runner exposes no supported state interface, document that blocker instead of scraping private runtime state or showing invented job status.

## Sources to verify during integration

- <https://github.com/nicobailon/pi-subagents/blob/main/docs/configuration.md>
- <https://github.com/nicobailon/pi-subagents/blob/main/docs/workflows.md>
- <https://github.com/nicobailon/pi-subagents/blob/main/docs/extension-api.md>

These are discovery pointers, not a claim that compatibility has been validated.
