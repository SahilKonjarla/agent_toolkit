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
    def test_secret_warning_regex(self):
        self.assertIsNotNone(mod.SECRET_RE.search('api_key: abc123'))
if __name__ == '__main__': unittest.main()
