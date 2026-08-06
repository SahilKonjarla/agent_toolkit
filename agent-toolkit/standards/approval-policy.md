# Approval Policy

Default mode:

```yaml
approvals:
  mode: supervised
```

## Mandatory approval gates

Approval is mandatory before:

- writing or modifying files
- major workflow phase transitions
- dependency additions/removals/upgrades
- database migrations
- public API/data contract changes
- Docker, CI, CD, deployment, infrastructure, or environment changes
- broad, slow, expensive, stateful, networked, or destructive tests
- `.env` or secret-bearing file access
- branch/worktree creation
- staging, committing, pushing, merging, opening/modifying PRs
- issue tracker mutations when not already approved
- provisioning infrastructure
- changing secret values or secret references
- deployments
- destructive commands
- remediation after a review

## Read-only actions allowed without approval

- Reading files
- Searching the repository
- Inspecting Git status/diffs/logs when policy allows
- Running clearly read-only commands
- Drafting plans without saving them
- Reporting findings

## Preferred approval request format

Use this format unless the user has specified another:

```md
Approval request

Proposed action:
Files/systems affected:
Why it is needed:
Risks:
Reversibility:
Expected validation:
Overrides consulted:
```

Keep requests concise. Ask for one coherent approval at a time; avoid bundling unrelated risky actions.

## Personalization limits

Project overrides may specialize approval wording or preferred validation, but they must not silently remove mandatory approval gates. If an override appears to weaken safety, ask the user to confirm in the current session.
