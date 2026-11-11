#!/usr/bin/env python3
"""Supervised project initializer for the agent toolkit."""
from __future__ import annotations
import argparse, json, os, re, shutil, sys, tempfile
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any

try:
    import yaml  # type: ignore
except ModuleNotFoundError:  # graceful required-dependency error
    yaml = None

SECRET_RE=re.compile(r'(api[_-]?key|secret|token|password|passwd|private[_-]?key)\s*[:=]\s*[^\s]+', re.I)

@dataclass
class SkillSyncResult:
    linked: list[str]
    repaired: list[str]
    unchanged: list[str]
    removed: list[str]
    preserved: list[str]
    warnings: list[str]
    skills_dir: Path
    toolkit_root: Path

    @property
    def managed(self) -> list[str]:
        return sorted(set(self.linked + self.repaired + self.unchanged))


@dataclass
class ProjectConfig:
    project: dict[str, Any]
    stack: dict[str, Any]
    commands: dict[str, Any]
    platform: dict[str, Any]
    tracking: dict[str, Any]
    paths: dict[str, str]
    personalization: dict[str, Any]
    models: dict[str, Any]
    approvals: dict[str, Any]
    git: dict[str, Any]
    security: dict[str, Any]
    herdr: dict[str, Any]

def require_yaml() -> None:
    if yaml is None:
        raise RuntimeError('Missing dependency PyYAML. Install with: python -m pip install PyYAML')

def safe_inside(root: Path, path: Path) -> Path:
    resolved=(root/path).resolve() if not path.is_absolute() else path.resolve()
    if root.resolve() not in (resolved, *resolved.parents):
        raise ValueError(f'Path escapes project root: {path}')
    return resolved

def detect(root: Path) -> dict[str, Any]:
    data={'commands':{}, 'stack': {'backend':{}, 'frontend':{}, 'database':{}, 'jobs':{}, 'testing':{}}, 'platform':{}}
    pkg=root/'package.json'
    if pkg.exists():
        try:
            j=json.loads(pkg.read_text())
            scripts=j.get('scripts',{})
            data['commands'].update({k:scripts.get(k) for k in ('start','lint','build') if scripts.get(k)})
            if scripts.get('test'): data['commands']['test_unit']=scripts['test']
            data['stack']['frontend']['language']='typescript' if (root/'tsconfig.json').exists() else 'javascript'
            data['stack']['frontend']['package_manager']='pnpm' if (root/'pnpm-lock.yaml').exists() else 'npm'
        except Exception: pass
    if (root/'pyproject.toml').exists() or list(root.glob('requirements*.txt')):
        data['stack']['backend']['language']='python'
    if list(root.glob('Dockerfile*')) or list(root.glob('*compose*.yml')) or list(root.glob('*compose*.yaml')):
        data['platform']['docker']=True
    if (root/'.github'/'workflows').exists(): data['platform']['ci_provider']='github-actions'
    return data

