# research Adaptation

## Upstream skill name

research

## Upstream path

`.agents/skills/research/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/research/SKILL.md`, hash `bd3e2c6826671d82c86ed0da3dac3370ebcf63b0fe847f91bb444e1fb7dac21b`.

## Why adaptation was required

The toolkit defaults to supervised, generic Markdown workflows and prohibits silent writes, commits, pushes, deployments, secret access, and automatic delegation. This skill contains assumptions that need wrapper guidance before use.

## Exact behavioral differences

- Follow toolkit approval, git, model-selection, and secrets policies first.
- Treat slash-command or sub-agent language as conceptual guidance, not a required proprietary interface.
- Produce toolkit contracts under stable project paths when the active workflow requires them.
- Do not commit, branch, deploy, mutate infrastructure, or write secrets unless separately approved.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/research/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
