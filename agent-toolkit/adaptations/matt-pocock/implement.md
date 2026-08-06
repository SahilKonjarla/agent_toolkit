# implement Adaptation

## Upstream skill name

implement

## Upstream path

`.agents/skills/implement/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/implement/SKILL.md`, hash `2139cfedf24791adbc839aaab6019cff158af1e28bfead020ec6e0ce01b3e74d`.

## Why adaptation was required

The toolkit defaults to supervised, generic Markdown workflows and prohibits silent writes, commits, pushes, deployments, secret access, and automatic delegation. This skill contains assumptions that need wrapper guidance before use.

## Exact behavioral differences

- Follow toolkit approval, git, model-selection, and secrets policies first.
- Treat slash-command or sub-agent language as conceptual guidance, not a required proprietary interface.
- Produce toolkit contracts under stable project paths when the active workflow requires them.
- Do not commit, branch, deploy, mutate infrastructure, or write secrets unless separately approved.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/implement/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
