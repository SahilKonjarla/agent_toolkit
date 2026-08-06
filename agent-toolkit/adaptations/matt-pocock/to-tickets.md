# to-tickets Adaptation

## Upstream skill name

to-tickets

## Upstream path

`.agents/skills/to-tickets/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/to-tickets/SKILL.md`, hash `0349eee265e7005e667b4543de849672106c46d545e998f37d3319300bb07751`.

## Why adaptation was required

The upstream skill publishes tickets to the configured tracker and uses `.scratch/` for local Markdown. This toolkit uses `.agent-work/tickets/` as the default local work area and requires approval before writing files or creating/updating tracker items.

## Toolkit ticket behavior

Use the upstream tracer-bullet slicing discipline:

- vertical slices over horizontal layers
- each ticket demoable/verifiable on its own
- explicit blocking edges
- expand–contract handling for wide refactors
- user review of granularity and dependencies before publishing

Default local destination after approval:

```text
.agent-work/tickets/<feature-slug>/<NN>-<ticket-slug>.md
```

If the user approves tracker publishing, use the configured provider from `agent-project.yaml` or `.agent-config/overrides/tracking.md`.

## Supervised flow

1. Read the source plan/spec/conversation context.
2. Inspect the repository only as needed to understand slicing and existing seams.
3. Use domain terms from `docs/context/DOMAIN_MODEL.md`.
4. Respect ADRs in `docs/adr/`.
5. Draft ticket breakdown in the chat first.
6. Ask the user whether granularity and blocking edges are correct.
7. Ask approval before writing ticket files or creating tracker issues.
8. Publish only approved tickets.
9. Do not close, modify, or relabel parent issues unless separately approved.

## Tracking mapping

Map upstream `.scratch/` and setup assumptions to toolkit paths:

```text
.scratch/<feature>/issues/ → .agent-work/tickets/<feature-slug>/
docs/agents/issue-tracker.md → agent-project.yaml tracking section
triage labels → .agent-config/overrides/tracking.md or tracker docs
```

Do not create GitHub/GitLab/Linear/Jira issues, labels, blocking links, or parent-child relationships without explicit approval.

## Ticket template

Use one file per ticket for local Markdown:

```md
# <NN> — <Ticket title>

## Parent

Reference to source spec/issue, if any.

## What to build

The end-to-end behavior this ticket makes work from the user's perspective.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

Other ticket numbers/titles, or `None — can start immediately`.

## Status

ready-for-agent
```

Avoid brittle file paths or code snippets unless they encode an approved contract that prose cannot capture cleanly.

## Frontier policy

Agents should work only on tickets whose blockers are complete or explicitly waived by the user. For parallel sessions, the user chooses Git isolation strategy before implementation begins.

## Personalization hooks

Projects may define ticket preferences in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/tickets.md
.agent-config/overrides/tracking.md
```

Useful preferences include ticket path, numbering style, tracker provider, label vocabulary, maximum ticket size, acceptance-criteria format, and whether to include suggested model tiers per ticket.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/to-tickets/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
