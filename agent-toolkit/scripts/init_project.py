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
class ProjectConfig:
    project: dict[str, Any]
    stack: dict[str, Any]
    commands: dict[str, Any]
    platform: dict[str, Any]
    tracking: dict[str, Any]
    paths: dict[str, str]
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

def generated_files(root: Path, cfg: ProjectConfig) -> dict[Path,str]:
    require_yaml(); y=yaml.safe_dump(asdict(cfg), sort_keys=False)
    files={Path('agent-project.yaml'): y,
           Path('AGENTS.md'): '# AGENTS.md\n\nProject: '+cfg.project['name']+'\n\nFollow `agent-toolkit/standards/` and `agent-project.yaml`.\n',
           Path(cfg.paths['context']): '# Project Context\n\nDescribe stable project context.\n',
           Path(cfg.paths['domain_model']): '# Domain Model\n\nGlossary and domain terminology.\n',
           Path(cfg.paths['adr'])/'README.md': '# ADRs\n\nArchitecture decision records.\n',
           Path(cfg.paths['specs'])/'README.md': '# Specs\n\nFeature specifications.\n',
           Path(cfg.paths['runbooks'])/'README.md': '# Runbooks\n\nOperational runbooks.\n',
           Path(cfg.paths['local_overrides'])/'README.md': '# Local Overrides\n\nProject-local non-secret overrides.\n'}
    for sub in ['tickets','reports','handoffs','temporary']:
        files[Path(cfg.paths['temporary_work'])/sub/'.gitkeep']=''
    files[Path(cfg.paths['local_overrides'])/'overrides'/'.gitkeep']=''
    return files

def validate(root: Path, cfg: ProjectConfig) -> list[str]:
    require_yaml(); errs=[]
    yaml.safe_load((root/'agent-project.yaml').read_text())
    for p in [cfg.paths['context'], cfg.paths['domain_model'], cfg.paths['adr'], cfg.paths['specs'], cfg.paths['runbooks']]:
        if not safe_inside(root, Path(p)).exists(): errs.append(f'missing {p}')
    if SECRET_RE.search((root/'agent-project.yaml').read_text()): errs.append('secret-like value in agent-project.yaml')
    return errs

def main(argv: list[str]|None=None) -> int:
    ap=argparse.ArgumentParser(); ap.add_argument('--config', type=Path); ap.add_argument('--quick', action='store_true'); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--yes', action='store_true'); ap.add_argument('--root', type=Path, default=Path.cwd())
    a=ap.parse_args(argv); root=a.root.resolve()
    try:
        cfg=load_config(a.config, root) if a.config else default_config(root, a.quick)
        files=generated_files(root,cfg)
        existing=[str(p) for p in files if safe_inside(root,p).exists()]
        print('Files to create:', ', '.join(str(p) for p in files if str(p) not in existing))
        if existing: print('Existing files preserved:', ', '.join(existing))
        if a.dry_run: print('Dry run: no files written'); return 0
        if existing: print('Refusing to overwrite existing files. Move/merge manually or rerun in a clean project.', file=sys.stderr); return 1
        if not a.yes:
            ans=input('Write these files? [y/N] ')
            if ans.lower() not in {'y','yes'}: print('Cancelled'); return 1
        for rel,content in files.items(): atomic_write(safe_inside(root,rel), content)
        errs=validate(root,cfg)
        if errs: print('Validation errors: '+', '.join(errs), file=sys.stderr); return 1
        print('Project initialized successfully'); return 0
    except Exception as e:
        print(f'Error: {e}', file=sys.stderr); return 2
if __name__ == '__main__': raise SystemExit(main())
