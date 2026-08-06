# handoff Adaptation

## Upstream skill name

handoff

## Upstream path

`.agents/skills/handoff/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/productivity/handoff/SKILL.md`, hash `ad03e8d4ea3cbbff66420eb7ba3cc375b5cbe1821a2449b53e863256cf5b5cbe`.

## Why adaptation was required

The upstream skill writes handoff documents to the operating-system temporary directory. This toolkit prefers stable repo-local artifacts so future Pi, Codex CLI, or manually managed Herdr sessions can resume work without relying on chat history or temp files.

## Toolkit behavior

Use the upstream handoff structure, but save handoff artifacts to the initialized project path:

```text
.agent-work/handoffs/
```

Use a timestamped, descriptive filename:

```text
.agent-work/handoffs/YYYY-MM-DD-HHMM-<purpose-slug>.md
```

Only use the OS temp directory when the user explicitly asks for a disposable handoff outside the repository.

## Required handoff content

Follow `agent-toolkit/contracts/handoff-report.md` and include:

- Objective
- Current status
- Completed work
- Important decisions
- Relevant files
- Commands and results
- Remaining work
- Risks
- Exact next action
- Suggested skills or roles for the next session

Do not duplicate full specs, reports, diffs, or chat transcripts. Reference stable artifacts by path instead.

## Approval and safety rules

- Ask approval before writing the handoff file unless the active workflow already approved handoff artifact creation.
- Redact secrets, credentials, PII, tokens, `.env` values, and billing/account details.
- Do not include secret values in handoffs.
- Do not commit, push, create branches, or open PRs as part of handoff creation.
- If the handoff references uncommitted changes, clearly say they are uncommitted.

## Personalization hooks

Projects may override the handoff destination in `agent-project.yaml`:

```yaml
paths:
  temporary_work: .agent-work
```

Personal preferences may be added to `.agent-config/overrides/`, such as preferred handoff length, naming style, or whether to include command output summaries.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/handoff/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
