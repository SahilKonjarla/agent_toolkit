# Engineering Principles

- Inspect before editing.
- Read `agent-project.yaml` when present and load only `.agent-config/overrides/` files relevant to the active task.
- Do not load every override file by default; use override trigger mappings from `AGENTS.md`, workflows, and role definitions.
- Treat overrides as advisory within toolkit policy; they must not silently weaken approval, Git, safety, or secrets rules.
- Prefer existing repository patterns.
- Keep changes scoped.
- Avoid speculative abstractions.
- Preserve compatibility unless approved otherwise.
- Add or update tests for behavioral changes.
- Document assumptions and decisions.
- Do not claim commands were run when they were not.
- Report incomplete work honestly.

## Diff-triggered logging and documentation checks

Apply these during implementation and again during diff review. Record a result or explicit not-applicable reason for each triggered row in the implementation/review artifact.

| Changed behavior | Required check |
|---|---|
| Job, webhook, external call | Use the project logger and field conventions; include available correlation ID, operation and outcome. Keep credentials, sensitive payloads and personal data out of logs. |
| Retry, fallback, error path | Distinguish retries from terminal failure. Make behavior-changing fallback observable and avoid logging the same error at multiple layers. |
| Public API, CLI, config, setup | Verify examples, defaults, error behavior and setup instructions against what callers now experience. |
| Non-obvious invariant or workaround | Explain the reason beside the code, including the failure it prevents (for example a crash between durable completion and queue acknowledgement). |
| Migration or operational change | Update the runbook's rollout order, verification and recovery steps. |

For operationally significant changes, use `../skills/quality/review-observability/SKILL.md`. For stale or missing instructions, use `../skills/quality/docs-drift/SKILL.md`. Apply relevant stack-profile conventions without coupling portable checks to one framework.