def default_config(root: Path, quick: bool=False) -> ProjectConfig:
    d=detect(root)
    return ProjectConfig(
        project={'name': root.name, 'client':'', 'description':'', 'repository_type':'application', 'stage':'development'},
        stack={
            'backend': {'language':None,'framework':None,'package_manager':None} | d['stack'].get('backend',{}),
            'frontend': {'language':None,'framework':None,'package_manager':None} | d['stack'].get('frontend',{}),
            'database': {'engine':None,'migrations':None}, 'jobs': {'framework':None,'broker':None},
            'testing': {'unit':None,'integration':None,'e2e':None}},
        commands={'install':None,'start':None,'format':None,'lint':None,'typecheck':None,'test_unit':None,'test_integration':None,'test_e2e':None,'build':None,'container_build':None} | d['commands'],
        platform={'docker':False,'ci_provider':None,'deployment_target':None,'environments':[],'observability':[],'secrets_manager':None,'infrastructure_as_code':None} | d['platform'],
        tracking={'provider':'auto','fallback':'local_markdown'},
        paths={'context':'docs/context/PROJECT_CONTEXT.md','domain_model':'docs/context/DOMAIN_MODEL.md','adr':'docs/adr','specs':'docs/specs','runbooks':'docs/runbooks','temporary_work':'.agent-work','local_overrides':'.agent-config'},
        personalization={
            'enabled': True,
            'profile': 'agent-toolkit/profiles/personal/sahil.md',
            'personal_preferences': '.agent-config/overrides/personal.md',
            'git_preferences': '.agent-config/overrides/git.md',
            'testing_preferences': '.agent-config/overrides/testing.md',
            'review_preferences': '.agent-config/overrides/review.md',
            'debugging_preferences': '.agent-config/overrides/debugging.md',
            'specs_preferences': '.agent-config/overrides/specs.md',
            'tickets_preferences': '.agent-config/overrides/tickets.md',
            'tracking_preferences': '.agent-config/overrides/tracking.md',
            'context_preferences': '.agent-config/overrides/context.md',
            'research_preferences': '.agent-config/overrides/research.md',
            'prototype_preferences': '.agent-config/overrides/prototypes.md',
            'architecture_review_preferences': '.agent-config/overrides/architecture-review.md',
            'wizard_preferences': '.agent-config/overrides/wizards.md',
            'secrets_preferences': '.agent-config/overrides/secrets.md',
            'writing_for_agents_preferences': '.agent-config/overrides/writing-for-agents.md',
        },
        models={'economical':None,'standard':None,'high_reasoning':None,'long_context':None,'fast_review':None},
        approvals={'mode':'supervised','require_before':['file_writes','workflow_phase_transition','dependencies','migrations','api_contract_changes','tests','env_access','git_operations','platform_changes','infrastructure_changes','deployments','destructive_commands','remediation']},
        git={'agent_managed':False,'allow_status':True,'allow_diff':True,'allow_log':True,'allow_branch_suggestions':True,'allow_branch_creation':False,'allow_worktree_creation':False,'allow_commit':False,'allow_push':False,'allow_merge':False},
        security={'allow_env_file_access':False,'store_secret_values':False,'redact_secrets_in_reports':True,'include_secrets_in_handoffs':False},
        herdr={'enabled':False,'manual_sessions_only':True,'automatic_delegation':False})

def merge_config(base: dict[str,Any], override: dict[str,Any]) -> dict[str,Any]:
    for k,v in override.items():
        if isinstance(v,dict) and isinstance(base.get(k),dict): merge_config(base[k],v)
        else: base[k]=v
    return base

def load_config(path: Path, root: Path) -> ProjectConfig:
    require_yaml()
    cfg=asdict(default_config(root))
    override=yaml.safe_load(path.read_text()) or {}
    text=path.read_text()
    if SECRET_RE.search(text): print('Warning: config contains secret-like keys/values; do not store secrets here.', file=sys.stderr)
    return ProjectConfig(**merge_config(cfg, override))

def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix=path.name, dir=str(path.parent)); os.close(fd)
    Path(tmp).write_text(content, encoding='utf-8'); os.replace(tmp, path)

