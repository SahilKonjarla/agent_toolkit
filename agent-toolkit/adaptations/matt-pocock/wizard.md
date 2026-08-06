# wizard Adaptation

## Upstream skill name

wizard

## Upstream path

`.agents/skills/wizard/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/wizard/SKILL.md`, hash `2c0d1187398b1b7ebb9902a4c91b24181ee07892f285615b46c59f45e2c4229c`.

## Why adaptation was required

The upstream skill can generate scripts that write `.env` files, set GitHub secrets, open URLs, and guide infrastructure or credential setup. This toolkit requires explicit approval for secret handling, environment-file access, CI secret changes, infrastructure actions, browser opening, and executable script creation.

## Toolkit wizard behavior

Use a wizard only for steps the agent cannot safely perform directly and that genuinely require human interaction, such as:

- third-party dashboard setup
- credential or secret creation
- CI secret entry
- manual infrastructure/account configuration
- one-off cutover checklists
- migrations requiring human approval at each stage

Do not use a wizard for normal agent-runnable tasks.

## Supervised flow

1. Inspect relevant repository files read-only.
2. Ask approval before reading `.env`, `.env.*`, secret-bearing files, private dashboards, or account-specific docs.
3. List proposed wizard stages and values captured.
4. For each value, state where it comes from, where it will be written, whether it is secret, and whether it affects billing/infrastructure/production.
5. Ask approval before writing the wizard script.
6. Ask approval before making it executable.
7. Validate statically with `bash -n`; run `shellcheck` only if available and approved/cheap.
8. Do not run the wizard end-to-end; it is for the human.
9. Report how to run it and what manual approvals remain.

## Location policy

Default location for one-off wizards:

```text
.agent-work/temporary/wizards/<purpose>.sh
```

For repeatable project setup, use a project-approved durable path such as:

```text
scripts/setup/<purpose>.sh
```

Durable scripts require separate approval and should be documented in the project README or runbook.

## Secret and env policy

- Do not read `.env` or secret-bearing files without approval.
- Do not write secret values into repo-tracked files.
- Prefer secret references and human-entered hidden prompts.
- Do not print secrets in summaries, reports, logs, or handoffs.
- Do not run `gh secret set`, `glab`, cloud CLIs, or dashboard automation without explicit approval.
- Confirm each irreversible or production-impacting stage inside the wizard.

## Browser/open URL policy

Do not automatically open URLs from the agent session unless approved. A wizard may include `open_url` steps for the human to run, but the agent should not execute the wizard end-to-end.

## Git behavior override

Do not commit generated wizards or link them from README automatically. If a wizard should become durable project setup, recommend the file path, docs update, and commit message, then wait for approval.

## Personalization hooks

Projects may define wizard preferences in:

```text
AGENTS.md
agent-project.yaml
.agent-config/overrides/wizards.md
.agent-config/overrides/secrets.md
```

Useful preferences include allowed wizard directories, shell style, whether `gh`/`glab` are permitted, secret manager conventions, dashboard source-of-truth links, and required human confirmation wording.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/wizard/SKILL.md`, `.agents/skills/wizard/template.sh`, or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
