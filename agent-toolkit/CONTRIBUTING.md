# Contributing

## Principles

- Keep canonical definitions generic Markdown.
- Keep vendor skills under `.agents/skills/` separate and unmodified.
- Prefer wrappers/adaptations over forks.
- Preserve supervised defaults.
- Add tests for script behavior.
- Do not include secrets, client data, credentials, account IDs, or environment values.

## Development

Use Python 3.11+. Scripts must use type hints, `pathlib`, safe path validation, clear errors, and non-destructive defaults. Prefer stdlib dependencies; PyYAML is the only required third-party package.

## Testing

Run:

```bash
python -m py_compile agent-toolkit/scripts/*.py
python -m unittest discover -s agent-toolkit/tests
```

## Versioning

Update `VERSION` and `CHANGELOG.md` for user-visible changes. Follow semantic versioning: MAJOR for breaking changes, MINOR for compatible features, PATCH for fixes/docs.