def override_file_templates() -> dict[str, str]:
    return {
        'personal.md': '# Personal Preferences\n\n- Be concise, but explicit about risks and uncertainty.\n- Prefer a short plan before code changes.\n- Work one step at a time and report what changed.\n- Ask before adding dependencies, directories, conventions, or architecture.\n- Prefer small vertical slices and tracer bullets over broad rewrites.\n- Do not commit, push, deploy, stage files, create branches, or create worktrees unless explicitly approved.\n- Suggest commit messages when useful, but stop before Git mutations.\n- If requirements are ambiguous, ask rather than guessing irreversible details.\n',
        'git.md': '# Git Preferences\n\n- The user controls branch strategy.\n- Agents may inspect status/diff/log when allowed.\n- Do not stage, commit, push, merge, or create branches/worktrees without approval.\n',
        'testing.md': '# Testing Preferences\n\n- Prefer the fastest meaningful test first.\n- Ask before broad, slow, stateful, networked, destructive, or expensive tests.\n- Report exact commands and results.\n',
        'review.md': '# Review Preferences\n\n- Separate confirmed defects, likely risks, suggestions, and nits.\n- Use toolkit severity levels.\n- Require concrete evidence for HIGH or BLOCKER findings.\n',
        'debugging.md': '# Debugging Preferences\n\n- Build a tight, red-capable reproduction before proposing fixes unless exploratory fixing is approved.\n- Redact logs and artifacts before quoting them.\n',
        'specs.md': '# Spec Preferences\n\n- Keep specs local Markdown first unless tracker publishing is approved.\n- Include acceptance criteria, risks, open questions, and proposed model plan.\n',
        'tickets.md': '# Ticket Preferences\n\n- Prefer tracer-bullet vertical slices.\n- Default local tickets to `.agent-work/tickets/`.\n- Confirm blocking edges before publishing.\n',
        'tracking.md': '# Tracking Preferences\n\n- Default fallback is local Markdown.\n- Do not create issues, labels, or tracker links without approval.\n',
        'context.md': '# Context Preferences\n\n- Domain terms live in `docs/context/DOMAIN_MODEL.md`.\n- Broader project context lives in `docs/context/PROJECT_CONTEXT.md`.\n- ADRs live in `docs/adr/`.\n',
        'research.md': '# Research Preferences\n\n- Prefer primary sources.\n- Cite material claims.\n- Default reports to `.agent-work/reports/`.\n',
        'prototypes.md': '# Prototype Preferences\n\n- Default prototypes to `.agent-work/temporary/prototypes/`.\n- Mark prototypes as not production code.\n- Define cleanup or promotion path.\n',
        'architecture-review.md': '# Architecture Review Preferences\n\n- Prefer focused deepening opportunities over broad rewrites.\n- Report locality, leverage, testability, risks, and ADR conflicts.\n',
        'wizards.md': '# Wizard Preferences\n\n- Use wizards only for human-required manual setup.\n- Ask before writing scripts, opening URLs, or handling secrets.\n',
        'secrets.md': '# Secrets Preferences\n\n- Do not store secret values here.\n- Reference secrets by environment variable name or secret-manager path only.\n',
        'writing-for-agents.md': '# Writing For Agents Preferences\n\n- Keep `AGENTS.md` concise and pointer-rich.\n- Avoid duplicating toolkit standards.\n- Keep project-specific guidance outside toolkit submodules.\n',
    }


def gitignore_block(cfg: ProjectConfig) -> str:
    temporary_work = cfg.paths.get('temporary_work', '.agent-work').rstrip('/')
    local_overrides = cfg.paths.get('local_overrides', '.agent-config').rstrip('/')
    return (
        '\n# Agent Toolkit local/runtime files\n'
        f'{temporary_work}/\n'
        f'{local_overrides}/\n'
    )


def gitignore_needs_update(root: Path, cfg: ProjectConfig) -> bool:
    gitignore = root / '.gitignore'
    if not gitignore.exists():
        return False
    text = gitignore.read_text(encoding='utf-8')
    temporary_work = cfg.paths.get('temporary_work', '.agent-work').rstrip('/') + '/'
    local_overrides = cfg.paths.get('local_overrides', '.agent-config').rstrip('/') + '/'
    return temporary_work not in text or local_overrides not in text


def update_gitignore(root: Path, cfg: ProjectConfig) -> None:
    gitignore = root / '.gitignore'
    if gitignore.exists() and gitignore_needs_update(root, cfg):
        text = gitignore.read_text(encoding='utf-8')
        separator = '' if text.endswith('\n') else '\n'
        atomic_write(gitignore, text + separator + gitignore_block(cfg))


