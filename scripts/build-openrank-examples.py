"""Derive the leaderboard's top-two examples from its actual converged graph."""
import gzip
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('galaxy_calc',Path(__file__).with_name('compute-galaxy-openrank.py'))
calc=importlib.util.module_from_spec(spec);spec.loader.exec_module(calc)

def build():
    snapshot=json.loads((ROOT/'src/data/galaxy.json').read_text(encoding='utf8'))
    project=next(p for p in snapshot['projects'] if p['id']=='astron-agent')
    report=json.loads((ROOT/'public/galaxy-data/astron-agent-calculation.json').read_text(encoding='utf8'))
    graph=report['graph']
    assert calc.digest(graph)==report['graphSha256']==project['calculation']['graphSha256']
    values,iterations,residual=calc.solve(graph['initial'],graph['retention'],graph['outgoing'])
    raw_path=ROOT/'docs/galaxy-data/github-history/astron-agent.json'
    raw=json.loads(raw_path.read_bytes() if raw_path.exists() else gzip.decompress(raw_path.with_suffix('.json.gz').read_bytes()))
    units={str(u['number']):u for u in raw['issues']+raw['pullRequests']}
    examples=[]
    for person in project['contributors'][:2]:
        index=graph['nodes'].index('user:'+person['login'])
        terms=[]
        for origin,row in enumerate(graph['outgoing']):
            for target,weight in row:
                if target!=index:continue
                node=graph['nodes'][origin]
                assert node.startswith('item:')
                uid=node[5:];unit=units.get(uid)
                if unit:
                    label=('PR' if unit['kind']=='pr' else 'Issue')+' #'+uid
                    url=unit['url']
                elif uid.startswith('commit:'):
                    label='Commit '+uid[7:14];url='https://github.com/iflytek/astron-agent/commit/'+uid[7:]
                elif uid.startswith('summary:'):
                    label='Code summary';url='https://github.com/iflytek/astron-agent/graphs/contributors'
                else:
                    label='Item #'+uid;url='https://github.com/iflytek/astron-agent/issues/'+uid
                terms.append({'node':node,'label':label,'url':url,'edgeWeight':weight,'nodeScore':values[origin],'weightedInput':weight*values[origin]})
        terms.sort(key=lambda t:(-t['weightedInput'],t['node']))
        total=sum(t['weightedInput'] for t in terms)
        base=graph['initial'][index];retention=graph['retention'][index]
        value=retention*base+(1-retention)*total
        assert abs(value-person['openrank'])<1e-8
        examples.append({'rank':person['rank'],'login':person['login'],'profileUrl':person['url'],
            'base':base,'retention':retention,'networkFactor':1-retention,'baseTerm':retention*base,
            'incomingTotal':total,'networkTerm':(1-retention)*total,'score':person['openrank'],
            'recomputedScore':value,'termCount':len(terms),'topTerms':terms[:3],
            'otherTermCount':max(0,len(terms)-3),'otherInputTotal':sum(t['weightedInput'] for t in terms[3:]),
            'allTerms':terms})
    common={'project':'astron-agent','capturedAt':snapshot['capturedAt'],'graphSha256':report['graphSha256'],
        'model':report['parameters']['model'],'formula':report['parameters']['formula'],
        'iterations':iterations,'residual':residual,'source':'/galaxy-data/astron-agent-calculation.json',
        'fullBreakdown':'/galaxy-data/astron-agent-examples.json'}
    full={**common,'examples':examples}
    compact={**common,'examples':[{k:v for k,v in e.items() if k!='allTerms'} for e in examples]}
    (ROOT/'public/galaxy-data/astron-agent-examples.json').write_text(json.dumps(full,indent=2),encoding='utf8',newline='\n')
    (ROOT/'src/data/openrank-examples.json').write_text(json.dumps(compact,indent=2),encoding='utf8',newline='\n')
    for e in examples:print(e['login'],f"{e['retention']} * {e['base']} + {e['networkFactor']} * {e['incomingTotal']:.12f} = {e['recomputedScore']:.12f}", 'terms',e['termCount'])

if __name__=='__main__':build()
