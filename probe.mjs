const B='main';
const files=`iflytek/astron-agent/AGENTS.md
iflytek/astron-agent/docs/DEPLOYMENT_GUIDE_zh.md
iflytek/astron-agent/docs/DEPLOYMENT_GUIDE_WITH_AUTH_zh.md
iflytek/astron-agent/docs/DEPLOYMENT_GUIDE_WITH_AUTH_RPA_zh.md
iflytek/astron-agent/docs/DEPLOYMENT_FAQ_zh.md
iflytek/astron-agent/docs/CONFIGURATION_zh.md
iflytek/astron-agent/docs/PROJECT_MODULES_zh.md
iflytek/astron-rpa/docs/devel/zh-CN/README.md
iflytek/astron-rpa/docs/devel/en-US/README.md
iflytek/iFly-Skills/ifly-hyper-tts/README.md
iflytek/iFly-Skills/ifly-hyper-tts/README_zh.md
iflytek/iFly-Skills/ifly-speed-transcription/README.md
iflytek/iFly-Skills/ifly-speed-transcription/README_zh.md
iflytek/iFly-Skills/ifly-ocr-invoice/README.md
iflytek/iFly-Skills/ifly-ocr-invoice/README_zh.md
iflytek/iFly-Skills/ifly-pdf-image-ocr/README.md
iflytek/iFly-Skills/ifly-pdf-image-ocr/README_zh.md
iflytek/iFly-Skills/ifly-image-understanding/README.md
iflytek/iFly-Skills/ifly-image-understanding/README_zh.md
iflytek/iFly-Skills/ifly-translate/README.md
iflytek/iFly-Skills/ifly-translate/README_zh.md
iflytek/iFly-Skills/ifly-text-proofread/README.md
iflytek/iFly-Skills/ifly-text-proofread/README_zh.md
iflytek/iFly-Skills/ifly-video-translate/README.md
iflytek/iFly-Skills/ifly-video-translate/README_zh.md
iflytek/iFly-Skills/ifly-voiceclone-tts/README.md
iflytek/iFly-Skills/ifly-voiceclone-tts/README_zh.md
iflytek/iFly-Skills/ifly-contract-intelligence-review/README.md
iflytek/iFly-Skills/ifly-contract-intelligence-review/README_zh.md`.split('\n');
async function probe(p){
  const repo=p.split('/').slice(0,2).join('/');const file=p.split('/').slice(2).join('/');
  for(const url of [`https://cdn.jsdelivr.net/gh/${repo}@${B}/${file}`,`https://raw.githubusercontent.com/${repo}/${B}/${file}`]){
    const c=new AbortController();const t=setTimeout(()=>c.abort(),10000