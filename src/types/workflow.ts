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
    workflowUrl: 'https://github.com/itwanger/PaiAgent/commit/7a4cf59d3e5302ffecdb95717c937afb2befa51a#diff-0c1529cd9f3a6d94ca74f4a60d460410f92c9c28278a980dbb4ad513cfefc913',
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
  },
  {
    id: 'paper-recommender',
    title: 'workflow.paper.title',
    description: 'workflow.paper.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/vt3rN-P70IOJd5emdG2Gyw',
    workflowUrl: 'https://github.com/qwwzdyj/Xfind/blob/main/workflow/spark_workflow_config.yml',
    features: [
      'features.paper.1',
      'features.paper.2',
      'features.paper.3',
      'features.paper.4',
      'features.paper.5'
    ],
    icon: 'book-open',
    category: 'education'
  },
  {
    id: 'essay-assistant',
    title: 'workflow.essay.title',
    description: 'workflow.essay.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/crbtWlKrWG9g3A7qxg8rFg',
    workflowUrl: 'https://github.com/TangXinyue00/AI-English-Essay-Assistant/blob/main/docker/astronAgent/AI-English-Essay-Assistant.yml',
    features: [
      'features.essay.1',
      'features.essay.2',
      'features.essay.3',
      'features.essay.4',
      'features.essay.5'
    ],
    icon: 'edit-3',
    category: 'education'
  },
  {
    id: 'novel-image-generator',
    title: 'workflow.novel.title',
    description: 'workflow.novel.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/F4Uz30jw5Uo2WQSe-tO3xg',
    workflowUrl: 'https://github.com/XiongFeng1997/AI-Novel-Generation/blob/main/docker/astronAgent/%E5%B0%8F%E8%AF%B4%E5%9B%BE%E6%96%87%E7%94%9F%E6%88%90.yml',
    features: [
      'features.novel.1',
      'features.novel.2',
      'features.novel.3',
      'features.novel.4',
      'features.novel.5'
    ],
    icon: 'image',
    category: 'content'
  },
  {
    id: 'knowledge-cards',
    title: 'workflow.cards.title',
    description: 'workflow.cards.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/b0jgNvVPI3zz3A8jWRH0LA',
    workflowUrl: 'https://github.com/fanan-uyun/Knowledge-Note-Cards/blob/main/docker/astronAgent/knowledge-cards.yml',
    features: [
      'features.cards.1',
      'features.cards.2',
      'features.cards.3',
      'features.cards.4',
      'features.cards.5'
    ],
    icon: 'layers',
    category: 'productivity'
  },
  {
    id: 'english-writing-practice',
    title: 'workflow.writing.title',
    description: 'workflow.writing.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/pGZ9rU4AoTztirzCCa0t9Q',
    workflowUrl: 'https://github.com/onlyliuxin97/english_writting_helper/blob/main/workflow/english_writting_helper.yml',
    features: [
      'features.writing.1',
      'features.writing.2',
      'features.writing.3',
      'features.writing.4',
      'features.writing.5'
    ],
    icon: 'pen-tool',
    category: 'education'
  },
  {
    id: 'travel-companion',
    title: 'workflow.travel.title',
    description: 'workflow.travel.description',
    userCaseUrl: '',
    workflowUrl: 'https://github.com/niaonao/astron_resource/blob/main/resources/papers/%E6%97%85%E8%A1%8C%E6%90%AD%E5%AD%90.yml',
    features: [
      'features.travel.1',
      'features.travel.2',
      'features.travel.3',
      'features.travel.4'
    ],
    icon: 'map',
    category: 'ai'
  },
  {
    id: 'wechat-summary',
    title: 'workflow.wechat.title',
    description: 'workflow.wechat.description',
    userCaseUrl: '',
    workflowUrl: 'https://github.com/user-attachments/files/24495795/default.yml',
    features: [
      'features.wechat.1',
      'features.wechat.2',
      'features.wechat.3',
      'features.wechat.4'
    ],
    icon: 'file-text',
    category: 'content'
  },
  {
    id: 'resume-optimizer',
    title: 'workflow.resume_opt.title',
    description: 'workflow.resume_opt.description',
    userCaseUrl: '',
    workflowUrl: 'https://github.com/user-attachments/files/24494434/default.yml',
    features: [
      'features.resume_opt.1',
      'features.resume_opt.2',
      'features.resume_opt.3',
      'features.resume_opt.4'
    ],
    icon: 'briefcase',
    category: 'productivity'
  }
];
