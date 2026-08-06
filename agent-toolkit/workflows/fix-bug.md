# Fix Bug

## Goal

Provide a supervised, reusable workflow for `fix-bug` outcomes.

## Appropriate use cases

Use when the user asks to fix bug or when the architect selects this as the minimum sufficient workflow.

## Inputs

- User objective and constraints.
- Project configuration and context docs.
- Relevant specs, diffs, bug reports, logs, or platform details.

## Preconditions

- Repository has been inspected read-only.
- Approval mode and git policy are known.
- Required artifacts are identified.

## Roles involved

Architect plus role specialists as needed. Do not invoke unnecessary specialists.

## Optional roles

Application Engineer, Quality Engineer, Platform Engineer, Production Readiness Engineer depending on scope.

## Ordered phases

1. Quality engineer reproduces and records evidence
2. Human approves diagnosis direction
3. Architect or engineer proposes fix
4. Human approves implementation
5. Relevant engineer implements
6. Quality engineer verifies regression coverage
7. Final report

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