def generated_agents_md(cfg: ProjectConfig) -> str:
    name = cfg.project.get('name') or '<project-name>'
    description = cfg.project.get('description') or 'Describe this project in `docs/context/PROJECT_CONTEXT.md`.'
    return f'''# AGENTS.md

## Project summary

Project: {name}

{description}

## Architecture summary

See `{cfg.paths['context']}` and `{cfg.paths['domain_model']}`.

## Personal operating preferences

- Be concise but explicit about risks and uncertainty.
- Prefer a short implementation plan before code changes.
- Ask before inventing new architecture, dependencies, directories, or conventions.
- Prefer small vertical slices over broad rewrites.
- Never commit, push, deploy, stage files, access `.env`, create branches/worktrees, or change infrastructure unless explicitly approved.
- If requirements are ambiguous, ask clarifying questions before making irreversible changes.
- If a command was not run, say so clearly.

## Personalization overrides

Project-specific and personal preferences live under `{cfg.paths['local_overrides']}/overrides/` and are referenced from the `personalization` section of `agent-project.yaml`.

Default personal profile: `agent-toolkit/profiles/personal/sahil.md`.

Agents should read only override files relevant to the active task. Do not load every override file by default.

Common override triggers:

- General working style → `{cfg.paths['local_overrides']}/overrides/personal.md`
- Git strategy or branch/worktree questions → `{cfg.paths['local_overrides']}/overrides/git.md`
- Tests, TDD, validation, or CI checks → `{cfg.paths['local_overrides']}/overrides/testing.md`
- Reviews or severity calibration → `{cfg.paths['local_overrides']}/overrides/review.md`
- Bugs, repros, logs, or debugging → `{cfg.paths['local_overrides']}/overrides/debugging.md`
- Specs or requirements → `{cfg.paths['local_overrides']}/overrides/specs.md`
- Tickets or work breakdown → `{cfg.paths['local_overrides']}/overrides/tickets.md`
- Issue tracker behavior → `{cfg.paths['local_overrides']}/overrides/tracking.md`
- Domain/context paths or glossary style → `{cfg.paths['local_overrides']}/overrides/context.md`
- Research tasks → `{cfg.paths['local_overrides']}/overrides/research.md`
- Prototypes → `{cfg.paths['local_overrides']}/overrides/prototypes.md`
- Architecture reviews → `{cfg.paths['local_overrides']}/overrides/architecture-review.md`
- Manual setup wizards → `{cfg.paths['local_overrides']}/overrides/wizards.md`
- Secret handling conventions → `{cfg.paths['local_overrides']}/overrides/secrets.md`
- Agent-facing documentation → `{cfg.paths['local_overrides']}/overrides/writing-for-agents.md`

Override files must not contain secret values, credentials, tokens, account IDs, private customer data, or `.env` contents.

## Source-of-truth paths

- Configuration: `agent-project.yaml`
- Toolkit workflows: `agent-toolkit/workflows/`
- Standards: `agent-toolkit/standards/`
- Contracts: `agent-toolkit/contracts/`
- Toolkit quality skills (PR/CI/feedback, preview QA, async/API/observability/docs): `agent-toolkit/skills/quality/README.md`
- Independent bounded worker tasks → `agent-toolkit/standards/delegation-policy.md`
- Imported skill adaptations: `agent-toolkit/adaptations/matt-pocock/`
- Project-local overrides: `{cfg.paths['local_overrides']}/`
- Project context: `{cfg.paths['context']}`
- Domain model: `{cfg.paths['domain_model']}`
- ADRs: `{cfg.paths['adr']}`
- Specs: `{cfg.paths['specs']}`
- Runbooks: `{cfg.paths['runbooks']}`
- Agent work artifacts: `{cfg.paths['temporary_work']}/`

When imported skills mention `CONTEXT.md`, use `{cfg.paths['domain_model']}` for glossary/domain terms and `{cfg.paths['context']}` for broader project context unless this project defines another mapping.

## Development commands

Use commands from `agent-project.yaml`. Do not invent commands without inspecting the repository.

## Shared engineering rules

Inspect before editing, prefer existing patterns, keep changes scoped, test behavioral changes, and report honestly. During implementation/review apply diff-triggered logging/docs checks in `agent-toolkit/standards/engineering-principles.md`; select focused review passes via `agent-toolkit/standards/review-specialists.md`.

When using imported Matt Pocock skills, apply toolkit standards first. Treat slash-command, sub-agent, commit, branch, temp-file, or root-`CONTEXT.md` assumptions as guidance that must be adapted to this project's approval, Git, handoff, and context policies.

## Approval policy

Supervised mode. Ask before writes, phase transitions, dependencies, migrations, API/platform changes, tests, env access, git operations, destructive commands, deployments, infrastructure changes, or remediation.

Approval requests should include proposed action, affected files/systems, reason, risks, reversibility, and expected validation.

## Git restrictions

Do not create branches/worktrees, stage, commit, push, merge, or open/modify PRs without approval.

## Secrets restrictions

Do not access `.env` or secret-bearing files without approval. Do not store secret values. Redact secrets in reports and handoffs.

## Completion reports

Include summary, personalization/overrides consulted, files changed, behavior implemented, commands/tests run, assumptions, limitations, risks, and next step.
'''


