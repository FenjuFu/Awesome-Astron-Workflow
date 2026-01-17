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
    'nav.community': 'Community Vibe Vault',
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
    'categories.all': 'All Categories',
    'categories.productivity': 'Office Productivity',
    'categories.creative': 'Creative Writing',
    'categories.learning': 'Learning Assistant',
    'categories.coding': 'Coding & Programming',
    'categories.entertainment': 'Leisure & Entertainment',
    'categories.health': 'Health Partner',

    // Workflows - AI Resume Assistant
    'workflow.resume.title': 'AI Resume Assistant',
    'workflow.resume.description': 'A smart resume optimization tool that helps job seekers create professional resumes with AI-driven suggestions and formatting.',
    'features.resume.1': 'Resume content analysis and optimization',
    'features.resume.2': 'AI-powered writing suggestions',
    'features.resume.3': 'Professional formatting templates',
    'features.resume.4': 'Industry-specific keyword recommendations',
    'features.resume.5': 'Multi-format export support',

    // Workflows - AI Translator
    'workflow.translator.title': 'AI Translator',
    'workflow.translator.description': 'An advanced translation tool that provides accurate, context-aware translations, supporting multiple languages and domains.',
    'features.translator.1': 'Multi-language translation support',
    'features.translator.2': 'Context-aware translation engine',
    'features.translator.3': 'Domain-specific translation modes',
    'features.translator.4': 'Batch translation capability',
    'features.translator.5': 'Translation quality evaluation',

    // Workflows - Multi-Platform Content Writing
    'workflow.content.title': 'Multi-Platform Content Writing',
    'workflow.content.description': 'A comprehensive content creation tool that generates platform-specific content optimized for different social media and publishing channels.',
    'features.content.1': 'Platform-specific content generation',
    'features.content.2': 'Multi-format content support',
    'features.content.3': 'SEO optimization',
    'features.content.4': 'Scheduling and publishing',
    'features.content.5': 'Analytics and performance tracking',

    // Workflows - AI Podcast Generator
    'workflow.podcast.title': 'AI Podcast Generator',
    'workflow.podcast.description': 'An automated podcast creation tool that converts text into engaging audio experiences with natural speech synthesis and audio editing.',
    'features.podcast.1': 'Text-to-speech conversion',
    'features.podcast.2': 'Natural speech synthesis',
    'features.podcast.3': 'Audio editing and enhancement',
    'features.podcast.4': 'Multi-speaker support',
    'features.podcast.5': 'Podcast distribution integrations',

    // Workflows - AI Course Generator
    'workflow.course.title': 'AI Course Generator',
    'workflow.course.description': 'An intelligent course creation platform that generates educational content, lesson plans, and learning materials based on specified topics and learning objectives.',
    'features.course.1': 'Automated course content generation',
    'features.course.2': 'Alignment with learning objectives',
    'features.course.3': 'Interactive content creation',
    'features.course.4': 'Assessment and quiz generation',
    'features.course.5': 'Progress tracking and analytics',

    // Workflows - AI Paper Recommender
    'workflow.paper.title': 'AI Paper Recommender',
    'workflow.paper.description': 'An AI-powered academic paper recommendation system that works like TikTok for research papers—users swipe through daily recommendations, like or save papers, and the agent learns preferences to improve suggestions.',
    'features.paper.1': 'Personalized recommendations based on user profile and interaction history',
    'features.paper.2': 'Daily batch of curated papers fetched via ArXiv API',
    'features.paper.3': 'Preference learning with feedback loop (like / save / skip)',
    'features.paper.4': 'Summaries and recommendation rationale via LLM',
    'features.paper.5': 'Frontend swipe UI and backend service integrating Astron Agent',

    // Workflows - AI English Essay Assistant
    'workflow.essay.title': 'AI English Essay Assistant',
    'workflow.essay.description': 'An AI-powered English essay grading and feedback assistant. Users submit their essay content, and the agent provides structured evaluation, points out grammar and expression issues, suggests improvements, offers example sentences/paragraphs, and estimates the essay level using IELTS or CEFR standards.',
    'features.essay.1': 'Structured evaluation covering organization, grammar, vocabulary, and logic',
    'features.essay.2': 'Grammar error detection with specific correction suggestions',
    'features.essay.3': 'Improved example sentences or revised paragraphs',
    'features.essay.4': 'Proficiency estimation under IELTS or CEFR standards',
    'features.essay.5': 'Clear, organized output format tailored for student feedback',

    // Workflows - Novel Image-Text Generator
    'workflow.novel_gen.title': 'Novel Image-Text Generator',
    'workflow.novel_gen.description': 'Enter a novel title and automatically generate a complete article with accompanying images. Built with Astron’s block-style workflow composition, you can create an agent in one click, enable web access, image generation, and code capabilities in advanced settings, and publish to the Agent Plaza for reuse.',
    'features.novel_gen.1': 'One-input novel title → full image-rich article',
    'features.novel_gen.2': 'Prompt-based agent creation with auto-completion',
    'features.novel_gen.3': 'Advanced config: web access / image gen / code tools',
    'features.novel_gen.4': 'Visual block-based workflow authoring',
    'features.novel_gen.5': 'Publishable to Agent Plaza for convenient reuse',

    // Workflows - Knowledge Note Cards Organizer
    'workflow.cards.title': 'Knowledge Note Cards Organizer',
    'workflow.cards.description': 'An agent that turns scattered learning notes or work records into structured knowledge cards. Users simply input raw notes, and the agent automatically parses, refines key points, and generates readable knowledge cards for easy review and recall.',
    'features.cards.1': 'Auto-parse raw note text',
    'features.cards.2': 'AI restructuring and key-point extraction',
    'features.cards.3': 'Generate structured knowledge cards',
    'features.cards.4': 'Customizable card templates',
    'features.cards.5': 'Export in multiple formats',

    // Workflows - AI English Writing Practice Assistant
    'workflow.writing.title': 'AI English Writing Practice Assistant',
    'workflow.writing.description': 'An "practice-feedback" closed-loop system for middle-school students to improve English writing. Parents/teachers generate prompts in one click; students write online; AI instantly scores and gives improvement tips, while auto-saving history to help kids progress steadily.',
    'features.writing.1': 'Grade-based random prompts from model essay knowledge base',
    'features.writing.2': 'AI auto-scoring: grammar, vocabulary, structure, logic',
    'features.writing.3': 'Instant feedback: error location + revision advice + high-score examples',
    'features.writing.4': 'History log: all practices & comments saved for review',
    'features.writing.5': 'One-click deploy: Flask web app + local Astron workflow',

    // Workflows - Travel Companion
    'workflow.travel.title': 'Travel Companion',
    'workflow.travel.description': 'An intelligent travel planning assistant that helps users design personalized travel routes, book accommodations, and provides real-time travel advice based on user preferences and budget.',
    'features.travel.1': 'Personalized travel route planning',
    'features.travel.2': 'Accommodation and transportation booking assistance',
    'features.travel.3': 'Real-time travel advice and emergency support',
    'features.travel.4': 'Integration with maps and weather services',

    // Workflows - WeChat Article Summary
    'workflow.wechat.title': 'WeChat Article Summary',
    'workflow.wechat.description': 'A content summarization tool that extracts and condenses articles from WeChat Official Accounts into concise summaries using the DeepSeek model.',
    'features.wechat.1': 'Extract content from URLs',
    'features.wechat.2': 'AI-powered summarization (DeepSeek-V3.2)',
    'features.wechat.3': 'Concise output (~350 words)',
    'features.wechat.4': 'Markdown format support',

    // Workflows - Smart Resume Optimizer
    'workflow.resume_opt.title': 'Smart Resume Optimizer',
    'workflow.resume_opt.description': 'An advanced resume analysis and job search assistance system supporting PDF resume OCR parsing, intelligent assessment, and job recommendations.',
    'features.resume_opt.1': 'PDF resume OCR parsing',
    'features.resume_opt.2': 'Multi-turn interaction for information completion',
    'features.resume_opt.3': 'Intelligent resume assessment and job recommendations',
    'features.resume_opt.4': 'Orchestration of multiple large models',

    // Workflows - Poetic Image Generator
    'workflow.poetic.title': 'Poetic Image Generator',
    'workflow.poetic.description': 'Transforms poetic verses or keywords into visual art by analyzing literary imagery and generating optimized prompts for AI image generation models.',
    'features.poetic.1': 'Deep analysis of literary artistic conception',
    'features.poetic.2': 'Generation of optimized visual descriptions',
    'features.poetic.3': 'Integration with Keling AI painting model',
    'features.poetic.4': 'From text to visual art realization',

    // Workflows - History Knowledge QA Assistant
    'workflow.history.title': 'History Knowledge QA Assistant',
    'workflow.history.description': 'The "History Knowledge QA" agent is your private history consultant, specializing in global historical events, cultural evolution, and important figures. Whether you are interested in the mysteries of ancient civilizations or turning points in modern history, it can provide accurate information and answer every question you have.',
    'features.history.1': 'Real-time online search for information',
    'features.history.2': 'Text compliance detection to ensure safety',
    'features.history.3': 'Professional historical role-playing',
    'features.history.4': 'Precise history knowledge Q&A',

    // Workflows - AI Radio Podcast Generator
    'workflow.radio.title': 'AI Radio Podcast Generator',
    'workflow.radio.description': 'An intelligent assistant that converts text or WeChat Official Account article links into lively and interesting radio podcast content, supporting speech synthesis and cover generation.',
    'features.radio.1': 'Parse URL content (supports WeChat Official Accounts, etc.)',
    'features.radio.2': 'Generate podcast-style scripts',
    'features.radio.3': 'Ultra-realistic speech synthesis',
    'features.radio.4': 'AI text-to-image cover generation',

    // Workflows - Drama Shortage Terminator
    'workflow.drama.title': 'Drama Shortage Terminator',
    'workflow.drama.description': 'Your personal film industry guardian and movie expert. Specialized in identifying movies from images, providing professional recommendations, and ensuring high-quality viewing experiences by filtering out bad movies.',
    'features.drama.1': 'Search movies by image (Image Understanding)',
    'features.drama.2': 'Professional movie recommendations & reviews',
    'features.drama.3': 'Real-time web search for movie info',
    'features.drama.4': 'Compliance and safety filtering',

    // Workflows - Dog Nutritionist
    'workflow.dog.title': 'Dog Nutritionist',
    'workflow.dog.description': 'A professional nutrition consultant for your dogs. Provides customized dietary plans based on age, weight, and specific needs, backed by real-time nutritional knowledge search.',
    'features.dog.1': 'Customized nutrition plans (Age/Weight/etc.)',
    'features.dog.2': 'Professional dietary advice via LLM',
    'features.dog.3': 'Web search for nutritional knowledge',
    'features.dog.4': 'Visual aids with Text-to-Image generation',

    // Workflows - Network Novel Finder
    'workflow.novel.title': 'Network Novel Finder',
    'workflow.novel.description': 'Find the latest online novels by entering the type of novel you want to find, and provide a brief introduction.',
    'features.novel.1': 'Extract novel type from user input',
    'features.novel.2': 'Aggregate search for latest novels',
    'features.novel.3': 'LLM-based recommendation and intro',
    'features.novel.4': 'Personalized reading suggestions',

    // Workflows - KET Essay Assistant
    'workflow.ket.title': 'KET Essay Assistant',
    'workflow.ket.description': 'A specialized assistant for KET exam essay writing. It analyzes requirements, generates outlines, writes drafts, polishes language, and checks word count compliance.',
    'features.ket.1': 'Essay requirement analysis',
    'features.ket.2': 'Structured outline generation',
    'features.ket.3': 'Draft writing & language polishing',
    'features.ket.4': 'Word count compliance check',

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
    'community.title': 'Astron Community Vibe Vault',
    'community.subtitle': 'Explore the fun side of our community with memes and music!',
    'community.memes': 'Community Memes',
    'community.music': 'Vibe Music',
    'community.swag': 'Astron Swag',
    'swag.redPackets': 'Astron Horse Year Red Envelope / Hóngbāo',
    'swag.download': 'Download',
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
    'nav.community': '社区氛围宝库',
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
    'categories.all': '全部类别',
    'categories.productivity': '办公提效',
    'categories.creative': '创意写作',
    'categories.learning': '学习助手',
    'categories.coding': '代码编程',
    'categories.entertainment': '休闲娱乐',
    'categories.health': '健康搭档',

    // Workflows - AI 简历助手
    'workflow.resume.title': 'AI 简历助手',
    'workflow.resume.description': '智能简历优化工具，帮助求职者通过 AI 驱动的建议和格式化创建专业简历。',
    'features.resume.1': '简历内容分析和优化',
    'features.resume.2': 'AI 驱动的写作建议',
    'features.resume.3': '专业格式模板',
    'features.resume.4': '行业特定关键词推荐',
    'features.resume.5': '多格式导出支持',

    // Workflows - AI 翻译器
    'workflow.translator.title': 'AI 翻译器',
    'workflow.translator.description': '高级翻译工具，提供准确的、上下文感知的翻译，支持多种语言和专业领域。',
    'features.translator.1': '多语言翻译支持',
    'features.translator.2': '上下文感知翻译引擎',
    'features.translator.3': '领域特定翻译模式',
    'features.translator.4': '批量翻译功能',
    'features.translator.5': '翻译质量评估',

    // Workflows - 多平台内容写作
    'workflow.content.title': '多平台内容写作',
    'workflow.content.description': '综合内容创作工具，生成针对不同社交媒体和发布平台优化的平台特定内容。',
    'features.content.1': '平台特定内容生成',
    'features.content.2': '多格式内容支持',
    'features.content.3': 'SEO 优化',
    'features.content.4': '内容调度和发布',
    'features.content.5': '分析和性能跟踪',

    // Workflows - AI 播客生成器
    'workflow.podcast.title': 'AI 播客生成器',
    'workflow.podcast.description': '自动化播客创作工具，通过自然语音合成和音频编辑将文本内容转换为引人入胜的音频体验。',
    'features.podcast.1': '文本到语音转换',
    'features.podcast.2': '自然语音合成',
    'features.podcast.3': '音频编辑和增强',
    'features.podcast.4': '多说话人支持',
    'features.podcast.5': '播客分发集成',

    // Workflows - AI 课程生成器
    'workflow.course.title': 'AI 课程生成器',
    'workflow.course.description': '智能课程创建平台，根据指定主题和学习目标生成教育内容、课程计划和学习材料。',
    'features.course.1': '自动化课程内容生成',
    'features.course.2': '学习目标对齐',
    'features.course.3': '交互式内容创建',
    'features.course.4': '评估和测验生成',
    'features.course.5': '进度跟踪和分析',

    // Workflows - 论文推荐系统
    'workflow.paper.title': '论文推荐系统',
    'workflow.paper.description': '一个像刷短视频一样刷论文的 AI 学术论文推荐系统。用户每天收到推荐论文卡片，通过点赞、收藏或跳过的交互，Agent 学习偏好并持续优化推荐效果。',
    'features.paper.1': '基于用户画像与历史交互的个性化推荐',
    'features.paper.2': '通过 ArXiv API 拉取最新论文，按天批量推送',
    'features.paper.3': '点赞 / 收藏 / 跳过反馈闭环，持续学习偏好',
    'features.paper.4': 'LLM 生成摘要与推荐理由，提升可读性',
    'features.paper.5': '前端滑动式交互、后端服务与 Astron Agent 集成',

    // Workflows - 英语作文批改助手
    'workflow.essay.title': '英语作文批改助手',
    'workflow.essay.description': '一个 AI 驱动的英语作文批改与反馈助手。用户提交作文内容后，Agent 将提供结构化评价，指出语法与表达问题，给出修改建议与示例句/段，并按雅思或 CEFR 标准估计作文等级。',
    'features.essay.1': '覆盖组织结构、语法、词汇、逻辑的综合评价',
    'features.essay.2': '精准定位语法错误并给出具体修改建议',
    'features.essay.3': '提供更优的例句或修订段落示例',
    'features.essay.4': '按雅思或 CEFR 标准进行水平估计',
    'features.essay.5': '输出格式清晰、适合学生阅读与改进',

    // Workflows - 小说图文生成器
    'workflow.novel_gen.title': '小说图文生成器',
    'workflow.novel_gen.description': '输入小说名称即可自动生成一篇完整的带配图小说文章。基于 Astron 工作流的「搭积木」式编排，一键创建智能体并可在高阶配置中开启联网、生图、代码等能力，完成后可发布到智能体广场。',
    'features.novel_gen.1': '输入小说名自动生成图文文章',
    'features.novel_gen.2': '提示词创建智能体并自动完善配置',
    'features.novel_gen.3': '高阶配置支持联网/生图/代码能力',
    'features.novel_gen.4': '工作流「搭积木」式可视化编排',
    'features.novel_gen.5': '可发布至智能体广场便于复用',

    // Workflows - 知识卡片整理助手
    'workflow.cards.title': '知识卡片整理助手',
    'workflow.cards.description': '将零散的学习笔记或工作记录通过 AI 重构为结构化知识卡片的智能体。用户只需输入原始笔记，Agent 自动解析、提炼要点并生成易读的知识卡片，方便后续查阅与复习。',
    'features.cards.1': '自动解析原始笔记文本',
    'features.cards.2': 'AI 重构内容并提取关键信息',
    'features.cards.3': '生成结构化知识卡片',
    'features.cards.4': '支持自定义卡片模板',
    'features.cards.5': '可导出多格式文件',

    // Workflows - AI 英语作文练习助手
    'workflow.writing.title': 'AI 英语作文练习助手',
    'workflow.writing.description': '面向中学生的 AI 英语作文“练习-反馈”闭环系统。家长/老师一键出题，学生在线写作，AI 即时给出评分与改进建议，并自动保存历史记录，帮助孩子持续、高效地提升英语写作水平。',
    'features.writing.1': '按年级随机生成作文题目（基于范文知识库）',
    'features.writing.2': 'AI 自动评分：语法、词汇、结构、逻辑四维评价',
    'features.writing.3': '即时反馈：错误定位 + 修改建议 + 高分表达示范',
    'features.writing.4': '历史记录：自动保存所有练习与评语，便于回顾',
    'features.writing.5': '一键部署：Flask Web 系统 + 本地 Astron 工作流',

    // Workflows - 旅行搭子
    'workflow.travel.title': '旅行搭子',
    'workflow.travel.description': '一个智能旅行规划助手，根据用户的偏好和预算，帮助设计个性化的旅行路线、预订住宿，并提供实时的旅行建议。',
    'features.travel.1': '个性化旅行路线规划',
    'features.travel.2': '住宿和交通预订协助',
    'features.travel.3': '实时旅行建议和应急支持',
    'features.travel.4': '集成地图和天气服务',

    // Workflows - 公众号文章总结凝练
    'workflow.wechat.title': '公众号文章总结凝练',
    'workflow.wechat.description': '一个内容总结工具，能够提取并凝练微信公众号（及其他平台）的文章，使用 DeepSeek 模型生成简洁的摘要。',
    'features.wechat.1': '从 URL 提取内容（支持微信公众号等）',
    'features.wechat.2': 'AI 驱动的智能总结 (DeepSeek-V3.2)',
    'features.wechat.3': '生成约 350 字的精简摘要',
    'features.wechat.4': '支持 Markdown 格式输出',

    // Workflows - 简历智优通
    'workflow.resume_opt.title': '简历智优通',
    'workflow.resume_opt.description': '一个基于多模型 Agent Flow 的智能简历分析与求职辅助系统，支持 PDF 简历 OCR 解析、智能评估与岗位推荐。',
    'features.resume_opt.1': 'PDF 简历 OCR 解析',
    'features.resume_opt.2': '多轮交互补全信息',
    'features.resume_opt.3': '智能简历评估与岗位推荐',
    'features.resume_opt.4': '多大模型与工具编排',

    // Workflows - 词汇生图
    'workflow.poetic.title': '词汇生图',
    'workflow.poetic.description': '只需输入一个词或一句诗，即可解析其中的文学意境，并生成专为 AI 绘画模型优化的视觉描述，让文字被“看见”。',
    'features.poetic.1': '文学意境深度解析',
    'features.poetic.2': '视觉描述优化生成',
    'features.poetic.3': '集成可灵 AI 绘画模型',
    'features.poetic.4': '从文字到视觉艺术的转化',

    // Workflows - 历史知识问答小助理
    'workflow.history.title': '历史知识问答小助理',
    'workflow.history.description': '“历史知识问答”智能体是您的私人历史顾问，专业涵盖全球历史事件、文化演变和重要人物。无论您对古代文明的奥秘还是现代历史的转折点感兴趣，它都能提供准确信息，解答您的每一个疑问。',
    'features.history.1': '联网搜索实时信息',
    'features.history.2': '文本合规检测确保安全',
    'features.history.3': '专业历史角色扮演',
    'features.history.4': '精准历史知识问答',

    // Workflows - AI电台播客生成
    'workflow.radio.title': 'AI电台播客生成',
    'workflow.radio.description': '一个能够将文字或公众号文章链接转化为生动有趣的电台播客内容的智能助手，支持语音合成和封面生成。',
    'features.radio.1': '解析 URL 内容（支持公众号等）',
    'features.radio.2': '生成播客风格脚本',
    'features.radio.3': '超拟人语音合成',
    'features.radio.4': 'AI 文生图制作封面',

    // Workflows - 剧荒终结者
    'workflow.drama.title': '剧荒终结者',
    'workflow.drama.description': '我是影坛守护者，精通电影圈的梗与秘辛。作为资深影迷，我挑剔每一帧画面，每一句对白，绝不容忍烂片的存在。在我这里，只有经典和佳作得以流传，让每一次观影都成为不可多得的艺术享受。',
    'features.drama.1': '以图搜剧（图片理解）',
    'features.drama.2': '专业影视推荐与点评',
    'features.drama.3': '联网搜索实时影视信息',
    'features.drama.4': '内容合规与安全过滤',

    // Workflows - 狗狗营养师
    'workflow.dog.title': '狗狗营养师',
    'workflow.dog.description': '狗狗也有一个专业的营养师。可以为你的狗狗提供专业的营养建议，帮助它们保持健康快乐的生活。',
    'features.dog.1': '定制化营养方案（年龄/体重/绝育等）',
    'features.dog.2': '专业饮食建议（大模型角色扮演）',
    'features.dog.3': '联网搜索营养知识',
    'features.dog.4': '文生图生成视觉辅助',

    // Workflows - 网络小说查找器
    'workflow.novel.title': '网络小说查找器',
    'workflow.novel.description': '通过输入想查找的小说类型，查找最新的网络小说，并提供简介。',
    'features.novel.1': '小说类型提取',
    'features.novel.2': '聚合搜索最新小说',
    'features.novel.3': '大模型推荐与简介生成',
    'features.novel.4': '个性化阅读建议',

    // Workflows - KET作文助手
    'workflow.ket.title': 'KET作文助手',
    'workflow.ket.description': '专为KET考试写作设计的智能助手。自动分析题目要求，生成提纲，撰写初稿并进行润色，最后检查字数是否达标。',
    'features.ket.1': '作文要求智能分析',
    'features.ket.2': '结构化提纲生成',
    'features.ket.3': '初稿撰写与语言润色',
    'features.ket.4': '字数合规检查',

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
    'community.title': 'Astron 社区氛围宝库',
    'community.subtitle': '探索社区有趣的一面，尽享表情包与音乐！',
    'community.memes': '社区表情包',
    'community.music': '氛围音乐',
    'community.swag': 'Astron 周边',
    'swag.redPackets': 'Astron 星辰马年红包 / Hóngbāo',
    'swag.download': '下载',
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