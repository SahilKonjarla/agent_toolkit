# Adaptation Log

Vendor files under `.agents/skills/` are not modified. All toolkit-specific behavior is documented as wrappers under `agent-toolkit/adaptations/matt-pocock/`.

## Coverage

All imported Matt Pocock skills currently have adaptation docs.

| Skill | Adaptation doc | Primary customization |
|---|---|---|
| `code-review` | `agent-toolkit/adaptations/matt-pocock/code-review.md` | Two-axis review mapped to toolkit severity, contracts, manual sessions, and remediation approval. |
| `codebase-design` | `agent-toolkit/adaptations/matt-pocock/codebase-design.md` | Deep-module vocabulary mapped to toolkit context paths and supervised design. |
| `diagnosing-bugs` | `agent-toolkit/adaptations/matt-pocock/diagnosing-bugs.md` | Red-capable reproduction required before fixes unless exploratory fixing is approved. |
| `domain-modeling` | `agent-toolkit/adaptations/matt-pocock/domain-modeling.md` | Root `CONTEXT.md` mapped to `docs/context/DOMAIN_MODEL.md` and `PROJECT_CONTEXT.md`. |
| `grill-with-docs` | `agent-toolkit/adaptations/matt-pocock/grill-with-docs.md` | Planning interviews mapped to toolkit docs and approval-gated writes. |
| `handoff` | `agent-toolkit/adaptations/matt-pocock/handoff.md` | Handoffs default to `.agent-work/handoffs/` instead of OS temp. |
| `implement` | `agent-toolkit/adaptations/matt-pocock/implement.md` | Upstream commit behavior replaced with supervised report-and-stop flow. |
| `improve-codebase-architecture` | `agent-toolkit/adaptations/matt-pocock/improve-codebase-architecture.md` | Sub-agent/HTML/browser behavior made manual and approval-gated. |
| `prototype` | `agent-toolkit/adaptations/matt-pocock/prototype.md` | Prototypes default to `.agent-work/temporary/prototypes/`; Git and persistence are gated. |
| `research` | `agent-toolkit/adaptations/matt-pocock/research.md` | Background-agent assumption replaced with manual-session policy and primary-source report rules. |
| `resolving-merge-conflicts` | `agent-toolkit/adaptations/matt-pocock/resolving-merge-conflicts.md` | Resolve/abort/stage/commit/continue all require explicit approval. |
| `setup-matt-pocock-skills` | `agent-toolkit/adaptations/matt-pocock/setup-matt-pocock-skills.md` | Toolkit initializer is primary; upstream setup conventions are mapped to project config. |
| `tdd` | `agent-toolkit/adaptations/matt-pocock/tdd.md` | TDD seams, writes, and test commands are approval/config bound. |
| `to-spec` | `agent-toolkit/adaptations/matt-pocock/to-spec.md` | Specs default to `docs/specs/` and tracker publishing is approval-gated. |
| `to-tickets` | `agent-toolkit/adaptations/matt-pocock/to-tickets.md` | Tickets default to `.agent-work/tickets/` and tracker publishing is approval-gated. |
| `wizard` | `agent-toolkit/adaptations/matt-pocock/wizard.md` | Env/secret/CI/infrastructure wizard behavior is tightly approval-gated. |
| `writing-for-agents` | `agent-toolkit/adaptations/matt-pocock/writing-for-agents.md` | Agent docs use toolkit source-of-truth layout, concise pointers, and no secrets. |

## Maintenance process

When `.agents/skills/` or `skills-lock.json` changes:

1. Run `python agent-toolkit/scripts/inventory_skills.py`.
2. Check whether every imported skill still has an adaptation doc.
3. Re-read changed upstream `SKILL.md` files.
4. Update adaptation docs for new assumptions or risky behavior.
5. Do not edit vendor files unless explicitly approved and documented as a fork.
