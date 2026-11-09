"""Independent OpenRank value-flow calculation over locally collected GitHub history.

This implements the mathematical fixed-point equation, not copied library code.
No external score dataset, service or OpenDigger data dependency is used.
"""
from collections import Counter, defaultdict
import datetime
import hashlib
import gzip
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PARAMETERS = {
 'model': 'astron-community-all-history-v1',
 'formula': 'x_i(next) = r_i * b_i + (1-r_i) * sum_j(w_ji * x_j)',
 'initial': {'developer':1, 'repository':1, 'issue':2, 'pr':3, 'merged_pr':5, 'direct_commit':1, 'code_summary':1, 'unavailable_item':1},
 'retention': {'developer':.15, 'repository':.15, 'work_item':.8},
 'activityWeights': {'open':2, 'comment':1, 'review':1, 'review_comment':1, 'close':2, 'commit':1, 'code_summary':1},
 'itemToRepo':.1, 'itemToPeople':.9, 'authorShare':.5,
 'tolerance':1e-10, 'maxIterations':1000,
 'time': 'One graph containing all collected history through capture; no monthly cutoff, monthly decay, or sum of precomputed scores.',
 'algorithmReference':'https://github.com/X-lab2017/openrank-neo4j-gds/blob/83ec0da7352440e391726323bb5eed43c4aa3d76/src/main/java/gds/openrank/OpenRankPregel.java',
 'modelReference':'https://blog.frankzhao.cn/openrank_in_project/',
 'adaptations':['Full-history graph rather than monthly inheritance.', 'Direct commits not represented in PRs become base-1 work items; coauthor credit is split.', 'Unlinked code contributors use a single verified GitHub contributor-summary work item, without inventing event dates.', 'Public comments whose parent is unavailable connect to a neutral base-1 item; missing author/status is not inferred.', 'No reaction bonus or inaccessible/deleted/private activity is inferred.']
}

def solve(initial, retention, outgoing):
    """Solve the documented OpenRank fixed point with normalized outgoing edges."""
    n=len(initial)
    for row in outgoing:
        if abs(sum(w for _,w in row)-1)>1e-9: raise ValueError('Outgoing edge weights must sum to 1')
    current=list(initial)
    for iteration in range(1,PARAMETERS['maxIterations']+1):
        incoming=[0.0]*n
        for j, row in enumerate(outgoing):
            for i, weight in row: incoming[i] += weight*current[j]
        updated=[retention[i]*initial[i]+(1-retention[i])*incoming[i] for i in range(n)]
        residual=max(abs(updated[i]-current[i]) for i in range(n))
        current=updated
        if residual < PARAMETERS['tolerance']: return current,iteration,residual
    raise RuntimeError('OpenRank did not converge; refuse to publish')

