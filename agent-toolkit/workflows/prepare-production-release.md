# Prepare Production Release

## Goal

Provide a supervised, reusable workflow for `prepare-production-release` outcomes.

## Appropriate use cases

Use when the user asks to prepare production release or when the architect selects this as the minimum sufficient workflow.

## Inputs

- User objective and constraints.
- Project configuration and context docs.
- Relevant specs, diffs, bug reports, logs, or platform details.

## Preconditions

- Repository has been inspected read-only.
- Approval mode and git policy are known.
- Required artifacts are identified.

## Personalization and context loading

At workflow start, read `agent-project.yaml` if present, especially `paths`, `commands`, `approvals`, `git`, `security`, `models`, and `personalization`.

Load only override files relevant to the current workflow and phase. Do not load every `.agent-config/overrides/` file by default.

Common overrides for this workflow:

- `.agent-config/overrides/personal.md`
- `.agent-config/overrides/review.md`
- `.agent-config/overrides/testing.md`
- `.agent-config/overrides/secrets.md`
- `.agent-config/overrides/research.md`
- `.agent-config/overrides/git.md`

Project overrides are advisory within toolkit policy. They may specialize communication style, commands, paths, severity calibration, or workflow preferences, but they must not silently weaken approval, Git, safety, or secrets rules.

## Roles involved

Architect plus role specialists as needed. Do not invoke unnecessary specialists.

## Optional roles

Application Engineer, Quality Engineer, Platform Engineer, Production Readiness Engineer depending on scope.

## Ordered phases

1. Quality validation
2. Platform validation
3. Production readiness audit
4. Human review of blockers
5. Approved remediation only
6. Final go/no-go report

## Approval gates

Approval is required before each major phase transition and before any meaningful state change.

## Required artifacts

Use contracts from `agent-toolkit/contracts/`, especially specifications, reports, handoffs, and model execution plans.

## Model-selection considerations

Use the lowest reliable tier. Reserve high-reasoning for architecture, complex debugging, security, irreversible choices, and high-risk final review. Reuse artifacts to avoid repeated full scans.

## Cost-control rules

Bound repository scans, avoid duplicate specialist sessions, summarize durable findings, and ask before materially increasing session count or model tier.

## Failure and rollback behavior

Stop on unexpected state, failed validation, missing approval, or irreversible risk. Report partial work and do not attempt destructive rollback without approval.

## Completion criteria

The final contract is complete, validations are reported, risks and limitations are disclosed, and the recommended next action is clear.
