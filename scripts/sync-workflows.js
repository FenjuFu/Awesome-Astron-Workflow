import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const README_EN_PATH = path.join(ROOT, 'README.md');
const README_CN_PATH = path.join(ROOT, 'README.zh-CN.md');
const WORKFLOW_TS_PATH = path.join(ROOT, 'src/types/workflow.ts');
const LANG_CTX_PATH = path.join(ROOT, 'src/contexts/LanguageContext.tsx');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8');
}

function extractWorkflowsFromReadme(content) {
  const workflows = [];
  const lines = content.split('\n');
  let currentWorkflow = null;
  let mode = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    const headerMatch = line.match(/^### (\d+)\.\s+(.*)$/);

    if (headerMatch) {
      if (currentWorkflow) {
        workflows.push(currentWorkflow);
      }
      currentWorkflow = {
        index: parseInt(headerMatch[1], 10),
        title: headerMatch[2].trim(),
        description: '',
        userCaseUrl: '',
        workflowUrl: '',
        features: []
      };
      mode = null;
      continue;
    }

    if (line.startsWith('#') && !headerMatch) {
      if (currentWorkflow) {
        workflows.push(currentWorkflow);
        currentWorkflow = null;
      }
      mode = null;
      continue;
    }

    if (!currentWorkflow) continue;

    if (line.startsWith('**Description') || line.startsWith('**描述')) {
       const endBoldIndex = line.indexOf('**', 2);
       if (endBoldIndex !== -1) {
         let descText = line.substring(endBoldIndex + 2).trim();
         if (descText.startsWith(':') || descText.startsWith('：')) {
           descText = descText.substring(1).trim();
         }
         currentWorkflow.description = descText;
         mode = 'description';
         continue;
       }
    }
    
    const userCaseMatch = line.match(/^-\s*\*\*(?:User Case|用户案例)(?:Url)?\s*[:：]?\*\*\s*(.*)$/i);
    if (userCaseMatch) {
      const linkMatch = userCaseMatch[1].match(/\[.*?\]\((.*?)\)/);
      if (linkMatch) {
        currentWorkflow.userCaseUrl = linkMatch[1];
      } else if (userCaseMatch[1].trim().startsWith('http')) {
        currentWorkflow.userCaseUrl = userCaseMatch[1].trim();
      }
      mode = 'meta';
      continue;
    }

    const workflowMatch = line.match(/^-\s*\*\*(?:Workflow|工作流)(?:Url)?\s*[:：]?\*\*\s*(.*)$/i);
    if (workflowMatch) {
      const linkMatch = workflowMatch[1].match(/\[.*?\]\((.*?)\)/);
      if (linkMatch) {
        currentWorkflow.workflowUrl = linkMatch[1];
      } else if (workflowMatch[1].trim().startsWith('http')) {
        currentWorkflow.workflowUrl = workflowMatch[1].trim();
      }
      mode = 'meta';
      continue;
    }

    if (line.match(/^\*\*(?:Key Features|主要功能)(?:[:：])?\*\*/i)) {
      mode = 'features';
      continue;
    }

    if (mode === 'description') {
      if (line && !line.startsWith('-') && !line.startsWith('**') && !line.startsWith('#')) {
        currentWorkflow.description += (currentWorkflow.description ? ' ' : '') + line;
      }
    }
    
    if (mode === 'features') {
      if (line.startsWith('- ')) {
        if (!line.includes('**User Case') && !line.includes('**Workflow') && !line.includes('**用户案例') && !line.includes('**工作流')) {
          currentWorkflow.features.push(line.substring(2).trim());
        }
      }
    }
  }
  
  if (currentWorkflow) {
    workflows.push(currentWorkflow);
  }
  
  return workflows.sort((a, b) => a.index - b.index);
}

function parseExistingWorkflowTs(content) {
  const match = content.match(/export const workflows: Workflow\[\] = (\[[\s\S]*?\]);/);
  if (!match) return [];
  const arrayStr = match[1];
  try {
    const getArray = new Function(`return ${arrayStr}`);
    return getArray();
  } catch (e) {
    console.error("Failed to parse workflow.ts array:", e);
    return [];
  }
}

console.log('Syncing workflows...');

const readmeEnContent = readFile(README_EN_PATH);
const readmeCnContent = readFile(README_CN_PATH);
const workflowTsContent = readFile(WORKFLOW_TS_PATH);
const langCtxContent = readFile(LANG_CTX_PATH);

const enWorkflows = extractWorkflowsFromReadme(readmeEnContent);
const cnWorkflows = extractWorkflowsFromReadme(readmeCnContent);

console.log(`Found ${enWorkflows.length} workflows in README.md`);
console.log(`Found ${cnWorkflows.length} workflows in README.zh-CN.md`);

const existingWorkflows = parseExistingWorkflowTs(workflowTsContent);
const finalWorkflows = [];

