"""Refresh independently collected GitHub history, local OpenRank and avatar assets."""
from pathlib import Path
import subprocess
import sys
import os
import datetime
# New runs refresh the API; set GALAXY_HISTORY_CACHE to resume an interrupted run.
os.environ.setdefault('GALAXY_HISTORY_CACHE', str(Path(__file__).resolve().parents[1] / '.cache/galaxy-history' / datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')))
for script in ['collect-galaxy-github.py','compute-galaxy-openrank.py','cache-galaxy-avatars.py']:
    subprocess.run([sys.executable,str(Path(__file__).with_name(script))],check=True)
