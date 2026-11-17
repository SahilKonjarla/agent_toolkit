# Task Focus and Blocking-Only Remediation

## Keep the task contract

Work toward the user's original outcome and acceptance criteria, within the approved paths, commands and permissions. Required scoped work includes preserving required functionality and compatibility except where explicitly approved to change, fixing regressions introduced by the change, and satisfying applicable documentation, logging and verification requirements. Explicitly requested cleanup is in scope; incidental cleanup is not.

## Triage incidental issues before acting

Use brief, bounded inspection to establish the consequence for this task, not an open-ended investigation. Classify each discovered issue by task impact, not severity alone:

- **Blocking:** evidence shows it prevents the requested implementation, required functionality, or required verification from proceeding safely or correctly. Name the affected acceptance criterion, behavior or verification gate and the causal link.
- **Non-blocking:** it does not prevent those outcomes. Note the issue once in the existing report/handoff or final response, mark it deferred, and continue the original task. Do not fix it, launch extra workers, create tickets, or interrupt the user for optional cleanup unless requested.
- **Uncertain:** report what is known and missing; continue unaffected work. Do not promote a suspicion to a blocker. Seek a decision only when uncertainty actually prevents a necessary or safe next step.

A required check failing is evidence of a verification blocker, not automatically proof that the requested functionality is broken. Distinguish pre-existing/unrelated failures from regressions; a focused check or other approved verification route may establish the relevant evidence. Never hide failures, weaken a required gate, or claim unverified completion.

## Remediate only the demonstrated blocker

Explain why the fix is necessary for the original task, then choose the smallest sufficient change and relevant verification. A small issue may block the task; a serious but unrelated issue may not justify expanding it. Avoid neighboring refactors, formatting sweeps, dependency upgrades and unrelated defect fixes. Return to the original task as soon as the blocker is cleared.

Blocking status is not authorization. Follow existing approval gates, including post-review remediation approval, and the worker's write scope. If a necessary fix needs new paths, dependencies, migrations, API/platform changes, Git operations or other unapproved actions, request the smallest additional approval and continue independent approved work meanwhile. Analysis/read-only and test-only workers report blockers to the lead; they do not remediate source.

Safety, secrets and irreversible-operation rules still apply: report an urgent unrelated safety risk and pause the affected unsafe action when necessary, but do not treat that risk as permission for unrelated remediation.

## Examples and reporting

| Encountered issue | Disposition |
|---|---|
| Non-gating lint warning, unrelated typo or nearby cleanup | Note/defer; continue the task. |
| Requested change breaks a required caller or fails its regression check | Fix the demonstrated regression minimally within approval; verify. |
| Pre-existing failure prevents mandatory verification | Explain the verification gap; use an approved focused route or request a bounded decision, not a repo-wide repair. |
| Required behavior-change docs or logging are missing | Complete that scoped requirement; do not use task focus to skip required work. |
| Unrelated security risk makes the next operation unsafe | Report/pause that operation; obtain approval before any out-of-scope fix. |

At completion, separate requested work, blocker fixes (with their necessity), required verification gaps, and deferred incidental findings. Keep deferred findings concise; do not perform an extra audit just to populate the list. Non-blocking observations alone do not prevent completion of the requested task.
