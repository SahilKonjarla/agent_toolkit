# Review Specialists

## Required axes

Every change review reports **Standards** and **Spec** separately. Standards compares the diff against documented project/toolkit rules. Spec compares behavior with the originating issue or approved requirements. A missing spec is a limitation, never an implicit pass.

Use a single pinned comparison for all reviewers. For dirty trees, include a snapshot identifier covering the content actually examined. Select extra reviewers by changed behavior, not by roster size. Separate specialists may be sequential passes by the lead; use `delegation-policy.md` only when workers add value and launch is approved.

## Selection

| Diff trigger | Focus and instruction |
|---|---|
| Catch blocks, retry, fallback, success/error responses | **Silent failures:** trace swallowed errors, false success, hidden terminal failure and behavior-changing fallback. Name the actual user/operator consequence. |
| Changed behavioral boundary or bug fix | **Regression coverage:** identify a real break the test should catch; inspect assertions, setup and boundary coverage. Recommend the smallest meaningful regression case. |
| Worker, queue, webhook, outbox | Read `../skills/quality/review-async-jobs/SKILL.md`. |
| Route, schema, caller, CLI, serialized event | Read `../skills/quality/review-api-contract/SKILL.md`. |
| Failure path, integration, worker, incident-sensitive flow | Apply engineering reminders; for significant risk read `../skills/quality/review-observability/SKILL.md`. |
| Behavior, config, setup, deployment | Apply engineering reminders; when docs may drift read `../skills/quality/docs-drift/SKILL.md`. |
| UI route/component and approved preview | Read `../skills/quality/qa-preview/SKILL.md`. |
| GitHub PR, failed check, unresolved review thread | Use `review-pr`, `triage-ci`, or `review-feedback` under `../skills/quality/`. |

Apply portable failure/compatibility checks first. Load the relevant stack profile for framework conventions (for example SQLAlchemy/Pydantic in FastAPI); activate outbox guidance only for projects that use an outbox.

## Reconciliation

Findings require severity, type, concrete consequence, file/line or permalink, and evidence. Distinguish confirmed defects, risks, suggestions and nits using `severity-levels.md`. Avoid duplicates between axes/specialists and prior PR comments. Reconcile conflicting findings explicitly; extra votes are not extra evidence. Link test matrices and browser reports rather than copying them into every artifact.

Recheck the target at report time. Label stale reviews and missing/failed specialists as evidence gaps. The verdict names all selected passes, which ran, which were blocked, and validation actually executed. Remediation and posting to GitHub remain separate approval gates.
