"""Skip retry schedules only after a same-day run verified production successfully."""
from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
import subprocess

BEIJING = timezone(timedelta(hours=8))


def eligible_run(run, now):
    started = datetime.fromisoformat(run['run_started_at'].replace('Z', '+00:00'))
    return (run['conclusion'] == 'success'
            and started.astimezone(BEIJING).date() == now.astimezone(BEIJING).date())


def verified_production(jobs):
    return any(step['name'] == 'Verify production data' and step['conclusion'] == 'success'
               for job in jobs for step in job.get('steps', []))


def api(path):
    return json.loads(subprocess.check_output(['gh', 'api', path], text=True, encoding='utf-8'))


def main():
    now = datetime.now(timezone.utc)
    receipt = {'checkedAt': now.isoformat(), 'event': os.environ['GITHUB_EVENT_NAME'], 'refresh': True}
    if receipt['event'] == 'schedule':
        repo = os.environ['GITHUB_REPOSITORY']
        runs = api(f'repos/{repo}/actions/workflows/galaxy-daily.yml/runs?status=success&per_page=20')['workflow_runs']
        for run in runs:
            if eligible_run(run, now):
                jobs = api(f'repos/{repo}/actions/runs/{run["id"]}/jobs')['jobs']
                if verified_production(jobs):
                    receipt.update(refresh=False, successfulRun=run['id'])
                    break
    root = Path('.cache/galaxy-receipts')
    root.mkdir(parents=True, exist_ok=True)
    (root / 'schedule-gate.json').write_text(json.dumps(receipt, indent=2), encoding='utf-8')
    with open(os.environ['GITHUB_OUTPUT'], 'a', encoding='utf-8') as output:
        output.write('refresh=' + str(receipt['refresh']).lower() + '\n')
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
