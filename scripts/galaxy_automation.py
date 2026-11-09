"""Explicit automation exclusion policy; never use broad substring matching."""
KNOWN_ACCOUNTS = {
 'claude':'user-requested-ai-account', 'claude-code':'known-ai-service', 'claude-code-action':'known-ai-service',
 'chatgpt':'user-requested-ai-account', 'chatgpt-codex-connector':'known-ai-service',
 'gemini':'user-requested-ai-account', 'gemini-code-assist':'known-ai-service', 'gemini-cli':'known-ai-service',
 'copilot':'user-requested-ai-account', 'github-copilot':'known-ai-service',
 'copilot-swe-agent':'known-ai-service', 'copilot-pull-request-reviewer':'known-ai-service',
 'openai-codex':'known-ai-service', 'codex':'user-requested-ai-account',
 'github-actions':'github-automation', 'github-advanced-security':'github-automation',
 'github-merge-queue':'github-automation', 'github-pages':'github-automation',
 'claassistant':'cla-automation', 'cla-assistant':'cla-automation', 'cla-bot':'cla-automation', 'clabot':'cla-automation',
 'yandawsonbot':'explicit-bot-account-handle', 'agentindex-bot':'explicit-bot-account-handle',
 'biqibao112212-bot':'explicit-bot-account-handle', 'goplusbot':'explicit-bot-account-handle',
}
POLICY = {'version':'exclude-known-automation-v1','githubType':'Bot','loginSuffix':'[bot]',
          'exactCaseInsensitiveAccounts':KNOWN_ACCOUNTS,
          'scope':'Remove identified Bot/AI/service actors and their activities before graph construction. Remove automation-only work items without eligible participants. No broad substring matches; remaining accounts are not claimed to be verified humans.'}

def automation_reason(person):
    if not person:return None
    if person.get('__typename',person.get('type'))=='Bot':return 'github-bot-type'
    login=person.get('login','').casefold()
    if login.endswith('[bot]'):return 'github-bot-login-suffix'
    return KNOWN_ACCOUNTS.get(login)
