export interface Workflow {
  id: string;
  title: string;
  description: string;
  userCaseUrl: string;
  workflowUrl: string;
  features: string[];
  icon: string;
  category: string;
  event?: string;
  award?: string;
}

export const workflows: Workflow[] = [
  {
    id: 'ai-resume-assistant',
    title: 'workflow.ai_resume_assistant.title',
    description: 'workflow.ai_resume_assistant.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/t18r62JYsx8P_1jV_5f1Mg',
    workflowUrl: 'https://github.com/justacoder99/AI-Resume-Assistant/blob/main/docker/astronAgent/AI-Resume-Assistant.yml',
    features: [
      'features.ai_resume_assistant.1',
      'features.ai_resume_assistant.2',
      'features.ai_resume_assistant.3',
      'features.ai_resume_assistant.4',
      'features.ai_resume_assistant.5'
    ],
    icon: 'box',
    category: 'productivity'
  },
  {
    id: 'ai-translator',
    title: 'workflow.ai_translator.title',
    description: 'workflow.ai_translator.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/ge52PHt_TQIkCcRl1m3B3w',
    workflowUrl: 'https://github.com/aying20/aitranslator/blob/main/workflow/aitranslator.yml',
    features: [
      'features.ai_translator.1',
      'features.ai_translator.2',
      'features.ai_translator.3',
      'features.ai_translator.4',
      'features.ai_translator.5'
    ],
    icon: 'box',
    category: 'productivity'
  },
  {
    id: 'multi-platform-content-writing',
    title: 'workflow.multi_platform_content_writing.title',
    description: 'workflow.multi_platform_content_writing.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/fVZJYtXTiPKMku_1ycOBpg',
    workflowUrl: 'https://github.com/binggandata/ai_resource/blob/main/%E5%A4%9A%E5%B9%B3%E5%8F%B0%E5%86%85%E5%AE%B9%E5%86%99%E4%BD%9C.yml',
    features: [
      'features.multi_platform_content_writing.1',
      'features.multi_platform_content_writing.2',
      'features.multi_platform_content_writing.3',
      'features.multi_platform_content_writing.4',
      'features.multi_platform_content_writing.5'
    ],
    icon: 'box',
    category: 'creative'
  },
  {
    id: 'ai-podcast-generator',
    title: 'workflow.ai_podcast_generator.title',
    description: 'workflow.ai_podcast_generator.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/QKp2nTKGl0m8JTytc-0ibA',
    workflowUrl: 'https://github.com/itwanger/PaiAgent/commit/7a4cf59d3e5302ffecdb95717c937afb2befa51a#diff-0c1529cd9f3a6d94ca74f4a60d460410f92c9c28278a980dbb4ad513cfefc913',
    features: [
      'features.ai_podcast_generator.1',
      'features.ai_podcast_generator.2',
      'features.ai_podcast_generator.3',
      'features.ai_podcast_generator.4',
      'features.ai_podcast_generator.5'
    ],
    icon: 'box',
    category: 'creative'
  },
  {
    id: 'ai-course-generator',
    title: 'workflow.ai_course_generator.title',
    description: 'workflow.ai_course_generator.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/QHcwsQB29m_dDzkchIUvdQ',
    workflowUrl: 'https://github.com/GitHubDaily/AI-Course-Generator/tree/main/workflow',
    features: [
      'features.ai_course_generator.1',
      'features.ai_course_generator.2',
      'features.ai_course_generator.3',
      'features.ai_course_generator.4',
      'features.ai_course_generator.5'
    ],
    icon: 'box',
    category: 'learning'
  },
  {
    id: 'ai-paper-recommender',
    title: 'workflow.ai_paper_recommender.title',
    description: 'workflow.ai_paper_recommender.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/vt3rN-P70IOJd5emdG2Gyw',
    workflowUrl: 'https://github.com/qwwzdyj/Xfind/blob/main/workflow/spark_workflow_config.yml',
    features: [
      'features.ai_paper_recommender.1',
      'features.ai_paper_recommender.2',
      'features.ai_paper_recommender.3',
      'features.ai_paper_recommender.4',
      'features.ai_paper_recommender.5'
    ],
    icon: 'box',
    category: 'learning'
  },
  {
    id: 'ai-english-essay-assistant',
    title: 'workflow.ai_english_essay_assistant.title',
    description: 'workflow.ai_english_essay_assistant.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/crbtWlKrWG9g3A7qxg8rFg',
    workflowUrl: 'https://github.com/TangXinyue00/AI-English-Essay-Assistant/blob/main/docker/astronAgent/AI-English-Essay-Assistant.yml',
    features: [
      'features.ai_english_essay_assistant.1',
      'features.ai_english_essay_assistant.2',
      'features.ai_english_essay_assistant.3',
      'features.ai_english_essay_assistant.4',
      'features.ai_english_essay_assistant.5'
    ],
    icon: 'box',
    category: 'learning'
  },
  {
    id: 'novel-image-text-generator',
    title: 'workflow.novel_image_text_generator.title',
    description: 'workflow.novel_image_text_generator.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/F4Uz30jw5Uo2WQSe-tO3xg',
    workflowUrl: 'https://github.com/XiongFeng1997/AI-Novel-Generation/blob/main/docker/astronAgent/%E5%B0%8F%E8%AF%B4%E5%9B%BE%E6%96%87%E7%94%9F%E6%88%90.yml',
    features: [
      'features.novel_image_text_generator.1',
      'features.novel_image_text_generator.2',
      'features.novel_image_text_generator.3',
      'features.novel_image_text_generator.4',
      'features.novel_image_text_generator.5'
    ],
    icon: 'box',
    category: 'creative'
  },
  {
    id: 'knowledge-note-cards-organizer',
    title: 'workflow.knowledge_note_cards_organizer.title',
    description: 'workflow.knowledge_note_cards_organizer.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/b0jgNvVPI3zz3A8jWRH0LA',
    workflowUrl: 'https://github.com/fanan-uyun/Knowledge-Note-Cards/blob/main/docker/astronAgent/knowledge-cards.yml',
    features: [
      'features.knowledge_note_cards_organizer.1',
      'features.knowledge_note_cards_organizer.2',
      'features.knowledge_note_cards_organizer.3',
      'features.knowledge_note_cards_organizer.4',
      'features.knowledge_note_cards_organizer.5'
    ],
    icon: 'box',
    category: 'productivity'
  },
  {
    id: 'ai-english-writing-practice-assistant',
    title: 'workflow.ai_english_writing_practice_assistant.title',
    description: 'workflow.ai_english_writing_practice_assistant.description',
    userCaseUrl: 'https://mp.weixin.qq.com/s/pGZ9rU4AoTztirzCCa0t9Q',
    workflowUrl: 'https://github.com/onlyliuxin97/english_writting_helper/blob/main/workflow/english_writting_helper.yml',
    features: [
      'features.ai_english_writing_practice_assistant.1',
      'features.ai_english_writing_practice_assistant.2',
      'features.ai_english_writing_practice_assistant.3',
      'features.ai_english_writing_practice_assistant.4',
      'features.ai_english_writing_practice_assistant.5'
    ],
    icon: 'box',
    category: 'learning'
  },
  {
    id: 'travel-companion',
    title: 'workflow.travel_companion.title',
    description: 'workflow.travel_companion.description',
    userCaseUrl: 'https://blog.csdn.net/niaonao/article/details/156937747',
    workflowUrl: 'https://github.com/niaonao/astron_resource/blob/main/resources/papers/%E6%97%85%E8%A1%8C%E6%90%AD%E5%AD%90.yml',
    features: [
      'features.travel_companion.1',
      'features.travel_companion.2',
      'features.travel_companion.3',
      'features.travel_companion.4'
    ],
    icon: 'box',
    category: 'entertainment'
  },
  {
    id: 'wechat-article-summary',
    title: 'workflow.wechat_article_summary.title',
    description: 'workflow.wechat_article_summary.description',
    userCaseUrl: '',
    workflowUrl: 'https://github.com/user-attachments/files/24495795/default.yml',
    features: [
      'features.wechat_article_summary.1',
      'features.wechat_article_summary.2',
      'features.wechat_article_summary.3',
      'features.wechat_article_summary.4'
    ],
    icon: 'box',
    category: 'productivity'
  },
  {
    id: 'smart-resume-optimizer',
    title: 'workflow.smart_resume_optimizer.title',
    description: 'workflow.smart_resume_optimizer.description',
    userCaseUrl: 'https://github.com/iflytek/astron-agent/discussions/824',
    workflowUrl: 'https://github.com/user-attachments/files/24494434/default.yml',
    features: [
      'features.smart_resume_optimizer.1',
      'features.smart_resume_optimizer.2',
      'features.smart_resume_optimizer.3',
      'features.smart_resume_optimizer.4'
    ],
    icon: 'box',
    category: 'productivity'
  },
  {
    id: 'poetic-image-generator',
    title: 'workflow.poetic_image_generator.title',
    description: 'workflow.poetic_image_generator.description',
    userCaseUrl: '',
    workflowUrl: 'https://github.com/user-attachments/files/24551622/default.yml',
    features: [
      'features.poetic_image_generator.1',
      'features.poetic_image_generator.2',
      'features.poetic_image_generator.3',
      'features.poetic_image_generator.4'
    ],
    icon: 'box',
    category: 'creative'
  },
  {
    id: 'history-knowledge-qa-assistant',
    title: 'workflow.history_knowledge_qa_assistant.title',
    description: 'workflow.history_knowledge_qa_assistant.description',
    userCaseUrl: '',
    workflowUrl: 'https://github.com/user-attachments/files/24560902/2.yml',
    features: [
      'features.history_knowledge_qa_assistant.1',
      'features.history_knowledge_qa_assistant.2',
      'features.history_knowledge_qa_assistant.3',
      'features.history_knowledge_qa_assistant.4'
    ],
    icon: 'box',
    category: 'learning'
  },
  {
    id: 'ai-radio-podcast-generator',
    title: 'workflow.ai_radio_podcast_generator.title',
    description: 'workflow.ai_radio_podcast_generator.description',
    userCaseUrl: '',
    workflowUrl: 'https://github.com/user-attachments/files/24562655/AI.yml',
    features: [
      'features.ai_radio_podcast_generator.1',
      'features.ai_radio_podcast_generator.2',
      'features.ai_radio_podcast_generator.3',
      'features.ai_radio_podcast_generator.4'
    ],
    icon: 'box',
    category: 'creative'
  },
  {
    id: 'drama-shortage-terminator',
    title: 'workflow.drama_shortage_terminator.title',
    description: 'workflow.drama_shortage_terminator.description',
    userCaseUrl: '',
    workflowUrl: 'https://github.com/user-attachments/files/24631399/Pro.yml',
    features: [
      'features.drama_shortage_terminator.1',
      'features.drama_shortage_terminator.2',
      'features.drama_shortage_terminator.3',
      'features.drama_shortage_terminator.4'
    ],
    icon: 'box',
    category: 'entertainment'
  },
  {
    id: 'dog-nutritionist',
    title: 'workflow.dog_nutritionist.title',
    description: 'workflow.dog_nutritionist.description',
    userCaseUrl: '',
    workflowUrl: 'https://github.com/user-attachments/files/24577568/default.yml',
    features: [
      'features.dog_nutritionist.1',
      'features.dog_nutritionist.2',
      'features.dog_nutritionist.3',
      'features.dog_nutritionist.4'
    ],
    icon: 'box',
    category: 'health'
  },
  {
    id: 'network-novel-finder',
    title: 'workflow.network_novel_finder.title',
    description: 'workflow.network_novel_finder.description',
    userCaseUrl: '',
    workflowUrl: 'https://github.com/user-attachments/files/24615934/default.yml',
    features: [
      'features.network_novel_finder.1',
      'features.network_novel_finder.2',
      'features.network_novel_finder.3',
      'features.network_novel_finder.4'
    ],
    icon: 'box',
    category: 'entertainment'
  },
  {
    id: 'ket-essay-assistant',
    title: 'workflow.ket_essay_assistant.title',
    description: 'workflow.ket_essay_assistant.description',
    userCaseUrl: '',
    workflowUrl: 'https://github.com/user-attachments/files/24612874/20260107220916.yml',
    features: [
      'features.ket_essay_assistant.1',
      'features.ket_essay_assistant.2',
      'features.ket_essay_assistant.3',
      'features.ket_essay_assistant.4'
    ],
    icon: 'box',
    category: 'learning'
  },
  {
    id: 'bks-ai',
    title: 'workflow.bks_ai.title',
    description: 'workflow.bks_ai.description',
    userCaseUrl: 'https://www.youtube.com/watch?v=weO_qGSQFI4&list=PLpSUIRpjMINCELDvnnHdVmPKEINljeluw&index=7&t=1s&pp=gAQBiAQBsAgC',
    workflowUrl: 'https://github.com/CoderWanFeng/AwesomeAstronAgent/blob/main/bks-AI.yml',
    features: [
      'features.bks_ai.1',
      'features.bks_ai.2',
      'features.bks_ai.3',
      'features.bks_ai.4'
    ],
    icon: 'box',
    category: 'productivity'
  },
  {
    id: 'docs-workflow',
    title: 'workflow.docs_workflow.title',
    description: 'workflow.docs_workflow.description',
    userCaseUrl: 'https://www.youtube.com/watch?v=n0gzapUwI3o',
    workflowUrl: 'https://github.com/beaucarnes/astronagent/blob/main/Docs%20Workfow.yml',
    features: [
      'features.docs_workflow.1',
      'features.docs_workflow.2',
      'features.docs_workflow.3',
      'features.docs_workflow.4'
    ],
    icon: 'box',
    category: 'productivity'
  },
  {
    id: 'astron-stock-analyzer',
    title: 'workflow.astron_stock_analyzer.title',
    description: 'workflow.astron_stock_analyzer.description',
    userCaseUrl: 'https://www.youtube.com/watch?v=F4BY49pp2Rs&list=PLpSUIRpjMINCELDvnnHdVmPKEINljeluw&index=25&pp=iAQBsAgC',
    workflowUrl: 'https://github.com/DungLai/Astron-AI-Agent-StockAnalyzer',
    features: [
      'features.astron_stock_analyzer.1',
      'features.astron_stock_analyzer.2',
      'features.astron_stock_analyzer.3',
      'features.astron_stock_analyzer.4'
    ],
    icon: 'box',
    category: 'finance'
  },
  {
    id: 'ai-research-assistant',
    title: 'workflow.ai_research_assistant.title',
    description: 'workflow.ai_research_assistant.description',
    userCaseUrl: 'https://www.youtube.com/watch?v=UUMhR0MkCOc&list=PLpSUIRpjMINCELDvnnHdVmPKEINljeluw&index=26&t=944s&pp=iAQBsAgC',
    workflowUrl: 'https://github.com/moladata/ai-research-assistant',
    features: [
      'features.ai_research_assistant.1',
      'features.ai_research_assistant.2',
      'features.ai_research_assistant.3',
      'features.ai_research_assistant.4'
    ],
    icon: 'box',
    category: 'productivity'
  }
];
