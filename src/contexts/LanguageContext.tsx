import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'zh-CN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.workflows': 'Workflows',
    'nav.about': 'About',
    'nav.contribute': 'Contribute',
    'language.toggle': '中文',
    'hero.title': 'Awesome Astron Workflows',
    'hero.subtitle': 'A curated collection of powerful AI-driven workflows for Astron. Discover, learn, and contribute to the growing ecosystem of automation solutions.',
    'hero.cta': 'Explore Workflows',
    'workflows.title': 'Featured Workflows',
    'workflows.subtitle': 'Discover our collection of production-ready Astron workflows that solve real-world problems with AI automation.',
    'workflows.keyFeatures': 'Key Features',
    'workflows.viewCase': 'View Case Study',
    'workflows.viewWorkflow': 'View Workflow',
    'workflows.workflowId': 'Workflow ID',
    'workflows.ctaTitle': 'Ready to Contribute?',
    'workflows.ctaDescription': 'Have an amazing Astron workflow? Share it with the community and help others automate their tasks.',
    'workflows.contribute': 'Start Contributing',
    'categories.ai': 'AI Tools',
    'categories.productivity': 'Productivity',
    'categories.content': 'Content Creation',
    
    // Workflows - Resume
    'workflow.resume.title': 'AI Resume Assistant',
    'workflow.resume.description': 'A smart resume optimization tool that helps job seekers create professional resumes with AI-driven suggestions and formatting.',
    'features.resume.1': 'Resume content analysis and optimization',
    'features.resume.2': 'AI-powered writing suggestions',
    'features.resume.3': 'Professional formatting templates',
    'features.resume.4': 'Industry-specific keyword recommendations',
    'features.resume.5': 'Multi-format export support',

    // Workflows - Translator
    'workflow.translator.title': 'AI Translator',
    'workflow.translator.description': 'An advanced translation tool that provides accurate, context-aware translations, supporting multiple languages and domains.',
    'features.translator.1': 'Multi-language translation support',
    'features.translator.2': 'Context-aware translation engine',
    'features.translator.3': 'Domain-specific translation modes',
    'features.translator.4': 'Batch translation capability',
    'features.translator.5': 'Translation quality evaluation',

    // Workflows - Content
    'workflow.content.title': 'Multi-Platform Content Writing',
    'workflow.content.description': 'A comprehensive content creation tool that generates platform-specific content optimized for different social media and publishing channels.',
    'features.content.1': 'Platform-specific content generation',
    'features.content.2': 'Multi-format content support',
    'features.content.3': 'SEO optimization',
    'features.content.4': 'Scheduling and publishing',
    'features.content.5': 'Analytics and performance tracking',

    // Workflows - Podcast
    'workflow.podcast.title': 'AI Podcast Generator',
    'workflow.podcast.description': 'An automated podcast creation tool that converts text into engaging audio experiences with natural speech synthesis and audio editing.',
    'features.podcast.1': 'Text-to-speech conversion',
    'features.podcast.2': 'Natural speech synthesis',
    'features.podcast.3': 'Audio editing and enhancement',
    'features.podcast.4': 'Multi-speaker support',
    'features.podcast.5': 'Podcast distribution integrations',

    // Workflows - Course
    'workflow.course.title': 'AI Course Generator',
    'workflow.course.description': 'An intelligent course creation platform that generates educational content, lesson plans, and learning materials based on specified topics and learning objectives.',
    'features.course.1': 'Automated course content generation',
    'features.course.2': 'Alignment with learning objectives',
    'features.course.3': 'Interactive content creation',
    'features.course.4': 'Assessment and quiz generation',
    'features.course.5': 'Progress tracking and analytics',

    // Workflows - Paper Recommender
    'workflow.paper.title': 'AI Paper Recommender',
    'workflow.paper.description': 'An AI-powered academic paper recommendation system that works like TikTok for research papers—users swipe through daily recommendations.',
    'features.paper.1': 'Personalized recommendations based on user profile',
    'features.paper.2': 'Daily batch of curated papers via ArXiv API',
    'features.paper.3': 'Preference learning with feedback loop',
    'features.paper.4': 'Summaries and recommendation rationale via LLM',
    'features.paper.5': 'Frontend swipe UI and backend service',

    // Workflows - Essay Assistant
    'workflow.essay.title': 'AI English Essay Assistant',
    'workflow.essay.description': 'An AI-powered English essay grading and feedback assistant that provides structured evaluation and improvement suggestions.',
    'features.essay.1': 'Structured evaluation covering organization and grammar',
    'features.essay.2': 'Grammar error detection with correction suggestions',
    'features.essay.3': 'Improved example sentences or revised paragraphs',
    'features.essay.4': 'Proficiency estimation (IELTS/CEFR)',
    'features.essay.5': 'Clear, organized output format',

    // Workflows - Novel Image-Text
    'workflow.novel.title': 'Novel Image-Text Generator',
    'workflow.novel.description': 'Enter a novel title and automatically generate a complete article with accompanying images.',
    'features.novel.1': 'One-input novel title to image-rich article',
    'features.novel.2': 'Prompt-based agent creation',
    'features.novel.3': 'Advanced config: web access / image gen',
    'features.novel.4': 'Visual block-based workflow authoring',
    'features.novel.5': 'Publishable to Agent Plaza',

    // Workflows - Knowledge Cards
    'workflow.cards.title': 'Knowledge Note Cards Organizer',
    'workflow.cards.description': 'An agent that turns scattered learning notes or work records into structured knowledge cards.',
    'features.cards.1': 'Auto-parse raw note text',
    'features.cards.2': 'AI restructuring and key-point extraction',
    'features.cards.3': 'Generate structured knowledge cards',
    'features.cards.4': 'Customizable card templates',
    'features.cards.5': 'Export in multiple formats',

    // Workflows - Writing Practice
    'workflow.writing.title': 'AI English Writing Practice Assistant',
    'workflow.writing.description': 'A practice-feedback closed-loop system for students to improve English writing with instant AI scoring.',
    'features.writing.1': 'Grade-based random prompts',
    'features.writing.2': 'AI auto-scoring: grammar, vocabulary, logic',
    'features.writing.3': 'Instant feedback with error location',
    'features.writing.4': 'History log of all practices',
    'features.writing.5': 'One-click deploy: Flask web app',
    'about.title': 'About Astron Workflows',
    'about.subtitle': 'Learn about the power and flexibility of Astron workflows and how they can transform your automation tasks.',
    'about.whatIs.title': 'What is Astron?',
    'about.whatIs.description': 'Astron is a powerful workflow automation platform that enables users to create sophisticated AI-driven workflows with ease. It combines the flexibility of YAML configuration with the power of modern AI tools.',
    'about.whatIs.description2': 'Our curated collection showcases the best practices and innovative solutions built by the community, making it easier for everyone to leverage AI automation in their daily tasks.',
    'about.whyUse.title': 'Why Use These Workflows?',
    'about.whyUse.point1': 'Save time with battle-tested automation solutions',
    'about.whyUse.point2': 'Learn from community-driven best practices',
    'about.whyUse.point3': 'Customize and extend workflows for your needs',
    'about.features.powerful.title': 'Powerful',
    'about.features.powerful.description': 'Leverage cutting-edge AI models and tools',
    'about.features.community.title': 'Community-Driven',
    'about.features.community.description': 'Built and maintained by the community',
    'about.features.documented.title': 'Well-Documented',
    'about.features.documented.description': 'Clear instructions and examples',
    'about.features.focused.title': 'Task-Focused',
    'about.features.focused.description': 'Designed for specific automation needs',
    'contribute.title': 'Contribute to the Community',
    'contribute.subtitle': 'Help us grow this collection by sharing your innovative Astron workflows and use cases.',
    'contribute.steps.fork.title': '1. Fork Repository',
    'contribute.steps.fork.description': 'Fork our GitHub repository to your account',
    'contribute.steps.add.title': '2. Add Your Workflow',
    'contribute.steps.add.description': 'Add your workflow YAML and documentation',
    'contribute.steps.document.title': '3. Document It',
    'contribute.steps.document.description': 'Write clear instructions and use cases',
    'contribute.steps.submit.title': '4. Submit PR',
    'contribute.steps.submit.description': 'Submit a pull request for review',
    'contribute.guidelines.title': 'What to Contribute',
    'contribute.guidelines.workflow.title': 'New Workflows',
    'contribute.guidelines.workflow.description': 'Share your unique automation solutions',
    'contribute.guidelines.improvement.title': 'Improvements',
    'contribute.guidelines.improvement.description': 'Enhance existing workflows with better logic',
    'contribute.guidelines.documentation.title': 'Documentation',
    'contribute.guidelines.documentation.description': 'Improve guides and add more examples',
    'contribute.requirements.title': 'Requirements',
    'contribute.requirements.tested.title': 'Tested',
    'contribute.requirements.tested.description': 'Ensure your workflow works correctly',
    'contribute.requirements.documented.title': 'Documented',
    'contribute.requirements.documented.description': 'Include clear instructions',
    'contribute.requirements.original.title': 'Original',
    'contribute.requirements.original.description': 'Contribute your own work',
    'contribute.cta.title': 'Ready to Share Your Workflow?',
    'contribute.cta.description': 'Join our community of contributors and help others discover the power of Astron workflows.',
    'contribute.cta.github': 'View on GitHub',
    'contribute.cta.issues': 'Open Issues',
    'footer.description': 'A curated collection of powerful AI-driven workflows for Astron automation platform.',
    'footer.quickLinks': 'Quick Links',
    'footer.resources': 'Resources',
    'footer.reportIssues': 'Report Issues',
    'footer.contribute': 'Contribute',
    'footer.madeWithLove': 'Made with ❤️ by the community',
    'footer.rightsReserved': 'All rights reserved.'
  },
  'zh-CN': {
    // Navigation
    'nav.home': '首页',
    'nav.workflows': '工作流',
    'nav.about': '关于',
    'nav.contribute': '贡献',
    'language.toggle': 'English',
    'hero.title': 'Awesome Astron 工作流',
    'hero.subtitle': '精选的强大 AI 驱动工作流集合，专为 Astron 设计。发现、学习并为不断发展的自动化解决方案生态系统做出贡献。',
    'hero.cta': '探索工作流',
    'workflows.title': '精选工作流',
    'workflows.subtitle': '发现我们的生产就绪 Astron 工作流集合，通过 AI 自动化解决现实世界的问题。',
    'workflows.keyFeatures': '核心功能',
    'workflows.viewCase': '查看案例',
    'workflows.viewWorkflow': '查看工作流',
    'workflows.workflowId': '工作流 ID',
    'workflows.ctaTitle': '准备好贡献了吗？',
    'workflows.ctaDescription': '有令人惊叹的 Astron 工作流？与社区分享，帮助他人自动化他们的任务。',
    'workflows.contribute': '开始贡献',
    'categories.ai': 'AI 工具',
    'categories.productivity': '生产力',
    'categories.content': '内容创作',

    // Workflows - Resume
    'workflow.resume.title': 'AI 简历助手',
    'workflow.resume.description': '一款智能简历优化工具，通过 AI 驱动的建议和格式化帮助求职者创建专业简历。',
    'features.resume.1': '简历内容分析与优化',
    'features.resume.2': 'AI 驱动的写作建议',
    'features.resume.3': '专业格式模板',
    'features.resume.4': '行业特定关键词推荐',
    'features.resume.5': '多格式导出支持',

    // Workflows - Translator
    'workflow.translator.title': 'AI 翻译官',
    'workflow.translator.description': '一款先进的翻译工具，提供准确、上下文感知的翻译，支持多种语言和领域。',
    'features.translator.1': '多语言翻译支持',
    'features.translator.2': '上下文感知翻译引擎',
    'features.translator.3': '领域特定翻译模式',
    'features.translator.4': '批量翻译能力',
    'features.translator.5': '翻译质量评估',

    // Workflows - Content
    'workflow.content.title': '多平台内容创作',
    'workflow.content.description': '一款综合内容创作工具，生成针对不同社交媒体和发布渠道优化的平台特定内容。',
    'features.content.1': '平台特定内容生成',
    'features.content.2': '多格式内容支持',
    'features.content.3': 'SEO 优化',
    'features.content.4': '调度与发布',
    'features.content.5': '分析与效果追踪',

    // Workflows - Podcast
    'workflow.podcast.title': 'AI 播客生成器',
    'workflow.podcast.description': '一款自动播客创建工具，通过自然语音合成和音频编辑将文本转换为引人入胜的音频体验。',
    'features.podcast.1': '文本转语音转换',
    'features.podcast.2': '自然语音合成',
    'features.podcast.3': '音频编辑与增强',
    'features.podcast.4': '多说话人支持',
    'features.podcast.5': '播客分发集成',

    // Workflows - Course
    'workflow.course.title': 'AI 课程生成器',
    'workflow.course.description': '一个智能课程创建平台，根据指定的主题和学习目标生成教育内容、教案和学习材料。',
    'features.course.1': '自动化课程内容生成',
    'features.course.2': '与学习目标对齐',
    'features.course.3': '互动内容创建',
    'features.course.4': '评估与测验生成',
    'features.course.5': '进度追踪与分析',

    // Workflows - Paper Recommender
    'workflow.paper.title': 'AI 论文推荐官',
    'workflow.paper.description': '一个 AI 驱动的学术论文推荐系统，就像科研论文界的抖音——用户刷每日推荐，点赞或收藏。',
    'features.paper.1': '基于用户画像的个性化推荐',
    'features.paper.2': '每日通过 ArXiv API 获取精选论文',
    'features.paper.3': '带反馈循环的偏好学习',
    'features.paper.4': '通过 LLM 提供摘要和推荐理由',
    'features.paper.5': '前端滑动 UI 和后端服务',

    // Workflows - Essay Assistant
    'workflow.essay.title': 'AI 英语作文助手',
    'workflow.essay.description': '一个 AI 驱动的英语作文评分和反馈助手，提供结构化评估、语法错误检测和改进建议。',
    'features.essay.1': '涵盖组织和语法的结构化评估',
    'features.essay.2': '带修正建议的语法错误检测',
    'features.essay.3': '改进的例句或修订段落',
    'features.essay.4': '能力预估 (雅思/CEFR)',
    'features.essay.5': '清晰、有条理的输出格式',

    // Workflows - Novel Image-Text
    'workflow.novel.title': '小说图文生成',
    'workflow.novel.description': '输入小说标题，自动生成带有配图的完整文章。',
    'features.novel.1': '单标题输入生成图文并茂文章',
    'features.novel.2': '基于 Prompt 的智能体创建',
    'features.novel.3': '高级配置：联网/绘图/代码工具',
    'features.novel.4': '可视化积木式工作流编排',
    'features.novel.5': '可发布到智能体广场复用',

    // Workflows - Knowledge Cards
    'workflow.cards.title': '知识卡片整理助手',
    'workflow.cards.description': '将零散的学习笔记或工作记录转化为结构化知识卡片的智能体。',
    'features.cards.1': '自动解析原始笔记文本',
    'features.cards.2': 'AI 重组和要点提取',
    'features.cards.3': '生成结构化知识卡片',
    'features.cards.4': '可自定义卡片模板',
    'features.cards.5': '支持多种格式导出',

    // Workflows - Writing Practice
    'workflow.writing.title': 'AI 英语写作练习助手',
    'workflow.writing.description': '针对学生的“练习-反馈”闭环系统，提供即时 AI 评分和改进建议。',
    'features.writing.1': '基于年级的范文库随机出题',
    'features.writing.2': 'AI 自动评分：语法、词汇、逻辑',
    'features.writing.3': '即时反馈，包含错误定位和建议',
    'features.writing.4': '所有练习和评语的历史记录',
    'features.writing.5': '一键部署：Flask Web 应用',
    'about.title': '关于 Astron 工作流',
    'about.subtitle': '了解 Astron 工作流的强大功能和灵活性，以及它们如何改变您的自动化任务。',
    'about.whatIs.title': '什么是 Astron？',
    'about.whatIs.description': 'Astron 是一个强大的工作流自动化平台，使用户能够轻松创建复杂的 AI 驱动工作流。它将 YAML 配置的灵活性与现代 AI 工具的强大功能相结合。',
    'about.whatIs.description2': '我们的精选集合展示了社区构建的最佳实践和创新解决方案，让每个人都能更轻松地在日常任务中利用 AI 自动化。',
    'about.whyUse.title': '为什么使用这些工作流？',
    'about.whyUse.point1': '通过经过实战测试的自动化解决方案节省时间',
    'about.whyUse.point2': '从社区驱动的最佳实践中学习',
    'about.whyUse.point3': '根据您的需求自定义和扩展工作流',
    'about.features.powerful.title': '强大',
    'about.features.powerful.description': '利用尖端的 AI 模型和工具',
    'about.features.community.title': '社区驱动',
    'about.features.community.description': '由社区构建和维护',
    'about.features.documented.title': '文档完善',
    'about.features.documented.description': '清晰的说明和示例',
    'about.features.focused.title': '任务导向',
    'about.features.focused.description': '专为特定自动化需求设计',
    'contribute.title': '为社区做贡献',
    'contribute.subtitle': '通过分享您创新的 Astron 工作流和用例，帮助我们发展这个集合。',
    'contribute.steps.fork.title': '1. Fork 仓库',
    'contribute.steps.fork.description': '将我们的 GitHub 仓库 fork 到您的账户',
    'contribute.steps.add.title': '2. 添加您的工作流',
    'contribute.steps.add.description': '添加您的工作流 YAML 和文档',
    'contribute.steps.document.title': '3. 编写文档',
    'contribute.steps.document.description': '编写清晰的说明和用例',
    'contribute.steps.submit.title': '4. 提交 PR',
    'contribute.steps.submit.description': '提交拉取请求以供审核',
    'contribute.guidelines.title': '贡献什么',
    'contribute.guidelines.workflow.title': '新工作流',
    'contribute.guidelines.workflow.description': '分享您独特的自动化解决方案',
    'contribute.guidelines.improvement.title': '改进',
    'contribute.guidelines.improvement.description': '通过更好的逻辑增强现有工作流',
    'contribute.guidelines.documentation.title': '文档',
    'contribute.guidelines.documentation.description': '改进指南并添加更多示例',
    'contribute.requirements.title': '要求',
    'contribute.requirements.tested.title': '已测试',
    'contribute.requirements.tested.description': '确保您的工作流正常工作',
    'contribute.requirements.documented.title': '已记录',
    'contribute.requirements.documented.description': '包含清晰的说明',
    'contribute.requirements.original.title': '原创',
    'contribute.requirements.original.description': '贡献您自己的作品',
    'contribute.cta.title': '准备好分享您的工作流了吗？',
    'contribute.cta.description': '加入我们的贡献者社区，帮助他人发现 Astron 工作流的力量。',
    'contribute.cta.github': '在 GitHub 上查看',
    'contribute.cta.issues': '打开问题',
    'footer.description': '专为 Astron 自动化平台设计的强大 AI 驱动工作流精选集合。',
    'footer.quickLinks': '快速链接',
    'footer.resources': '资源',
    'footer.reportIssues': '报告问题',
    'footer.contribute': '贡献',
    'footer.madeWithLove': '由社区用 ❤️ 制作',
    'footer.rightsReserved': '保留所有权利。'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};