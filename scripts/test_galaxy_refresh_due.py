from datetime import datetime, timezone
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('due', Path(__file__).with_name('galaxy-refresh-due.py'))
due = importlib.util.module_from_spec(spec)
spec.loader.exec_module(due)


class ScheduleGate(unittest.TestCase):
    def test_beijing_date_and_failed_runs(self):
        now = datetime(2026, 11, 11, 2, tzinfo=timezone.utc)
        self.assertTrue(due.eligible_run({'run_started_at': '2026-11-10T16:10:00Z', 'conclusion': 'success'}, now))
        self.assertFalse(due.eligible_run({'run_started_at': '2026-11-10T15:59:00Z', 'conclusion': 'success'}, now))
        self.assertFalse(due.eligible_run({'run_started_at': '2026-11-11T01:00:00Z', 'conclusion': 'failure'}, now))

    def test_noop_or_collection_success_does_not_count_as_deployment(self):
        self.assertFalse(due.verified_production([{'steps': [{'name': 'Verify production data', 'conclusion': 'skipped'}]}]))
        self.assertFalse(due.verified_production([{'steps': [{'name': 'Collect fresh history and calculate scores', 'conclusion': 'success'}]}]))
        self.assertTrue(due.verified_production([{'steps': [{'name': 'Verify production data', 'conclusion': 'success'}]}]))


if __name__ == '__main__':
    unittest.main()
