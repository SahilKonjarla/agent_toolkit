# Fix Bug

## Goal

Reproduce, diagnose, fix, and verify a reported defect with regression evidence and supervised remediation.

## Appropriate use cases

Use when something is broken, failing, throwing, slow, flaky, or behavior differs from expectation.

## Inputs

- User symptom and expected behavior
- Logs/artifacts/screenshots, redacted
- `agent-project.yaml`, relevant overrides, context docs, ADRs, commands

## Preconditions

- Secrets are redacted before quoting artifacts.
- Approval policy and validation commands are known.

## Personalization and context loading

Read relevant config and only triggered overrides:

- `.agent-config/overrides/personal.md`
- `.agent-config/overrides/debugging.md`
- `.agent-config/overrides/testing.md`
- `.agent-config/overrides/review.md`
- `.agent-config/overrides/git.md`

## Roles involved

Quality Engineer first, then Architect or relevant engineer, then Quality verification.

## Optional roles

Platform Engineer for environment/CI/deployment bugs. Production Readiness Engineer for release-impacting or production-risk defects.

## Ordered phases

1. **Symptom capture** — Record exact observed/expected behavior and redact artifacts.
2. **Reproduction strategy** — Propose a tight loop and ask approval for commands or temporary files.
3. **Red-capable reproduction** — Build/run a command that can catch the user's exact bug.
4. **Minimize** — Shrink repro to load-bearing conditions.
5. **Diagnosis direction approval** — Present evidence and ranked falsifiable hypotheses.
6. **Fix proposal** — Relevant engineer proposes scoped change and regression seam.
7. **Implementation approval** — Stop before writes/remediation.
8. **Fix and regression coverage** — Implement approved change and test at correct seam.
9. **Verification** — Quality verifies red loop goes green and regression coverage is meaningful.
10. **Final report** — Include symptom, repro command, root cause, fix, tests, risks, overrides consulted, and next step.

## Approval gates

Temporary files/harnesses, broad commands, env/secret access, remediation, dependency changes, migrations/API/platform changes, Git operations.

## Required artifacts

- `review-report.md` or diagnosis report
- `implementation-report.md` after approved fix
- `handoff-report.md` when pausing or transferring

## Model-selection considerations

Use high reasoning for complex debugging, performance, security, or nondeterminism. Use economical/fast review for reproduction loops and verification.

## Cost-control rules

Tighten the loop before broad scanning. Reuse captured evidence. Ask before exploratory fixing without reproduction.

## Failure and rollback behavior

If no red-capable loop can be built, stop and request more evidence/access/approval rather than guessing. Do not run destructive rollback commands without approval.

## Completion criteria

Bug workflow is complete when the bug is reproduced or explicitly blocked, fix is verified or deferred, regression coverage is reported, and remaining risk is clear.
