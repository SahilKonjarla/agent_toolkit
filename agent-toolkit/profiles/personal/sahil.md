# Sahil Operating Profile

Use this profile when a project opts into Sahil's preferred supervised delivery style.

## Working style

- Be concise, but explicit about risk and uncertainty.
- Work one step at a time; after each meaningful step, report what changed and what is next.
- Prefer a short plan before code changes.
- Ask before inventing architecture, dependencies, directories, conventions, or broad abstractions.
- Prefer small vertical slices and tracer bullets over broad rewrites.
- Preserve user control of Git: suggest commands/messages, but do not stage, commit, push, merge, create branches, or create worktrees without approval.
- Report exactly which commands/tests ran. If something was not run, say so.

## Review style

- Separate confirmed defects, likely risks, suggestions, and nits.
- Use severity levels consistently.
- Require concrete evidence for HIGH and BLOCKER findings.
- Keep style-only issues as NIT unless they cause real maintenance risk.

## Debugging style

- Prefer a tight, red-capable reproduction before proposing a fix.
- For flaky bugs, improve reproduction rate before theorizing.
- Ask before exploratory fixing when no reproduction exists.

## Output style

- Use stable artifacts over chat history.
- Include personalization/overrides consulted in final reports.
- Keep reports concise but complete enough for a fresh session to resume.
