"""Collect public GitHub collaboration history using locally authenticated gh only.

Resumable request cache; every connection is paginated and checked against totalCount.
No OpenDigger data endpoints are called. No issue/comment bodies or email addresses are collected.
"""
import concurrent.futures
import datetime
import hashlib
import gzip
import json
import os
from pathlib import Path
import subprocess
import threading
import time

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path(os.environ.get('GALAXY_HISTORY_CACHE', str(ROOT / '.cache/galaxy-history')))
CACHE.mkdir(parents=True, exist_ok=True)
ACTOR = 'login avatarUrl url __typename'
PAGE = 'totalCount pageInfo { hasNextPage endCursor }'
COMMENT = f'id createdAt author {{ {ACTOR} }}'
REVIEW = f'id submittedAt state author {{ {ACTOR} }}'
COMMIT = f'oid committedDate authors(first:10) {{ {PAGE} nodes {{ user {{ {ACTOR} }} }} }}'
CLOSE = f'''{PAGE} nodes {{ __typename ... on ClosedEvent {{ id createdAt actor {{ {ACTOR} }} }} }}'''
PR_EXTRA = f'''mergedAt mergedBy {{ {ACTOR} }}
 reviews(first:100) {{ {PAGE} nodes {{ {REVIEW} }} }}
 commits(first:100) {{ {PAGE} nodes {{ commit {{ {COMMIT} }} }} }}'''
UNIT = f'''id number url createdAt updatedAt closedAt author {{ {ACTOR} }}
 timelineItems(first:100,itemTypes:[CLOSED_EVENT]) {{ {CLOSE} }}'''
LOCK = threading.Lock()
MANIFEST = {}
CONTEXT = threading.local()

def request(args, identity):
    key = hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()
    cached = CACHE / (key + '.json')
    if cached.exists():
        raw = cached.read_bytes()
        value = json.loads(raw)
        checked=datetime.datetime.fromtimestamp(cached.stat().st_mtime,datetime.timezone.utc).isoformat()
        if hasattr(CONTEXT,'times'):CONTEXT.times.append(checked)
        with LOCK: MANIFEST[key] = {'request': identity, 'sha256': hashlib.sha256(raw).hexdigest(), 'cache': cached.name, 'checkedAt':checked, 'repository':getattr(CONTEXT,'repo',None)}
        return value
    for attempt in range(5):
        done = subprocess.run(['gh', 'api', *args], capture_output=True, encoding='utf8')
        try: value = json.loads(done.stdout)
        except Exception: value = {}
        if done.returncode == 0 and not (isinstance(value,dict) and value.get('errors')):
            raw = done.stdout.encode('utf8'); cached.write_bytes(raw)
            checked=datetime.datetime.now(datetime.timezone.utc).isoformat()
            if hasattr(CONTEXT,'times'):CONTEXT.times.append(checked)
            with LOCK: MANIFEST[key] = {'request': identity, 'sha256': hashlib.sha256(raw).hexdigest(), 'cache': cached.name, 'checkedAt':checked, 'repository':getattr(CONTEXT,'repo',None)}
            return value
        message = done.stderr + done.stdout[:1200]
        if 'HTTP 404' in message:raise RuntimeError(message)
        if 'rate limit exceeded' in message.lower():
            limit=subprocess.run(['gh','api','rate_limit'],capture_output=True,encoding='utf8')
            if limit.returncode==0:
                resource=json.loads(limit.stdout)['resources']['graphql' if identity.get('kind')=='graphql' else 'core']
                delay=max(1,resource['reset']-time.time()+3)
                print('Waiting for GitHub quota reset:',round(delay),'seconds',flush=True)
                while delay>0:
                    step=min(10,delay);time.sleep(step);delay-=step
                continue
        if attempt == 4: raise RuntimeError(message)
        print('Retry', identity.get('kind'), message[:200], flush=True)
        time.sleep(min(2 ** attempt * 2, 20))

def graphql(query, variables):
    payload = {'query': query, 'variables': variables}
    key = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
    path = CACHE / (key + '-request.json')
    path.write_text(json.dumps(payload), encoding='utf8')
    return request(['graphql', '--input', str(path)], {'kind': 'graphql', **payload})['data']

def rest(path): return request([path], {'kind': 'rest', 'path': path})

