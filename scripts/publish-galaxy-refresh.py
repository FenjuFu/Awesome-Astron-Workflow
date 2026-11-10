"""Publish only generated Galaxy data, using the owner's gh authentication.

The owner explicitly authorized daily data PR auto-merges on 2026-11-10.
No branch protection is bypassed. No source-code PR is auto-merged here.
"""
import datetime
import json
import os
from pathlib import Path
import subprocess
import time

ROOT = Path(__file__).resolve().parents[1]
REPO = 'FenjuFu/Awesome-Astron-Workflow'
RECEIPTS = ROOT / '.cache/galaxy-receipts'


def command(*args, check=True):
    return subprocess.run(args, cwd=ROOT, text=True, encoding='utf-8',
                          capture_output=True, check=check)


def api(path):
    return json.loads(command('gh', 'api', path).stdout)


def allowed(path):
    projects = json.loads((ROOT / 'src/data/galaxy-projects.json').read_text(encoding='utf-8'))
    ids = {p['id'] for p in projects}
    return (path in {'src/data/galaxy.json', 'src/data/galaxy-avatars.json',
                     'src/data/openrank-examples.json', 'docs/galaxy-data/avatars.json',
                     'public/galaxy-data/astron-agent-examples.json'}
            or path in {f'docs/galaxy-data/github-history/{name}{suffix}' for name in ids
                        for suffix in ('.json.gz', '-manifest.json')}
            or path in {f'public/galaxy-data/{name}-calculation.json' for name in ids})


def main():
    RECEIPTS.mkdir(parents=True, exist_ok=True)
    identity = api('user')
    assert identity['login'] == 'FenjuFu', 'Unexpected publishing identity'
    receipt = {'runId': os.environ.get('GITHUB_RUN_ID'), 'reviewRequests': [],
               'sourceSha': command('git', 'rev-parse', 'HEAD').stdout.strip()}
    receipt_path = RECEIPTS / 'publication.json'

    def save():
        receipt_path.write_text(json.dumps(receipt, indent=2), encoding='utf-8')

    save()
    # Never stage a broad directory without checking every changed path first.
    paths = command('git', 'diff', '--name-only').stdout.splitlines()
    paths += command('git', 'ls-files', '--others', '--exclude-standard').stdout.splitlines()
    paths = [p for p in paths if not p.startswith('.cache/') and '__pycache__/' not in p]
    assert all(allowed(p) for p in paths), f'Unexpected changes: {paths}'
    if not paths:
        receipt['status'] = 'unchanged'
        save()
        return
    branch = 'automation/galaxy-' + os.environ['GITHUB_RUN_ID'] + '-' + os.environ['GITHUB_RUN_ATTEMPT']
    command('git', 'switch', '-c', branch)
    email = f"{identity['id']}+{identity['login']}@users.noreply.github.com"
    command('git', 'config', 'user.name', identity['login'])
    command('git', 'config', 'user.email', email)
    command('git', 'add', '--', *paths)
    snapshot = json.loads((ROOT / 'src/data/galaxy.json').read_text(encoding='utf-8'))
    now = datetime.datetime.now(datetime.timezone.utc)
    for project in snapshot['projects']:
        ledger = json.loads((ROOT / 'public/galaxy-data' / (project['id'] + '-calculation.json')).read_text(encoding='utf-8'))
        started = datetime.datetime.fromisoformat(ledger['capture']['startedAt'].replace('Z', '+00:00'))
        assert 0 <= (now - started).total_seconds() < 86400, 'Stale collection: ' + project['id']
    title = 'data: refresh Galaxy ' + snapshot['capturedAt'][:10]
    command('git', 'commit', '-s', '-m', title)
    sha = command('git', 'rev-parse', 'HEAD').stdout.strip()
    receipt.update(headSha=sha, branch=branch, files=paths, capturedAt=snapshot['capturedAt'])
    save()
    command('git', 'push', 'origin', branch)
    body = RECEIPTS / 'pr-body.md'
    body.write_text('Refresh the configured Galaxy projects from fresh public GitHub history. '
                    'Recalculate repository and contributor OpenRank, examples and avatars.\n\n'
                    'Validation: local OpenRank tests, independent graph replay, npm ci and production build passed.\n\n'
                    f'Capture cutoff: {snapshot["capturedAt"]}. Source: {receipt["sourceSha"]}.\n'
                    'Automatic data-only merge authorized by the repository owner on 2026-11-10.\n', encoding='utf-8')
    url = command('gh', 'pr', 'create', '--repo', REPO, '--base', 'master', '--head', branch,
                  '--title', title, '--body-file', str(body)).stdout.strip()
    receipt['pr'] = url
    save()
    pr = json.loads(command('gh', 'pr', 'view', url, '--json', 'number,title,body,headRefOid').stdout)
    assert pr['title'] == title and pr['body'].replace('\r\n', '\n').strip() == body.read_text(encoding='utf-8').strip()
    assert pr['headRefOid'] == sha
    candidates = [u['login'] for u in api(f'repos/{REPO}/collaborators?per_page=100')
                  if u['login'] != identity['login'] and u.get('permissions', {}).get('push')]
    if candidates:
        command('gh', 'pr', 'edit', url, '--add-reviewer', candidates[0])
        review = json.loads(command('gh', 'pr', 'view', url, '--json', 'reviewRequests').stdout)
        receipt['reviewRequests'] = review['reviewRequests']
        assert receipt['reviewRequests'], 'Reviewer request was not persisted'
    else:
        receipt['reviewerGap'] = 'No eligible non-author collaborator; no permission changes made.'
        print('::warning::' + receipt['reviewerGap'])
    save()
    # Allow external checks (including Vercel) to register. Never interpret zero checks as success.
    deadline = time.monotonic() + 1200
    while time.monotonic() < deadline:
        current = json.loads(command('gh', 'pr', 'view', url, '--json', 'headRefOid,state,statusCheckRollup,mergeable').stdout)
        assert current['headRefOid'] == sha, 'PR head changed; refusing automatic merge'
        checks = current['statusCheckRollup'] or []
        receipt['checks'] = checks
        save()
        failed = [c for c in checks if c.get('conclusion') in {'FAILURE', 'CANCELLED', 'TIMED_OUT', 'ACTION_REQUIRED'} or c.get('state') in {'FAILURE', 'ERROR'}]
        if failed:
            raise RuntimeError('PR checks failed: ' + json.dumps(failed))
        passed = checks and all(c.get('conclusion') in {'SUCCESS', 'NEUTRAL', 'SKIPPED'} or c.get('state') == 'SUCCESS' for c in checks)
        if passed and current['mergeable'] == 'MERGEABLE':
            changed = command('gh', 'pr', 'diff', url, '--name-only').stdout.splitlines()
            assert changed and all(allowed(p) for p in changed), 'PR contains non-data changes'
            latest_base = api(f'repos/{REPO}/git/ref/heads/master')['object']['sha']
            assert latest_base == receipt['sourceSha'], 'Master changed after validation; leave PR open for a fresh run'
            command('gh', 'pr', 'merge', url, '--squash', '--match-head-commit', sha)
            merged = json.loads(command('gh', 'pr', 'view', url, '--json', 'state,mergeCommit').stdout)
            assert merged['state'] == 'MERGED'
            receipt.update(status='merged', mergeSha=merged['mergeCommit']['oid'])
            save()
            return
        time.sleep(20)
    raise TimeoutError('PR checks/mergeability did not become ready; left PR open')


if __name__ == '__main__':
    main()
