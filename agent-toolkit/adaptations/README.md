# Adaptations

Canonical toolkit behavior is defined in generic Markdown. Imported skills under `.agents/skills/` are vendor content and must not be edited silently. Adaptations document wrappers, constraints, and behavioral differences needed to use those skills safely with this toolkit.

## Policy

Preference order:

1. Reuse directly
2. Reference from a workflow
3. Wrap with toolkit instructions
4. Fork only with explicit approval

Do not personalize imported vendor files. Put personal/project behavior in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/
agent-toolkit/adaptations/matt-pocock/
```

## Current coverage

Every imported skill under `.agents/skills/` currently has a corresponding adaptation doc under:

```text
agent-toolkit/adaptations/matt-pocock/
```

See `docs/toolkit-design/adaptation-log.md` for the complete list and maintenance process.

## Common adaptation themes

- Toolkit approval policy overrides upstream write/commit/deploy behavior.
- Toolkit Git policy keeps branches, worktrees, staging, commits, pushes, merges, and PR actions user-controlled.
- Toolkit context paths replace root `CONTEXT.md` assumptions.
- Manual Pi/Codex/Herdr sessions replace automatic sub-agent assumptions.
- Stable repo-local artifacts replace OS-temp defaults when future sessions need continuity.
- Secrets, `.env`, dashboards, CI secrets, infrastructure, and production access are explicit approval gates.
