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

Economical: scanning, bounded summaries, simple transformations. Standard: routine coding. High reasoning: architecture, complex debugging, security, irreversible decisions. Long context: broad repository/document analysis. Fast review: bounded follow-up checks.

Prefer the lowest reliable tier, reuse artifacts, avoid repeated full scans, and ask before increasing sessions or changing provider/auth/billing assumptions.
