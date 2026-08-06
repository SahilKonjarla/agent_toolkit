# Approval Policy

Default mode:

```yaml
approvals:
  mode: supervised
```

Approval is mandatory before writing files, major workflow phase transitions, dependency changes, migrations, public API changes, Docker/CI/CD/infrastructure/deployment changes, broad or expensive tests, `.env` or secret access, branch/worktree creation, commit, push, PR/merge actions, provisioning, secret changes, deployments, destructive commands, or review remediation.

Read-only inspection may proceed without approval.

Approval requests must include proposed action, affected files/systems, reason, risks, reversibility, and expected validation.
