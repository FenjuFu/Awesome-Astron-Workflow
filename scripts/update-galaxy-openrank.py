"""Refresh GitHub contributors and OpenDigger Global OpenRank; preserve source evidence."""
import concurrent.futures
import datetime
import hashlib
import json
import re
import time
from pathlib import Path
import urllib.request
import urllib.error
import urllib.parse

REPOS = ['astron-agent', 'skillhub', 'astron-rpa']
ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = {}

def fetch(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Astron-Galaxy', 'Accept': 'application/json'})
            with urllib.request.urlopen(req, timeout=25) as response:
                raw = response.read()
            value = json.loads(raw)
            EVIDENCE[url] = {'sha256': hashlib.sha256(raw).hexdigest(), 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'data': value}
            return value
        except urllib.error.HTTPError as error:
            if error.code == 404:
                EVIDENCE[url] = {'error': 'HTTP 404', 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}
                raise
            if attempt == 2: raise
        except Exception:
            if attempt == 2: raise
        time.sleep(attempt + 1)

def project(name):
    base = 'https://api.github.com/repos/iflytek/' + name
    meta = fetch(base)
    if meta['archived']:
        raise RuntimeError(name + ' is archived; review collection before publishing')
    people = []
    for page in range(1, 21):
        batch = fetch(base + f'/contributors?per_page=100&anon=false&page={page}')
        people.extend(batch)
        if len(batch) < 100: break
    else: raise RuntimeError('Contributor pagination limit reached: ' + name)
    source = f'https://oss.open-digger.cn/github/iflytek/{name}/openrank.json'
    ranks = fetch(source)
    return {'id': name, 'url': meta['html_url'], 'stars': meta['stargazers_count'],
            'forks': meta['forks_count'], 'archived': False, 'source': base,
            'contributorsSource': base + '/contributors?per_page=100&anon=false',
            'contributorsPages': page, 'openrankSource': source, 'openrankHistory': ranks,
            'contributors': [{'login': p['login'], 'url': p['html_url'], 'avatar': p['avatar_url'],
                              'contributions': p['contributions'], 'type': p['type']} for p in people]}

def user_rank(login):
    url = f'https://oss.open-digger.cn/github/{urllib.parse.quote(login)}/openrank.json'
    try: return login, {'history': fetch(url), 'source': url, 'error': None}
    except Exception as error:
        EVIDENCE.setdefault(url, {'error': str(error), 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()})
        return login, {'history': {}, 'source': url, 'error': 'not-exported' if isinstance(error, urllib.error.HTTPError) and error.code == 404 else str(error)}

def main():
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        projects = list(pool.map(project, REPOS))
    this_month = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m')
    months = [set(m for m in p['openrankHistory'] if re.fullmatch(r'\d{4}-\d{2}', m) and m < this_month) for p in projects]
    month = max(set.intersection(*months))
    logins = sorted({p['login'] for repo in projects for p in repo['contributors']})
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        ranks = dict(pool.map(user_rank, logins))
    if not any(month in r['history'] for r in ranks.values()):
        raise RuntimeError('No developer OpenRank for shared month; preserve last snapshot')
    for p in projects:
        p['openrank'] = p.pop('openrankHistory')[month]
        for c in p['contributors']:
            r = ranks[c['login']]
            c.update(openrank=r['history'].get(month), openrankSource=r['source'],
                     openrankStatus='available' if month in r['history'] else r['error'] or 'month-missing')
        p['contributors'].sort(key=lambda c: (c['openrank'] is None, -(c['openrank'] or 0), c['login'].lower()))
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result = {'capturedAt': now, 'openrankMonth': month, 'openrankMetric': 'Global OpenRank',
              'method': 'Paginated GitHub contributors endpoint, anonymous accounts excluded; sorted by OpenDigger monthly Global OpenRank. Global influence is not repository-specific contribution. Missing data is null, never zero.',
              'projects': projects}
    evidence_path = ROOT / 'docs/galaxy-data'
    evidence_path.mkdir(exist_ok=True)
    (evidence_path / 'sources.json').write_text(json.dumps({'capturedAt': now, 'month': month, 'responses': EVIDENCE}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (ROOT / 'src/data/galaxy.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'month': month, 'projects': [{'id': p['id'], 'accounts': len(p['contributors']), 'ranked': sum(c['openrank'] is not None for c in p['contributors'])} for p in projects]}))

if __name__ == '__main__': main()
