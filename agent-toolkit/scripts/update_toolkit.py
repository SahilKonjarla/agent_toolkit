#!/usr/bin/env python3
"""Supervised toolkit update inspector."""
from __future__ import annotations
import argparse, subprocess, sys
from pathlib import Path

def run(cmd: list[str], cwd: Path) -> tuple[int,str,str]:
    p=subprocess.run(cmd,cwd=cwd,text=True,capture_output=True)
    return p.returncode,p.stdout.strip(),p.stderr.strip()

def detect(root: Path, toolkit: Path) -> str:
    gitfile=toolkit/'.git'
    if gitfile.is_file(): return 'submodule'
    if (toolkit/'.git').is_dir(): return 'standalone-checkout'
    if (root/'.git').exists() and toolkit.exists(): return 'subtree-like-copy'
    return 'missing'

def version(toolkit: Path) -> str:
    v=toolkit/'VERSION'
    if v.exists(): return v.read_text().strip()
    code,out,_=run(['git','rev-parse','--short','HEAD'], toolkit)
    return out if code==0 else 'unknown'

def main(argv: list[str]|None=None) -> int:
    ap=argparse.ArgumentParser(); ap.add_argument('--check',action='store_true'); ap.add_argument('--dry-run',action='store_true'); ap.add_argument('--yes',action='store_true'); ap.add_argument('--root',type=Path,default=Path.cwd())
    a=ap.parse_args(argv); root=a.root.resolve(); toolkit=(root/'agent-toolkit').resolve()
    kind=detect(root,toolkit); print(f'Toolkit layout: {kind}');
    if kind=='missing': return 2
    print(f'Current version/commit: {version(toolkit)}')
    if kind=='submodule':
        print('Submodule detected. Project-specific customization must live outside agent-toolkit/.')
        code,out,err=run(['git','submodule','status','agent-toolkit'], root); print(out or err)
    elif kind=='standalone-checkout':
        code,out,err=run(['git','remote','-v'], toolkit); print(out or 'No remote detected')
    else:
        print('Subtree-like copy detected. Automatic update is unsafe; use manual subtree/vendor-copy workflow.')
    print('This script never updates automatically and never touches .agents/skills/.')
    if a.check or a.dry_run: return 0
    if not a.yes:
        ans=input('Fetch/check remote update information only? [y/N] ')
        if ans.lower() not in {'y','yes'}: print('Cancelled'); return 1
    if kind in {'submodule','standalone-checkout'}:
        code,out,err=run(['git','fetch','--tags'], toolkit); print(out or err or 'Fetched')
        code,out,err=run(['git','log','--oneline','HEAD..@{u}'], toolkit); print('Available commits:\n'+(out or 'None or upstream not configured'))
    else:
        print('Manual update required; no files changed.')
    return 0
if __name__=='__main__': raise SystemExit(main())
