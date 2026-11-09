import importlib.util
from pathlib import Path
import unittest
import copy
from galaxy_automation import automation_reason

spec=importlib.util.spec_from_file_location('local_openrank',Path(__file__).with_name('compute-galaxy-openrank.py'))
calc=importlib.util.module_from_spec(spec);spec.loader.exec_module(calc)

def person(name):return {'login':name,'avatarUrl':'https://avatars.githubusercontent.com/'+name,'url':'https://github.com/'+name,'__typename':'User'}
def commit(oid,who):return {'oid':oid,'committedDate':'2020-01-01T00:00:00Z','authors':{'nodes':[{'user':person(who)}]}}

class LocalOpenRankTest(unittest.TestCase):
    def test_public_commenters_survive_unavailable_parent(self):
        raw={'repo':'test','meta':{'created_at':'2019-01-01','html_url':'https://github.com/test','stargazers_count':0,'forks_count':0},
             'issues':[],'pullRequests':[],'comments':[{'id':'C1','unitNumber':99,'createdAt':'2020-01-02','author':person('commenter')}],
             'reviewComments':[],'defaultCommits':[],'codeContributors':[],'startedAt':'2026-11-09','completedAt':'2026-11-09','defaultHead':None}
        project,report=calc.calculate(raw)
        self.assertEqual(project['contributors'][0]['login'],'commenter')
        self.assertGreater(project['contributors'][0]['openrank'],0)
        self.assertEqual(report['gaps']['unavailableParentItems'],1)
        self.assertEqual(report['gaps']['commentsWithUnavailableParent'],1)
    def test_graphql_rest_bot_aliases_are_excluded_once(self):
        bot={**person('review-app'),'__typename':'Bot'}
        rest_bot={**person('review-app[bot]'),'__typename':'Bot'}
        raw={'repo':'test','meta':{'created_at':'2019-01-01','html_url':'https://github.com/test','stargazers_count':0,'forks_count':0},
             'issues':[{'id':'I1','number':1,'url':'https://github.com/test/issues/1','kind':'issue','createdAt':'2020-01-01','author':bot,'closings':[]}],
             'pullRequests':[],'comments':[{'id':'C1','unitNumber':1,'createdAt':'2020-01-02','author':rest_bot}],
             'reviewComments':[],'defaultCommits':[],'codeContributors':[],'startedAt':'2026-11-09','completedAt':'2026-11-09','defaultHead':None}
        project,report=calc.calculate(raw)
        self.assertEqual(project['contributors'],[])
        self.assertEqual(report['automationExclusions']['accountCount'],1)
        self.assertEqual(report['automationExclusions']['eventCount'],2)
        self.assertEqual(report['graph']['nodes'],['repo:test'])
    def test_explicit_ai_services_not_similarly_named_people(self):
        for name in ['claude','Copilot','CLAassistant','chatgpt','gemini-code-assist','github-actions','github-advanced-security[bot]']:
            self.assertIsNotNone(automation_reason(person(name)))
        for name in ['claudechen','claudette','copilotto','roboticsfan','alice']:
            self.assertIsNone(automation_reason(person(name)))
    def test_bot_activity_does_not_change_remaining_network(self):
        raw={'repo':'test','meta':{'created_at':'2019-01-01','html_url':'https://github.com/test','stargazers_count':0,'forks_count':0},
             'issues':[{'id':'I1','number':1,'url':'https://github.com/test/issues/1','kind':'issue','createdAt':'2020-01-01','author':person('alice'),'closings':[]}],
             'pullRequests':[],'comments':[],'reviewComments':[],'defaultCommits':[commit('aaa','alice')],
             'codeContributors':[],'startedAt':'2026-11-09','completedAt':'2026-11-09','defaultHead':'aaa'}
        _,baseline=calc.calculate(raw)
        with_bots=copy.deepcopy(raw);bot={**person('github-actions'),'__typename':'Bot'}
        with_bots['comments']=[{'id':f'B{i}','unitNumber':1,'createdAt':'2020-01-02','author':bot} for i in range(100)]
        with_bots['issues'].append({'id':'I2','number':2,'url':'https://github.com/test/issues/2','kind':'issue','createdAt':'2020-01-02','author':bot,'closings':[]})
        with_bots['defaultCommits'][0]['authors']['nodes'].append({'user':bot})
        with_bots['codeContributors']=[{**bot,'contributions':999}]
        _,filtered=calc.calculate(with_bots)
        self.assertEqual(filtered['scores'],baseline['scores'])
        self.assertEqual(filtered['graphSha256'],baseline['graphSha256'])
    def test_symmetric_fixed_point(self):
        values,iterations,residual=calc.solve([1,1],[.15,.15],[[(1,1)],[(0,1)]])
        self.assertEqual(values,[1,1]);self.assertLess(residual,1e-10)
    def test_weight_normalization_required(self):
        with self.assertRaises(ValueError):calc.solve([1],[.15],[[(0,.7)]])
    def test_all_history_people_and_no_double_counted_commits(self):
        pr={'id':'PR1','number':1,'url':'https://github.com/test/pull/1','kind':'pr','createdAt':'2020-01-01T00:00:00Z','author':person('author'),'closings':[],
            'mergedAt':'2020-02-01T00:00:00Z','mergedBy':person('maintainer'),'reviews':[{'id':'R1','submittedAt':'2020-01-20T00:00:00Z','state':'APPROVED','author':person('reviewer')}],
            'commits':[{'commit':commit('aaa','coder')}]}
        raw={'repo':'test','meta':{'created_at':'2019-01-01T00:00:00Z','html_url':'https://github.com/iflytek/test','stargazers_count':1,'forks_count':1},
             'issues':[],'pullRequests':[pr],'comments':[{'id':'C1','unitNumber':1,'createdAt':'2020-01-10T00:00:00Z','author':person('commenter')}],
             'reviewComments':[],'defaultCommits':[commit('aaa','coder'),commit('bbb','direct')],
             'codeContributors':[{**person('summary'),'contributions':5}], 'startedAt':'2026-11-09T00:00:00Z','completedAt':'2026-11-09T00:10:00Z','defaultHead':'bbb'}
        repo,report=calc.calculate(raw)
        scores={p['login']:p for p in repo['contributors']}
        self.assertEqual(set(scores),{'author','maintainer','reviewer','coder','commenter','direct','summary'})
        self.assertTrue(all(p['openrank']>0 for p in scores.values()))
        self.assertEqual(report['workItems'],3) # PR + unmatched direct commit + verified summary
        self.assertEqual(scores['coder']['stats']['commit'],1)
        self.assertEqual(scores['summary']['stats']['code_summary'],1)
        self.assertLess(report['residual'],1e-10)
        # Re-solve published graph to verify reproducibility from evidence alone.
        graph=report['graph'];values,_,_=calc.solve(graph['initial'],graph['retention'],graph['outgoing'])
        for login,p in scores.items():self.assertAlmostEqual(values[graph['nodes'].index('user:'+login)],p['openrank'],places=8)

if __name__=='__main__':unittest.main()
