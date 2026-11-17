# Severity Levels

- BLOCKER: prevents safe merge/release or risks data loss/security incident.
- HIGH: likely user-facing defect, security weakness, or serious maintainability risk.
- MEDIUM: meaningful issue with workaround or limited blast radius.
- LOW: minor correctness, clarity, or maintainability concern.
- NIT: style-only or optional polish.

Severity measures impact, not task relevance or authorization. Apply `task-focus-policy.md` independently: defer incidental non-blocking findings rather than expanding implementation. Report urgent unrelated safety risks and pause affected unsafe actions when needed; obtain approval before any out-of-scope remediation.
