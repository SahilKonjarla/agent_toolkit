# Toolkit scripts

- `init_project.py`: supervised project initialization and downstream skill synchronization. Use `--dry-run` to preview without writes. Existing generated files and project-owned skills are preserved.
- `init_project.py skills sync --root <project>`: refresh managed skill links only. Combines vendor names from `skills-lock.json` with toolkit-owned `skills/<category>/<name>/SKILL.md` sources; leaves vendor metadata unchanged. Name collisions are reported rather than overwriting project content.
- `update_toolkit.py`: inspect toolkit version/layout and provide supervised update guidance. Never commits, pushes or updates imported skills.
- `inventory_skills.py`: inventory imported `.agents/skills/` only. Toolkit-owned skills are documented separately in `../skills/quality/README.md`.

`/reload` is not a project toolkit updater: it reloads resources in the one Pi chat where it runs. Global extension files may be shared, while project toolkit checkouts and skill links remain separate. `update_toolkit.py` does not check out a new revision or merge local modifications. A nested `.git` file can be mistaken for a registered submodule by its layout heuristic; verify the parent actually tracks a mode-160000 gitlink before using submodule update instructions.

Use each script's `--help` for supported arguments. YAML initialization requires PyYAML; read-only skill discovery and direct synchronization can be tested without it. See `../tests/README.md` for validation.