def generated_files(root: Path, cfg: ProjectConfig) -> dict[Path,str]:
    require_yaml(); y=yaml.safe_dump(asdict(cfg), sort_keys=False)
    files={Path('agent-project.yaml'): y,
           Path('AGENTS.md'): generated_agents_md(cfg),
           Path(cfg.paths['context']): '# Project Context\n\nDescribe stable project context.\n',
           Path(cfg.paths['domain_model']): '# Domain Model\n\nGlossary and domain terminology.\n',
           Path(cfg.paths['adr'])/'README.md': '# ADRs\n\nArchitecture decision records.\n',
           Path(cfg.paths['specs'])/'README.md': '# Specs\n\nFeature specifications.\n',
           Path(cfg.paths['runbooks'])/'README.md': '# Runbooks\n\nOperational runbooks.\n',
           Path(cfg.paths['local_overrides'])/'README.md': '# Local Overrides\n\nProject-local non-secret overrides. See `overrides/`.\n'}
    for sub in ['tickets','reports','handoffs','temporary']:
        files[Path(cfg.paths['temporary_work'])/sub/'.gitkeep']=''
    overrides_dir = Path(cfg.paths['local_overrides'])/'overrides'
    for name, content in override_file_templates().items():
        files[overrides_dir/name] = content
    return files

def find_toolkit_root(start: Path | None = None) -> Path:
    """Find the toolkit checkout that owns this initializer."""
    candidates: list[Path] = []
    if start is not None:
        candidates.append(start.resolve())
    here = Path(__file__).resolve()
    candidates.extend([here.parents[1], here.parents[2]])
    seen: set[Path] = set()
    for base in candidates:
        for p in (base, *base.parents):
            if p in seen:
                continue
            seen.add(p)
            if (p / 'skills-lock.json').exists() or (p / '.agents' / 'skills').exists():
                return p
            if (p / 'agent-toolkit' / 'skills-lock.json').exists() or (p / 'agent-toolkit' / '.agents' / 'skills').exists():
                return p / 'agent-toolkit'
    return here.parents[1]


def find_project_root(requested_root: Path, toolkit_root: Path) -> Path:
    root = requested_root.resolve()
    toolkit = toolkit_root.resolve()
    if root == toolkit or toolkit in (root, *root.parents):
        return toolkit.parent
    return root


def read_enabled_skill_names(toolkit_root: Path) -> tuple[list[str], list[str]]:
    warnings: list[str] = []
    lock = toolkit_root / 'skills-lock.json'
    if not lock.exists() and (toolkit_root.parent / 'skills-lock.json').exists():
        lock = toolkit_root.parent / 'skills-lock.json'
    if lock.exists():
        try:
            data = json.loads(lock.read_text(encoding='utf-8'))
            skills = data.get('skills', {})
            if isinstance(skills, dict):
                return sorted(skills), warnings
            warnings.append(f'{lock}: expected "skills" object; falling back to discovered skill directories')
        except Exception as e:
            warnings.append(f'{lock}: cannot read skills lock ({e}); falling back to discovered skill directories')
    skills_dir = toolkit_skills_dir(toolkit_root)
    if not skills_dir.exists():
        return [], warnings + [f'{skills_dir}: toolkit skills directory not found']
    return sorted(p.name for p in skills_dir.iterdir() if p.is_dir()), warnings


def toolkit_skills_dir(toolkit_root: Path) -> Path:
    if (toolkit_root / '.agents' / 'skills').exists():
        return toolkit_root / '.agents' / 'skills'
    if (toolkit_root.parent / '.agents' / 'skills').exists():
        return toolkit_root.parent / '.agents' / 'skills'
    return toolkit_root / '.agents' / 'skills'


def toolkit_skill_sources(toolkit_root: Path) -> tuple[dict[str, Path], list[str]]:
    """Combine locked imports and toolkit-owned skills without altering vendor metadata."""
    enabled, warnings = read_enabled_skill_names(toolkit_root)
    canonical = toolkit_skills_dir(toolkit_root)
    sources: dict[str, Path] = {}
    for name in enabled:
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', name):
            warnings.append(f'Invalid toolkit skill name: {name!r}; skipped')
            continue
        sources[name] = canonical / name
    owned_root = toolkit_root / 'agent-toolkit' / 'skills'
    if not owned_root.is_dir():
        owned_root = toolkit_root / 'skills'
    for skill_file in sorted(owned_root.glob('*/*/SKILL.md')):
        name = skill_file.parent.name
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', name):
            warnings.append(f'Invalid owned skill name: {name!r}; skipped')
        elif name in sources:
            warnings.append(f'{name}: duplicate toolkit skill; keeping {sources[name]}')
        else:
            sources[name] = skill_file.parent
    return sources, warnings


