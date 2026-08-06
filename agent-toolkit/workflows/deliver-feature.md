# Deliver Feature

## Goal

Turn an approved user need into a tested, reviewed, handoff-ready implementation using the minimum necessary roles and model capability.

## Appropriate use cases

Use when adding or changing user-facing/application behavior. If the request is mostly platform, use `platformize-project`; if it starts from a defect, use `fix-bug`.

## Inputs

- User objective and constraints
- Existing specs/tickets if any
- `agent-project.yaml`
- Relevant overrides, context docs, ADRs, commands, and standards

## Preconditions

- Repository has been inspected read-only.
- Approval mode, Git policy, commands, and relevant overrides are known.
- The user has approved moving from planning to implementation.

## Personalization and context loading

At workflow start, read `agent-project.yaml` if present, especially `paths`, `commands`, `approvals`, `git`, `security`, `models`, and `personalization`.

Load only override files relevant to the current workflow and phase. Common overrides:

- `.agent-config/overrides/personal.md`
- `.agent-config/overrides/specs.md`
- `.agent-config/overrides/tickets.md`
- `.agent-config/overrides/testing.md`
- `.agent-config/overrides/review.md`
- `.agent-config/overrides/git.md`

## Roles involved

Architect, Application Engineer, Quality Engineer.

## Optional roles

Platform Engineer or Production Readiness Engineer only if the feature affects Docker, CI/CD, deployment, environments, security, reliability, observability, or release risk.

## Ordered phases

1. **Intake and context check** — Architect clarifies outcome, reads relevant config/overrides/context, and identifies risks.
2. **Specification draft** — Architect drafts `feature-specification.md`, acceptance criteria, seams, and model execution plan.
3. **Specification approval** — Stop until human approves scope, artifacts, roles, and model/session plan.
4. **Implementation plan** — Application Engineer states files/areas likely affected and validation plan.
5. **Implementation approval** — Stop before writes unless approval already covers the scope.
6. **Vertical-slice implementation** — Implement small slices, test at approved seams, avoid speculative abstractions.
7. **Implementation report** — Produce `implementation-report.md`; include overrides consulted and suggested commit message if useful.
8. **Review approval** — Human approves handoff to review and any broad validation commands.
9. **Quality review** — Quality Engineer reviews against spec and standards, runs approved checks, and produces `review-report.md`.
10. **Remediation approval** — Stop before any remediation.
11. **Scoped remediation and verification** — Relevant engineer remediates approved findings; Quality verifies.
12. **Final completion report** — Summarize status, files, validation, risks, overrides consulted, and next step.

## Approval gates

Specification, implementation writes, dependencies, migrations, API contracts, test commands beyond focused checks, review remediation, platform changes, Git operations, and final phase transition.

## Required artifacts

- `feature-specification.md`
- `model-execution-plan.md` for multi-phase/session work
- `implementation-report.md`
- `review-report.md`
- `handoff-report.md` when switching sessions

## Model-selection considerations

Use standard for normal implementation, economical/fast review for bounded checks, high reasoning for architecture/security/complex behavior, and long context only when repo/docs require it.

## Cost-control rules

Avoid repeated full scans. Reuse specs and reports. Do not invoke optional roles unless scope justifies them. Ask before increasing session count or model tier.

## Failure and rollback behavior

Stop on unexpected repo state, failed validation, unapproved scope expansion, risky irreversible choice, or unclear acceptance criteria. Do not rollback destructively without approval.

## Completion criteria

Feature is complete when approved scope is implemented or explicitly deferred, validation is reported, review/remediation status is clear, and the final report names exact next action.
