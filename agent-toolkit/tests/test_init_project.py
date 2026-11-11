import unittest, importlib.util, sys, json
from pathlib import Path
MOD_PATH = Path(__file__).parents[1] / 'scripts' / 'init_project.py'
spec = importlib.util.spec_from_file_location('init_project', MOD_PATH)
mod = importlib.util.module_from_spec(spec); sys.modules['init_project']=mod; spec.loader.exec_module(mod)  # type: ignore
class InitProjectTests(unittest.TestCase):
    def test_default_model_validation(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            cfg=mod.default_config(Path(td))
            self.assertEqual(cfg.approvals['mode'],'supervised')
            self.assertFalse(cfg.git['allow_commit'])
    def test_dry_run_writes_nothing(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); rc=mod.main(['--root', str(root), '--dry-run'])
            self.assertIn(rc, (0,2))
            self.assertFalse((root/'agent-project.yaml').exists())
    def test_existing_file_preserved(self):
        if mod.yaml is None: self.skipTest('PyYAML missing')
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); (root/'AGENTS.md').write_text('existing')
            self.assertEqual(mod.main(['--root', str(root), '--yes']), 0)
            self.assertEqual((root/'AGENTS.md').read_text(), 'existing')
    def test_generated_personalization_overrides(self):
        if mod.yaml is None: self.skipTest('PyYAML missing')
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); cfg=mod.default_config(root)
            files=mod.generated_files(root, cfg)
            self.assertIn(Path('.agent-config/overrides/personal.md'), files)
            self.assertIn(Path('.agent-config/overrides/testing.md'), files)
            self.assertTrue(cfg.personalization['enabled'])

    def test_generated_agents_md_is_rich(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            cfg=mod.default_config(Path(td))
            content=mod.generated_agents_md(cfg)
            self.assertIn('## Personalization overrides', content)
            self.assertIn('## Source-of-truth paths', content)
            self.assertIn('## Approval policy', content)
            self.assertIn('.agent-config/overrides/testing.md', content)

    def test_gitignore_update_existing_file_only(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); cfg=mod.default_config(root)
            self.assertFalse(mod.gitignore_needs_update(root, cfg))
            (root/'.gitignore').write_text('node_modules/\n')
            self.assertTrue(mod.gitignore_needs_update(root, cfg))
            mod.update_gitignore(root, cfg)
            text=(root/'.gitignore').read_text()
            self.assertIn('.agent-work/', text)
            self.assertIn('.agent-config/', text)

    def make_project(self, root: Path, skills: dict[str, bool] | None = None, lock_names: list[str] | None = None, toolkit_name: str = 'agent-toolkit') -> Path:
        toolkit = root / toolkit_name
        skills_dir = toolkit / '.agents' / 'skills'
        skills_dir.mkdir(parents=True)
        skills = skills or {'testing': True, 'code-review': True}
        for name, valid in skills.items():
            d = skills_dir / name; d.mkdir(parents=True)
            if valid: (d / 'SKILL.md').write_text(f'# {name}\n')
        names = lock_names if lock_names is not None else list(skills)
        (toolkit / 'skills-lock.json').write_text(json.dumps({'version': 1, 'skills': {n: {} for n in names}}))
        return toolkit

    def test_sync_skills_fresh_project(self):
        if mod.yaml is None: self.skipTest('PyYAML missing')
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); toolkit=self.make_project(root)
            self.assertEqual(mod.main(['--root', str(root), '--yes']), 0)
            link=root/'.agents'/'skills'/'testing'
            self.assertTrue(link.is_symlink())
            self.assertEqual(link.resolve(), (toolkit/'.agents'/'skills'/'testing').resolve())
            manifest=json.loads((root/'.agent-config'/'managed-skills.json').read_text())
            self.assertEqual(manifest['managed'], ['code-review','testing'])

    def test_sync_skills_rerun_idempotent_and_correct_link_unchanged(self):
        if mod.yaml is None: self.skipTest('PyYAML missing')
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); self.make_project(root)
            self.assertEqual(mod.main(['--root', str(root), '--yes']), 0)
            before=(root/'.agents'/'skills'/'testing').readlink()
            self.assertEqual(mod.main(['--root', str(root), '--yes']), 0)
            self.assertEqual((root/'.agents'/'skills'/'testing').readlink(), before)

    def test_sync_skills_repairs_incorrect_managed_link(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); toolkit=self.make_project(root)
            cfg=mod.default_config(root)
            (root/'.agents'/'skills').mkdir(parents=True)
            (root/'.agent-config').mkdir()
            (root/'.agent-config'/'managed-skills.json').write_text(json.dumps({'managed':['testing']}))
            old=root/'old'; old.mkdir(); (root/'.agents'/'skills'/'testing').symlink_to(old, target_is_directory=True)
            result=mod.sync_skills(root, cfg, toolkit)
            self.assertIn('testing', result.repaired)
            self.assertEqual((root/'.agents'/'skills'/'testing').resolve(), (toolkit/'.agents'/'skills'/'testing').resolve())

    def test_sync_skills_removes_stale_toolkit_link(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); toolkit=self.make_project(root, {'testing': True}, ['testing'])
            cfg=mod.default_config(root); mod.sync_skills(root, cfg, toolkit)
            # Skill removed from lock/source after a toolkit update.
            (toolkit/'skills-lock.json').write_text(json.dumps({'version':1,'skills':{}}))
            result=mod.sync_skills(root, cfg, toolkit)
            self.assertIn('testing', result.removed)
            self.assertFalse((root/'.agents'/'skills'/'testing').exists())
            self.assertEqual(json.loads((root/'.agent-config'/'managed-skills.json').read_text())['managed'], [])

    def test_sync_skills_preserves_project_owned_skill_and_name_collision_warns(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); toolkit=self.make_project(root, {'testing': True, 'code-review': True})
            custom=root/'.agents'/'skills'/'custom-skill'; custom.mkdir(parents=True); (custom/'SKILL.md').write_text('# custom')
            collision=root/'.agents'/'skills'/'testing'; collision.mkdir(); (collision/'SKILL.md').write_text('# project testing')
            result=mod.sync_skills(root, mod.default_config(root), toolkit)
            self.assertTrue(custom.is_dir())
            self.assertTrue(collision.is_dir())
            self.assertFalse(collision.is_symlink())
            self.assertTrue(any('testing' in w and 'already exists' in w for w in result.warnings))
            self.assertTrue((root/'.agents'/'skills'/'code-review').is_symlink())

    def test_sync_skills_missing_or_malformed_warns_without_link(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); toolkit=self.make_project(root, {'testing': False}, ['testing', 'missing'])
            result=mod.sync_skills(root, mod.default_config(root), toolkit)
            self.assertFalse((root/'.agents'/'skills'/'testing').exists())
            self.assertFalse((root/'.agents'/'skills'/'missing').exists())
            self.assertTrue(any('testing' in w for w in result.warnings))
            self.assertTrue(any('missing' in w for w in result.warnings))

    def test_sync_skills_spaces_and_non_default_toolkit_location(self):
        import tempfile
        with tempfile.TemporaryDirectory(prefix='project with spaces ') as td:
            root=Path(td); toolkit=self.make_project(root, {'testing': True}, toolkit_name='tools/agent kit')
            result=mod.sync_skills(root, mod.default_config(root), toolkit)
            link=root/'.agents'/'skills'/'testing'
            self.assertTrue(link.is_symlink())
            self.assertEqual(link.resolve(), (toolkit/'.agents'/'skills'/'testing').resolve())
            self.assertFalse(str(link.readlink()).startswith('/'))
            self.assertEqual(result.toolkit_root, toolkit.resolve())

    def test_sync_includes_owned_skills_without_changing_vendor_lock(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root = Path(td); toolkit = self.make_project(root)
            owned = toolkit / 'agent-toolkit' / 'skills' / 'quality' / 'review-pr'
            owned.mkdir(parents=True); (owned / 'SKILL.md').write_text('# PR review\n')
            lock_before = (toolkit / 'skills-lock.json').read_bytes()
            cfg = mod.default_config(root)
            result = mod.sync_skills(root, cfg, toolkit)
            self.assertIn('review-pr', result.linked)
            self.assertEqual((root / '.agents/skills/review-pr').resolve(), owned.resolve())
            self.assertEqual((toolkit / 'skills-lock.json').read_bytes(), lock_before)
            self.assertIn('review-pr', mod.sync_skills(root, cfg, toolkit).unchanged)

    def test_owned_skills_dry_run_and_name_collision(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root = Path(td); toolkit = self.make_project(root)
            for name in ['review-pr', 'testing']:
                owned = toolkit / 'skills' / 'quality' / name
                owned.mkdir(parents=True); (owned / 'SKILL.md').write_text('# skill\n')
            cfg = mod.default_config(root)
            result = mod.sync_skills(root, cfg, toolkit, dry_run=True)
            self.assertIn('review-pr', result.linked)
            self.assertFalse((root / '.agents').exists())
            self.assertTrue(any('duplicate' in warning and 'testing' in warning for warning in result.warnings))

    def test_invalid_lock_skill_cannot_escape_skill_directory(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root = Path(td); toolkit = self.make_project(root, lock_names=['../outside'])
            result = mod.sync_skills(root, mod.default_config(root), toolkit)
            self.assertEqual(result.managed, [])
            self.assertTrue(any('Invalid toolkit skill name' in warning for warning in result.warnings))
            self.assertFalse((root / '.agents/outside').exists())

    def test_removed_owned_skill_link_is_cleaned_up(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root = Path(td); toolkit = self.make_project(root)
            owned = toolkit / 'skills/quality/review-pr'
            owned.mkdir(parents=True); skill = owned / 'SKILL.md'; skill.write_text('# PR review\n')
            cfg = mod.default_config(root)
            mod.sync_skills(root, cfg, toolkit)
            skill.unlink()
            result = mod.sync_skills(root, cfg, toolkit)
            self.assertIn('review-pr', result.removed)
            self.assertFalse((root / '.agents/skills/review-pr').is_symlink())

    def test_secret_warning_regex(self):
        self.assertIsNotNone(mod.SECRET_RE.search('api_key: abc123'))
if __name__ == '__main__': unittest.main()
