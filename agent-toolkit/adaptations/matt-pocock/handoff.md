# handoff Adaptation

## Upstream skill name

handoff

## Upstream path

`.agents/skills/handoff/SKILL.md`

## Upstream version or commit

Not discoverable from install; lock metadata: source `mattpocock/skills`, skill path `skills/productivity/handoff/SKILL.md`, hash `ad03e8d4ea3cbbff66420eb7ba3cc375b5cbe1821a2449b53e863256cf5b5cde`.

## Why adaptation was required

The toolkit defaults to supervised, generic Markdown workflows and prohibits silent writes, commits, pushes, deployments, secret access, and automatic delegation. This skill contains assumptions that need wrapper guidance before use.

## Exact behavioral differences

- Follow toolkit approval, git, model-selection, and secrets policies first.
- Treat slash-command or sub-agent language as conceptual guidance, not a required proprietary interface.
- Produce toolkit contracts under stable project paths when the active workflow requires them.
- Do not commit, branch, deploy, mutate infrastructure, or write secrets unless separately approved.

## Maintenance notes

Re-check this adaptation whenever `.agents/skills/handoff/SKILL.md` or `skills-lock.json` changes. Prefer wrapper updates over vendor edits.
