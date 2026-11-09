"""Refresh the public GitHub snapshot. Failed requests never replace the last snapshot."""
import concurrent.futures
import datetime
import json
from pathlib import Path
import urllib.request

REPOS = ['astron-agent', 'skillhub', 'astron-rpa']
ROOT = Path(__file__).resolve().parents[1]

def fetch(path):
    req = urllib.request.Request('https://api.github.com/' + path,
                                 headers={'User-Agent': 'Astron-Galaxy', 'Accept': 'application/vnd.github+json'})
    with urllib.request.urlopen(req, timeout=40) as response:
        return json.load(response)

def project(name):
    base = 'repos/iflytek/' + name
    with concurrent.futures.ThreadPoolExecutor() as pool:
        meta, people = list(pool.map(fetch, [base, base + '/contributors?per_page=30&anon=false']))
    if meta['archived']:
        raise RuntimeError(name + ' is archived; review the project collection before publishing')
    return {'id': name, 'url': meta['html_url'], 'stars': meta['stargazers_count'],
            'forks': meta['forks_count'], 'archived': meta['archived'],
            'source': 'https://api.github.com/' + base,
            'contributorsSource': 'https://api.github.com/' + base + '/contributors?per_page=30&anon=false',
            'contributors': [{'login': p['login'], 'url': p['html_url'],
                              'contributions': p['contributions'], 'type': p['type']} for p in people]}

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor() as pool:
        projects = list(pool.map(project, REPOS))
    result = {'capturedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'method': 'GitHub repository counters and first 30 contributors per repository, ordered by contributions. Not a full contributor census or OpenRank.',
              'projects': projects}
    target = ROOT / 'src/data/galaxy.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'capturedAt': result['capturedAt'], 'projects': [
        {'id': p['id'], 'stars': p['stars'], 'sample': len(p['contributors'])} for p in projects]}))
