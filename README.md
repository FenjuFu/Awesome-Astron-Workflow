# Awesome Astron Workflow

> A curated collection of Astron workflow examples and user cases for AI-powered applications

[![English](https://img.shields.io/badge/README-English-blue)](README.md) [![中文](https://img.shields.io/badge/README-%E4%B8%AD%E6%96%87-red)](README.zh-CN.md) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/FenjuFu/Awesome-Astron-Workflow)

## Table of Contents

- [Overview](#overview)
- [Use Cases & Workflows](#use-cases--workflows)
  - [Office Productivity](#office-productivity)
    - [1. AI Resume Assistant](#1-ai-resume-assistant)
    - [2. AI Translator](#2-ai-translator)
    - [9. Knowledge Note Cards Organizer](#9-knowledge-note-cards-organizer)
    - [12. WeChat Article Summary](#12-wechat-article-summary)
    - [13. Smart Resume Optimizer](#13-smart-resume-optimizer)
    - [22. Docs Workflow](#22-docs-workflow)
    - [26. AI Research Assistant](#26-ai-research-assistant)
  - [Creative Writing](#creative-writing)
    - [3. Multi-Platform Content Writing](#3-multi-platform-content-writing)
    - [4. AI Podcast Generator](#4-ai-podcast-generator)
    - [8. Novel Image-Text Generator](#8-novel-image-text-generator)
    - [14. Poetic Image Generator](#14-poetic-image-generator)
    - [16. AI Radio Podcast Generator](#16-ai-radio-podcast-generator)
  - [Learning Assistant](#learning-assistant)
    - [5. AI Course Generator](#5-ai-course-generator)
    - [6. AI Paper Recommender](#6-ai-paper-recommender)
    - [7. AI English Essay Assistant](#7-ai-english-essay-assistant)
    - [10. AI English Writing Practice Assistant](#10-ai-english-writing-practice-assistant)
    - [15. History Knowledge QA Assistant](#15-history-knowledge-qa-assistant)
    - [20. KET Essay Assistant](#20-ket-essay-assistant)
  - [Coding & Programming](#coding--programming)
  - [Leisure & Entertainment](#leisure--entertainment)
    - [11. Travel Companion](#11-travel-companion)
    - [17. Drama Shortage Terminator](#17-drama-shortage-terminator)
    - [19. Network Novel Finder](#19-network-novel-finder)
  - [Health Partner](#health-partner)
    - [18. Dog Nutritionist](#18-dog-nutritionist)
- [Contributing](#contributing)
- [License](#license)

## Overview

Astron is a powerful workflow engine designed for building AI-driven applications. This repository collects real-world user cases and their corresponding workflow implementations to help developers understand how to build various AI applications with Astron.

Each case includes:
- A user case document (WeChat article)
- A complete workflow YAML file
- A summary of key features

## Use Cases & Workflows

### Office Productivity

#### 21. bks-AI

**Description:** An "AI for Everyone" comprehensive assistant workflow. It integrates a multi-intent recognition system to intelligently distinguish user needs (such as consultation, order queries, or casual chat), combines online search for systematic knowledge organization, and uses a specialized knowledge base to provide precise business Q&A services.

- **User Case:** [Video Showcase](https://www.youtube.com/watch?v=weO_qGSQFI4&list=PLpSUIRpjMINCELDvnnHdVmPKEINljeluw&index=7&t=1s&pp=gAQBiAQBsAgC)
- **Workflow:** [bks-AI.yml](https://github.com/CoderWanFeng/AwesomeAstronAgent/blob/main/bks-AI.yml)

**Key Features:**
- **Smart Intent Routing**: Accurately identifies consultation, order queries, and casual chat scenarios
- **Deep Online Search**: Real-time retrieval of network information with structured summarization
- **Exclusive Knowledge Base**: Provides professional business answers related to Bks-AI
- **Multi-source Recall Fusion**: Combines search results, knowledge base, and LLM generation for responses

#### 1. AI Resume Assistant

**Description:** A smart resume optimization tool that helps job seekers create professional resumes with AI-driven suggestions and formatting.

- **User Case:** [WeChat article](https://mp.weixin.qq.com/s/t18r62JYsx8P_1jV_5f1Mg)
- **Workflow:** [AI-Resume-Assistant.yml](https://github.com/justacoder99/AI-Resume-Assistant/blob/main/docker/astronAgent/AI-Resume-Assistant.yml)

**Key Features:**
- Resume content analysis and optimization
- AI-powered writing suggestions
- Professional formatting templates
- Industry-specific keyword recommendations
- Multi-format export support

#### 2. AI Translator

**Description:** An advanced translation tool that provides accurate, context-aware translations, supporting multiple languages and domains.

- **User Case:** [WeChat article](https://mp.weixin.qq.com/s/ge52PHt_TQIkCcRl1m3B3w)
- **Workflow:** [aitranslator.yml](https://github.com/aying20/aitranslator/blob/main/workflow/aitranslator.yml)

**Key Features:**
- Multi-language translation support
- Context-aware translation engine
- Domain-specific translation modes
- Batch translation capability
- Translation quality evaluation

#### 9. Knowledge Note Cards Organizer

**Description:** An agent that turns scattered learning notes or work records into structured knowledge cards. Users simply input raw notes, and the agent automatically parses, refines key points, and generates readable knowledge cards for easy review and recall.

- **User Case:** [WeChat article](https://mp.weixin.qq.com/s/b0jgNvVPI3zz3A8jWRH0LA)
- **Workflow:** [`knowledge-cards.yml`](https://github.com/fanan-uyun/Knowledge-Note-Cards/blob/main/docker/astronAgent/knowledge-cards.yml)

**Key Features:**
- Auto-parse raw note text
- AI restructuring and key-point extraction
- Generate structured knowledge cards
- Customizable card templates
- Export in multiple formats

#### 12. WeChat Article Summary

**Description:** A content summarization tool that extracts and condenses articles from WeChat Official Accounts into concise summaries using the DeepSeek model.

- **User Case:**
- **Workflow:** [default.yml](https://github.com/user-attachments/files/24495795/default.yml)
- **Hashtag Event:** Astron Training Camp · Cohort #1

**Key Features:**
- Extract content from URLs
- AI-powered summarization (DeepSeek-V3.2)
- Concise output (~350 words)
- Markdown format support

#### 13. Smart Resume Optimizer

**Description:** An advanced resume analysis and job search assistance system supporting PDF resume OCR parsing, intelligent assessment, and job recommendations.

- **User Case:** [Resume Intelligence add](https://github.com/iflytek/astron-agent/discussions/824)
- **Workflow:** [default.yml](https://github.com/user-attachments/files/24494434/default.yml)
- **Hashtag Event:** Astron Training Camp · Cohort #1

**Key Features:**
- PDF resume OCR parsing
- Multi-turn interaction for information completion
- Intelligent resume assessment and job recommendations
- Orchestration of multiple large models

#### 22. Docs Workflow

**Description:** An intelligent Q&A assistant designed to answer questions based on a specific documentation knowledge base. It acts as a dedicated assistant (e.g., for HR inquiries) providing accurate responses solely from the provided documents.

- **User Case:** [Video Showcase](https://www.youtube.com/watch?v=n0gzapUwI3o)
- **Workflow:** [Docs Workfow.yml](https://github.com/beaucarnes/astronagent/blob/main/Docs%20Workfow.yml)

**Key Features:**
- **Knowledge Base Integration:** Retrieves information from a specific document repository
- **Role-Based Q&A:** Configured as a dedicated assistant (e.g., HR support)
- **Strict Context Adherence:** Answers based solely on provided documentation to ensure accuracy
- **Concise & Friendly:** Delivers clear, brief, and professional responses

#### 26. AI Research Assistant

**Description:** An open-source AI Research Assistant workflow for Astron Agent. It automates deep online research by breaking down topics, searching the web, scraping content, and compiling structured research reports with citations.

- **User Case:** [Video Showcase](https://www.youtube.com/watch?v=UUMhR0MkCOc&list=PLpSUIRpjMINCELDvnnHdVmPKEINljeluw&index=26&t=944s&pp=iAQBsAgC)
- **Workflow:** [ai-research-assistant](https://github.com/moladata/ai-research-assistant)

**Key Features:**
- Automated research planning and execution
- Deep web search and content scraping
- Structured report generation with citations
- Multi-source information synthesis


### Creative Writing

#### 3. Multi-Platform Content Writing

**Description:** A comprehensive content creation tool that generates platform-specific content optimized for different social media and publishing channels.

- **User Case:** [WeChat article](https://mp.weixin.qq.com/s/fVZJYtXTiPKMku_1ycOBpg)
- **Workflow:** [Multi-platform content writing.yml](https://github.com/binggandata/ai_resource/blob/main/%E5%A4%9A%E5%B9%B3%E5%8F%B0%E5%86%85%E5%AE%B9%E5%86%99%E4%BD%9C.yml)

**Key Features:**
- Platform-specific content generation
- Multi-format content support
- SEO optimization
- Scheduling and publishing
- Analytics and performance tracking

#### 4. AI Podcast Generator

**Description:** An automated podcast creation tool that converts text into engaging audio experiences with natural speech synthesis and audio editing.

- **User Case:** [WeChat article](https://mp.weixin.qq.com/s/QKp2nTKGl0m8JTytc-0ibA)
- **Workflow:** [AI Podcast.yml](https://github.com/itwanger/PaiAgent/commit/7a4cf59d3e5302ffecdb95717c937afb2befa51a#diff-0c1529cd9f3a6d94ca74f4a60d460410f92c9c28278a980dbb4ad513cfefc913)

**Key Features:**
- Text-to-speech conversion
- Natural speech synthesis
- Audio editing and enhancement
- Multi-speaker support
- Podcast distribution integrations

#### 8. Novel Image-Text Generator

**Description:** Enter a novel title and automatically generate a complete article with accompanying images. Built with Astron’s block-style workflow composition, you can create an agent in one click, enable web access, image generation, and code capabilities in advanced settings, and publish to the Agent Plaza for reuse.

- **User Case:** [WeChat article](https://mp.weixin.qq.com/s/F4Uz30jw5Uo2WQSe-tO3xg)
- **Workflow:** [小说图文生成.yml](https://github.com/XiongFeng1997/AI-Novel-Generation/blob/main/docker/astronAgent/%E5%B0%8F%E8%AF%B4%E5%9B%BE%E6%96%87%E7%94%9F%E6%88%90.yml)

**Key Features:**
- One-input novel title → full image-rich article
- Prompt-based agent creation with auto-completion
- Advanced config: web access / image gen / code tools
- Visual block-based workflow authoring
- Publishable to Agent Plaza for convenient reuse

#### 14. Poetic Image Generator

**Description:** Transforms poetic verses or keywords into visual art by analyzing literary imagery and generating optimized prompts for AI image generation models.

- **User Case:**
- **Workflow:** [default.yml](https://github.com/user-attachments/files/24551622/default.yml)
- **Hashtag Event:** Astron Training Camp · Cohort #1

**Key Features:**
- Deep analysis of literary artistic conception
- Generation of optimized visual descriptions
- Integration with Keling AI painting model
- From text to visual art realization

#### 16. AI Radio Podcast Generator

**Description:** An intelligent assistant that converts text or WeChat Official Account article links into lively and interesting radio podcast content, supporting speech synthesis and cover generation.

- **User Case:**
- **Workflow:** [AI.yml](https://github.com/user-attachments/files/24562655/AI.yml)
- **Hashtag Event:** Astron Training Camp · Cohort #1

**Key Features:**
- Parse URL content (supports WeChat Official Accounts, etc.)
- Generate podcast-style scripts
- Ultra-realistic speech synthesis
- AI text-to-image cover generation

### Learning Assistant

#### 5. AI Course Generator

**Description:** An intelligent course creation platform that generates educational content, lesson plans, and learning materials based on specified topics and learning objectives.

- **User Case:** [WeChat article](https://mp.weixin.qq.com/s/QHcwsQB29m_dDzkchIUvdQ)
- **Workflow:** [Course Generator workflows](https://github.com/GitHubDaily/AI-Course-Generator/tree/main/workflow)

**Key Features:**
- Automated course content generation
- Alignment with learning objectives
- Interactive content creation
- Assessment and quiz generation
- Progress tracking and analytics

#### 6. AI Paper Recommender

**Description:** An AI-powered academic paper recommendation system that works like TikTok for research papers—users swipe through daily recommendations, like or save papers, and the agent learns preferences to improve suggestions.

- **User Case:** [WeChat article](https://mp.weixin.qq.com/s/vt3rN-P70IOJd5emdG2Gyw)
- **Workflow:** [`spark_workflow_config.yml`](https://github.com/qwwzdyj/Xfind/blob/main/workflow/spark_workflow_config.yml)

**Key Features:**
- Personalized recommendations based on user profile and interaction history
- Daily batch of curated papers fetched via ArXiv API
- Preference learning with feedback loop (like / save / skip)
- Summaries and recommendation rationale via LLM
- Frontend swipe UI and backend service integrating Astron Agent

#### 7. AI English Essay Assistant

**Description:** An AI-powered English essay grading and feedback assistant. Users submit their essay content, and the agent provides structured evaluation, points out grammar and expression issues, suggests improvements, offers example sentences/paragraphs, and estimates the essay level using IELTS or CEFR standards.

- **User Case:** [WeChat article](https://mp.weixin.qq.com/s/crbtWlKrWG9g3A7qxg8rFg)
- **Workflow:** [`AI-English-Essay-Assistant.yml`](https://github.com/TangXinyue00/AI-English-Essay-Assistant/blob/main/docker/astronAgent/AI-English-Essay-Assistant.yml)

**Key Features:**
- Structured evaluation covering organization, grammar, vocabulary, and logic
- Grammar error detection with specific correction suggestions
- Improved example sentences or revised paragraphs
- Proficiency estimation under IELTS or CEFR standards
- Clear, organized output format tailored for student feedback

#### 10. AI English Writing Practice Assistant

**Description:** An "practice-feedback" closed-loop system for middle-school students to improve English writing. Parents/teachers generate prompts in one click; students write online; AI instantly scores and gives improvement tips, while auto-saving history to help kids progress steadily.

- **User Case:** [WeChat article](https://mp.weixin.qq.com/s/pGZ9rU4AoTztirzCCa0t9Q)
- **Workflow:** [`english_writting_helper.yml`](https://github.com/onlyliuxin97/english_writting_helper/blob/main/workflow/english_writting_helper.yml)

**Key Features:**
- Grade-based random prompts from model essay knowledge base
- AI auto-scoring: grammar, vocabulary, structure, logic
- Instant feedback: error location + revision advice + high-score examples
- History log: all practices & comments saved for review
- One-click deploy: Flask web app + local Astron workflow

#### 15. History Knowledge QA Assistant

**Description:** The "History Knowledge QA" agent is your private history consultant, specializing in global historical events, cultural evolution, and important figures. Whether you are interested in the mysteries of ancient civilizations or turning points in modern history, it can provide accurate information and answer every question you have.

- **User Case:**
- **Workflow:** [2.yml](https://github.com/user-attachments/files/24560902/2.yml)
- **Hashtag Event:** Astron Training Camp · Cohort #1

**Key Features:**
- Real-time online search for information
- Text compliance detection to ensure safety
- Professional historical role-playing
- Precise history knowledge Q&A

#### 20. KET Essay Assistant

**Description:** A specialized assistant for KET exam essay writing. It analyzes requirements, generates outlines, writes drafts, polishes language, and checks word count compliance.

- **User Case:**
- **Workflow:** [20260107220916.yml](https://github.com/user-attachments/files/24612874/20260107220916.yml)
- **Hashtag Event:** Astron Training Camp · Cohort #1

**Key Features:**
- Essay requirement analysis
- Structured outline generation
- Draft writing & language polishing
- Word count compliance check

### Coding & Programming

(To be added)

### Finance & Investment

#### 24. Astron Stock Analyzer

**Description:** An intelligent stock analysis agent that aggregates market data, performs technical and fundamental analysis, and provides investment insights.

- **User Case:** [Video Showcase](https://www.youtube.com/watch?v=F4BY49pp2Rs&list=PLpSUIRpjMINCELDvnnHdVmPKEINljeluw&index=25&pp=iAQBsAgC)
- **Workflow:** [Astron-AI-Agent-StockAnalyzer](https://github.com/DungLai/Astron-AI-Agent-StockAnalyzer)

**Key Features:**
- Real-time stock data fetching
- Technical indicator analysis
- Fundamental data assessment
- Investment report generation

### Leisure & Entertainment

#### 11. Travel Companion

**Description:** An intelligent travel planning assistant that helps users design personalized travel routes, book accommodations, and provides real-time travel advice based on user preferences and budget.

- **User Case:** [CSDN Blog](https://blog.csdn.net/niaonao/article/details/156937747)
- **Workflow:** [Travel Companion.yml](https://github.com/niaonao/astron_resource/blob/main/resources/papers/%E6%97%85%E8%A1%8C%E6%90%AD%E5%AD%90.yml)
- **Hashtag Event:** Astron Training Camp · Cohort #1

**Key Features:**
- Personalized travel route planning
- Accommodation and transportation booking assistance
- Real-time travel advice and emergency support
- Integration with maps and weather services

#### 17. Drama Shortage Terminator

**Description:** Your personal film industry guardian and movie expert. Specialized in identifying movies from images, providing professional recommendations, and ensuring high-quality viewing experiences by filtering out bad movies.

- **User Case:**
- **Workflow:** [Pro.yml](https://github.com/user-attachments/files/24631399/Pro.yml)
- **Hashtag Event:** Astron Training Camp · Cohort #1

**Key Features:**
- Search movies by image (Image Understanding)
- Professional movie recommendations & reviews
- Real-time web search for movie info
- Compliance and safety filtering

#### 19. Network Novel Finder

**Description:** Find the latest online novels by entering the type of novel you want to find, and provide a brief introduction.

- **User Case:**
- **Workflow:** [default.yml](https://github.com/user-attachments/files/24615934/default.yml)
- **Hashtag Event:** Astron Training Camp · Cohort #1

**Key Features:**
- Extract novel type from user input
- Aggregate search for latest novels
- LLM-based recommendation and intro
- Personalized reading suggestions

### Health Partner

#### 18. Dog Nutritionist

**Description:** A professional nutrition consultant for your dogs. Provides customized dietary plans based on age, weight, and specific needs, backed by real-time nutritional knowledge search.

- **User Case:**
- **Workflow:** [default.yml](https://github.com/user-attachments/files/24577568/default.yml)
- **Hashtag Event:** Astron Training Camp · Cohort #1

**Key Features:**
- Customized nutrition plans (Age/Weight/etc.)
- Professional dietary advice via LLM
- Web search for nutritional knowledge
- Visual aids with Text-to-Image generation

## Contributing

We welcome contributions to this repository! If you have an Astron workflow or user case to share:

1. Fork this repository
2. Create a new branch for your contribution
3. Add your workflow and user case information
4. Submit a pull request with a detailed description

Please make sure your contribution includes:
- A clear description of the use case
- A link to the user case document (if available)
- A complete workflow YAML file
- A summary of key features

## License

This repository is licensed under the MIT License. For details, see the [LICENSE](LICENSE) file.

---

**Note:** This repository is a community-driven collection of Astron workflow examples. All user case links and workflow files are the property of their respective owners; references are provided for educational and informational purposes only.
