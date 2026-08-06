# improve-codebase-architecture Adaptation

## Upstream skill name

improve-codebase-architecture

## Upstream path

`.agents/skills/improve-codebase-architecture/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/improve-codebase-architecture/SKILL.md`, hash `bce096b49db40761adb1d5348f064c303fc152e4e50fc3fd81b79df8b6cf137f`.

## Why adaptation was required

The toolkit defaults to supervised, generic Markdown workflows and prohibits silent writes, commits, pushes, deployments, secret access, and automatic delegation. This skill contains assumptions that need wrapper guidance before use.

## Exact behavioral differences

- Follow toolkit approval, git, model-selection, and secrets policies first.
- Treat slash-command or sub-agent language as conceptual guidance, not a required proprietary interface.
- Produce toolkit contracts under stable project paths when the active workflow requires them.
- Do not commit, branch, deploy, mutate infrastructure, or write secrets unless separately approved.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/improve-codebase-architecture/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
