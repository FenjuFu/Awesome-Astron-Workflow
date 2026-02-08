# Awesome Astron 工作流

> 精选的 Astron 工作流示例和用户案例集合，用于 AI 驱动的应用程序

[![English](https://img.shields.io/badge/README-English-blue)](README.md) [![中文](https://img.shields.io/badge/README-%E4%B8%AD%E6%96%87-red)](README.zh-CN.md) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/FenjuFu/Awesome-Astron-Workflow)

## 目录

- [概述](#概述)
- [用户案例与工作流](#用户案例与工作流)
  - [办公提效](#办公提效)
    - [AI 简历助手](#1-ai-简历助手)
    - [AI 翻译器](#2-ai-翻译器)
    - [知识卡片整理助手](#9-知识卡片整理助手)
    - [公众号文章总结凝练](#12-公众号文章总结凝练)
    - [简历智优通](#13-简历智优通)
    - [文档问答助手 (Docs Workflow)](#22-文档问答助手-docs-workflow)
  - [创意写作](#创意写作)
    - [多平台内容写作](#3-多平台内容写作)
    - [AI 播客生成器](#4-ai-播客生成器)
    - [小说图文生成器](#8-小说图文生成器)
    - [词汇生图](#14-词汇生图)
    - [AI电台播客生成](#16-ai电台播客生成)
  - [学习助手](#学习助手)
    - [AI 课程生成器](#5-ai-课程生成器)
    - [论文推荐系统](#6-论文推荐系统)
    - [英语作文批改助手](#7-英语作文批改助手)
    - [AI 英语作文练习助手](#10-ai-英语作文练习助手)
    - [历史知识问答小助理](#15-历史知识问答小助理)
    - [KET作文助手](#20-ket作文助手)
  - [代码编程](#代码编程)
  - [休闲娱乐](#休闲娱乐)
    - [旅行搭子](#11-旅行搭子)
    - [剧荒终结者](#17-剧荒终结者)
    - [网络小说查找器](#19-网络小说查找器)
  - [健康搭档](#健康搭档)
    - [狗狗营养师](#18-狗狗营养师)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 概述

Astron 是一个强大的工作流引擎，专为构建 AI 驱动的应用程序而设计。本仓库收集真实世界的用户案例及其对应的工作流实现，帮助开发者了解如何利用 Astron 开发各种 AI 应用程序。

每个案例包括：
- 用户案例文档（微信公众号文章）
- 完整的工作流 YAML 文件
- 主要功能和特性概述

## 用户案例与工作流

### 办公提效

#### 21. bks-AI

**描述：** 一个“人人可用”的综合型 AI 助手工作流。它集成了多意图识别系统，能够智能区分用户需求（如咨询、订单查询或闲聊），结合联网搜索进行系统化的知识规整，并利用专属知识库提供精准的业务问答服务。

- **用户案例：** [视频演示](https://www.youtube.com/watch?v=weO_qGSQFI4&list=PLpSUIRpjMINCELDvnnHdVmPKEINljeluw&index=7&t=1s&pp=gAQBiAQBsAgC)
- **工作流：** [bks-AI.yml](https://github.com/CoderWanFeng/AwesomeAstronAgent/blob/main/bks-AI.yml)

**主要功能：**
- **智能意图分流**：精准识别咨询、订单查询与通用闲聊场景
- **联网深度搜索**：实时检索网络信息并进行结构化总结
- **专属知识库**：提供 Bks-AI 相关的专业业务解答
- **多路召回融合**：综合搜索结果、知识库与大模型生成回复

#### 1. AI 简历助手

**描述：** 智能简历优化工具，帮助求职者通过 AI 驱动的建议和格式化创建专业简历。

- **用户案例：** [微信公众号文章](https://mp.weixin.qq.com/s/t18r62JYsx8P_1jV_5f1Mg)
- **工作流：** [AI-Resume-Assistant.yml](https://github.com/justacoder99/AI-Resume-Assistant/blob/main/docker/astronAgent/AI-Resume-Assistant.yml)

**主要功能：**
- 简历内容分析和优化
- AI 驱动的写作建议
- 专业格式模板
- 行业特定关键词推荐
- 多格式导出支持

#### 2. AI 翻译器

**描述：** 高级翻译工具，提供准确的、上下文感知的翻译，支持多种语言和专业领域。

- **用户案例：** [微信公众号文章](https://mp.weixin.qq.com/s/ge52PHt_TQIkCcRl1m3B3w)
- **工作流：** [aitranslator.yml](https://github.com/aying20/aitranslator/blob/main/workflow/aitranslator.yml)

**主要功能：**
- 多语言翻译支持
- 上下文感知翻译引擎
- 领域特定翻译模式
- 批量翻译功能
- 翻译质量评估

#### 9. 知识卡片整理助手

**描述：** 将零散的学习笔记或工作记录通过 AI 重构为结构化知识卡片的智能体。用户只需输入原始笔记，Agent 自动解析、提炼要点并生成易读的知识卡片，方便后续查阅与复习。

- **用户案例：** [微信公众号文章](https://mp.weixin.qq.com/s/b0jgNvVPI3zz3A8jWRH0LA)
- **工作流：** [`knowledge-cards.yml`](https://github.com/fanan-uyun/Knowledge-Note-Cards/blob/main/docker/astronAgent/knowledge-cards.yml)

**主要功能：**
- 自动解析原始笔记文本
- AI 重构内容并提取关键信息
- 生成结构化知识卡片
- 支持自定义卡片模板
- 可导出多格式文件

#### 12. 公众号文章总结凝练

**描述：** 一个内容总结工具，能够提取并凝练微信公众号（及其他平台）的文章，使用 DeepSeek 模型生成简洁的摘要。

- **用户案例：**
- **工作流：** [default.yml](https://github.com/user-attachments/files/24495795/default.yml)
- **活动标签：** Astron Training Camp · Cohort #1

**主要功能：**
- 从 URL 提取内容（支持微信公众号等）
- AI 驱动的智能总结 (DeepSeek-V3.2)
- 生成约 350 字的精简摘要
- 支持 Markdown 格式输出

#### 13. 简历智优通

**描述：** 一个基于多模型 Agent Flow 的智能简历分析与求职辅助系统，支持 PDF 简历 OCR 解析、智能评估与岗位推荐。

- **用户案例：** [Resume Intelligence add](https://github.com/iflytek/astron-agent/discussions/824)
- **工作流：** [default.yml](https://github.com/user-attachments/files/24494434/default.yml)
- **活动标签：** Astron Training Camp · Cohort #1

**主要功能：**
- PDF 简历 OCR 解析
- 多轮交互补全信息
- 智能简历评估与岗位推荐
- 多大模型与工具编排

#### 22. 文档问答助手 (Docs Workflow)

**描述：** 一个智能问答助手，旨在根据特定的文档知识库回答问题。它充当专属助手（例如 HR 咨询），仅根据提供的文档提供准确的回复。

- **用户案例：** [视频演示](https://www.youtube.com/watch?v=n0gzapUwI3o)
- **工作流：** [Docs Workfow.yml](https://github.com/beaucarnes/astronagent/blob/main/Docs%20Workfow.yml)

**主要功能：**
- **知识库集成**：从特定文档库中检索信息
- **角色化问答**：配置为专属助手（如 HR 支持）
- **严格上下文遵循**：仅依据提供的文档回答，确保准确性
- **简洁友好**：提供清晰、简短且专业的回复


### 创意写作

#### 3. 多平台内容写作

**描述：** 综合内容创作工具，生成针对不同社交媒体和发布平台优化的平台特定内容。

- **用户案例：** [微信公众号文章](https://mp.weixin.qq.com/s/fVZJYtXTiPKMku_1ycOBpg)
- **工作流：** [多平台内容写作.yml](https://github.com/binggandata/ai_resource/blob/main/%E5%A4%9A%E5%B9%B3%E5%8F%B0%E5%86%85%E5%AE%B9%E5%86%99%E4%BD%9C.yml)

**主要功能：**
- 平台特定内容生成
- 多格式内容支持
- SEO 优化
- 内容调度和发布
- 分析和性能跟踪

#### 4. AI 播客生成器

**描述：** 自动化播客创作工具，通过自然语音合成和音频编辑将文本内容转换为引人入胜的音频体验。

- **用户案例：** [微信公众号文章](https://mp.weixin.qq.com/s/QKp2nTKGl0m8JTytc-0ibA)
- **工作流：** [AI 播客.yml](https://github.com/itwanger/PaiAgent/commit/7a4cf59d3e5302ffecdb95717c937afb2befa51a#diff-0c1529cd9f3a6d94ca74f4a60d460410f92c9c28278a980dbb4ad513cfefc913)

**主要功能：**
- 文本到语音转换
- 自然语音合成
- 音频编辑和增强
- 多说话人支持
- 播客分发集成

#### 8. 小说图文生成器

**描述：** 输入小说名称即可自动生成一篇完整的带配图小说文章。基于 Astron 工作流的「搭积木」式编排，一键创建智能体并可在高阶配置中开启联网、生图、代码等能力，完成后可发布到智能体广场。

- **用户案例：** [微信公众号文章](https://mp.weixin.qq.com/s/F4Uz30jw5Uo2WQSe-tO3xg)
- **工作流：** [小说图文生成.yml](https://github.com/XiongFeng1997/AI-Novel-Generation/blob/main/docker/astronAgent/%E5%B0%8F%E8%AF%B4%E5%9B%BE%E6%96%87%E7%94%9F%E6%88%90.yml)

**主要功能：**
- 输入小说名自动生成图文文章
- 提示词创建智能体并自动完善配置
- 高阶配置支持联网/生图/代码能力
- 工作流「搭积木」式可视化编排
- 可发布至智能体广场便于复用

#### 14. 词汇生图

**描述：** 只需输入一个词或一句诗，即可解析其中的文学意境，并生成专为 AI 绘画模型优化的视觉描述，让文字被“看见”。

- **用户案例：**
- **工作流：** [default.yml](https://github.com/user-attachments/files/24551622/default.yml)
- **活动标签：** Astron Training Camp · Cohort #1

**主要功能：**
- 文学意境深度解析
- 视觉描述优化生成
- 集成可灵 AI 绘画模型
- 从文字到视觉艺术的转化

#### 16. AI电台播客生成

**描述：** 一个能够将文字或公众号文章链接转化为生动有趣的电台播客内容的智能助手，支持语音合成和封面生成。

- **用户案例：**
- **工作流：** [AI.yml](https://github.com/user-attachments/files/24562655/AI.yml)
- **活动标签：** Astron Training Camp · Cohort #1

**主要功能：**
- 解析 URL 内容（支持公众号等）
- 生成播客风格脚本
- 超拟人语音合成
- AI 文生图制作封面

### 学习助手

#### 5. AI 课程生成器

**描述：** 智能课程创建平台，根据指定主题和学习目标生成教育内容、课程计划和学习材料。

- **用户案例：** [微信公众号文章](https://mp.weixin.qq.com/s/QHcwsQB29m_dDzkchIUvdQ)
- **工作流：** [课程生成器工作流](https://github.com/GitHubDaily/AI-Course-Generator/tree/main/workflow)

**主要功能：**
- 自动化课程内容生成
- 学习目标对齐
- 交互式内容创建
- 评估和测验生成
- 进度跟踪和分析

#### 6. 论文推荐系统

**描述：** 一个像刷短视频一样刷论文的 AI 学术论文推荐系统。用户每天收到推荐论文卡片，通过点赞、收藏或跳过的交互，Agent 学习偏好并持续优化推荐效果。

- **用户案例：** [微信公众号文章](https://mp.weixin.qq.com/s/vt3rN-P70IOJd5emdG2Gyw)
- **工作流：** [`spark_workflow_config.yml`](https://github.com/qwwzdyj/Xfind/blob/main/workflow/spark_workflow_config.yml)

**主要功能：**
- 基于用户画像与历史交互的个性化推荐
- 通过 ArXiv API 拉取最新论文，按天批量推送
- 点赞 / 收藏 / 跳过反馈闭环，持续学习偏好
- LLM 生成摘要与推荐理由，提升可读性
- 前端滑动式交互、后端服务与 Astron Agent 集成

#### 7. 英语作文批改助手

**描述：** 一个 AI 驱动的英语作文批改与反馈助手。用户提交作文内容后，Agent 将提供结构化评价，指出语法与表达问题，给出修改建议与示例句/段，并按雅思或 CEFR 标准估计作文等级。

- **用户案例：** [微信公众号文章](https://mp.weixin.qq.com/s/crbtWlKrWG9g3A7qxg8rFg)
- **工作流：** [`AI-English-Essay-Assistant.yml`](https://github.com/TangXinyue00/AI-English-Essay-Assistant/blob/main/docker/astronAgent/AI-English-Essay-Assistant.yml)

**主要功能：**
- 覆盖组织结构、语法、词汇、逻辑的综合评价
- 精准定位语法错误并给出具体修改建议
- 提供更优的例句或修订段落示例
- 按雅思或 CEFR 标准进行水平估计
- 输出格式清晰、适合学生阅读与改进

#### 10. AI 英语作文练习助手

**描述：** 面向中学生的 AI 英语作文“练习-反馈”闭环系统。家长/老师一键出题，学生在线写作，AI 即时给出评分与改进建议，并自动保存历史记录，帮助孩子持续、高效地提升英语写作水平。

- **用户案例：** [微信公众号文章](https://mp.weixin.qq.com/s/pGZ9rU4AoTztirzCCa0t9Q)
- **工作流：** [`english_writting_helper.yml`](https://github.com/onlyliuxin97/english_writting_helper/blob/main/workflow/english_writting_helper.yml)

**主要功能：**
- 按年级随机生成作文题目（基于范文知识库）
- AI 自动评分：语法、词汇、结构、逻辑四维评价
- 即时反馈：错误定位 + 修改建议 + 高分表达示范
- 历史记录：自动保存所有练习与评语，便于回顾
- 一键部署：Flask Web 系统 + 本地 Astron 工作流

#### 15. 历史知识问答小助理

**描述：** “历史知识问答”智能体是您的私人历史顾问，专业涵盖全球历史事件、文化演变和重要人物。无论您对古代文明的奥秘还是现代历史的转折点感兴趣，它都能提供准确信息，解答您的每一个疑问。

- **用户案例：**
- **工作流：** [2.yml](https://github.com/user-attachments/files/24560902/2.yml)
- **活动标签：** Astron Training Camp · Cohort #1

**主要功能：**
- 联网搜索实时信息
- 文本合规检测确保安全
- 专业历史角色扮演
- 精准历史知识问答

#### 20. KET作文助手

**描述：** “KET作文助手”是专为KET考试写作设计的智能助手。自动分析题目要求，生成提纲，撰写初稿并进行润色，最后检查字数是否达标。

- **用户案例：**
- **工作流：** [20260107220916.yml](https://github.com/user-attachments/files/24612874/20260107220916.yml)
- **活动标签：** Astron Training Camp · Cohort #1

**主要功能：**
- 作文要求智能分析
- 结构化提纲生成
- 初稿撰写与语言润色
- 字数合规检查

### 代码编程

（待添加）

### 休闲娱乐

#### 11. 旅行搭子

**描述：** 一个智能旅行规划助手，根据用户的偏好和预算，帮助设计个性化的旅行路线、预订住宿，并提供实时的旅行建议。

- **用户案例：** [CSDN 博客](https://blog.csdn.net/niaonao/article/details/156937747)
- **工作流：** [旅行搭子.yml](https://github.com/niaonao/astron_resource/blob/main/resources/papers/%E6%97%85%E8%A1%8C%E6%90%AD%E5%AD%90.yml)
- **活动标签：** Astron Training Camp · Cohort #1

**主要功能：**
- 个性化旅行路线规划
- 住宿和交通预订协助
- 实时旅行建议和应急支持
- 集成地图和天气服务

#### 17. 剧荒终结者

**描述：** “我是影坛守护者，精通电影圈的梗与秘辛。作为资深影迷，我挑剔每一帧画面，每一句对白，绝不容忍烂片的存在。在我这里，只有经典和佳作得以流传，让每一次观影都成为不可多得的艺术享受。”

- **用户案例：**
- **工作流：** [Pro.yml](https://github.com/user-attachments/files/24631399/Pro.yml)
- **活动标签：** Astron Training Camp · Cohort #1

**主要功能：**
- 以图搜剧（图片理解）
- 专业影视推荐与点评
- 联网搜索实时影视信息
- 内容合规与安全过滤

#### 19. 网络小说查找器

**描述：** “网络小说查找器”通过输入想查找的小说类型，查找最新的网络小说，并提供简介。

- **用户案例：**
- **工作流：** [default.yml](https://github.com/user-attachments/files/24615934/default.yml)
- **活动标签：** Astron Training Camp · Cohort #1

**主要功能：**
- 小说类型提取
- 聚合搜索最新小说
- 大模型推荐与简介生成
- 个性化阅读建议

### 健康搭档

#### 18. 狗狗营养师

**描述：** “狗狗也有一个专业的营养师。” 可以为你的狗狗提供专业的营养建议，帮助它们保持健康快乐的生活。

- **用户案例：**
- **工作流：** [default.yml](https://github.com/user-attachments/files/24577568/default.yml)
- **活动标签：** Astron Training Camp · Cohort #1

**主要功能：**
- 定制化营养方案（年龄/体重/绝育等）
- 专业饮食建议（大模型角色扮演）
- 联网搜索营养知识
- 文生图生成视觉辅助


## 贡献指南

我们欢迎对本仓库的贡献！如果您有想要分享的 Astron 工作流或用户案例，请：

1. Fork 本仓库
2. 为您的新贡献创建一个新分支
3. 添加您的工作流和用户案例信息
4. 提交带有详细描述的拉取请求

请确保您的贡献包括：
- 用例的清晰描述
- 用户案例文档链接（如果有）
- 完整的工作流 YAML 文件
- 主要功能和特性概述

## 许可证

本仓库采用 MIT 许可证。详细信息请参见 [LICENSE](LICENSE) 文件。

---

**注意：** 本仓库作为社区驱动的 Astron 工作流示例集合。所有用户案例链接和工作流文件均为其各自所有者的财产，此处引用仅供教育和参考目的。
