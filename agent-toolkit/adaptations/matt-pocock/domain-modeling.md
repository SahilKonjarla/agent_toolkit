# domain-modeling Adaptation

## Upstream skill name

domain-modeling

## Upstream path

`.agents/skills/domain-modeling/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/domain-modeling/SKILL.md`, hash `363cb0f53b0b431e7c00086ad1f823500b7e1b70b5616ee969c979f0934e9e6e`.

## Why adaptation was required

The toolkit defaults to supervised, generic Markdown workflows and prohibits silent writes, commits, pushes, deployments, secret access, and automatic delegation. This skill contains assumptions that need wrapper guidance before use.

## Exact behavioral differences

- Follow toolkit approval, git, model-selection, and secrets policies first.
- Treat slash-command or sub-agent language as conceptual guidance, not a required proprietary interface.
- Produce toolkit contracts under stable project paths when the active workflow requires them.
- Do not commit, branch, deploy, mutate infrastructure, or write secrets unless separately approved.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/domain-modeling/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
