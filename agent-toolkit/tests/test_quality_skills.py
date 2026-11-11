"""Validate owned skill packaging and the links agents follow during execution."""
import re
import unittest
from pathlib import Path

from test_init_project import mod

TOOLKIT = Path(__file__).resolve().parents[1]
QUALITY = TOOLKIT / 'skills' / 'quality'
EXPECTED = {
    'review-pr', 'triage-ci', 'review-feedback', 'qa-preview',
    'review-async-jobs', 'review-api-contract', 'review-observability', 'docs-drift',
}


class QualitySkillTests(unittest.TestCase):
    def test_all_eight_owned_skills_are_discoverable(self):
        for checkout in [TOOLKIT, TOOLKIT.parent]:
            sources, warnings = mod.toolkit_skill_sources(checkout)
            self.assertTrue(EXPECTED.issubset(sources))
            self.assertFalse(warnings, warnings)
            for name in EXPECTED:
                self.assertEqual(sources[name].resolve(), (QUALITY / name).resolve())

    def test_frontmatter_and_relative_instruction_targets(self):
        for name in sorted(EXPECTED):
            with self.subTest(skill=name):
                path = QUALITY / name / 'SKILL.md'
                text = path.read_text(encoding='utf-8')
                self.assertTrue(text.startswith(f'---\nname: {name}\ndescription: '))
                self.assertIn('\n---\n', text[4:])
                self.assertIn('Read `../README.md`', text)
                self.assertIn('## Inputs', text)
                self.assertIn('## Steps', text)
                self.assertIn('## Output and completion', text)
                for target in re.findall(r'`((?:\.\./)+[^`]+)`', text):
                    self.assertTrue((path.parent / target).exists(), f'{path}: {target}')

    def test_shared_contracts_and_generated_pointers_exist(self):
        text = (QUALITY / 'README.md').read_text(encoding='utf-8')
        for target in ['review-report.md', 'handoff-report.md', 'implementation-report.md']:
            self.assertTrue((TOOLKIT / 'contracts' / target).is_file())
        self.assertIn('snapshot', text)
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            generated = mod.generated_agents_md(mod.default_config(Path(td)))
        template = (TOOLKIT / 'templates' / 'AGENTS.md').read_text(encoding='utf-8')
        for guidance in [generated, template]:
            for target in ['skills/quality/README.md', 'standards/delegation-policy.md', 'standards/review-specialists.md']:
                self.assertIn(f'agent-toolkit/{target}', guidance)
                self.assertTrue((TOOLKIT / target).is_file())


if __name__ == '__main__':
    unittest.main()
