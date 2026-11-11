# AGENTS.md

## Project summary

Example App is an application repository using supervised agent workflows.

## Source of truth

- Project config: `agent-project.yaml`
- Context: `docs/context/PROJECT_CONTEXT.md`
- Domain model: `docs/context/DOMAIN_MODEL.md`
- Toolkit standards: `agent-toolkit/standards/`
- Toolkit workflows: `agent-toolkit/workflows/`
- Toolkit quality skills: `agent-toolkit/skills/quality/README.md`
- Independent bounded worker tasks → `agent-toolkit/standards/delegation-policy.md`

## Rules

Inspect before editing. Ask approval before writes, major workflow phase transitions, broad tests, Git operations, dependency changes, platform changes, env access, remediation, infrastructure, or deployments.

During implementation/review, apply diff-triggered logging/docs checks in `agent-toolkit/standards/engineering-principles.md`. Select focused review passes through `agent-toolkit/standards/review-specialists.md` and keep Standards/Spec results separate.

## Completion reports

Include summary, files changed, commands run, tests run, assumptions, limitations, risks, and next step.