def manifest_path(root: Path, cfg: ProjectConfig) -> Path:
    return safe_inside(root, Path(cfg.paths.get('local_overrides', '.agent-config')) / 'managed-skills.json')


def load_managed_manifest(root: Path, cfg: ProjectConfig) -> list[str]:
    path = manifest_path(root, cfg)
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
        managed = data.get('managed', [])
        return sorted(x for x in managed if isinstance(x, str)) if isinstance(managed, list) else []
    except Exception:
        return []


def symlink_points_to(path: Path, target: Path) -> bool:
    try:
        return path.is_symlink() and path.resolve(strict=False) == target.resolve(strict=False)
    except OSError:
        return False


def sync_skills(root: Path, cfg: ProjectConfig, toolkit_root: Path | None = None, dry_run: bool = False) -> SkillSyncResult:
    toolkit_root = (toolkit_root or find_toolkit_root()).resolve()
    skills_dir = safe_inside(root, Path('.agents') / 'skills')
    linked: list[str] = []
    repaired: list[str] = []
    unchanged: list[str] = []
    removed: list[str] = []
    warnings: list[str] = []
    sources, source_warnings = toolkit_skill_sources(toolkit_root)
    warnings.extend(source_warnings)
    previous = set(load_managed_manifest(root, cfg))
    valid: set[str] = set()
    if not dry_run:
        skills_dir.mkdir(parents=True, exist_ok=True)
    for name, source in sorted(sources.items()):
        if not source.is_dir() or not (source / 'SKILL.md').is_file():
            warnings.append(f'{name}: configured toolkit skill missing or invalid at {source}')
            continue
        valid.add(name)
        dest = skills_dir / name
        rel_target = os.path.relpath(source, start=skills_dir)
        if dest.exists() or dest.is_symlink():
            if symlink_points_to(dest, source):
                unchanged.append(name)
            elif dest.is_symlink() and name in previous:
                if not dry_run:
                    dest.unlink(); dest.symlink_to(rel_target, target_is_directory=True)
                repaired.append(name)
            else:
                warnings.append(f'Cannot expose toolkit skill "{name}": {dest} already exists and is not a toolkit-managed symlink.')
            continue
        if not dry_run:
            dest.symlink_to(rel_target, target_is_directory=True)
        linked.append(name)
    for name in sorted(previous - valid):
        dest = skills_dir / name
        if dest.is_symlink():
            if not dry_run:
                dest.unlink()
            removed.append(name)
        elif dest.exists():
            warnings.append(f'{name}: previously toolkit-managed path is no longer a symlink; leaving {dest} untouched')
    managed_now = sorted(set(linked + repaired + unchanged))
    preserved: list[str] = []
    if skills_dir.exists():
        for p in skills_dir.iterdir():
            if p.name not in managed_now and p.name not in removed:
                preserved.append(p.name)
    if not dry_run:
        atomic_write(manifest_path(root, cfg), json.dumps({'managed': managed_now}, indent=2) + '\n')
    return SkillSyncResult(linked, repaired, unchanged, removed, sorted(preserved), warnings, skills_dir, toolkit_root)


def validate_skill_structure(result: SkillSyncResult) -> list[str]:
    errs: list[str] = []
    for name in result.managed:
        p = result.skills_dir / name
        if not p.is_symlink() or not (p.resolve(strict=False) / 'SKILL.md').exists():
            errs.append(f'invalid skill link {p}')
    return errs


def validate(root: Path, cfg: ProjectConfig) -> list[str]:
    require_yaml(); errs=[]
    yaml.safe_load((root/'agent-project.yaml').read_text())
    for p in [cfg.paths['context'], cfg.paths['domain_model'], cfg.paths['adr'], cfg.paths['specs'], cfg.paths['runbooks']]:
        if not safe_inside(root, Path(p)).exists(): errs.append(f'missing {p}')
    if SECRET_RE.search((root/'agent-project.yaml').read_text()): errs.append('secret-like value in agent-project.yaml')
    return errs

