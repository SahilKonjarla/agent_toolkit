import unittest, importlib.util, sys
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
            self.assertEqual(mod.main(['--root', str(root), '--yes']), 1)
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

    def test_secret_warning_regex(self):
        self.assertIsNotNone(mod.SECRET_RE.search('api_key: abc123'))
if __name__ == '__main__': unittest.main()
