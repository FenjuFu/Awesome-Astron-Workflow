"""Guard the data-only automatic merge boundary."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('publish', Path(__file__).with_name('publish-galaxy-refresh.py'))
publish = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publish)


class PublishBoundary(unittest.TestCase):
    def test_generated_artifacts(self):
        for path in ['src/data/galaxy.json', 'public/galaxy-data/astron-agent-calculation.json',
                     'public/galaxy-data/astron-agent-examples.json',
                     'docs/galaxy-data/github-history/skillhub.json.gz',
                     'docs/galaxy-data/github-history/spark-mlx-llm-manifest.json']:
            self.assertTrue(publish.allowed(path), path)

    def test_source_unknown_projects_and_path_traversal_rejected(self):
        for path in ['src/data/galaxy-projects.json', '.github/workflows/galaxy-daily.yml',
                     'scripts/update-galaxy.py', 'public/galaxy-data/unapproved.json',
                     'public/galaxy-data/../../package.json',
                     'docs/galaxy-data/github-history/unapproved.json.gz']:
            self.assertFalse(publish.allowed(path), path)


if __name__ == '__main__':
    unittest.main()
