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