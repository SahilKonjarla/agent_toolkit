# writing-for-agents Adaptation

## Upstream skill name

writing-for-agents

## Upstream path

`.agents/skills/writing-for-agents/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/productivity/writing-for-agents/SKILL.md`, hash `ccfa1e94d8f6ab5c6a1edd55293ca477faf93c39207771331efdb1e798ed21d6`.

## Why adaptation was required

The upstream skill is strong general guidance for agent-facing docs. This adaptation binds it to the toolkit's source-of-truth layout, vendor boundary, approval policy, and personal/project customization rules.

## Toolkit writing behavior

Use the upstream principles:

- strong context pointers
- progressive disclosure
- co-location
- clear completion criteria
- leading words
- pruning
- avoiding stale caches of environment facts

Apply them to toolkit and project files without duplicating instructions unnecessarily.

## Source-of-truth layout

Use the right file for the right kind of instruction:

```text
agent-toolkit/agents/ → generic role behavior
agent-toolkit/workflows/ → generic outcome process
agent-toolkit/standards/ → universal policy
agent-toolkit/contracts/ → artifact templates
agent-toolkit/templates/ → generated project-local defaults
agent-toolkit/adaptations/ → imported skill wrapper behavior
agent-project.yaml → project configuration
AGENTS.md → concise always-loaded project instructions
.agent-config/overrides/ → project/personal overrides
docs/context/ → durable project context and domain model
```

Do not place project/client-specific instructions inside `agent-toolkit/` when the toolkit is installed as a submodule.

## AGENTS.md rules

`AGENTS.md` is always-loaded context, so keep it short and pointer-rich.

Include:

- project summary
- source-of-truth paths
- development commands or pointers to config
- approval/Git/secrets restrictions
- completion-report expectations
- personal operating preferences

Avoid:

- duplicating entire standards files
- restating package scripts that can be read from config
- long tutorials
- secrets or environment values
- stale generated summaries

## Vendor boundary

Do not edit `.agents/skills/` for personalization. Prefer:

```text
agent-toolkit/adaptations/matt-pocock/<skill>.md
AGENTS.md
.agent-config/overrides/<topic>.md
```

If a vendor skill must be forked, document why, exact behavioral differences, and maintenance notes before changing behavior.

## Approval and safety rules

- Ask approval before modifying agent-facing instructions.
- Never add secret values, account IDs, private customer data, tokens, or `.env` values.
- Do not silently change model/provider/billing/authentication instructions.
- Do not encode project-specific Git or deployment permissions in the generic toolkit unless they are safe defaults.

## Personal style customization

Personal preferences should be concise and operational. Good examples:

- `Prefer short plans before code changes.`
- `Ask before adding dependencies or new directories.`
- `Report skipped tests explicitly.`
- `Suggest commit messages but do not commit.`

Avoid vague preferences like `be better`, `write good code`, or `think carefully` unless paired with checkable behavior.

## Review checklist for agent docs

Before finishing an agent-facing document, check:

- Is this the right source-of-truth file?
- Is any instruction duplicated elsewhere?
- Is any environment fact cached unnecessarily?
- Are approval, Git, and secrets policies preserved?
- Are project-specific details outside the reusable toolkit?
- Are completion criteria checkable?
- Are links/pointers clear and reachable?

## Personalization hooks

Projects may define writing preferences in:

```text
AGENTS.md
.agent-config/overrides/writing-for-agents.md
```

Useful preferences include desired verbosity, report style, section order, whether to include examples, and how aggressively to prune stale docs.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/writing-for-agents/SKILL.md`, `SKILL-MECHANICS.md`, or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
