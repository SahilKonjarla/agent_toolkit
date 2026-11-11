---
name: triage-ci
description: Triage a failing GitHub Actions run or PR check, identify the earliest actionable failure, and propose the smallest validation step.
---

# Triage CI

Read `../README.md` for shared execution and evidence rules.

## Inputs

PR/run/check URL or identifier, repository, expected head SHA. Ask which run if multiple failures could refer to different commits.

## Steps

1. Inspect `gh run view --help` and supported read-only check commands. Capture run ID, attempt, commit SHA, workflow, event, failed jobs, dependencies and matrix entries. Label runs for an old PR head historical.
2. Read failed-job logs and relevant workflow/config changes. Find the earliest causal error within the failing dependency chain, not merely the first red line by wall-clock time. Separate downstream cancellation/noise from independently failing jobs.
3. Classify each actionable failure as code, environment, dependency, or uncertain. State the observed error and evidence supporting the classification. For unavailable/expired logs or externally hosted checks, report the evidence gap and run/check link.
4. Compare the failure with the pinned diff and existing tests. Propose the smallest useful reproduction or validation command from project configuration. Run only approved checks; do not rerun workflows, install packages, or modify CI as part of triage.

## Output and completion

For every failed job/matrix entry, return its run/attempt link, SHA, classification, redacted short log excerpt, causal relationship and next check. Provide one prioritized next action. Completion means all failed jobs are classified or explicitly uncertain; a suspected flaky failure stays uncertain until evidence supports that conclusion. Reruns and fixes require separate approval.
