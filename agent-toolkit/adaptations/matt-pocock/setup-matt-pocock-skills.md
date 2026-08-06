# setup-matt-pocock-skills Adaptation

## Upstream skill name

setup-matt-pocock-skills

## Upstream path

`.agents/skills/setup-matt-pocock-skills/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/engineering/setup-matt-pocock-skills/SKILL.md`, hash `f9c2b933dda18eea572e96f6ebbcd5b30e0d1bfdc074af53cc99728dc5f0bdac`.

## Why adaptation was required

The toolkit defaults to supervised, generic Markdown workflows and prohibits silent writes, commits, pushes, deployments, secret access, and automatic delegation. This skill contains assumptions that need wrapper guidance before use.

## Exact behavioral differences

- Follow toolkit approval, git, model-selection, and secrets policies first.
- Treat slash-command or sub-agent language as conceptual guidance, not a required proprietary interface.
- Produce toolkit contracts under stable project paths when the active workflow requires them.
- Do not commit, branch, deploy, mutate infrastructure, or write secrets unless separately approved.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/setup-matt-pocock-skills/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