def print_summary(root: Path, cfg: ProjectConfig, result: SkillSyncResult, generated: list[str], existing: list[str]) -> None:
    print('\nAgent Toolkit initialized')
    print('\nProject')
    print(f'  {cfg.project.get("name") or root.name}')
    print('\nToolkit')
    try:
        print(f'  {result.toolkit_root.relative_to(root)}')
    except ValueError:
        print(f'  {result.toolkit_root}')
    print('\nGenerated')
    for item in ['AGENTS.md', cfg.paths.get('local_overrides', '.agent-config') + '/', cfg.paths.get('temporary_work', '.agent-work') + '/', '.agents/skills/']:
        print(f'  ✓ {item}')
    if existing:
        print('\nExisting project files preserved')
        for p in existing[:8]: print(f'  ✓ {p}')
        if len(existing) > 8: print(f'  … {len(existing)-8} more')
    print('\nPi skills')
    for name in result.managed:
        marker = '✓'
        detail = ' repaired' if name in result.repaired else ''
        print(f'  {marker} {name}{detail}')
    print(f'\n{len(result.managed)} toolkit skills linked')
    print(f'{len(result.preserved)} project-specific skill preserved' + ('' if len(result.preserved) == 1 else 's'))
    if result.removed:
        print(f'{len(result.removed)} stale toolkit skill link removed')
    if result.warnings:
        print('\nWarnings')
        for w in result.warnings:
            print(f'  ! {w}')
    print('\nPi can discover skills from:')
    print(f'  {result.skills_dir}')
    print('\nIf Pi is already running, use /reload.')


def parse_args(argv: list[str] | None) -> tuple[argparse.Namespace, bool]:
    argv = list(argv or sys.argv[1:])
    if argv[:2] == ['skills', 'sync']:
        ap = argparse.ArgumentParser(prog='init_project.py skills sync')
        ap.add_argument('--root', type=Path, default=Path.cwd())
        ap.add_argument('--dry-run', action='store_true')
        return ap.parse_args(argv[2:]), True
    ap=argparse.ArgumentParser(); ap.add_argument('--config', type=Path); ap.add_argument('--quick', action='store_true'); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--yes', action='store_true'); ap.add_argument('--root', type=Path, default=Path.cwd()); ap.add_argument('--sync-skills', action='store_true')
    return ap.parse_args(argv), False


def main(argv: list[str]|None=None) -> int:
    a, sync_only = parse_args(argv)
    toolkit_root = find_toolkit_root(a.root)
    root = find_project_root(a.root, toolkit_root)
    try:
        config_path = getattr(a, 'config', None)
        if config_path:
            cfg=load_config(config_path, root)
        elif (root/'agent-project.yaml').exists():
            cfg=load_config(root/'agent-project.yaml', root)
        else:
            cfg=default_config(root, getattr(a, 'quick', False))
        if sync_only or getattr(a, 'sync_skills', False):
            result=sync_skills(root, cfg, toolkit_root, getattr(a, 'dry_run', False))
            for w in result.warnings: print(f'WARN: {w}', file=sys.stderr)
            print(f'Synced {len(result.managed)} toolkit skills to {result.skills_dir}')
            return 0
        files=generated_files(root,cfg)
        existing=[str(p) for p in files if safe_inside(root,p).exists()]
        to_create=[p for p in files if str(p) not in existing]
        gitignore_update = gitignore_needs_update(root, cfg)
        print('Files to create:', ', '.join(str(p) for p in to_create))
        if existing: print('Existing files preserved:', ', '.join(existing))
        if gitignore_update: print('Existing .gitignore will be updated to ignore agent local/runtime files.')
        if a.dry_run: print('Dry run: no files written'); return 0
        if to_create and not a.yes:
            ans=input('Write these files? [y/N] ')
            if ans.lower() not in {'y','yes'}: print('Cancelled'); return 1
        for rel,content in files.items():
            path = safe_inside(root,rel)
            if not path.exists(): atomic_write(path, content)
        update_gitignore(root, cfg)
        result=sync_skills(root, cfg, toolkit_root)
        errs=validate(root,cfg) + validate_skill_structure(result)
        if errs: print('Validation errors: '+', '.join(errs), file=sys.stderr); return 1
        print_summary(root, cfg, result, [str(p) for p in to_create], existing)
        return 0
    except Exception as e:
        print(f'Error: {e}', file=sys.stderr); return 2
if __name__ == '__main__': raise SystemExit(main())
