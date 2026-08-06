# diagnosing-bugs Adaptation

## Upstream skill name

diagnosing-bugs

## Upstream path

`.agents/skills/diagnosing-bugs/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/diagnosing-bugs/SKILL.md`, hash `c86c725ad271ba57d7e9ffd86122b898438314ef9c20ec1dbe03f3e8f149c3b2`.

## Why adaptation was required

The upstream skill is already strongly aligned with this toolkit, but this adaptation binds it to the toolkit's supervised approval, context paths, reporting contracts, and remediation gates.

## Toolkit bug-diagnosis behavior

Use the upstream red-capable feedback-loop discipline. The default rule is:

> Do not propose or implement a fix until there is a tight, red-capable reproduction command, unless the user explicitly approves exploratory fixing.

A red-capable command must:

- drive the actual bug code path
- assert the user's exact symptom
- be deterministic or have a high reproduction rate for flaky bugs
- be fast enough to iterate
- be runnable by the agent without human clicks, except through an approved HITL script

## Supervised flow

1. Capture the user's reported symptom and expected behavior.
2. Redact any logs, traces, screenshots, HAR files, or artifacts before quoting them.
3. Inspect relevant context using toolkit paths:
   - `docs/context/DOMAIN_MODEL.md`
   - `docs/context/PROJECT_CONTEXT.md`
   - `docs/adr/`
4. Propose a reproduction strategy and commands.
5. Ask approval before writing temporary harnesses, adding tests, accessing env/secret files, using private services, or running broad/expensive commands.
6. Build and run the tight loop.
7. Minimize the repro.
8. Produce ranked falsifiable hypotheses.
9. Ask approval before implementation/remediation.
10. Implement only after approval, then verify the loop goes green and regression coverage exists where appropriate.

## Temporary artifacts

Preferred temporary locations:

```text
.agent-work/temporary/bug-repros/
.agent-work/reports/
```

Do not leave debug logs, throwaway harnesses, captured traces, or temporary instrumentation in production paths without reporting them and receiving cleanup/retention approval.

## Debug instrumentation policy

- Tag temporary logs with a unique prefix.
- Change one variable at a time.
- Prefer debuggers/REPLs or targeted boundary logs over broad logging.
- Remove or explicitly report all temporary instrumentation before completion.
- For performance regressions, measure baseline first and fix second.

## Secrets and production safety

- Do not access `.env` or secret-bearing files without approval.
- Do not request or paste raw secrets.
- Redact credentials, auth headers, PII, account IDs, tokens, and private payload data.
- Do not add production instrumentation, query production systems, or run destructive/debug commands against production without explicit approval.

## Reporting requirements

Use `agent-toolkit/contracts/review-report.md` for diagnosis/review findings or `agent-toolkit/contracts/implementation-report.md` after an approved fix. Include:

- reported symptom
- reproduction command and redacted output
- minimized case
- hypotheses considered
- root cause, if confirmed
- fix summary, if implemented
- regression coverage
- commands/tests run
- remaining risks
- exact next action

## Personalization hooks

Projects may define bug-diagnosis preferences in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/debugging.md
```

Useful preferences include allowed test commands, flaky-test policy, logging conventions, approved local fixtures, HITL procedure, and production-debug escalation rules.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/diagnosing-bugs/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
