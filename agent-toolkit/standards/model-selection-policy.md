# Model Selection Policy

Use capability tiers rather than hard-coded model names:

```yaml
models:
  economical: null
  standard: null
  high_reasoning: null
  long_context: null
  fast_review: null
```

## Tier use

- `economical`: repository scanning, bounded summarization, simple transformations, routine file inventory, quick script/test checks.
- `standard`: normal coding, routine implementation, ordinary planning, typical reviews.
- `high_reasoning`: architecture, complex debugging, security analysis, irreversible decisions, data migrations, production readiness, final high-risk review.
- `long_context`: large repository or broad document analysis when artifacts cannot be narrowed first.
- `fast_review`: quick bounded follow-up verification, small diffs, post-remediation checks.

## Sahil defaults

- Start with the lowest tier likely to be reliable.
- Do not use high reasoning just because the task involves code.
- Use high reasoning when a wrong answer would be expensive, risky, security-sensitive, or hard to reverse.
- Ask before materially increasing model tier, session count, context breadth, provider, authentication method, or billing mode.
- Prefer durable artifacts over repeated full scans.

## Model execution plan requirements

The Architect must produce a model execution plan for multi-phase or multi-session workflows. Include:

- workflow and phases
- role/session count estimate
- tier per phase
- what context will be reused
- cost/rate-limit risk
- escalation triggers
- approval required before expansion

## Cost-control rules

- Narrow scope before loading broad context.
- Reuse specs, reports, inventories, and handoffs.
- Avoid unnecessary specialists.
- Prefer fast verification commands before broad suites.
- Stop and ask if cost/rate-limit pressure becomes materially higher than planned.
