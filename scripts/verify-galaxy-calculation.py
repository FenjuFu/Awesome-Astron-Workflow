"""Replay every published graph and check every participant score against raw inputs."""
import gzip
import importlib.util
import json
from pathlib import Path
from galaxy_automation import automation_reason
from galaxy_projects import BY_ID, full_name
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('calc',Path(__file__).with_name('compute-galaxy-openrank.py'))
calc=importlib.util.module_from_spec(spec);spec.loader.exec_module(calc)
snapshot=json.loads((ROOT/'src/data/galaxy.json').read_text(encoding='utf8'))
assert snapshot['openrankPeriod']=='all-history-graph'
assert {p['id'] for p in snapshot['projects']}==set(BY_ID)
for project in snapshot['projects']:
    name=project['id'];source=ROOT/'docs/galaxy-data/github-history'/f'{name}.json'
    raw=json.loads(source.read_bytes() if source.exists() else gzip.decompress(source.with_suffix('.json.gz').read_bytes()))
    expected,report=calc.calculate(raw)
    published=json.loads((ROOT/'public/galaxy-data'/f'{name}-calculation.json').read_text(encoding='utf8'))
    assert published['repository'].casefold()==full_name(name).casefold()
    assert project['url'].casefold()==('https://github.com/'+full_name(name)).casefold()
    assert published['inputSha256']==calc.digest(raw)
    assert published['graphSha256']==calc.digest(published['graph'])
    assert report['scores']==published['scores']
    assert {c['login']:c['openrank'] for c in project['contributors']}==report['scores']
    assert all(c['openrank'] is not None and c['openrankStatus']=='calculated' for c in project['contributors'])
    graph=published['graph'];values,_,residual=calc.solve(graph['initial'],graph['retention'],graph['outgoing'])
    assert residual<1e-10
    assert abs(values[0] - project['openrank']) < 1e-8
    assert abs(published['repositoryOpenRank'] - project['openrank']) < 1e-8
    assert abs(expected['openrank'] - project['openrank']) < 1e-8
    for c in project['contributors']:
        assert abs(values[graph['nodes'].index('user:'+c['login'])]-c['openrank'])<1e-8
    code_names={c['login'].casefold().removesuffix('[bot]') for c in raw['codeContributors'] if not automation_reason(c)}
    ranked_names={c['login'].casefold().removesuffix('[bot]') for c in project['contributors']}
    assert code_names <= ranked_names
    assert all(not automation_reason(c) for c in project['contributors'])
    assert all(not automation_reason({'login':e['login']}) for e in published['eventLedger'])
    excluded_names={c['login'].casefold() for c in published['automationExclusions']['accounts']}
    assert not excluded_names.intersection(c['login'].casefold() for c in project['contributors'])
    assert not any(n[5:].casefold() in excluded_names for n in graph['nodes'] if n.startswith('user:'))
    print(name, 'PASS',len(project['contributors']),'accounts',published['events'],'observed relations', 'residual',residual)
