---
name: review-async-jobs
description: Review workers, queues, webhooks, retries or outbox changes for duplicate delivery, crash safety, durable effects and recovery.
---

# Review Async Jobs

Read `../README.md` for shared execution and evidence rules.

## Inputs

Pinned diff, queue/delivery guarantees, worker entry points, side effects, durable storage and acknowledgement mechanisms. Mark undocumented guarantees unknown.

## Steps

1. Trace producer/enqueue → execution → external effects → durable writes → acknowledgement → recovery. Record transaction boundaries and ownership, stable job/event IDs, retry/dead-letter behavior and timeouts. Apply the project's stack profile only where relevant; outbox checks apply only when an outbox exists.
2. Walk duplicate and concurrent delivery, crash before/after each side effect, write failure, acknowledgement failure, timeout and retry exhaustion. Check whether deduplication is durable and atomic with the protected effect. Do not assume an idempotency key alone provides exactly-once effects.
3. Trace partial completion and recovery: can an operator distinguish delayed, failed and lost work? Check ordering requirements, stale events and cancellation when the changed behavior depends on them.
4. For each suspected defect, construct a concrete event ordering and resulting state. Identify the smallest test or code seam that could validate it; run only approved tests. Separate a confirmed failure path from an unknown infrastructure guarantee.

## Output and completion

Return the lifecycle map, scenario/result matrix, evidence-backed findings and proposed regression seams. Every changed lifecycle boundary must be traced or explicitly blocked. Findings must name the consequence (duplicate durable result, lost write, unrecoverable job, etc.), not just recommend generic retries or transactions.
