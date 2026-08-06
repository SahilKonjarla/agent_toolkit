# to-spec Adaptation

## Upstream skill name

to-spec

## Upstream path

`.agents/skills/to-spec/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/to-spec/SKILL.md`, hash `7e07d4cfabd1a4f61627ebe2705601784fae7b9aca7e13af3e201ace75738200`.

## Why adaptation was required

The upstream skill publishes directly to the configured issue tracker and assumes Matt Pocock setup conventions. This toolkit treats specifications as durable contracts and requires approval before writing files or creating/updating tracker items.

## Toolkit spec behavior

Use the upstream synthesis discipline, but produce a toolkit feature specification using:

```text
agent-toolkit/contracts/feature-specification.md
```

Default project-local destination after approval:

```text
docs/specs/YYYY-MM-DD-<feature-slug>.md
```

If tracking is configured and the user approves, the spec may also be published to the issue tracker.

## Supervised flow

1. Synthesize from the current conversation and repository inspection.
2. Use domain language from `docs/context/DOMAIN_MODEL.md`.
3. Respect relevant ADRs in `docs/adr/`.
4. Identify existing seams and propose test seams.
5. Ask the user to confirm seams and open questions before finalizing.
6. Draft the spec using the toolkit contract.
7. Ask approval before writing the spec file or creating/updating tracker items.
8. Mark the spec's required roles and proposed model plan.

## Tracking mapping

When upstream instructions mention issue tracker setup or `ready-for-agent` labels, use:

```text
agent-project.yaml tracking section
.agent-project.yaml approvals/git/security sections
.agent-config/overrides/tracking.md
```

Default local fallback:

```text
docs/specs/
.agent-work/tickets/
```

Do not create GitHub/GitLab/Linear/Jira issues, labels, or tickets without explicit approval.

## Spec content preferences

Use the toolkit contract sections:

- Goal
- Background
- Scope
- Out of scope
- Current behavior
- Proposed behavior
- User flows
- API/data contracts
- Acceptance criteria
- Nonfunctional requirements
- Risks
- Open questions
- Required roles
- Proposed model plan

Keep specs implementation-aware but not brittle. Avoid line-by-line implementation plans in the spec unless the detail is a real contract.

## Interview behavior

The upstream skill says not to interview and to synthesize what is already known. In this toolkit, ask clarifying questions when:

- acceptance criteria are ambiguous
- scope boundaries are unclear
- the change affects APIs, migrations, security, platform, or production readiness
- the model plan or specialist roles would materially increase cost
- assumptions would become hard to reverse

## Personalization hooks

Projects may define spec preferences in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/specs.md
```

Useful preferences include spec filename style, acceptance-criteria format, user-story depth, tracker publishing behavior, and whether specs should be local Markdown first.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/to-spec/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
