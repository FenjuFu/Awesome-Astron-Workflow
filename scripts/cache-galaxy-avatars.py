"""Cache unmodified public avatar responses so the map works without third-party image requests."""
import base64
import concurrent.futures
import hashlib
import json
import time
import urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
snapshot = json.loads((ROOT / 'src/data/galaxy.json').read_text(encoding='utf8'))
people = {c['login']: c for p in snapshot['projects'] for c in p['contributors']}
def get(item):
    login, person = item
    url = person['avatar'] + ('&' if '?' in person['avatar'] else '?') + 's=64'
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                raw = r.read(); mime = r.headers.get_content_type()
            if mime not in ('image/png', 'image/jpeg', 'image/webp', 'image/gif'): raise ValueError(mime)
            return login, 'data:' + mime + ';base64,' + base64.b64encode(raw).decode(), {'source': url, 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw), 'mime': mime}
        except Exception as error:
            if attempt == 2: return login, None, {'source': url, 'error': str(error)}
            time.sleep(1)
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    rows = list(pool.map(get, people.items()))
(ROOT / 'src/data/galaxy-avatars.json').write_text(json.dumps({login: value for login, value, _ in rows if value}, separators=(',', ':')), encoding='utf8')
(ROOT / 'docs/galaxy-data/avatars.json').write_text(json.dumps({login: evidence for login, _, evidence in rows}, indent=2), encoding='utf8')
print(json.dumps({'total': len(rows), 'cached': sum(value is not None for _, value, _ in rows), 'failures': [login for login, value, _ in rows if value is None]}))
