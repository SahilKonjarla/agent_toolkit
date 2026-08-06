# tdd Adaptation

## Upstream skill name

tdd

## Upstream path

`.agents/skills/tdd/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/tdd/SKILL.md`, hash `614ac2e45fb0ec02f6ce422d26bd9aa4e33aa4867323f5a3a5c0c20b96f78ff4`.

## Why adaptation was required

The upstream skill aligns well with this toolkit but assumes root `CONTEXT.md` and does not explicitly bind test creation/runs to the toolkit approval policy and project command configuration.

## Toolkit TDD behavior

Use the upstream red → green discipline:

- agree on seams first
- write one failing test
- implement the minimum code to pass
- avoid speculative behavior
- keep tests behavior-focused and public-interface-oriented

Before writing tests, state:

- the seam under test
- why that seam represents user-visible behavior
- the first red test to add
- expected test command
- files likely affected

Then ask approval before writing unless the active workflow already approved test creation for this scope.

## Context mapping

When upstream instructions mention `CONTEXT.md`, use:

```text
docs/context/DOMAIN_MODEL.md
docs/context/PROJECT_CONTEXT.md
docs/adr/
```

Use domain terms from `DOMAIN_MODEL.md` in test names where relevant.

## Test command policy

Use commands from `agent-project.yaml` when available:

```yaml
commands:
  test_unit: null
  test_integration: null
  test_e2e: null
  typecheck: null
  lint: null
```

If commands are unknown, inspect the repository first. Do not invent commands. Ask before broad, slow, expensive, stateful, networked, or destructive test runs.

## Seams policy

Tests should verify behavior through public interfaces. Avoid:

- private method tests
- implementation-coupled mocks
- tautological expected values
- snapshots without independent meaning
- broad horizontal test plans before learning from the first slice

If no good seam exists, report that as an architecture/testability finding and ask whether to use `codebase-design` guidance before proceeding.

## Refactoring policy

Do not mix broad refactoring into the red → green loop. Keep refactors separate, scoped, and approved. If refactoring is necessary to make the change safe, propose it as a prefactor or follow-up phase.

## Reporting requirements

Implementation or test reports should include:

- agreed seam
- tests added/updated
- red command/result, if observed
- green command/result, if observed
- implementation files changed
- skipped tests and why
- risks or coverage gaps

## Personalization hooks

Projects may define TDD preferences in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/testing.md
```

Useful preferences include unit/integration/e2e boundaries, mocking policy, snapshot policy, flaky-test rules, test naming conventions, and approved fast test commands.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/tdd/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
