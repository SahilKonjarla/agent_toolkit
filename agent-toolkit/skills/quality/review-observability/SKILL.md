---
name: review-observability
description: Review failure paths, external integrations, workers or incident-sensitive flows for correlation, visible outcomes and diagnosable failures.
---

# Review Observability

Read `../README.md` for shared execution and evidence rules, then `../../../standards/engineering-principles.md` for diff-triggered reminders.

## Inputs

Pinned diff, project logger/event conventions, existing metrics/traces, and affected request/job entry points. Use code inspection if live telemetry is unavailable.

## Steps

1. Walk one representative success and one failure end to end. Record how a request/job ID crosses process and external-call boundaries, and which operation/outcome events an operator would observe.
2. Trace retry, fallback and terminal failure separately. Check invisible behavior-changing fallbacks, false success, missing completion, repeated logging at multiple layers and unbounded/high-cardinality fields.
3. Check that correlation IDs are propagated rather than regenerated at every hop. Inspect fields for credentials, personal data and sensitive payloads without opening secret-bearing sources. Follow existing project conventions before proposing new telemetry.
4. For each gap, describe a concrete incident and the missing signal needed to distinguish possible causes. Recommend the smallest instrumentation change and a focused validation seam. State whether conclusions come from code inspection or observed runtime evidence.

## Output and completion

Return success/failure event maps, correlation gaps, redacted evidence and prioritized minimal changes. Account for every changed failure boundary. Avoid generic demands for more logs; each finding must explain what an operator cannot currently diagnose. Live telemetry access and instrumentation edits require their own approvals.
