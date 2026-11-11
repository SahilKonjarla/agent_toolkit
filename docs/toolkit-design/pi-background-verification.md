# Background runtime verification

## Current 0.3.0 five-worker verification

Command: `node agent-toolkit/integrations/pi/verify-runtime.mjs --live` — exited **0** with Pi 1.5.2 / pi-subagents 0.88.0. Output: `/tmp/toolkit-five-agent-verification.log`; JSON evidence: `verification.json` inside private temporary fixture `toolkit-five-agent-smoke-SHsMtf`.

| Check | Observed result |
|---|---|
| Task-defined roles | Five different briefs/labels were registered at dispatch, not selected from the earlier fixed roster. |
| Five concurrent workers | Native fleet/capacity reported five occupied slots. Dispatch returned before results (13–15 ms after first-load initialization). |
| Sixth rejection | A sixth `background_task` was rejected with `Active async run capacity exhausted: 5/5 used`; no sixth child started. |
| Real background tests | All five workers executed the approved `python3 -B -m unittest test_fixture.py` command; native mirrored tool events contained `Ran 1 test` and `OK`. |
| Task permissions | Test workers' effective tool audits included shell and excluded edit/write/nested-subagent tools. |
| Reload | All five job IDs remained collectable after reload. |
| Capacity reuse | Analysis job `32045caa-6db6-44b5-882e-2a91bd2cdea8` launched after the five jobs retired and completed: the cap is concurrent, not five lifetime launches. |
| Isolated implementation | Job `93149e28-0257-4e87-8831-c0520c7f60af` wrote `canary.txt` only in its managed worktree. The saved patch contained `ISOLATED_WORKER_OK`; the lead fixture had no canary and remained Git-clean. |
| Footer | The public bridge emitted an available snapshot with five active workers. |

The smoke used normal existing model authentication; no credential values or transcripts were copied into this document. Git mutations and edits were restricted to disposable fixtures. No user repository commit/push or automatic integration was performed.

## Earlier 0.2.1 environment and checks (historical)

The records below describe the earlier fixed read-only profile. That roster and two-child workflow policy have been replaced; the earlier stop/foreground/deadline checks remain useful historical evidence.

Locally verified with Pi **1.5.2**, `pi-subagents` **0.88.0**, and the existing `openai-codex/gpt-6.1-sol` route. Credentials were used through normal runtime authentication, not read or copied into reports. Fixtures, Git commits/worktrees, model calls and runtime artifacts were limited to the approved smoke test; no user repository commit/push was performed.

```bash
node agent-toolkit/integrations/pi/verify-runtime.mjs --live
```

The successful run exited **0**. Its public summary was saved at `/tmp/toolkit-runtime-verification.log`; full JSON evidence is `verification.json` inside the private temporary fixture `toolkit-runtime-smoke-93gBmn`. Temporary evidence may be removed by OS/runtime retention; this summary records the checked facts without copying transcripts.

## Results

| Check | Observed result |
|---|---|
| Public RPC | Fleet-status v1 and process-terminal-proof v1 advertised. |
| Unapproved writer | Builtin `worker` rejected by the toolkit capability ceiling before launch. |
| Async launch | Read-only child `5d85059b-7b9c-4763-9f32-c076a238930e` dispatched in **18 ms**, before completion. |
| Read-only contract | Run metadata allowed only `find`, `grep`, `ls`, `read`, with `denyExtensions:true`. |
| Reload recovery | Same detached run remained addressable after `session.reload()` and completed. |
| Real result | Child read `fixture.txt`, returned `TOOLKIT_SMOKE_OK`, and left the fixture worktree clean. |
| Steering | Public steer request returned a receipt; this establishes receipt, not model compliance. |
| Stop | Active run `c257146d-4548-4bb7-aa69-4c98331bceb2` reached `stopped` with `process-terminal.state:observed` and non-resumable disposition. |
| Worktree isolation | Read-only run `dc109ba5-e715-4084-b54a-b46e1437ebd3` completed from a managed fixture worktree; only the main checkout remained afterward. No editing-worker behavior is claimed. |
| Parallel | Workflow `16a426ff-f036-4bef-81e5-ec8e3aee9f5c` completed two fresh read-only children. |
| Foreground opt-out | `async:false` returned `FOREGROUND_OK` after blocking for about 8.2 seconds. |
| Deadline | Run `a9d7d9b5-0618-42c0-9b75-10a28b303e8b` failed with `timedOut:true`; not misreported as success. |
| Footer bridge | Available/active public status events were observed by the bridge consumer. Actual terminal appearance remains a user check. |
| Cleanup | No runner/workflow processes from verification remained active after completion. Fixture/evidence directories were intentionally retained for inspection. |

## Limitation found rather than hidden

An earlier immediate-stop probe, before a child initialized, recorded `process-terminal:unknown` with `writer-close-unverified`, even though the runner's close event was present. With a one-slot active-run cap this retained capacity and correctly blocked another dispatch. The upstream package was not patched and proof files were not rewritten.

The successful active-child stop above is a distinct scenario, not a fix for that early-stop edge. See [integration limitations](pi-background-agents.md) for safe handling. Shorter-than-startup deadlines can trigger the same capacity-retention behavior.

## Local automated checks

- Python toolkit tests: **26 passed**, `python -m unittest discover -s agent-toolkit/tests`.
- Current adapter tests: **11 passed**, `npm test` in `agent-toolkit/integrations/pi/` (RPC lifecycle, projection, workflow bounds and real host tool-hook wiring without model prompts).
- Local footer tests: **14 passed**, `npm test` in `~/code/pi-extensions/` (layout, idle/active/unknown status and narrow widths).
- Script syntax checks and `git diff --check`: passed.

The live smoke is opt-in and separate from normal unit tests. It does not claim coverage for remote machines, standalone binaries, mutation-capable workers, secret confinement, or visual UI acceptance.
