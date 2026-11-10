"""Collect official monthly repository OpenRank; retain responses and explicit gaps."""
import concurrent.futures
import datetime
import hashlib
import json
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/galaxy-data/global-openrank'
OUT.mkdir(parents=True, exist_ok=True)
definitions = json.loads((ROOT / 'src/data/galaxy-projects.json').read_text(encoding='utf-8'))
now = datetime.datetime.now(datetime.timezone.utc)
current_month = now.strftime('%Y-%m')

def fetch(p):
    url = f"https://oss.open-digger.cn/github/{p['owner']}/{p['repo']}/openrank.json"
    record = dict(id=p['id'], source=url, checkedAt=now.isoformat(), values={})
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Astron-Galaxy/1.0'})
            with urllib.request.urlopen(req, timeout=30) as response:
                raw = response.read()
            data = json.loads(raw)
            record['sha256'] = hashlib.sha256(raw).hexdigest()
            record['values'] = {k: v for k, v in data.items() if len(k) == 7 and k[4] == '-' and k < current_month and isinstance(v, (float, int)) and v >= 0}
            (OUT / f"{p['id']}.json").write_bytes(raw)
            record['status'] = 'available' if record['values'] else 'no-complete-month'
            break
        except Exception as exc:
            record['status'] = 'unavailable'
            record['error'] = str(exc)
            if attempt < 2:
                time.sleep(1)
    return record

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    records = list(pool.map(fetch, definitions))
# Latest completed month with the greatest repository coverage; never mix months.
months = sorted({m for r in records for m in r['values']})
month = max(months, key=lambda m: (sum(m in r['values'] for r in records), m)) if months else None
for r in records:
    r['score'] = r['values'].get(month)
    r['latestMonth'] = max(r['values'], default=None)
    if r['score'] is None and r['status'] == 'available':
        r['status'] = 'missing-selected-month'
result = dict(provider='OpenDigger Global OpenRank', month=month, fetchedAt=now.isoformat(), selection='latest completed month among months with maximum project coverage', projects=records)
(OUT / 'manifest.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
for r in records:
    del r['values']
(ROOT / 'src/data/galaxy-global-openrank.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, indent=2))