def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def calculate(raw):
    name=raw['repo']; people={}; units={}; events=[]; seen=set(); gaps=Counter(); code_counts={}; canonical_names={}
    def actor(person):
        if not person or not person.get('login'):
            gaps['unlinkedActorOccurrences']+=1; return None
        login=person['login']
        if person.get('__typename')=='Bot' and not login.endswith('[bot]'):login+='[bot]'
        login=canonical_names.setdefault(login.casefold(),login)
        people.setdefault(login, {'login':login,'url':person.get('url') or 'https://github.com/'+login,
            'avatar':person['avatarUrl'],'type':person.get('__typename','User'),'stats':Counter(),'dates':[]})
        return login
    def event(unit, person, kind, date, identifier, weight=None):
        login=actor(person)
        if not login:return
        # The same close/merge or commit is never credited twice to an account.
        key=(kind,identifier,login)
        if key in seen:return
        seen.add(key)
        units[unit]['weights'][login]+=weight if weight is not None else PARAMETERS['activityWeights'][kind]
        people[login]['stats'][kind]+=1
        if date:people[login]['dates'].append(date)
        events.append({'id':identifier,'unit':unit,'login':login,'kind':kind,'at':date})
    for c in raw.get('codeContributors',[]):
        login=actor(c);code_counts[login]=c['contributions']
    all_work=sorted(raw['issues']+raw['pullRequests'],key=lambda u:(u['createdAt'],u['number']))
    associated_commits={edge['commit']['oid'] for p in raw['pullRequests'] for edge in p['commits']}
    for u in all_work:
        uid=str(u['number']);author=actor(u['author']) if u['author'] else None
        base=2 if u['kind']=='issue' else 5 if u['mergedAt'] else 3
        units[uid]={'id':uid,'kind':u['kind'],'url':u['url'],'base':base,'authors':[author] if author else [],'weights':Counter()}
        event(uid,u['author'],'open',u['createdAt'],'open:'+u['id'])
        for close in u['closings']:
            event(uid,close.get('actor'),'close',close['createdAt'],f'close:{uid}:{close["createdAt"]}')
        if u['kind']=='pr':
            if u['mergedAt']:
                event(uid,u['mergedBy'],'close',u['mergedAt'],f'close:{uid}:{u["mergedAt"]}')
            for review in u['reviews']:
                if review['submittedAt'] and review['state']!='PENDING': event(uid,review['author'],'review',review['submittedAt'],review['id'])
            for edge in u['commits']:
                commit=edge['commit'];authors=[a['user'] for a in commit['authors']['nodes'] if a['user']]
                gaps['unlinkedCommitAuthorOccurrences']+=sum(a['user'] is None for a in commit['authors']['nodes'])
                for person in authors:event(uid,person,'commit',commit['committedDate'],commit['oid'],1/len(authors))
    for group,kind in [('comments','comment'),('reviewComments','review_comment')]:
        for c in raw[group]:
            uid=str(c['unitNumber'])
            if uid not in units:
                units[uid]={'id':uid,'kind':'unavailable_item','url':f'https://github.com/iflytek/{name}/issues/{uid}',
                            'base':1,'authors':[],'weights':Counter()}
                gaps['unavailableParentItems']+=1
            if units[uid]['kind']=='unavailable_item':gaps['commentsWithUnavailableParent']+=1
            event(uid,c['author'],kind,c['createdAt'],c['id'])
    for commit in raw['defaultCommits']:
        if commit['oid'] in associated_commits:continue
        authors=[a['user'] for a in commit['authors']['nodes'] if a['user']]
        gaps['unlinkedCommitAuthorOccurrences']+=sum(a['user'] is None for a in commit['authors']['nodes'])
        if not authors:gaps['directCommitsWithoutLinkedAccount']+=1;continue
        uid='commit:'+commit['oid']
        units[uid]={'id':uid,'kind':'direct_commit','url':f'https://github.com/iflytek/{name}/commit/{commit["oid"]}',
                    'base':1,'authors':[actor(p) for p in authors],'weights':Counter()}
        if commit['committedDate']<raw['meta']['created_at']:gaps['importedCommitsPredatingRepository']+=1
        for person in authors:event(uid,person,'commit',commit['committedDate'],commit['oid'],1/len(authors))
    for c in raw.get('codeContributors',[]):
        login=actor(c)
        if not people[login]['stats']:
            uid='summary:'+login
            units[uid]={'id':uid,'kind':'code_summary','url':f'https://github.com/iflytek/{name}/graphs/contributors',
                        'base':1,'authors':[login],'weights':Counter()}
            event(uid,c,'code_summary',None,uid)
            gaps['codeContributorSummaryFallbacks']+=1
    # Repository, work item and account nodes, with independently constructed edges.
    logins=sorted(people,key=str.lower);unit_ids=sorted(units)
    ids=['repo:'+name]+['item:'+u for u in unit_ids]+['user:'+p for p in logins]
    index={key:i for i,key in enumerate(ids)}
    initial=[1]+[units[u]['base'] for u in unit_ids]+[1]*len(logins)
    retention=[.15]+[.8]*len(unit_ids)+[.15]*len(logins)
    edges=[[] for _ in ids];user_weights=defaultdict(Counter)
    edges[0]=[(index['item:'+u],1/len(unit_ids)) for u in unit_ids] if unit_ids else [(0,1)]
    for uid in unit_ids:
        item=units[uid];weights=item['weights'];ii=index['item:'+uid]
        if not weights:edges[ii]=[(0,1)];continue
        edges[ii]=[(0,.1)]
        authors=[p for p in item['authors'] if p in weights]
        others={p:w for p,w in weights.items() if p not in authors}
        shares=Counter()
        if authors:
            portion=.5 if others else 1
            for p in authors:shares[p]+=portion/len(authors)
            if others:
                total=sum(others.values())
                for p,w in others.items():shares[p]+=.5*w/total
        else:
            total=sum(weights.values())
            for p,w in weights.items():shares[p]+=w/total
        edges[ii]+=[(index['user:'+p],.9*share) for p,share in shares.items()]
        for p,w in weights.items():user_weights[p][ii]+=w
    for login in logins:
        ui=index['user:'+login];weights=user_weights[login];total=sum(weights.values())
        if not total:raise RuntimeError('Account without a verified relation: '+login)
        edges[ui]=[(i,w/total) for i,w in weights.items()]
    values,iterations,residual=solve(initial,retention,edges)
    contributors=[]
    for login in logins:
        p=people[login];dates=sorted(p.pop('dates'));months=sorted({d[:7] for d in dates})
        coverage={'firstMonth':months[0],'lastMonth':months[-1],'months':len(months),'gapMonths':0,'monthsSinceLast':0} if months else None
        contributors.append({**p,'stats':dict(p['stats']),'contributions':code_counts.get(login,0),
            'openrank':round(values[index['user:'+login]],10),'openrankStatus':'calculated',
            'openrankSource':'/galaxy-data/'+name+'-calculation.json','openrankCoverage':coverage,
            'observedEvents':sum(p['stats'].values()),'firstObservedAt':dates[0] if dates else None,
            'lastObservedAt':dates[-1] if dates else None,
            'evidenceLinks':[units[uid]['url'] for uid in unit_ids if login in units[uid]['weights']][:5]})
    contributors.sort(key=lambda p:(-p['openrank'],p['login'].lower()))
    for i,p in enumerate(contributors):
        p['rank']=contributors[i-1]['rank'] if i and p['openrank']==contributors[i-1]['openrank'] else i+1
    graph={'nodes':ids,'initial':initial,'retention':retention,'outgoing':edges}
    report={'repository':'iflytek/'+name,'parameters':PARAMETERS,'inputSha256':digest(raw),'graphSha256':digest(graph),
        'capture':{'startedAt':raw['startedAt'],'completedAt':raw['completedAt'],'defaultHead':raw['defaultHead']},
        'coverage':{k:len(raw[k]) for k in ['issues','pullRequests','comments','reviewComments','defaultCommits','codeContributors']},
        'participants':len(contributors),'events':len(events),'workItems':len(unit_ids),'gaps':dict(gaps),
        'iterations':iterations,'residual':residual,'repositoryOpenRank':values[0],
        'scores':{p['login']:p['openrank'] for p in contributors},'graph':graph,'eventLedger':events}
    meta=raw['meta']
    repo={'id':name,'url':meta['html_url'],'stars':meta['stargazers_count'],'forks':meta['forks_count'],'archived':False,
          'source':'https://api.github.com/repos/iflytek/'+name,'contributorsSource':'/galaxy-data/'+name+'-calculation.json',
          'openrankSource':'/galaxy-data/'+name+'-calculation.json','openrank':round(values[0],10),
          'openrankCoverage':{'firstMonth':meta['created_at'][:7],'lastMonth':raw['completedAt'][:7],'months':0,'gapMonths':0,'monthsSinceLast':0},
          'historyStart':meta['created_at'][:10],'historyEnd':raw['completedAt'][:10],
          'calculation':{k:report[k] for k in ['coverage','participants','events','workItems','gaps','iterations','residual','graphSha256']},
          'contributors':contributors}
    return repo,report

