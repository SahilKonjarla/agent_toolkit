---
name: qa-preview
description: Verify UI changes against user flows at an approved local or preview URL using browser evidence and focused regression cases.
---

# QA Preview

Read `../README.md` for shared execution and evidence rules.

## Inputs

Pinned UI diff, preview/local URL, expected build/ref, acceptance criteria, approved browser actions and disposable test data. Request missing flow expectations rather than inventing project-specific behavior.

## Steps

1. Map changed routes/components to affected user flows, boundaries and failure states. Create a test matrix including loading/error/empty states, narrow viewport and keyboard navigation where relevant. Mark unaffected flows out of scope explicitly.
2. Verify target environment and, where exposed, build SHA. If the preview cannot be tied to the reviewed ref, record that limitation. Confirm side-effect approval before submitting forms, creating/deleting data, invoking paid services or changing accounts; use disposable data and an approved non-production environment.
3. Use an available browser tool or installed Playwright CLI skill. If unavailable, return the matrix and blocker; do not install browser dependencies or claim manual inspection. Record viewport, route, actions, expected/actual outcome and console/network evidence for each executed case.
4. For persistence changes, create the approved record, refresh/reopen and verify it remains available. Use project-specific entities from acceptance criteria, not toolkit examples. Capture minimal redacted screenshots or traces for failures only at approved paths.
5. Propose the smallest regression test at the behavior boundary. Clean up test data only as approved; report anything left behind. Recheck target build/ref before concluding.

## Output and completion

Return the test matrix, build/ref confidence, browser/tool used, failure evidence paths, regression recommendations and cleanup status. Every planned case must be pass/fail/blocked/not run. UI appearance alone is not functional validation, and a browser check is not a complete accessibility audit.
