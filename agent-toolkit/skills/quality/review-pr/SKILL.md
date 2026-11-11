---
name: review-pr
description: Review a GitHub PR URL, number, or current branch PR against standards, its originating spec, and diff-triggered specialist checks.
---

# Review PR

Read `../README.md` for shared execution and evidence rules.

## Inputs

PR identifier, repository, requested review scope, linked issue/spec if known. Resolve an omitted PR from the current branch; ask if ambiguous.

## Steps

1. Inspect `gh pr view --help` and `gh pr diff --help` before choosing supported flags. Fetch PR metadata, head/base SHAs, merge base, changed files, CI checks, linked spec, and prior reviews. Record repository and PR URL. For fork PRs, distinguish head repository/ref from the base repository; never assume the branch exists locally.
2. Obtain the diff for the captured head without checking out or mutating the working tree. If local objects are unavailable, use an approved fetch or GitHub's read-only API; record the exact comparison. If head changes during retrieval, retry against a pinned target or mark the review stale.
3. Run **Standards** and **Spec** separately using `../../../adaptations/matt-pocock/code-review.md`. Missing source spec means Spec is limited/not assessed, not a pass.
4. Select specialists using `../../../standards/review-specialists.md`. Use approved delegation under `../../../standards/delegation-policy.md` when available; otherwise run the axes sequentially. Give each reviewer the same diff and expected report. Deduplicate against existing comments and distinguish resolved historical issues from current defects.
5. Capture check status without treating passing CI as proof of all acceptance criteria. Re-read PR head before finalizing. If it differs, label results stale and review the delta before claiming current.

## Output and completion

Return a draft review with separate Standards/Spec results, specialist selection and reasons, CI evidence, per-finding file/line and consequence, missing evidence, and current/stale status. Both axes and every selected specialist must have a result or explicit blocker. Posting a review, commenting, requesting changes, merging, and remediation are separate user-authorized actions.
