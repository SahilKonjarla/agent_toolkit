import unittest, importlib.util
from pathlib import Path
MOD_PATH = Path(__file__).parents[1] / 'scripts' / 'inventory_skills.py'
spec = importlib.util.spec_from_file_location('inventory_skills', MOD_PATH)
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)  # type: ignore
class InventoryTests(unittest.TestCase):
    def test_discovery_and_render(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); d=root/'.agents'/'skills'/'demo'; d.mkdir(parents=True)
            (d/'SKILL.md').write_text('---\nname: demo\ndescription: Demo skill\n---\n# Demo')
            rows=mod.discover(root)
            self.assertEqual(rows[0]['name'],'demo')
            self.assertIn('Demo skill', mod.render(rows))
    def test_check_does_not_modify_skill(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            root=Path(td); d=root/'.agents'/'skills'/'demo'; d.mkdir(parents=True)
            skill=d/'SKILL.md'; skill.write_text('---\nname: demo\n---\nbody')
            before=skill.read_text()
            self.assertEqual(mod.main(['--root', str(root), '--check']), 1)
            self.assertEqual(skill.read_text(), before)
if __name__ == '__main__': unittest.main()