def complete_authors(name, commit):
    conn=commit['authors'];nodes=list(conn['nodes']);page=conn['pageInfo'];expected=conn['totalCount']
    query=f'''query($name:String!,$oid:GitObjectID!,$after:String) {{ repository(owner:"iflytek",name:$name) {{object(oid:$oid) {{... on Commit {{authors(first:100,after:$after) {{{PAGE} nodes {{user {{{ACTOR}}}}}}}}}}}}}}}'''
    while page['hasNextPage']:
        conn=graphql(query,{'name':name,'oid':commit['oid'],'after':page['endCursor']})['repository']['object']['authors']
        if conn['totalCount']!=expected:raise RuntimeError('Commit authors changed during pagination')
        nodes.extend(conn['nodes']);page=conn['pageInfo']
    if len(nodes)!=expected:raise RuntimeError('Commit authors incomplete')
    commit['authors']={'nodes':nodes,'totalCount':expected,'pageInfo':page}

def append_pages(initial, node_id, typename, field, fields, args='', allow_incomplete=False):
    nodes = list(initial['nodes'])
    page = initial['pageInfo']
    expected = initial['totalCount']
    while page['hasNextPage']:
        query = f'''query($id:ID!,$after:String) {{ node(id:$id) {{ ... on {typename} {{ {field}(first:100,after:$after{args}) {{ {PAGE} nodes {{ {fields} }} }} }} }} }}'''
        connection = graphql(query, {'id': node_id, 'after': page['endCursor']})['node'][field]
        nodes.extend(connection['nodes']); page = connection['pageInfo']
        if connection['totalCount'] != expected: raise RuntimeError('Connection changed during pagination: ' + node_id + '/' + field)
    # GitHub timelineItems.totalCount counts the unfiltered timeline even when
    # itemTypes is supplied. Exhaust pageInfo for that filtered connection.
    if not allow_incomplete and field != 'timelineItems' and len(nodes) != expected: raise RuntimeError(f'Incomplete {field}: {len(nodes)}/{expected}')
    return nodes

def all_pr_commits(name,unit,expected):
    # GitHub caps the PR commit connection at 250. Its paginated comparison API
    # exposes the complete base...head comparison; verify total before accepting.
    refs=graphql('query($id:ID!){node(id:$id){... on PullRequest {baseRefOid headRefOid}}}',{'id':unit['id']})['node']
    ids=[]
    for page in range(1,1001):
        try:result=rest(f'repos/iflytek/{name}/compare/{refs["baseRefOid"]}...{refs["headRefOid"]}?per_page=100&page={page}')
        except RuntimeError as error:
            if 'No common ancestor' not in str(error):raise
            return recover_pr_history(name,unit,expected,refs)
        if result['total_commits']!=expected:return recover_pr_history(name,unit,expected,refs)
        ids.extend(c['node_id'] for c in result['commits'])
        if len(ids)>=expected:break
        if not result['commits']:raise RuntimeError('Empty compare page before total')
    if len(ids)!=expected or len(set(ids))!=expected:raise RuntimeError('Comparison pagination incomplete')
    nodes=[]
    for start in range(0,len(ids),50):
        query=f'query($ids:[ID!]!){{nodes(ids:$ids){{... on Commit {{{COMMIT}}}}}}}'
        batch=graphql(query,{'ids':ids[start:start+50]})['nodes']
        if any(n is None for n in batch):raise RuntimeError('Comparison commit inaccessible')
        nodes.extend({'commit':n} for n in batch)
    print(name,'PR',unit['number'],'recovered all',expected,'commits via comparison',flush=True)
    unit['commitRecovery']={'method':'paginated-base-head-comparison','expected':expected,'recovered':len(nodes),'refs':refs}
    return nodes

def history_at(name,oid):
    query=f'''query($name:String!,$oid:GitObjectID!,$after:String){{repository(owner:"iflytek",name:$name){{object(oid:$oid){{... on Commit{{history(first:100,after:$after){{{PAGE} nodes{{{COMMIT} parents(first:100){{{PAGE} nodes{{oid}}}}}}}}}}}}}}}}'''
    nodes=[];after=None
    while True:
        result=graphql(query,{'name':name,'oid':oid,'after':after})['repository']['object']['history']
        nodes.extend(result['nodes'])
        if not result['pageInfo']['hasNextPage']:break
        after=result['pageInfo']['endCursor']
    if len(nodes)!=result['totalCount']:raise RuntimeError('Head history pagination incomplete')
    return nodes

