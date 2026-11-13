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

Pi is the primary runtime. Codex CLI can be an independent worker. Herdr organizes terminals and can manage worktree-backed workspaces; terminal layout alone does not isolate writes or grant task authority. Stable artifacts replace chat-history transfer.

Optional delegation follows `agent-toolkit/standards/delegation-policy.md`; no runner is bundled. The optional `agent-toolkit/integrations/pi/` adapter registers ephemeral task-defined workers through pi-subagents' public runtime-agent API, selects tools by task kind, and projects public RPC status into local footer events. Five atomic background slots each admit one child; composite/nested fan-out cannot multiply the cap. Approved test work gets shell access; approved implementation receives a managed worktree. Local installation, live verification and limitations are recorded in `pi-background-agents.md`. Workflows fall back to sequential execution when compatible approved dispatch is unavailable.

## Herdr presentation seam

The optional adapter records owner-scoped native dispatch bindings and exposes `agent_inspector` for at most two read-only views. Herdr remains an external host; the viewer reads only documented public status/output artifacts and never executes or controls jobs. A private manifest, token-bound receipt, foreground process/start identity, and serialized reservations govern reuse/close across reload. CLI admission is separate from verified process startup. Existing upstream metadata remains the source of native active-job summaries; the adapter adds filtered notifications, not a competing lifecycle publisher.

Independent Pi chats/workspaces and shared cross-chat admission remain deferred. See `herdr-observers.md` for implemented behavior and `herdr-bounded-orchestration.md` for the broader proposal.

## Owned skill discovery

Toolkit-owned skills live under `agent-toolkit/skills/<category>/<name>/SKILL.md`. The initializer combines these sources with locked `.agents/skills/` imports when creating downstream project links. It preserves project-owned name collisions and keeps vendor lock/inventory metadata separate. The skill index and generated project guidance provide task triggers; nested files in this checkout do not imply global runtime installation.
