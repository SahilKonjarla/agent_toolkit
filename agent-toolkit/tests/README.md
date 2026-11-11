# Tests

Run from the toolkit checkout root:

```bash
python3 -m unittest discover -s agent-toolkit/tests
```

Tests use temporary directories for initialization, skill sync, update inspection and imported inventory behavior. Owned-skill tests cover downstream links, dry-run behavior, duplicate names, stale-link removal, invalid names, frontmatter and instruction paths.

PyYAML is required for full initialization coverage. Without it, YAML-dependent tests explicitly skip; owned-skill discovery and sync tests still run. Python bytecode and cache directories are ignored and no longer versioned. For syntax checking with cache output outside the checkout:

```bash
PYTHONPYCACHEPREFIX=/tmp/agent-toolkit-pycache python3 -m py_compile agent-toolkit/scripts/*.py
```

These tests validate packaging and scripts, not live GitHub reviews, browser QA or background-runtime compatibility. Those require approved integration checks in a configured environment.