for (const enWf of enWorkflows) {
  const cnWf = cnWorkflows.find(w => w.index === enWf.index);
  if (!cnWf) {
    console.warn(`Warning: Workflow ${enWf.index} (${enWf.title}) not found in Chinese README.`);
  }
  
  const existingConfig = existingWorkflows[enWf.index - 1];
  
  let id, icon, category, titleKey, descKey, featurePrefix;

  if (existingConfig) {
    id = existingConfig.id;
    icon = existingConfig.icon;
    category = existingConfig.category;
    titleKey = existingConfig.title;
    
    const parts = titleKey.split('.');
    if (parts.length === 3 && parts[0] === 'workflow' && parts[2] === 'title') {
      featurePrefix = parts[1];
    } else {
      featurePrefix = id.replace(/-/g, '_');
    }
  } else {
    id = enWf.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    icon = 'box';
    category = 'other';
    featurePrefix = id.replace(/-/g, '_');
  }

  titleKey = `workflow.${featurePrefix}.title`;
  descKey = `workflow.${featurePrefix}.description`;
  
  const features = enWf.features.map((_, idx) => `features.${featurePrefix}.${idx + 1}`);

  finalWorkflows.push({
    index: enWf.index,
    id,
    title: titleKey,
    description: descKey,
    userCaseUrl: enWf.userCaseUrl || (existingConfig ? existingConfig.userCaseUrl : ''),
    workflowUrl: enWf.workflowUrl || (existingConfig ? existingConfig.workflowUrl : ''),
    features,
    icon,
    category,
    
    _en: {
      title: enWf.title,
      description: enWf.description,
      features: enWf.features
    },
    _cn: {
      title: cnWf ? cnWf.title : enWf.title,
      description: cnWf ? cnWf.description : enWf.description,
      features: cnWf ? cnWf.features : enWf.features
    }
  });
}

function formatWorkflowTs(workflows) {
  const lines = ['export const workflows: Workflow[] = ['];
  workflows.forEach((w, i) => {
    lines.push('  {');
    lines.push(`    id: '${w.id}',`);
    lines.push(`    title: '${w.title}',`);
    lines.push(`    description: '${w.description}',`);
    lines.push(`    userCaseUrl: '${w.userCaseUrl}',`);
    lines.push(`    workflowUrl: '${w.workflowUrl}',`);
    lines.push(`    features: [`);
    w.features.forEach((f, fi) => {
      lines.push(`      '${f}'${fi < w.features.length - 1 ? ',' : ''}`);
    });
    lines.push(`    ],`);
    lines.push(`    icon: '${w.icon}',`);
    lines.push(`    category: '${w.category}'`);
    lines.push(`  }${i < workflows.length - 1 ? ',' : ''}`);
  });
  lines.push('];');
  return lines.join('\n');
}

const finalWorkflowTs = workflowTsContent.replace(
  /export const workflows: Workflow\[\] = \[[\s\S]*?\];/,
  formatWorkflowTs(finalWorkflows)
);

writeFile(WORKFLOW_TS_PATH, finalWorkflowTs);
console.log('Updated src/types/workflow.ts');

function generateTranslations(workflows, lang) {
  let output = [];
  workflows.forEach(w => {
    const data = lang === 'en' ? w._en : w._cn;
    const prefix = w.title.split('.')[1];
    
    output.push(`    // Workflows - ${data.title}`);
    output.push(`    'workflow.${prefix}.title': '${data.title.replace(/'/g, "\\'")}',`);
    output.push(`    'workflow.${prefix}.description': '${data.description.replace(/'/g, "\\'")}',`);
    
    data.features.forEach((f, i) => {
      output.push(`    'features.${prefix}.${i + 1}': '${f.replace(/'/g, "\\'")}',`);
    });
    output.push('');
  });
  return output.join('\n');
}

let newLangCtx = langCtxContent;
const enTransBlock = generateTranslations(finalWorkflows, 'en');
const enRegex = /('categories\.content': 'Content Creation',)([\s\S]*?)('about\.title':)/;
newLangCtx = newLangCtx.replace(enRegex, `$1\n\n${enTransBlock}\n    $3`);

const cnTransBlock = generateTranslations(finalWorkflows, 'cn');
const cnRegex = /('categories\.content': '内容创作',)([\s\S]*?)('about\.title':)/;
newLangCtx = newLangCtx.replace(cnRegex, `$1\n\n${cnTransBlock}\n    $3`);

writeFile(LANG_CTX_PATH, newLangCtx);
console.log('Updated src/contexts/LanguageContext.tsx');

function updateToc(content, workflows, lang) {
  const tocLines = workflows.map(w => {
     const data = lang === 'en' ? w._en : w._cn;
     let anchor = w.index + '-' + data.title.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w\-\u4e00-\u9fa5]/g, '');
     return `  - [${w.index}. ${data.title}](#${anchor})`;
  });

  const startMarker = lang === 'en' ? '- [1. ' : '- [1. ';
  const lines = content.split('\n');
  let startIdx = -1;
  let endIdx = -1;
  
  for(let i=0; i<lines.length; i++) {
    if (lines[i].trim().startsWith(startMarker.trim())) {
      startIdx = i;
      for(let j=i; j<lines.length; j++) {
        if (!lines[j].trim().match(/^-\s*\[\d+\./)) {
           endIdx = j;
           break;
        }
      }
      break;
    }
  }
  
  if (startIdx !== -1 && endIdx !== -1) {
    const newContent = [
      ...lines.slice(0, startIdx),
      ...tocLines,
      ...lines.slice(endIdx)
    ].join('\n');
    return newContent;
  }
  return content;
}

const newReadmeEn = updateToc(readmeEnContent, finalWorkflows, 'en');
writeFile(README_EN_PATH, newReadmeEn);

const newReadmeCn = updateToc(readmeCnContent, finalWorkflows, 'cn');
writeFile(README_CN_PATH, newReadmeCn);

console.log('Updated README TOCs');
console.log('Done.');
