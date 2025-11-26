export interface Workflow {
  id: string;
  title: string;
  description: string;
  userCaseUrl: string;
  workflowUrl: string;
  features: string[];
  icon: string;
  category: string;
}

export const workflows: Workflow[] = [
  {
    id: 'resume-assistant',
    title: 'workflow.resume.title',
    description: 'workflow.resume.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/t18r62JYsx8P_1jV_5f1Mg',
    workflowUrl: 'https://github.com/justacoder99/AI-Resume-Assistant/blob/main/docker/astronAgent/AI-Resume-Assistant.yml',
    features: [
      'features.resume.1',
      'features.resume.2',
      'features.resume.3',
      'features.resume.4',
      'features.resume.5'
    ],
    icon: 'file-text',
    category: 'productivity'
  },
  {
    id: 'ai-translator',
    title: 'workflow.translator.title',
    description: 'workflow.translator.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/ge52PHt_TQIkCcRl1m3B3w',
    workflowUrl: 'https://github.com/aying20/aitranslator/blob/main/workflow/aitranslator.yml',
    features: [
      'features.translator.1',
      'features.translator.2',
      'features.translator.3',
      'features.translator.4',
      'features.translator.5'
    ],
    icon: 'languages',
    category: 'communication'
  },
  {
    id: 'content-writing',
    title: 'workflow.content.title',
    description: 'workflow.content.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/fVZJYtXTiPKMku_1ycOBpg',
    workflowUrl: 'https://github.com/binggandata/ai_resource/blob/main/%E5%A4%9A%E5%B9%B3%E5%8F%B0%E5%86%85%E5%AE%B9%E5%86%99%E4%BD%9C.yml',
    features: [
      'features.content.1',
      'features.content.2',
      'features.content.3',
      'features.content.4',
      'features.content.5'
    ],
    icon: 'pen-tool',
    category: 'content'
  },
  {
    id: 'podcast-generator',
    title: 'workflow.podcast.title',
    description: 'workflow.podcast.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/QKp2nTKGl0m8JTytc-0ibA',
    workflowUrl: 'https://github.com/itwanger/AI-Podcast-Workshop/blob/main/docker/astronAgent/AI%20%E6%92%AD%E5%AE%A2.yml',
    features: [
      'features.podcast.1',
      'features.podcast.2',
      'features.podcast.3',
      'features.podcast.4',
      'features.podcast.5'
    ],
    icon: 'mic',
    category: 'audio'
  },
  {
    id: 'course-generator',
    title: 'workflow.course.title',
    description: 'workflow.course.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/QHcwsQB29m_dDzkchIUvdQ',
    workflowUrl: 'https://github.com/GitHubDaily/AI-Course-Generator/tree/main/workflow',
    features: [
      'features.course.1',
      'features.course.2',
      'features.course.3',
      'features.course.4',
      'features.course.5'
    ],
    icon: 'graduation-cap',
    category: 'education'
  }
  ,
  {
    id: 'novel-image-generator',
    title: 'Novel Image-Text Generator',
    description: 'Enter a novel title and auto-generate a full article with images via Astron workflow.',
    userCaseUrl: 'https://mp.weixin.qq.com/s/F4Uz30jw5Uo2WQSe-tO3xg',
    workflowUrl: 'https://github.com/XiongFeng1997/AI-Novel-Generation/blob/main/docker/astronAgent/%E5%B0%8F%E8%AF%B4%E5%9B%BE%E6%96%87%E7%94%9F%E6%88%90.yml',
    features: [
      'One-input novel title → image-rich article',
      'Prompt-based agent creation',
      'Advanced config: web/image/code tools',
      'Visual block-based workflow authoring',
      'Publish to Agent Plaza for reuse'
    ],
    icon: 'pen-tool',
    category: 'content'
  }
  ,
  {
    id: 'knowledge-cards',
    title: 'Knowledge Note Cards Organizer',
    description: 'Turn scattered notes into structured knowledge cards with AI.',
    userCaseUrl: 'https://mp.weixin.qq.com/s/b0jgNvVPI3zz3A8jWRH0LA',
    workflowUrl: 'https://github.com/fanan-uyun/Knowledge-Note-Cards/blob/main/docker/astronAgent/knowledge-cards.yml',
    features: [
      'Auto-parse raw note text',
      'AI restructuring and key extraction',
      'Generate structured knowledge cards',
      'Customizable card templates',
      'Export in multiple formats'
    ],
    icon: 'file-text',
    category: 'productivity'
  }
  ,
  {
    id: 'english-writing-practice',
    title: 'AI English Writing Practice Assistant',
    description: '"Practice-feedback" closed-loop system for students to improve English writing.',
    userCaseUrl: 'https://mp.weixin.qq.com/s/pGZ9rU4AoTztirzCCa0t9Q',
    workflowUrl: 'https://github.com/onlyliuxin97/english_writting_helper/blob/main/workflow/english_writting_helper.yml',
    features: [
      'Grade-based random prompts from essay knowledge base',
      'AI auto-scoring: grammar, vocabulary, structure, logic',
      'Instant feedback with error location & revision tips',
      'History log of all practices and comments',
      'One-click deploy: Flask web app + local Astron workflow'
    ],
    icon: 'pen-tool',
    category: 'education'
  }
];
