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
