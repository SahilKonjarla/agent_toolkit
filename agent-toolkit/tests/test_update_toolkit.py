import unittest, importlib.util
from pathlib import Path
MOD_PATH = Path(__file__).parents[1] / 'scripts' / 'update_toolkit.py'
spec = importlib.util.spec_from_file_location('update_toolkit', MOD_PATH)
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)  # type: ignore
class UpdateToolkitTests(unittest.TestCase):
    def test_missing_detection(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); self.assertEqual(mod.detect(root, root/'agent-toolkit'), 'missing')
    def test_subtree_like_detection(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); (root/'.git').mkdir(); (root/'agent-toolkit').mkdir()
            self.assertEqual(mod.detect(root, root/'agent-toolkit'), 'subtree-like-copy')
    def test_check_mode_no_update(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); (root/'.git').mkdir(); (root/'agent-toolkit').mkdir(); (root/'agent-toolkit'/'VERSION').write_text('0.1.0')
            self.assertEqual(mod.main(['--root', str(root), '--check']), 0)
if __name__ == '__main__': unittest.main()