def main():
    projects=[];capture_times=[];out=ROOT/'public/galaxy-data';out.mkdir(exist_ok=True)
    for name in ['astron-agent','skillhub','astron-rpa']:
        source=ROOT/'docs/galaxy-data/github-history'/f'{name}.json'
        payload=source.read_bytes() if source.exists() else gzip.decompress(source.with_suffix('.json.gz').read_bytes())
        raw=json.loads(payload)
        capture_times.append(raw['completedAt'])
        project,report=calculate(raw);projects.append(project)
        (out/(name+'-calculation.json')).write_text(json.dumps(report,separators=(',',':')),encoding='utf8')
        print(name,'participants',report['participants'],'events',report['events'],'gaps',report['gaps'],'top',[(p['login'],round(p['openrank'],2)) for p in project['contributors'][:3]])
    captured=max(p['historyEnd'] for p in projects)
    result={'capturedAt':max(capture_times),'calculatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'calculatedThrough':captured,
      'openrankMonth':captured,'openrankPeriod':'all-history-graph','openrankMetric':'Locally calculated Community OpenRank',
      'method':'Independently collect public GitHub history and solve a full-history repository collaboration network with the OpenRank equation. No externally published scores are used.',
      'parameters':PARAMETERS,'projects':projects}
    (ROOT/'src/data/galaxy.json').write_text(json.dumps(result,indent=2),encoding='utf8')

if __name__=='__main__':main()
