"""Wait for anonymous production artifacts to match the generated snapshot."""
import argparse
import hashlib
import json
import re
from pathlib import Path
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.awesome-astron-workflow.dev'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--timeout', type=int, default=1200)
    args = parser.parse_args()
    files = sorted((ROOT / 'public/galaxy-data').glob('*.json'))
    expected = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
    snapshot = json.loads((ROOT / 'src/data/galaxy.json').read_text(encoding='utf-8'))
    assert expected
    receipts = ROOT / '.cache/galaxy-receipts'
    receipts.mkdir(parents=True, exist_ok=True)
    deadline = time.monotonic() + args.timeout
    result = {}
    while True:
        try:
            with urllib.request.urlopen(BASE + '/galaxy', timeout=30) as response:
                html = response.read()
                assert response.status == 200 and b'/assets/' in html
            scripts = re.findall(rb'<script[^>]+src="(/assets/[^\"]+\.js)"', html)
            assert scripts, 'Missing production entry script'
            bundle = b''
            for script in scripts:
                with urllib.request.urlopen(BASE + script.decode(), timeout=60) as response:
                    bundle += response.read()
            # Galaxy is lazy-loaded, so its data lives outside the HTML entry bundle.
            galaxy_chunks = set(re.findall(rb'AstronGalaxy-[A-Za-z0-9_-]+\.js', bundle))
            assert galaxy_chunks, 'Missing lazy Galaxy chunk reference'
            for chunk in galaxy_chunks:
                with urllib.request.urlopen(BASE + '/assets/' + chunk.decode(), timeout=60) as response:
                    bundle += response.read()
            frontend_matches = snapshot['capturedAt'].encode() in bundle and all(
                p['calculation']['graphSha256'].encode() in bundle for p in snapshot['projects'])
            actual = {}
            for name in expected:
                with urllib.request.urlopen(BASE + '/galaxy-data/' + name, timeout=60) as response:
                    actual[name] = hashlib.sha256(response.read()).hexdigest()
            result = {'url': BASE + '/galaxy', 'expected': expected, 'actual': actual,
                      'verifiedAtEpoch': time.time(), 'frontendMatches': frontend_matches,
                      'matches': actual == expected and frontend_matches}
            if result['matches']:
                (receipts / 'production.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
                print('Production Galaxy artifacts match:', len(expected))
                return
        except Exception as error:
            result['lastError'] = str(error)
        (receipts / 'production.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
        if time.monotonic() >= deadline:
            raise TimeoutError('Production has not published the expected Galaxy snapshot: ' + json.dumps(result))
        time.sleep(20)


if __name__ == '__main__':
    main()
