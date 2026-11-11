---
name: docs-drift
description: Find stale documentation after behavior, configuration, CLI, schema, setup or deployment changes.
---

# Docs Drift

Read `../README.md` for shared execution and evidence rules.

## Inputs

Pinned diff, relevant user/developer docs, API examples, setup instructions, runbooks and nearby code comments.

## Steps

1. Map every changed documented behavior to its audience and source of truth. Inspect README/setup commands, public examples, defaults, error behavior, config reference, operational rollout/recovery instructions and non-obvious invariants near the code.
2. Compare each instruction with current code/config and the pinned old behavior. Cite exact stale path/line and the changed behavior that invalidates it. Distinguish a demonstrably wrong instruction from optional documentation coverage.
3. Check migrations and operational changes for rollout order, verification and recovery. Check workarounds/invariants for a nearby explanation of why they exist. Prefer pointers to canonical facts over duplicated command/config lists.
4. Propose concise replacement wording or an outline. Use the imported `writing-for-agents` skill through its toolkit adaptation when agent-facing guidance needs edits. Executing setup/deployment examples or applying edits requires approval.

## Output and completion

Return a behavior-to-document matrix and exact stale instructions with proposed corrections, evidence and severity. Every changed documentation trigger must be checked or explicitly not assessed. Do not report documentation as updated when only replacement text was drafted.
