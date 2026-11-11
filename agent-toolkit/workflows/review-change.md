# Review Change

## Goal

Review a diff, branch, commit range, or PR working tree against specs, standards, risk, and validation evidence.

## Appropriate use cases

Use for uncommitted diff review, branch comparison, commit-range review, PR review, or post-implementation quality gates.

## Inputs

- Review target and fixed point
- Spec/ticket/source issue if any
- Standards, `AGENTS.md`, `agent-project.yaml`, overrides, reports

## Preconditions

- Review scope is clear or the reviewer asks for a fixed point.
- Git inspection is allowed by policy.

## Personalization and context loading

Load only relevant overrides:

- `.agent-config/overrides/personal.md`
- `.agent-config/overrides/review.md`
- `.agent-config/overrides/testing.md`
- `.agent-config/overrides/git.md`
- `.agent-config/overrides/secrets.md`

## Roles involved

Quality Engineer.

## Optional roles

Platform Engineer for Docker/CI/CD/deployment changes. Production Readiness Engineer for release-impacting changes. Architect for spec ambiguity.

## Ordered phases

1. **Pin scope** — Identify diff command/range and verify it resolves.
2. **Find source of truth** — Locate spec/ticket and standards.
3. **Classify relevance** — Use `../standards/review-specialists.md` to select diff-triggered passes and relevant platform/production/security roles. GitHub PRs use `../skills/quality/review-pr/SKILL.md`; failing checks or unresolved threads trigger `triage-ci` or `review-feedback` in that directory.
4. **Review** — Report Standards and Spec separately against the same pinned target. Run selected specialists, apply logging/docs reminders in `../standards/engineering-principles.md`, and use `../standards/delegation-policy.md` for approved workers; otherwise review sequentially. Missing spec or failed worker is an evidence gap.
5. **Report** — Recheck the target, mark stale results, and produce `review-report.md`, grouping findings by severity/type and deduplicating prior comments. Link the test matrix, browser evidence and worker results; state actual validation.
6. **Remediation approval** — Stop before edits.
7. **Verification** — If remediation is approved, verify fixes and update report.

## Approval gates

Broad validation, env/secret access, remediation, Git operations, destructive commands.

## Required artifacts

- `review-report.md`
- `handoff-report.md` for follow-up sessions

## Model-selection considerations

Use fast review for small diffs, standard for normal reviews, high reasoning for security/architecture/high-risk releases, and long context for broad diffs.

## Cost-control rules

Review only the requested scope. Avoid re-running expensive checks unless they change the verdict.

## Failure and rollback behavior

If scope or spec is missing, report limitations instead of guessing. Do not remediate without approval.

## Completion criteria

Review is complete when verdict, scope, evidence, findings, required remediation, optional improvements, overrides consulted, and next action are clear.