def recover_pr_history(name,unit,expected,refs):
    head=history_at(name,refs['headRefOid']);known={e['commit']['oid'] for e in unit['commits']}
    candidate=head;method='complete-head-history'
    if len(candidate)!=expected:
        base={c['oid'] for c in history_at(name,refs['baseRefOid'])}
        candidate=[c for c in head if c['oid'] not in base];method='head-minus-base-ancestry'
    if len(candidate)!=expected or not known.issubset({c['oid'] for c in candidate}):
        # Older PR base refs can move after force-push. Recover the original
        # boundary from the oldest commit returned by the PR connection.
        by_id={c['oid']:c for c in head};oldest=unit['commits'][0]['commit']['oid']
        boundary=[p['oid'] for p in by_id[oldest]['parents']['nodes'] if p['oid'] not in known]
        excluded=set();pending=list(boundary)
        while pending:
            current=pending.pop()
            if current in excluded:continue
            excluded.add(current)
            if current in by_id:pending.extend(p['oid'] for p in by_id[current]['parents']['nodes'])
        candidate=[c for c in head if c['oid'] not in excluded];method='original-pr-boundary-ancestry'
    actual={c['oid'] for c in candidate}
    if len(candidate)!=expected or len(actual)!=expected or not known.issubset(actual) or refs['headRefOid'] not in actual:
        raise RuntimeError(f'Cannot verify complete PR history {name}#{unit["number"]}: {len(candidate)}/{expected}')
    unit['commitRecovery']={'method':method,'expected':expected,'recovered':len(candidate),'verifiedKnownCommits':len(known),'refs':refs}
    print(name,'PR',unit['number'],'recovered',expected,'commits',method,flush=True)
    return [{'commit':c} for c in reversed(candidate)]

def collect_units(name, kind):
    result=[];after=None;expected=None
    field='issues' if kind=='issue' else 'pullRequests'
    typename='Issue' if kind=='issue' else 'PullRequest'
    query=f'''query($name:String!,$after:String) {{ repository(owner:"iflytek",name:$name) {{ {field}(first:30,after:$after,orderBy:{{field:CREATED_AT,direction:ASC}}) {{ {PAGE} nodes {{ {UNIT} {PR_EXTRA if kind=='pr' else ''} }} }} }} rateLimit {{ remaining resetAt cost }} }}'''
    while True:
        response=graphql(query,{'name':name,'after':after}); conn=response['repository'][field]
        if expected is None: expected=conn['totalCount']
        # New Issues/PRs may be appended while a public repo is being collected.
        # CREATED_AT ascending cursors keep existing pages stable; exhaust the
        # connection and validate against the largest observed total.
        expected=max(expected,conn['totalCount'])
        for unit in conn['nodes']:
            unit['kind']=kind
            unit['closings']=append_pages(unit.pop('timelineItems'),unit['id'],typename,'timelineItems',f'__typename ... on ClosedEvent {{ id createdAt actor {{ {ACTOR} }} }}',',itemTypes:[CLOSED_EVENT]')
            if kind=='pr':
                unit['reviews']=append_pages(unit['reviews'],unit['id'],typename,'reviews',REVIEW)
                commit_total=unit['commits']['totalCount']
                unit['commits']=append_pages(unit['commits'],unit['id'],typename,'commits',f'commit {{ {COMMIT} }}',allow_incomplete=True)
                if len(unit['commits'])!=commit_total:unit['commits']=all_pr_commits(name,unit,commit_total)
                for edge in unit['commits']:
                    complete_authors(name,edge['commit'])
            result.append(unit)
        print(name,kind,len(result),'/',expected,'GraphQL remaining',response['rateLimit']['remaining'],flush=True)
        if not conn['pageInfo']['hasNextPage']:break
        after=conn['pageInfo']['endCursor']
    if len(result)!=expected or len({u['id'] for u in result})!=expected: raise RuntimeError('Unit pagination incomplete')
    return result

def bulk_comments(name, path):
    result=[]
    for page in range(1,1001):
        rows=rest(f'repos/iflytek/{name}/{path}?per_page=100&page={page}')
        if not isinstance(rows,list):raise RuntimeError('Unexpected comment response')
        for c in rows:
            unit_url=c.get('issue_url') or c.get('pull_request_url')
            result.append({'id':c['node_id'],'createdAt':c['created_at'],'unitNumber':int(unit_url.rsplit('/',1)[1]),
              'author': {'login':c['user']['login'],'avatarUrl':c['user']['avatar_url'],'url':c['user']['html_url'],'__typename':c['user']['type']} if c.get('user') else None})
        if len(rows)<100:return result
    raise RuntimeError('Comment page cap exceeded')

