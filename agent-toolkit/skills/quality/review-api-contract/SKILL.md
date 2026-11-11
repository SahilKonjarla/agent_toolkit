---
name: review-api-contract
description: Review changed routes, schemas, clients, CLI output or serialized events for caller compatibility and safe rollout.
---

# Review API Contract

Read `../README.md` for shared execution and evidence rules.

## Inputs

Pinned old/new revisions, changed public boundary, known callers, supported versions and rollout constraints.

## Steps

1. Compare old and new request/response or serialized shapes using code and examples. Inventory required/default/nullable fields, enum values, validation, status/error semantics, pagination and CLI stdout/stderr/exit codes where changed.
2. Trace repository callers and identify external consumers or generated clients that cannot be inspected. Mark those unknown instead of asserting there are no callers.
3. Exercise concrete old/new examples against producer/consumer combinations: old caller/new server, new caller/old server, and mixed-version events during rollout where applicable. Check ordering of deploys and migrations, field tolerance and retry semantics for errors.
4. Link each incompatible behavior to a caller and consequence. Identify the smallest compatibility test and affected schema/client/example docs. Apply the relevant project stack profile for conventions, while keeping the compatibility analysis portable.

## Output and completion

Return a boundary/caller matrix, before/after examples, rollout constraints, findings and tests/docs to update. Every changed public shape or behavior must have a compatibility result or named evidence gap. Changes to the public contract require approval before remediation.
