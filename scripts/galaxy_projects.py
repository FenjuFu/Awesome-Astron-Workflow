"""Shared project registry; IDs are stable artifact names, owners/repos stay canonical."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PROJECTS=json.loads((ROOT/'src/data/galaxy-projects.json').read_text(encoding='utf8'))
BY_ID={p['id']:p for p in PROJECTS}
if len(BY_ID)!=len(PROJECTS):raise ValueError('Duplicate galaxy project ID')
if len({(p['owner']+'/'+p['repo']).casefold() for p in PROJECTS})!=len(PROJECTS):raise ValueError('Duplicate galaxy repository')
def full_name(project_id):
    p=BY_ID[project_id]
    return p['owner']+'/'+p['repo']