def branch_commits(name):
    ref=graphql('query($name:String!){repository(owner:"iflytek",name:$name){defaultBranchRef{name target{... on Commit{oid}}}}}',{'name':name})['repository']['defaultBranchRef']
    if not ref:return [],None
    head=ref['target']['oid']
    commits=history_at(name,head)
    for commit in commits:complete_authors(name,commit)
    print(name,'default commits',len(commits),'at fixed head',head,flush=True)
    return commits,head

def collect(name):
    CONTEXT.repo=name;CONTEXT.times=[]
    meta=rest('repos/iflytek/'+name)
    if meta['archived']:raise RuntimeError(name+' archived')
    result={'repo':name,'meta':{k:meta[k] for k in ['full_name','created_at','html_url','stargazers_count','forks_count','archived']},'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    result['issues']=collect_units(name,'issue')
    result['pullRequests']=collect_units(name,'pr')
    result['comments']=bulk_comments(name,'issues/comments')
    result['reviewComments']=bulk_comments(name,'pulls/comments')
    result['unavailableParents']=[]
    known={u['number'] for u in result['issues']+result['pullRequests']}
    missing={c['unitNumber'] for c in result['comments']+result['reviewComments']}-known
    for number in sorted(missing):
        path=f'repos/iflytek/{name}/issues/{number}'
        try:metadata=rest(path)
        except RuntimeError as error:
            if 'HTTP 404' not in str(error):raise
            result['unavailableParents'].append({'number':number,'source':'https://api.github.com/'+path,'status':404,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()})
            continue
        kind='pr' if 'pull_request' in metadata else 'issue'
        typename='PullRequest' if kind=='pr' else 'Issue'
        query=f'query($id:ID!){{node(id:$id){{... on {typename}{{{UNIT} {PR_EXTRA if kind=="pr" else ""}}}}}}}'
        unit=graphql(query,{'id':metadata['node_id']})['node'];unit['kind']=kind
        unit['closings']=append_pages(unit.pop('timelineItems'),unit['id'],typename,'timelineItems',f'__typename ... on ClosedEvent {{ id createdAt actor {{ {ACTOR} }} }}',',itemTypes:[CLOSED_EVENT]')
        if kind=='pr':
            unit['reviews']=append_pages(unit['reviews'],unit['id'],typename,'reviews',REVIEW)
            total=unit['commits']['totalCount']
            unit['commits']=append_pages(unit['commits'],unit['id'],typename,'commits',f'commit {{ {COMMIT} }}',allow_incomplete=True)
            if len(unit['commits'])!=total:unit['commits']=all_pr_commits(name,unit,total)
            for edge in unit['commits']:complete_authors(name,edge['commit'])
        result['pullRequests' if kind=='pr' else 'issues'].append(unit)
    result['defaultCommits'],result['defaultHead']=branch_commits(name)
    result['codeContributors']=[]
    for page in range(1,101):
        batch=rest(f'repos/iflytek/{name}/contributors?per_page=100&anon=false&page={page}')
        result['codeContributors'].extend({'login':c['login'],'avatarUrl':c['avatar_url'],'url':c['html_url'],'__typename':c['type'],'contributions':c['contributions']} for c in batch)
        if len(batch)<100:break
    else:raise RuntimeError('Code contributor pagination cap exceeded')
    result['startedAt']=min(CONTEXT.times)
    result['completedAt']=max(CONTEXT.times)
    result['assembledAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    out=ROOT/'docs/galaxy-data/github-history';out.mkdir(parents=True,exist_ok=True)
    normalized=json.dumps(result,separators=(',',':')).encode('utf8')
    (out/(name+'.json')).write_bytes(normalized)
    (out/(name+'.json.gz')).write_bytes(gzip.compress(normalized,mtime=0))
    print('COMPLETE',name,{k:len(result[k]) for k in ['issues','pullRequests','comments','reviewComments','defaultCommits']},flush=True)
    return result

if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        results=list(pool.map(collect,['astron-agent','skillhub','astron-rpa']))
    out=ROOT/'docs/galaxy-data/github-history'
    (out/'manifest.json').write_text(json.dumps({'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'requests':MANIFEST},indent=2),encoding='utf8')
