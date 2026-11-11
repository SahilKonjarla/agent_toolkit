# Toolkit Architecture

## Design

The toolkit uses generic Markdown as the canonical source for agent roles, workflows, standards, and contracts. Tool-specific behavior is thin usage guidance around those files.

## Layers

1. Universal standards: safety, approval, Git, secrets, model selection, completion.
2. Contracts: durable artifacts passed between sessions.
3. Agents: role-specific responsibilities and boundaries.
4. Workflows: user-facing outcomes that compose agents and contracts.
5. Profiles: optional stack/deployment/compliance overlays.
6. Scripts: safe bootstrap, update inspection, and skill inventory.

## Vendor boundary

`.agents/skills/` is imported upstream content. Toolkit-owned content lives under `agent-toolkit/`. Adaptation docs explain how to compose imported skills safely without editing them.

## Execution model

Version one is human-supervised. Agents inspect and propose freely, then request approval before writes, phase transitions, broad tests, Git mutations, secret access, platform changes, remediation, infrastructure, or deployments.

## Coordination

Pi is the primary runtime. Codex CLI can be an independent worker. Herdr can arrange manual terminal sessions but does not provide orchestration or isolation. Stable artifacts replace chat-history transfer.

Optional delegation follows `agent-toolkit/standards/delegation-policy.md`; no runner is bundled. Background runtime/fleet integration remains pending the checklist in `pi-background-agents.md`. Workflows fall back to sequential execution when compatible approved dispatch is unavailable.

## Owned skill discovery

Toolkit-owned skills live under `agent-toolkit/skills/<category>/<name>/SKILL.md`. The initializer combines these sources with locked `.agents/skills/` imports when creating downstream project links. It preserves project-owned name collisions and keeps vendor lock/inventory metadata separate. The skill index and generated project guidance provide task triggers; nested files in this checkout do not imply global runtime installation.
