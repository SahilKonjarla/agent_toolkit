# resolving-merge-conflicts Adaptation

## Upstream skill name

resolving-merge-conflicts

## Upstream path

`.agents/skills/resolving-merge-conflicts/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/resolving-merge-conflicts/SKILL.md`, hash `28aad6f8b1b7025abc8892fa8890f68fe1533499b28a565f416b159131d22fad`.

## Why adaptation was required

The toolkit defaults to supervised, generic Markdown workflows and prohibits silent writes, commits, pushes, deployments, secret access, and automatic delegation. This skill contains assumptions that need wrapper guidance before use.

## Exact behavioral differences

- Follow toolkit approval, git, model-selection, and secrets policies first.
- Treat slash-command or sub-agent language as conceptual guidance, not a required proprietary interface.
- Produce toolkit contracts under stable project paths when the active workflow requires them.
- Do not commit, branch, deploy, mutate infrastructure, or write secrets unless separately approved.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/resolving-merge-conflicts/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
