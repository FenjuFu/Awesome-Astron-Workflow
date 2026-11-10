import importlib.util
import os
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('collector', Path(__file__).with_name('collect-galaxy-github.py'))
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)


class ReadAuth(unittest.TestCase):
    def test_rest_uses_read_token_only_in_subprocess_environment(self):
        with patch.dict(os.environ, {'GH_TOKEN': 'owner-test', 'GALAXY_REST_TOKEN': 'read-test'}):
            self.assertEqual(collector.request_environment({'kind': 'rest'})['GH_TOKEN'], 'read-test')
            self.assertEqual(collector.request_environment({'kind': 'graphql'})['GH_TOKEN'], 'owner-test')
            self.assertEqual(os.environ['GH_TOKEN'], 'owner-test')

    def test_local_auth_is_unchanged(self):
        with patch.dict(os.environ, {'GH_TOKEN': 'owner-test'}, clear=True):
            self.assertEqual(collector.request_environment({'kind': 'rest'})['GH_TOKEN'], 'owner-test')


if __name__ == '__main__':
    unittest.main()
