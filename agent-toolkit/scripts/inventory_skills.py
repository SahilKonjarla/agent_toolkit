#!/usr/bin/env python3
"""Inventory imported SKILL.md files without modifying vendor content."""
from __future__ import annotations
import argparse, re, sys
from pathlib import Path

RECOMMENDED = {
    'setup-matt-pocock-skills','grill-with-docs','to-spec','to-tickets','implement','tdd','code-review',
    'diagnosing-bugs','handoff','writing-for-agents','domain-modeling','codebase-design','prototype','research',
    'resolving-merge-conflicts','wizard','improve-codebase-architecture'
}

def parse_frontmatter(text: str) -> dict[str, str]:
    m = re.match(r"^---\n(.*?)\n---", text, re.S)
    data: dict[str, str] = {}
    if not m:
        return data
    for line in m.group(1).splitlines():
        if ':' in line:
            k, v = line.split(':', 1)
            data[k.strip()] = v.strip().strip('"')
    return data

def assumptions(text: str, meta: dict[str,str]) -> tuple[str,str]:
    found=[]
    if 'disable-model-invocation' in meta or '/' in text[:2000]: found.append('slash-command/model invocation assumptions possible')
    if 'sub-agent' in text or 'background agent' in text: found.append('sub-agent/background-agent assumption')
    if 'commit' in text.lower(): found.append('git commit behavior mentioned')
    if 'CONTEXT.md' in text: found.append('root CONTEXT.md path assumption')
    return ('; '.join(found) or 'None obvious', 'Adapt through wrapper if assumptions conflict with toolkit policy' if found else 'None obvious')

def discover(root: Path) -> list[dict[str,str]]:
    skills_dir = root / '.agents' / 'skills'
    rows=[]
    for skill in sorted(skills_dir.glob('*/SKILL.md')):
        text = skill.read_text(encoding='utf-8')
        meta = parse_frontmatter(text)
        name = meta.get('name', skill.parent.name)
        tool, claude = assumptions(text, meta)
        scripts = [str(p.relative_to(root)) for p in skill.parent.rglob('*') if p.is_file() and (p.suffix in {'.sh','.py'} or 'script' in str(p))]
        rows.append({
            'name': name, 'path': str(skill.relative_to(root)), 'purpose': meta.get('description','Unknown'),
            'phase': infer_phase(name), 'use': infer_use(name), 'tool_assumptions': tool,
            'claude': claude, 'scripts': ', '.join(scripts) or 'None'
        })
    return rows

def infer_phase(name: str) -> str:
    return {
        'setup-matt-pocock-skills':'bootstrap','to-spec':'planning','to-tickets':'planning','grill-with-docs':'planning',
        'implement':'implementation','tdd':'quality/implementation','code-review':'review','diagnosing-bugs':'bug diagnosis',
        'handoff':'handoff','writing-for-agents':'documentation','domain-modeling':'context/domain','codebase-design':'architecture',
        'prototype':'discovery','research':'research','resolving-merge-conflicts':'git maintenance','wizard':'manual operations',
        'improve-codebase-architecture':'architecture review'
    }.get(name, 'unknown')

def infer_use(name: str) -> str:
    if name in {'implement','handoff','domain-modeling','research','resolving-merge-conflicts','improve-codebase-architecture','prototype','setup-matt-pocock-skills'}:
        return 'wrapped/adapted'
    return 'direct/reference'

def render(rows: list[dict[str,str]]) -> str:
    present={r['name'] for r in rows}
    missing=sorted(RECOMMENDED-present)
    md = '# Imported Skills Inventory\n\nVendor source: `.agents/skills/`. Do not modify imported files.\n\n'
    md += f'Recommended skills present: {len(RECOMMENDED)-len(missing)}/{len(RECOMMENDED)}.\n\n'
    if missing: md += 'Missing recommended skills: '+', '.join(missing)+'\n\n'
    md += '| Skill | Relative path | Purpose | Main workflow phase | Use | Model/tool assumptions | Claude-specific behavior requiring adaptation | Executable scripts/external deps |\n|---|---|---|---|---|---|---|---|\n'
    for r in rows:
        vals=[r[k] for k in ('name','path','purpose','phase','use','tool_assumptions','claude','scripts')]
        md += '| ' + ' | '.join(v.replace('|','\\|').replace('\n',' ') for v in vals) + ' |\n'
    return md

def main(argv: list[str] | None = None) -> int:
    ap=argparse.ArgumentParser()
    ap.add_argument('--root', type=Path, default=Path.cwd())
    ap.add_argument('--check', action='store_true')
    args=ap.parse_args(argv)
    root=args.root.resolve()
    if not (root/'.agents'/'skills').exists():
        print('No .agents/skills directory found', file=sys.stderr); return 2
    content=render(discover(root))
    out=root/'docs'/'toolkit-design'/'imported-skills-inventory.md'
    if args.check:
        current=out.read_text(encoding='utf-8') if out.exists() else ''
        if current != content:
            print('Inventory is stale or missing'); return 1
        print('Inventory is current'); return 0
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(content, encoding='utf-8')
    print(f'Wrote {out.relative_to(root)}')
    return 0
if __name__ == '__main__': raise SystemExit(main())
