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
    'nav.wayToSuperAgent': 'WayToSuperAgent',
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
    'categories.finance': 'Finance & Investment',
    'categories.other': 'Other',

    // Workflows - AI Resume Assistant
    'workflow.ai_resume_assistant.title': 'AI Resume Assistant',
    'workflow.ai_resume_assistant.description': 'A smart resume optimization tool that helps job seekers create professional resumes with AI-driven suggestions and formatting.',
    'features.ai_resume_assistant.1': 'Resume content analysis and optimization',
    'features.ai_resume_assistant.2': 'AI-powered writing suggestions',
    'features.ai_resume_assistant.3': 'Professional formatting templates',
    'features.ai_resume_assistant.4': 'Industry-specific keyword recommendations',
    'features.ai_resume_assistant.5': 'Multi-format export support',

    // Workflows - AI Translator
    'workflow.ai_translator.title': 'AI Translator',
    'workflow.ai_translator.description': 'An advanced translation tool that provides accurate, context-aware translations, supporting multiple languages and domains.',
    'features.ai_translator.1': 'Multi-language translation support',
    'features.ai_translator.2': 'Context-aware translation engine',
    'features.ai_translator.3': 'Domain-specific translation modes',
    'features.ai_translator.4': 'Batch translation capability',
    'features.ai_translator.5': 'Translation quality evaluation',

    // Workflows - Multi-Platform Content Writing
    'workflow.multi_platform_content_writing.title': 'Multi-Platform Content Writing',
    'workflow.multi_platform_content_writing.description': 'A comprehensive content creation tool that generates platform-specific content optimized for different social media and publishing channels.',
    'features.multi_platform_content_writing.1': 'Platform-specific content generation',
    'features.multi_platform_content_writing.2': 'Multi-format content support',
    'features.multi_platform_content_writing.3': 'SEO optimization',
    'features.multi_platform_content_writing.4': 'Scheduling and publishing',
    'features.multi_platform_content_writing.5': 'Analytics and performance tracking',

    // Workflows - AI Podcast Generator
    'workflow.ai_podcast_generator.title': 'AI Podcast Generator',
    'workflow.ai_podcast_generator.description': 'An automated podcast creation tool that converts text into engaging audio experiences with natural speech synthesis and audio editing.',
    'features.ai_podcast_generator.1': 'Text-to-speech conversion',
    'features.ai_podcast_generator.2': 'Natural speech synthesis',
    'features.ai_podcast_generator.3': 'Audio editing and enhancement',
    'features.ai_podcast_generator.4': 'Multi-speaker support',
    'features.ai_podcast_generator.5': 'Podcast distribution integrations',

    // Workflows - AI Course Generator
    'workflow.ai_course_generator.title': 'AI Course Generator',
    'workflow.ai_course_generator.description': 'An intelligent course creation platform that generates educational content, lesson plans, and learning materials based on specified topics and learning objectives.',
    'features.ai_course_generator.1': 'Automated course content generation',
    'features.ai_course_generator.2': 'Alignment with learning objectives',
    'features.ai_course_generator.3': 'Interactive content creation',
    'features.ai_course_generator.4': 'Assessment and quiz generation',
    'features.ai_course_generator.5': 'Progress tracking and analytics',

    // Workflows - AI Paper Recommender
    'workflow.ai_paper_recommender.title': 'AI Paper Recommender',
    'workflow.ai_paper_recommender.description': 'An AI-powered academic paper recommendation system that works like TikTok for research papers—users swipe through daily recommendations, like or save papers, and the agent learns preferences to improve suggestions.',
    'features.ai_paper_recommender.1': 'Personalized recommendations based on user profile and interaction history',
    'features.ai_paper_recommender.2': 'Daily batch of curated papers fetched via ArXiv API',
    'features.ai_paper_recommender.3': 'Preference learning with feedback loop (like / save / skip)',
    'features.ai_paper_recommender.4': 'Summaries and recommendation rationale via LLM',
    'features.ai_paper_recommender.5': 'Frontend swipe UI and backend service integrating Astron Agent',

    // Workflows - AI English Essay Assistant
    'workflow.ai_english_essay_assistant.title': 'AI English Essay Assistant',
    'workflow.ai_english_essay_assistant.description': 'An AI-powered English essay grading and feedback assistant. Users submit their essay content, and the agent provides structured evaluation, points out grammar and expression issues, suggests improvements, offers example sentences/paragraphs, and estimates the essay level using IELTS or CEFR standards.',
    'features.ai_english_essay_assistant.1': 'Structured evaluation covering organization, grammar, vocabulary, and logic',
    'features.ai_english_essay_assistant.2': 'Grammar error detection with specific correction suggestions',
    'features.ai_english_essay_assistant.3': 'Improved example sentences or revised paragraphs',
    'features.ai_english_essay_assistant.4': 'Proficiency estimation under IELTS or CEFR standards',
    'features.ai_english_essay_assistant.5': 'Clear, organized output format tailored for student feedback',

    // Workflows - Novel Image-Text Generator
    'workflow.novel_image_text_generator.title': 'Novel Image-Text Generator',
    'workflow.novel_image_text_generator.description': 'Enter a novel title and automatically generate a complete article with accompanying images. Built with Astron’s block-style workflow composition, you can create an agent in one click, enable web access, image generation, and code capabilities in advanced settings, and publish to the Agent Plaza for reuse.',
    'features.novel_image_text_generator.1': 'One-input novel title → full image-rich article',
    'features.novel_image_text_generator.2': 'Prompt-based agent creation with auto-completion',
    'features.novel_image_text_generator.3': 'Advanced config: web access / image gen / code tools',
    'features.novel_image_text_generator.4': 'Visual block-based workflow authoring',
    'features.novel_image_text_generator.5': 'Publishable to Agent Plaza for convenient reuse',

    // Workflows - Knowledge Note Cards Organizer
    'workflow.knowledge_note_cards_organizer.title': 'Knowledge Note Cards Organizer',
    'workflow.knowledge_note_cards_organizer.description': 'An agent that turns scattered learning notes or work records into structured knowledge cards. Users simply input raw notes, and the agent automatically parses, refines key points, and generates readable knowledge cards for easy review and recall.',
    'features.knowledge_note_cards_organizer.1': 'Auto-parse raw note text',
    'features.knowledge_note_cards_organizer.2': 'AI restructuring and key-point extraction',
    'features.knowledge_note_cards_organizer.3': 'Generate structured knowledge cards',
    'features.knowledge_note_cards_organizer.4': 'Customizable card templates',
    'features.knowledge_note_cards_organizer.5': 'Export in multiple formats',

    // Workflows - AI English Writing Practice Assistant
    'workflow.ai_english_writing_practice_assistant.title': 'AI English Writing Practice Assistant',
    'workflow.ai_english_writing_practice_assistant.description': 'An "practice-feedback" closed-loop system for middle-school students to improve English writing. Parents/teachers generate prompts in one click; students write online; AI instantly scores and gives improvement tips, while auto-saving history to help kids progress steadily.',
    'features.ai_english_writing_practice_assistant.1': 'Grade-based random prompts from model essay knowledge base',
    'features.ai_english_writing_practice_assistant.2': 'AI auto-scoring: grammar, vocabulary, structure, logic',
    'features.ai_english_writing_practice_assistant.3': 'Instant feedback: error location + revision advice + high-score examples',
    'features.ai_english_writing_practice_assistant.4': 'History log: all practices & comments saved for review',
    'features.ai_english_writing_practice_assistant.5': 'One-click deploy: Flask web app + local Astron workflow',

    // Workflows - Travel Companion
    'workflow.travel_companion.title': 'Travel Companion',
    'workflow.travel_companion.description': 'An intelligent travel planning assistant that helps users design personalized travel routes, book accommodations, and provides real-time travel advice based on user preferences and budget.',
    'features.travel_companion.1': 'Personalized travel route planning',
    'features.travel_companion.2': 'Accommodation and transportation booking assistance',
    'features.travel_companion.3': 'Real-time travel advice and emergency support',
    'features.travel_companion.4': 'Integration with maps and weather services',

    // Workflows - WeChat Article Summary
    'workflow.wechat_article_summary.title': 'WeChat Article Summary',
    'workflow.wechat_article_summary.description': 'A content summarization tool that extracts and condenses articles from WeChat Official Accounts into concise summaries using the DeepSeek model.',
    'features.wechat_article_summary.1': 'Extract content from URLs',
    'features.wechat_article_summary.2': 'AI-powered summarization (DeepSeek-V3.2)',
    'features.wechat_article_summary.3': 'Concise output (~350 words)',
    'features.wechat_article_summary.4': 'Markdown format support',

    // Workflows - Smart Resume Optimizer
    'workflow.smart_resume_optimizer.title': 'Smart Resume Optimizer',
    'workflow.smart_resume_optimizer.description': 'An advanced resume analysis and job search assistance system supporting PDF resume OCR parsing, intelligent assessment, and job recommendations.',
    'features.smart_resume_optimizer.1': 'PDF resume OCR parsing',
    'features.smart_resume_optimizer.2': 'Multi-turn interaction for information completion',
    'features.smart_resume_optimizer.3': 'Intelligent resume assessment and job recommendations',
    'features.smart_resume_optimizer.4': 'Orchestration of multiple large models',

    // Workflows - Poetic Image Generator
    'workflow.poetic_image_generator.title': 'Poetic Image Generator',
    'workflow.poetic_image_generator.description': 'Transforms poetic verses or keywords into visual art by analyzing literary imagery and generating optimized prompts for AI image generation models.',
    'features.poetic_image_generator.1': 'Deep analysis of literary artistic conception',
    'features.poetic_image_generator.2': 'Generation of optimized visual descriptions',
    'features.poetic_image_generator.3': 'Integration with Keling AI painting model',
    'features.poetic_image_generator.4': 'From text to visual art realization',

    // Workflows - History Knowledge QA Assistant
    'workflow.history_knowledge_qa_assistant.title': 'History Knowledge QA Assistant',
    'workflow.history_knowledge_qa_assistant.description': 'The "History Knowledge QA" agent is your private history consultant, specializing in global historical events, cultural evolution, and important figures. Whether you are interested in the mysteries of ancient civilizations or turning points in modern history, it can provide accurate information and answer every question you have.',
    'features.history_knowledge_qa_assistant.1': 'Real-time online search for information',
    'features.history_knowledge_qa_assistant.2': 'Text compliance detection to ensure safety',
    'features.history_knowledge_qa_assistant.3': 'Professional historical role-playing',
    'features.history_knowledge_qa_assistant.4': 'Precise history knowledge Q&A',

    // Workflows - AI Radio Podcast Generator
    'workflow.ai_radio_podcast_generator.title': 'AI Radio Podcast Generator',
    'workflow.ai_radio_podcast_generator.description': 'An intelligent assistant that converts text or WeChat Official Account article links into lively and interesting radio podcast content, supporting speech synthesis and cover generation.',
    'features.ai_radio_podcast_generator.1': 'Parse URL content (supports WeChat Official Accounts, etc.)',
    'features.ai_radio_podcast_generator.2': 'Generate podcast-style scripts',
    'features.ai_radio_podcast_generator.3': 'Ultra-realistic speech synthesis',
    'features.ai_radio_podcast_generator.4': 'AI text-to-image cover generation',

    // Workflows - Drama Shortage Terminator
    'workflow.drama_shortage_terminator.title': 'Drama Shortage Terminator',
    'workflow.drama_shortage_terminator.description': 'Your personal film industry guardian and movie expert. Specialized in identifying movies from images, providing professional recommendations, and ensuring high-quality viewing experiences by filtering out bad movies.',
    'features.drama_shortage_terminator.1': 'Search movies by image (Image Understanding)',
    'features.drama_shortage_terminator.2': 'Professional movie recommendations & reviews',
    'features.drama_shortage_terminator.3': 'Real-time web search for movie info',
    'features.drama_shortage_terminator.4': 'Compliance and safety filtering',

    // Workflows - Dog Nutritionist
    'workflow.dog_nutritionist.title': 'Dog Nutritionist',
    'workflow.dog_nutritionist.description': 'A professional nutrition consultant for your dogs. Provides customized dietary plans based on age, weight, and specific needs, backed by real-time nutritional knowledge search.',
    'features.dog_nutritionist.1': 'Customized nutrition plans (Age/Weight/etc.)',
    'features.dog_nutritionist.2': 'Professional dietary advice via LLM',
    'features.dog_nutritionist.3': 'Web search for nutritional knowledge',
    'features.dog_nutritionist.4': 'Visual aids with Text-to-Image generation',

    // Workflows - Network Novel Finder
    'workflow.network_novel_finder.title': 'Network Novel Finder',
    'workflow.network_novel_finder.description': 'Find the latest online novels by entering the type of novel you want to find, and provide a brief introduction.',
    'features.network_novel_finder.1': 'Extract novel type from user input',
    'features.network_novel_finder.2': 'Aggregate search for latest novels',
    'features.network_novel_finder.3': 'LLM-based recommendation and intro',
    'features.network_novel_finder.4': 'Personalized reading suggestions',

    // Workflows - KET Essay Assistant
    'workflow.ket_essay_assistant.title': 'KET Essay Assistant',
    'workflow.ket_essay_assistant.description': 'A specialized assistant for KET exam essay writing. It analyzes requirements, generates outlines, writes drafts, polishes language, and checks word count compliance.',
    'features.ket_essay_assistant.1': 'Essay requirement analysis',
    'features.ket_essay_assistant.2': 'Structured outline generation',
    'features.ket_essay_assistant.3': 'Draft writing & language polishing',
    'features.ket_essay_assistant.4': 'Word count compliance check',

    // Workflows - bks-AI
    'workflow.bks_ai.title': 'bks-AI',
    'workflow.bks_ai.description': 'An "AI for Everyone" comprehensive assistant workflow. It integrates a multi-intent recognition system to intelligently distinguish user needs (such as consultation, order queries, or casual chat), combines online search for systematic knowledge organization, and uses a specialized knowledge base to provide precise business Q&A services.',
    'features.bks_ai.1': '**Smart Intent Routing**: Accurately identifies consultation, order queries, and casual chat scenarios',
    'features.bks_ai.2': '**Deep Online Search**: Real-time retrieval of network information with structured summarization',
    'features.bks_ai.3': '**Exclusive Knowledge Base**: Provides professional business answers related to Bks-AI',
    'features.bks_ai.4': '**Multi-source Recall Fusion**: Combines search results, knowledge base, and LLM generation for responses',

    // Workflows - Docs Workflow
    'workflow.docs_workflow.title': 'Docs Workflow',
    'workflow.docs_workflow.description': 'An intelligent Q&A assistant designed to answer questions based on a specific documentation knowledge base. It acts as a dedicated assistant (e.g., for HR inquiries) providing accurate responses solely from the provided documents.',
    'features.docs_workflow.1': '**Knowledge Base Integration:** Retrieves information from a specific document repository',
    'features.docs_workflow.2': '**Role-Based Q&A:** Configured as a dedicated assistant (e.g., HR support)',
    'features.docs_workflow.3': '**Strict Context Adherence:** Answers based solely on provided documentation to ensure accuracy',
    'features.docs_workflow.4': '**Concise & Friendly:** Delivers clear, brief, and professional responses',

    // Workflows - Astron Stock Analyzer
    'workflow.astron_stock_analyzer.title': 'Astron Stock Analyzer',
    'workflow.astron_stock_analyzer.description': 'An intelligent stock analysis agent that aggregates market data, performs technical and fundamental analysis, and provides investment insights.',
    'features.astron_stock_analyzer.1': 'Real-time stock data fetching',
    'features.astron_stock_analyzer.2': 'Technical indicator analysis',
    'features.astron_stock_analyzer.3': 'Fundamental data assessment',
    'features.astron_stock_analyzer.4': 'Investment report generation',

    // Workflows - AI Research Assistant
    'workflow.ai_research_assistant.title': 'AI Research Assistant',
    'workflow.ai_research_assistant.description': 'An open-source AI Research Assistant workflow for Astron Agent. It automates deep online research by breaking down topics, searching the web, scraping content, and compiling structured research reports with citations.',
    'features.ai_research_assistant.1': 'Automated research planning and execution',
    'features.ai_research_assistant.2': 'Deep web search and content scraping',
    'features.ai_research_assistant.3': 'Structured report generation with citations',
    'features.ai_research_assistant.4': 'Multi-source information synthesis',

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
    'contribute.github.title': 'GitHub Contribution Insights',
    'contribute.github.subtitle': 'After authorizing GitHub, you can view your contribution activity in iflytek/astron-agent and iflytek/astron-rpa.',
    'contribute.github.login': 'Authorize GitHub and View Contributions',
    'contribute.github.logout': 'Log out',
    'contribute.github.loggedInAs': 'Logged in as',
    'contribute.github.loading': 'Loading contribution data...',
    'contribute.github.stats.commits': 'Commits',
    'contribute.github.stats.pullRequests': 'Pull Requests',
    'contribute.github.stats.issues': 'Issues',
    'contribute.github.stats.reviews': 'Code Reviews',
    'contribute.github.table.profile': 'Domain Profile',
    'contribute.github.table.org': 'Organization',
    'contribute.github.table.count': 'Contribution Count',
    'contribute.github.errors.state': 'Authorization state validation failed. Please try again.',
    'contribute.github.errors.exchange': 'Failed to complete GitHub authorization. Please try again.',
    'contribute.github.errors.load': 'Unable to load contribution data at the moment.',
    'contribute.github.errors.missingClientId': 'Missing VITE_GITHUB_CLIENT_ID. Configure it in your deployment environment before enabling login.',
    'community.title': 'Astron Community Vibe Vault',
    'community.subtitle': 'Explore the fun side of our community with memes and music!',
    'community.memes': 'Community Memes',
    'community.memes.horse': 'Astron Celebrates the Year of the Horse',
    'community.memes.life': 'Colorful Astron Life',
    'community.music': 'Vibe Music',
    'community.musicDescription': 'Curated BGM for Astron Development & Video Creation',
    'community.swag': 'Astron Swag',
    'swag.redPackets': 'Astron Horse Year Red Envelope / Hóngbāo',
    'swag.event': 'Astron Event Swag',
    'swag.download': 'Download',

    'way.title': 'WayToSuperAgent',
    'way.subtitle': 'Astron Video List',
    'way.talk.title': 'Talk',
    'way.talk.description': 'Technical sharing, Conference speeches, Deep dives',
    'way.talk.aiUniversity': 'AI University Astron Video Zone',
    'way.showcase.title': 'Showcase',
    'way.showcase.description': 'Product demos, Tutorials, Case studies, Hackathon projects',
    'way.showcase.youtube': 'Astron Agent YouTube Playlist',
    'way.showcase.vimeo': 'Astron Agent Video Showcase (Vimeo)',
    'way.showcase.x': 'Astron Agent X(Twitter) Video List',
    'way.slides.title': 'Slides',
    'way.slides.description': 'Presentation slides from conferences and meetups',
    'way.slides.huqi': 'Astron Quick Build and Apply Agent by HuQi',
    'way.slides.rpa': 'Practical Integration of Astron Agent and RPA',

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
    'nav.wayToSuperAgent': 'WayToSuperAgent',
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
    'workflow.ai_resume_assistant.title': 'AI 简历助手',
    'workflow.ai_resume_assistant.description': '智能简历优化工具，帮助求职者通过 AI 驱动的建议和格式化创建专业简历。',
    'features.ai_resume_assistant.1': '简历内容分析和优化',
    'features.ai_resume_assistant.2': 'AI 驱动的写作建议',
    'features.ai_resume_assistant.3': '专业格式模板',
    'features.ai_resume_assistant.4': '行业特定关键词推荐',
    'features.ai_resume_assistant.5': '多格式导出支持',

    // Workflows - AI 翻译器
    'workflow.ai_translator.title': 'AI 翻译器',
    'workflow.ai_translator.description': '高级翻译工具，提供准确的、上下文感知的翻译，支持多种语言和专业领域。',
    'features.ai_translator.1': '多语言翻译支持',
    'features.ai_translator.2': '上下文感知翻译引擎',
    'features.ai_translator.3': '领域特定翻译模式',
    'features.ai_translator.4': '批量翻译功能',
    'features.ai_translator.5': '翻译质量评估',

    // Workflows - 多平台内容写作
    'workflow.multi_platform_content_writing.title': '多平台内容写作',
    'workflow.multi_platform_content_writing.description': '综合内容创作工具，生成针对不同社交媒体和发布平台优化的平台特定内容。',
    'features.multi_platform_content_writing.1': '平台特定内容生成',
    'features.multi_platform_content_writing.2': '多格式内容支持',
    'features.multi_platform_content_writing.3': 'SEO 优化',
    'features.multi_platform_content_writing.4': '内容调度和发布',
    'features.multi_platform_content_writing.5': '分析和性能跟踪',

    // Workflows - AI 播客生成器
    'workflow.ai_podcast_generator.title': 'AI 播客生成器',
    'workflow.ai_podcast_generator.description': '自动化播客创作工具，通过自然语音合成和音频编辑将文本内容转换为引人入胜的音频体验。',
    'features.ai_podcast_generator.1': '文本到语音转换',
    'features.ai_podcast_generator.2': '自然语音合成',
    'features.ai_podcast_generator.3': '音频编辑和增强',
    'features.ai_podcast_generator.4': '多说话人支持',
    'features.ai_podcast_generator.5': '播客分发集成',

    // Workflows - AI 课程生成器
    'workflow.ai_course_generator.title': 'AI 课程生成器',
    'workflow.ai_course_generator.description': '智能课程创建平台，根据指定主题和学习目标生成教育内容、课程计划和学习材料。',
    'features.ai_course_generator.1': '自动化课程内容生成',
    'features.ai_course_generator.2': '学习目标对齐',
    'features.ai_course_generator.3': '交互式内容创建',
    'features.ai_course_generator.4': '评估和测验生成',
    'features.ai_course_generator.5': '进度跟踪和分析',

    // Workflows - 论文推荐系统
    'workflow.ai_paper_recommender.title': '论文推荐系统',
    'workflow.ai_paper_recommender.description': '一个像刷短视频一样刷论文的 AI 学术论文推荐系统。用户每天收到推荐论文卡片，通过点赞、收藏或跳过的交互，Agent 学习偏好并持续优化推荐效果。',
    'features.ai_paper_recommender.1': '基于用户画像与历史交互的个性化推荐',
    'features.ai_paper_recommender.2': '通过 ArXiv API 拉取最新论文，按天批量推送',
    'features.ai_paper_recommender.3': '点赞 / 收藏 / 跳过反馈闭环，持续学习偏好',
    'features.ai_paper_recommender.4': 'LLM 生成摘要与推荐理由，提升可读性',
    'features.ai_paper_recommender.5': '前端滑动式交互、后端服务与 Astron Agent 集成',

    // Workflows - 英语作文批改助手
    'workflow.ai_english_essay_assistant.title': '英语作文批改助手',
    'workflow.ai_english_essay_assistant.description': '一个 AI 驱动的英语作文批改与反馈助手。用户提交作文内容后，Agent 将提供结构化评价，指出语法与表达问题，给出修改建议与示例句/段，并按雅思或 CEFR 标准估计作文等级。',
    'features.ai_english_essay_assistant.1': '覆盖组织结构、语法、词汇、逻辑的综合评价',
    'features.ai_english_essay_assistant.2': '精准定位语法错误并给出具体修改建议',
    'features.ai_english_essay_assistant.3': '提供更优的例句或修订段落示例',
    'features.ai_english_essay_assistant.4': '按雅思或 CEFR 标准进行水平估计',
    'features.ai_english_essay_assistant.5': '输出格式清晰、适合学生阅读与改进',

    // Workflows - 小说图文生成器
    'workflow.novel_image_text_generator.title': '小说图文生成器',
    'workflow.novel_image_text_generator.description': '输入小说名称即可自动生成一篇完整的带配图小说文章。基于 Astron 工作流的「搭积木」式编排，一键创建智能体并可在高阶配置中开启联网、生图、代码等能力，完成后可发布到智能体广场。',
    'features.novel_image_text_generator.1': '输入小说名自动生成图文文章',
    'features.novel_image_text_generator.2': '提示词创建智能体并自动完善配置',
    'features.novel_image_text_generator.3': '高阶配置支持联网/生图/代码能力',
    'features.novel_image_text_generator.4': '工作流「搭积木」式可视化编排',
    'features.novel_image_text_generator.5': '可发布至智能体广场便于复用',

    // Workflows - 知识卡片整理助手
    'workflow.knowledge_note_cards_organizer.title': '知识卡片整理助手',
    'workflow.knowledge_note_cards_organizer.description': '将零散的学习笔记或工作记录通过 AI 重构为结构化知识卡片的智能体。用户只需输入原始笔记，Agent 自动解析、提炼要点并生成易读的知识卡片，方便后续查阅与复习。',
    'features.knowledge_note_cards_organizer.1': '自动解析原始笔记文本',
    'features.knowledge_note_cards_organizer.2': 'AI 重构内容并提取关键信息',
    'features.knowledge_note_cards_organizer.3': '生成结构化知识卡片',
    'features.knowledge_note_cards_organizer.4': '支持自定义卡片模板',
    'features.knowledge_note_cards_organizer.5': '可导出多格式文件',

    // Workflows - AI 英语作文练习助手
    'workflow.ai_english_writing_practice_assistant.title': 'AI 英语作文练习助手',
    'workflow.ai_english_writing_practice_assistant.description': '面向中学生的 AI 英语作文“练习-反馈”闭环系统。家长/老师一键出题，学生在线写作，AI 即时给出评分与改进建议，并自动保存历史记录，帮助孩子持续、高效地提升英语写作水平。',
    'features.ai_english_writing_practice_assistant.1': '按年级随机生成作文题目（基于范文知识库）',
    'features.ai_english_writing_practice_assistant.2': 'AI 自动评分：语法、词汇、结构、逻辑四维评价',
    'features.ai_english_writing_practice_assistant.3': '即时反馈：错误定位 + 修改建议 + 高分表达示范',
    'features.ai_english_writing_practice_assistant.4': '历史记录：自动保存所有练习与评语，便于回顾',
    'features.ai_english_writing_practice_assistant.5': '一键部署：Flask Web 系统 + 本地 Astron 工作流',

    // Workflows - 旅行搭子
    'workflow.travel_companion.title': '旅行搭子',
    'workflow.travel_companion.description': '一个智能旅行规划助手，根据用户的偏好和预算，帮助设计个性化的旅行路线、预订住宿，并提供实时的旅行建议。',
    'features.travel_companion.1': '个性化旅行路线规划',
    'features.travel_companion.2': '住宿和交通预订协助',
    'features.travel_companion.3': '实时旅行建议和应急支持',
    'features.travel_companion.4': '集成地图和天气服务',

    // Workflows - 公众号文章总结凝练
    'workflow.wechat_article_summary.title': '公众号文章总结凝练',
    'workflow.wechat_article_summary.description': '一个内容总结工具，能够提取并凝练微信公众号（及其他平台）的文章，使用 DeepSeek 模型生成简洁的摘要。',
    'features.wechat_article_summary.1': '从 URL 提取内容（支持微信公众号等）',
    'features.wechat_article_summary.2': 'AI 驱动的智能总结 (DeepSeek-V3.2)',
    'features.wechat_article_summary.3': '生成约 350 字的精简摘要',
    'features.wechat_article_summary.4': '支持 Markdown 格式输出',

    // Workflows - 简历智优通
    'workflow.smart_resume_optimizer.title': '简历智优通',
    'workflow.smart_resume_optimizer.description': '一个基于多模型 Agent Flow 的智能简历分析与求职辅助系统，支持 PDF 简历 OCR 解析、智能评估与岗位推荐。',
    'features.smart_resume_optimizer.1': 'PDF 简历 OCR 解析',
    'features.smart_resume_optimizer.2': '多轮交互补全信息',
    'features.smart_resume_optimizer.3': '智能简历评估与岗位推荐',
    'features.smart_resume_optimizer.4': '多大模型与工具编排',

    // Workflows - 词汇生图
    'workflow.poetic_image_generator.title': '词汇生图',
    'workflow.poetic_image_generator.description': '只需输入一个词或一句诗，即可解析其中的文学意境，并生成专为 AI 绘画模型优化的视觉描述，让文字被“看见”。',
    'features.poetic_image_generator.1': '文学意境深度解析',
    'features.poetic_image_generator.2': '视觉描述优化生成',
    'features.poetic_image_generator.3': '集成可灵 AI 绘画模型',
    'features.poetic_image_generator.4': '从文字到视觉艺术的转化',

    // Workflows - 历史知识问答小助理
    'workflow.history_knowledge_qa_assistant.title': '历史知识问答小助理',
    'workflow.history_knowledge_qa_assistant.description': '“历史知识问答”智能体是您的私人历史顾问，专业涵盖全球历史事件、文化演变和重要人物。无论您对古代文明的奥秘还是现代历史的转折点感兴趣，它都能提供准确信息，解答您的每一个疑问。',
    'features.history_knowledge_qa_assistant.1': '联网搜索实时信息',
    'features.history_knowledge_qa_assistant.2': '文本合规检测确保安全',
    'features.history_knowledge_qa_assistant.3': '专业历史角色扮演',
    'features.history_knowledge_qa_assistant.4': '精准历史知识问答',

    // Workflows - AI电台播客生成
    'workflow.ai_radio_podcast_generator.title': 'AI电台播客生成',
    'workflow.ai_radio_podcast_generator.description': '一个能够将文字或公众号文章链接转化为生动有趣的电台播客内容的智能助手，支持语音合成和封面生成。',
    'features.ai_radio_podcast_generator.1': '解析 URL 内容（支持公众号等）',
    'features.ai_radio_podcast_generator.2': '生成播客风格脚本',
    'features.ai_radio_podcast_generator.3': '超拟人语音合成',
    'features.ai_radio_podcast_generator.4': 'AI 文生图制作封面',

    // Workflows - 剧荒终结者
    'workflow.drama_shortage_terminator.title': '剧荒终结者',
    'workflow.drama_shortage_terminator.description': '“我是影坛守护者，精通电影圈的梗与秘辛。作为资深影迷，我挑剔每一帧画面，每一句对白，绝不容忍烂片的存在。在我这里，只有经典和佳作得以流传，让每一次观影都成为不可多得的艺术享受。”',
    'features.drama_shortage_terminator.1': '以图搜剧（图片理解）',
    'features.drama_shortage_terminator.2': '专业影视推荐与点评',
    'features.drama_shortage_terminator.3': '联网搜索实时影视信息',
    'features.drama_shortage_terminator.4': '内容合规与安全过滤',

    // Workflows - 狗狗营养师
    'workflow.dog_nutritionist.title': '狗狗营养师',
    'workflow.dog_nutritionist.description': '“狗狗也有一个专业的营养师。” 可以为你的狗狗提供专业的营养建议，帮助它们保持健康快乐的生活。',
    'features.dog_nutritionist.1': '定制化营养方案（年龄/体重/绝育等）',
    'features.dog_nutritionist.2': '专业饮食建议（大模型角色扮演）',
    'features.dog_nutritionist.3': '联网搜索营养知识',
    'features.dog_nutritionist.4': '文生图生成视觉辅助',

    // Workflows - 网络小说查找器
    'workflow.network_novel_finder.title': '网络小说查找器',
    'workflow.network_novel_finder.description': '“网络小说查找器”通过输入想查找的小说类型，查找最新的网络小说，并提供简介。',
    'features.network_novel_finder.1': '小说类型提取',
    'features.network_novel_finder.2': '聚合搜索最新小说',
    'features.network_novel_finder.3': '大模型推荐与简介生成',
    'features.network_novel_finder.4': '个性化阅读建议',

    // Workflows - KET作文助手
    'workflow.ket_essay_assistant.title': 'KET作文助手',
    'workflow.ket_essay_assistant.description': '“KET作文助手”是专为KET考试写作设计的智能助手。自动分析题目要求，生成提纲，撰写初稿并进行润色，最后检查字数是否达标。',
    'features.ket_essay_assistant.1': '作文要求智能分析',
    'features.ket_essay_assistant.2': '结构化提纲生成',
    'features.ket_essay_assistant.3': '初稿撰写与语言润色',
    'features.ket_essay_assistant.4': '字数合规检查',

    // Workflows - bks-AI
    'workflow.bks_ai.title': 'bks-AI',
    'workflow.bks_ai.description': '一个“人人可用”的综合型 AI 助手工作流。它集成了多意图识别系统，能够智能区分用户需求（如咨询、订单查询或闲聊），结合联网搜索进行系统化的知识规整，并利用专属知识库提供精准的业务问答服务。',
    'features.bks_ai.1': '**智能意图分流**：精准识别咨询、订单查询与通用闲聊场景',
    'features.bks_ai.2': '**联网深度搜索**：实时检索网络信息并进行结构化总结',
    'features.bks_ai.3': '**专属知识库**：提供 Bks-AI 相关的专业业务解答',
    'features.bks_ai.4': '**多路召回融合**：综合搜索结果、知识库与大模型生成回复',

    // Workflows - 文档问答助手 (Docs Workflow)
    'workflow.docs_workflow.title': '文档问答助手 (Docs Workflow)',
    'workflow.docs_workflow.description': '一个智能问答助手，旨在根据特定的文档知识库回答问题。它充当专属助手（例如 HR 咨询），仅根据提供的文档提供准确的回复。',
    'features.docs_workflow.1': '**知识库集成**：从特定文档库中检索信息',
    'features.docs_workflow.2': '**角色化问答**：配置为专属助手（如 HR 支持）',
    'features.docs_workflow.3': '**严格上下文遵循**：仅依据提供的文档回答，确保准确性',
    'features.docs_workflow.4': '**简洁友好**：提供清晰、简短且专业的回复',

    // Workflows - Astron Stock Analyzer
    'workflow.astron_stock_analyzer.title': 'Astron Stock Analyzer',
    'workflow.astron_stock_analyzer.description': '一个智能股票分析代理，聚合市场数据，进行技术和基本面分析，并提供投资见解。',
    'features.astron_stock_analyzer.1': '实时股票数据获取',
    'features.astron_stock_analyzer.2': '技术指标分析',
    'features.astron_stock_analyzer.3': '基本面数据评估',
    'features.astron_stock_analyzer.4': '投资报告生成',

    // Workflows - AI 研究助手
    'workflow.ai_research_assistant.title': 'AI 研究助手',
    'workflow.ai_research_assistant.description': '一个自动化的研究助手，能够执行深度的在线研究。它可以拆解主题，搜索网络，抓取内容，并编制带有引用的结构化研究报告。',
    'features.ai_research_assistant.1': '自动化研究规划与执行',
    'features.ai_research_assistant.2': '深度网络搜索与内容抓取',
    'features.ai_research_assistant.3': '生成带引用的结构化报告',
    'features.ai_research_assistant.4': '多源信息综合',

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
    'contribute.github.title': 'GitHub 贡献洞察',
    'contribute.github.subtitle': '完成 GitHub 授权后，可查看您在 iflytek/astron-agent 与 iflytek/astron-rpa 的贡献行为。',
    'contribute.github.login': '授权 GitHub 并查看贡献',
    'contribute.github.logout': '退出登录',
    'contribute.github.loggedInAs': '当前登录用户',
    'contribute.github.loading': '正在加载贡献数据...',
    'contribute.github.stats.commits': '提交（Commits）',
    'contribute.github.stats.pullRequests': '拉取请求（PR）',
    'contribute.github.stats.issues': 'Issues',
    'contribute.github.stats.reviews': '代码评审',
    'contribute.github.table.profile': '领域画像',
    'contribute.github.table.org': '组织',
    'contribute.github.table.count': '贡献次数',
    'contribute.github.errors.state': '授权状态校验失败，请重试。',
    'contribute.github.errors.exchange': 'GitHub 授权失败，请稍后重试。',
    'contribute.github.errors.load': '暂时无法加载贡献数据。',
    'contribute.github.errors.missingClientId': '缺少 VITE_GITHUB_CLIENT_ID，请在部署环境变量中配置后再启用登录。',
    'community.title': 'Astron 社区氛围宝库',
    'community.subtitle': '探索社区有趣的一面，尽享表情包与音乐！',
    'community.memes': '社区表情包',
    'community.memes.horse': 'Astron 庆马年',
    'community.memes.life': '多彩 Astron 生活',
    'community.music': '氛围音乐',
    'community.musicDescription': 'Astron 开发活动与视频创作的精选背景音乐素材',
    'community.swag': 'Astron 周边',
    'swag.redPackets': 'Astron 星辰马年红包 / Hóngbāo',
    'swag.event': 'Astron 活动周边',
    'swag.download': '下载',

    'way.title': 'WayToSuperAgent',
    'way.subtitle': 'Astron 视频列表',
    'way.talk.title': 'Talk',
    'way.talk.description': '包含技术分享、会议演讲、源码深度解析等',
    'way.talk.aiUniversity': 'AI大学堂 Astron 视频专区',
    'way.showcase.title': 'Showcase',
    'way.showcase.description': '包含产品演示、3分钟入门、用户案例、黑客松作品等',
    'way.showcase.youtube': 'Astron Agent YouTube 播放列表',
    'way.showcase.vimeo': 'Astron Agent 视频演示合集 (Vimeo)',
    'way.showcase.x': 'Astron Agent X(Twitter) 视频列表',
    'way.slides.title': 'Slides',
    'way.slides.description': '来自会议和聚会的演示幻灯片',
    'way.slides.huqi': 'Astron 助力智能体快速构建与应用 by 胡琦',
    'way.slides.rpa': 'Astron Agent 与 RPA 的实战融合',

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