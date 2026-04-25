import React, { useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { toPng } from 'html-to-image';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Download } from 'lucide-react';

const AstronLandscape: React.FC = () => {
  const { language } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    if (cardRef.current === null) {
      return;
    }

    const exportNode = cardRef.current;

    const waitForFonts = document.fonts ? document.fonts.ready : Promise.resolve();

    waitForFonts
      .then(() =>
        toPng(exportNode, {
          cacheBust: true,
          width: 1280,
          height: 720,
          pixelRatio: 2,
          skipAutoScale: true,
          style: {
            margin: '0',
            transform: 'none',
          },
        })
      )
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `astron-landscape-${language}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('oops, something went wrong!', err);
        });
  }, [language]);

  const isZH = language === 'zh-CN';

  const content = {
    title: isZH ? '讯飞 Astron 开源项目全景图' : 'iFLYTEK Astron Open Source Project Landscape',
    subtitle: isZH ? '全球首个企业级智能体开源生态全景图' : 'The World\'s First Enterprise-grade Agent Open Source Ecosystem Landscape',
    badge: isZH ? '关系视图' : 'Relations View',
    orchestration: isZH ? '驱动编排' : 'Powers Orchestration',
    apis: isZH ? '提供 API' : 'Provides APIs',
    rpa: isZH ? '触发 RPA' : 'Triggers RPA',
    capabilities: isZH ? '提供能力' : 'Provides Capabilities',
    groups: {
      workflow: {
        header: isZH ? '智能体工作流 (agentic-workflow)' : 'agentic-workflow',
        title: isZH ? '工作流平台' : 'Workflow Platform',
        desc: isZH ? '企业级、商用友好的智能体工作流平台，用于构建下一代超级智能体（SuperAgents）。提供核心编排和 MCP 能力。' : 'Enterprise-grade, commercial-friendly agentic workflow platform for building next-generation SuperAgents. Provides core orchestration and MCP capabilities.',
        tags: isZH ? ['Java', 'Python', '工作流', 'AI', 'MCP', '多智能体'] : ['Java', 'Python', 'workflow', 'ai', 'mcp', 'multi-agent']
      },
      automation: {
        header: isZH ? '智能体自动化 (agentic-automation)' : 'agentic-automation',
        title: isZH ? '自动化套件' : 'Automation Suite',
        desc: isZH ? '面向智能体的 RPA 套件，内置开箱即用的自动化工具。专为个人和企业打造。' : 'Agent-ready RPA suite with out-of-the-box automation tools. Built for individuals and enterprises.',
        tags: isZH ? ['Java', 'Python', '自动化', 'RPA', '低代码'] : ['Java', 'Python', 'automation', 'rpa', 'low-code']
      },
      skills: {
        header: isZH ? '智能体技能 (agent-skills)' : 'agent-skills',
        official: {
          title: isZH ? '讯飞官方技能库' : 'Official iFLYTEK Skills',
          desc: isZH ? '讯飞官方技能库，包含语音、OCR、翻译及多模态 AI 能力。' : 'Official collection of iFLYTEK skills for speech, OCR, translation, and multimodal AI capabilities.',
          tags: isZH ? ['Python', '语音', 'OCR', '多模态'] : ['Python', 'speech', 'ocr', 'multimodal']
        },
        registry: {
          title: isZH ? '技能注册表' : 'Skill Registry',
          desc: isZH ? '私有化智能体技能注册表。支持基于角色访问控制（RBAC）的技能包发布与版本管理。' : 'Self-hosted agent skill registry. Publish & version skill packages with RBAC.',
          tags: isZH ? ['Java', '技能管理', '治理'] : ['Java', 'skill-manager', 'governance']
        }
      },
      tutorial: {
        header: isZH ? '教程指南 (tutorial)' : 'tutorial',
        title: isZH ? '从零到一掌握工作流' : 'Zero to Workflow',
        desc: isZH ? '掌握 AstronClaw（云端 AI）与 Loomy（桌面 AI）的完整教程。' : 'A complete tutorial to master AstronClaw (cloud AI) & Loomy (desktop AI).',
        tags: isZH ? ['学习', '指南'] : ['learning', 'guide']
      },
      management: {
        header: isZH ? '智能体管理 (agent-management)' : 'agent-management',
        title: isZH ? '桌面应用程序' : 'Desktop App',
        desc: isZH ? '基于 Electron 的桌面应用程序，旨在无缝管理、对话及操作 AI 智能体与技能。' : 'Electron-based desktop application designed to manage, chat with, and operate AI agents and skills seamlessly.',
        tags: isZH ? ['TypeScript', '智能体客户端', '桌面端'] : ['TypeScript', 'agent-client', 'desktop']
      },
      engine: {
        header: isZH ? '智能体引擎 (agent-engine)' : 'agent-engine',
        title: 'harnessclaw-engine',
        desc: isZH ? '基于 Go 语言构建的大模型编程助手引擎，支持 WebSocket、多轮对话、工具调用及权限管理。' : 'LLM programming assistant engine built with Go, supporting WebSocket, multi-turn dialogues, tool calling, and permissions.',
        tags: isZH ? ['Go', '引擎', 'WebSocket'] : ['Go', 'engine', 'websocket']
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex flex-col items-center pt-24 pb-8 px-4 overflow-hidden relative">
        {/* Ambient background bubbles for the whole page */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute w-[600px] h-[600px] -top-48 -left-48 bg-blue-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute w-[400px] h-[400px] bottom-0 right-0 bg-indigo-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="scale-container flex justify-center items-start w-full overflow-auto">
          <div
            style={{
              transform: 'scale(min(calc((100vw - 40px) / 1280), calc((100vh - 220px) / 720), 1))',
              transformOrigin: 'center top',
            }}
          >
            <div
              ref={cardRef}
              className="card-container bg-blue-50/30 backdrop-blur-xl border-2 border-white/60 shadow-2xl flex flex-col shrink-0 rounded-2xl relative"
              style={{
                width: '1280px',
                height: '720px',
                background: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 40%, #7dd3fc 100%)',
                fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
              }}
            >
            {/* Ambient bubbles inside card */}
            <div className="absolute w-16 h-16 top-[15%] left-[20%] rounded-full bg-white/40 border border-white/50 shadow-inner" />
            <div className="absolute w-10 h-10 top-[30%] left-[80%] rounded-full bg-white/40 border border-white/50 shadow-inner" />
            <div className="absolute w-20 h-20 top-[60%] left-[15%] rounded-full bg-white/40 border border-white/50 shadow-inner" />
            <div className="absolute w-8 h-8 top-[70%] left-[85%] rounded-full bg-white/40 border border-white/50 shadow-inner" />
            <div className="absolute w-12 h-12 top-[25%] left-[60%] rounded-full bg-white/40 border border-white/50 shadow-inner" />

            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 bg-transparent border-b-2 border-white/50 relative z-[100]">
              <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 drop-shadow-sm">
                <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                {content.title}
              </div>
              <div className="text-sm text-slate-800 font-semibold flex items-center gap-2 drop-shadow-sm whitespace-nowrap">
                {content.subtitle}
                <span className="bg-white/60 text-indigo-600 px-2.5 py-1 rounded-xl text-xs font-bold border border-white/90 shadow-sm whitespace-nowrap">
                  {content.badge}
                </span>
              </div>
            </div>

            {/* Ecosystem Relationships Overlay SVG */}
            <svg width="1280" height="720" className="absolute top-0 left-0 pointer-events-none z-50">
              <defs>
                <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L0,8 L8,4 z" fill="#6366f1" />
                </marker>
                <marker id="arrowPink" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L0,8 L8,4 z" fill="#ec4899" />
                </marker>
                <marker id="arrowTeal" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L0,8 L8,4 z" fill="#14b8a6" />
                </marker>
              </defs>
              
              <g fill="none" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.85">
                {/* Engine -> Workflow */}
                <path d="M 980 450 C 800 480, 700 380, 500 350" stroke="#6366f1" markerEnd="url(#arrowBlue)" />
                {/* Engine -> Management */}
                <path d="M 1250 500 C 1300 450, 1300 300, 1250 250" stroke="#6366f1" markerEnd="url(#arrowBlue)" />
                {/* Workflow -> Automation */}
                <path d="M 50 320 C 15 380, 15 450, 45 495" stroke="#14b8a6" markerEnd="url(#arrowTeal)" />
                {/* Skills -> Workflow */}
                <path d="M 570 160 C 550 100, 510 100, 490 160" stroke="#ec4899" markerEnd="url(#arrowPink)" />
              </g>

              <g fontSize="12" fontWeight="700" fill="#334155" style={{ textShadow: '0 0 4px #fff, 0 0 8px #fff' }}>
                <text x="740" y="415" textAnchor="middle" fill="#4f46e5" className="select-none">{content.orchestration}</text>
                <text x="1270" y="375" textAnchor="end" fill="#4f46e5" className="select-none">{content.apis}</text>
                <text x="20" y="435" textAnchor="start" fill="#0d9488" className="select-none">{content.rpa}</text>
                <text x="530" y="115" textAnchor="middle" fill="#db2777" className="select-none">{content.capabilities}</text>
              </g>
            </svg>

            {/* Treemap Content */}
            <div className="flex-1 flex gap-3 p-3 bg-transparent">
              {/* Column 1 (Left): Agent & Automation */}
              <div className="w-[42%] flex flex-col gap-3">
                <div className="flex flex-col bg-white/25 backdrop-blur-md border border-white/60 rounded-xl overflow-hidden shadow-lg h-[58%]">
                  <div className="h-[30px] flex items-center px-3 text-[13px] text-slate-900 font-extrabold uppercase tracking-wider border-b border-white/50">
                    {content.groups.workflow.header}
                  </div>
                  <div className="flex-1 flex p-2">
                    <div className="w-full flex flex-col p-4 rounded-lg border border-white/80 shadow-inner bg-gradient-to-br from-sky-100/60 to-sky-200/70 text-sky-900 relative z-10">
                      <div className="text-[13px] font-bold mb-2 opacity-85 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z" /></svg>
                        iflytek / astron-agent
                      </div>
                      <div className="text-2xl font-extrabold mb-2 leading-tight tracking-tight">{content.groups.workflow.title}</div>
                      <div className="text-sm leading-relaxed font-medium opacity-90 mb-3 flex-1">{content.groups.workflow.desc}</div>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {content.groups.workflow.tags.map(tag => (
                          <span key={tag} className="text-[11px] px-3 py-1 rounded-xl bg-white/85 font-bold border border-white shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                            {tag === 'Java' && <div className="w-1.5 h-1.5 rounded-full bg-[#b07219]" />}
                            {tag === 'Python' && <div className="w-1.5 h-1.5 rounded-full bg-[#3572A5]" />}
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col bg-white/25 backdrop-blur-md border border-white/60 rounded-xl overflow-hidden shadow-lg h-[42%]">
                  <div className="h-[30px] flex items-center px-3 text-[13px] text-slate-900 font-extrabold uppercase tracking-wider border-b border-white/50">
                    {content.groups.automation.header}
                  </div>
                  <div className="flex-1 flex p-2">
                    <div className="w-full flex flex-col p-4 rounded-lg border border-white/80 shadow-inner bg-gradient-to-br from-teal-100/60 to-teal-200/70 text-teal-900 relative z-10">
                      <div className="text-[13px] font-bold mb-2 opacity-85 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z" /></svg>
                        iflytek / astron-rpa
                      </div>
                      <div className="text-xl font-extrabold mb-2 leading-tight tracking-tight">{content.groups.automation.title}</div>
                      <div className="text-sm leading-relaxed font-medium opacity-90 mb-3 flex-1">{content.groups.automation.desc}</div>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {content.groups.automation.tags.map(tag => (
                          <span key={tag} className="text-[11px] px-3 py-1 rounded-xl bg-white/85 font-bold border border-white shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                            {tag === 'Java' && <div className="w-1.5 h-1.5 rounded-full bg-[#b07219]" />}
                            {tag === 'Python' && <div className="w-1.5 h-1.5 rounded-full bg-[#3572A5]" />}
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2 (Center): Skills & Tutorial */}
              <div className="w-[33%] flex flex-col gap-3">
                <div className="flex flex-col bg-white/25 backdrop-blur-md border border-white/60 rounded-xl overflow-hidden shadow-lg h-[65%]">
                  <div className="h-[30px] flex items-center px-3 text-[13px] text-slate-900 font-extrabold uppercase tracking-wider border-b border-white/50">
                    {content.groups.skills.header}
                  </div>
                  <div className="flex-1 flex flex-col gap-2 p-2">
                    <div className="h-[55%] flex flex-col p-4 rounded-lg border border-white/80 shadow-inner bg-gradient-to-br from-green-100/60 to-green-200/70 text-green-900 relative z-10">
                      <div className="text-[13px] font-bold mb-2 opacity-85 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z" /></svg>
                        iflytek / iFly-Skills
                      </div>
                      <div className="text-xl font-extrabold mb-2 leading-tight tracking-tight">{content.groups.skills.official.title}</div>
                      <div className="text-sm leading-relaxed font-medium opacity-90 mb-3 flex-1">{content.groups.skills.official.desc}</div>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {content.groups.skills.official.tags.map(tag => (
                          <span key={tag} className="text-[11px] px-3 py-1 rounded-xl bg-white/85 font-bold border border-white shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                            {tag === 'Python' && <div className="w-1.5 h-1.5 rounded-full bg-[#3572A5]" />}
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="h-[45%] flex flex-col p-4 rounded-lg border border-white/80 shadow-inner bg-gradient-to-br from-emerald-200/60 to-emerald-300/70 text-green-900 relative z-10">
                      <div className="text-[13px] font-bold mb-2 opacity-85 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z" /></svg>
                        iflytek / skillhub
                      </div>
                      <div className="text-lg font-extrabold mb-1 leading-tight tracking-tight">{content.groups.skills.registry.title}</div>
                      <div className="text-[13px] leading-relaxed font-medium opacity-90 mb-2 flex-1">{content.groups.skills.registry.desc}</div>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {content.groups.skills.registry.tags.map(tag => (
                          <span key={tag} className="text-[11px] px-3 py-1 rounded-xl bg-white/85 font-bold border border-white shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                            {tag === 'Java' && <div className="w-1.5 h-1.5 rounded-full bg-[#b07219]" />}
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col bg-white/25 backdrop-blur-md border border-white/60 rounded-xl overflow-hidden shadow-lg h-[35%]">
                  <div className="h-[30px] flex items-center px-3 text-[13px] text-slate-900 font-extrabold uppercase tracking-wider border-b border-white/50">
                    {content.groups.tutorial.header}
                  </div>
                  <div className="flex-1 flex p-2">
                    <div className="w-full flex flex-col p-4 rounded-lg border border-white/80 shadow-inner bg-gradient-to-br from-yellow-100/60 to-yellow-200/70 text-yellow-900 relative z-10">
                      <div className="text-[13px] font-bold mb-2 opacity-85 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z" /></svg>
                        iflytek / astronclaw-tutorial
                      </div>
                      <div className="text-xl font-extrabold mb-2 leading-tight tracking-tight">{content.groups.tutorial.title}</div>
                      <div className="text-sm leading-relaxed font-medium opacity-90 mb-3 flex-1">{content.groups.tutorial.desc}</div>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {content.groups.tutorial.tags.map(tag => (
                          <span key={tag} className="text-[11px] px-3 py-1 rounded-xl bg-white/85 font-bold border border-white shadow-sm whitespace-nowrap">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3 (Right): Desktop App & Engine */}
              <div className="w-[25%] flex flex-col gap-3">
                <div className="flex flex-col bg-white/25 backdrop-blur-md border border-white/60 rounded-xl overflow-hidden shadow-lg h-[50%]">
                  <div className="h-[30px] flex items-center px-3 text-[13px] text-slate-900 font-extrabold uppercase tracking-wider border-b border-white/50">
                    {content.groups.management.header}
                  </div>
                  <div className="flex-1 flex p-2">
                    <div className="w-full flex flex-col p-4 rounded-lg border border-white/80 shadow-inner bg-gradient-to-br from-purple-100/60 to-purple-200/70 text-purple-900 relative z-10">
                      <div className="text-[13px] font-bold mb-2 opacity-85 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z" /></svg>
                        harnessclaw / harnessclaw
                      </div>
                      <div className="text-xl font-extrabold mb-2 leading-tight tracking-tight">{content.groups.management.title}</div>
                      <div className="text-sm leading-relaxed font-medium opacity-90 mb-3 flex-1">{content.groups.management.desc}</div>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {content.groups.management.tags.map(tag => (
                          <span key={tag} className="text-[11px] px-3 py-1 rounded-xl bg-white/85 font-bold border border-white shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                            {tag === 'TypeScript' && <div className="w-1.5 h-1.5 rounded-full bg-[#3178c6]" />}
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col bg-white/25 backdrop-blur-md border border-white/60 rounded-xl overflow-hidden shadow-lg h-[50%]">
                  <div className="h-[30px] flex items-center px-3 text-[13px] text-slate-900 font-extrabold uppercase tracking-wider border-b border-white/50">
                    {content.groups.engine.header}
                  </div>
                  <div className="flex-1 flex p-2">
                    <div className="w-full flex flex-col p-4 rounded-lg border border-white/80 shadow-inner bg-gradient-to-br from-indigo-100/60 to-indigo-200/70 text-indigo-900 relative z-10">
                      <div className="text-[13px] font-bold mb-2 opacity-85 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z" /></svg>
                        harnessclaw / harnessclaw
                      </div>
                      <div className="text-xl font-extrabold mb-2 leading-tight tracking-tight">{content.groups.engine.title}</div>
                      <div className="text-sm leading-relaxed font-medium opacity-90 mb-3 flex-1">{content.groups.engine.desc}</div>
                      <div className="mt-auto flex items-end gap-3">
                        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                          {content.groups.engine.tags.map(tag => (
                            <span key={tag} className="text-[11px] px-3 py-1 rounded-xl bg-white/85 font-bold border border-white shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                              {tag === 'Go' && <div className="w-1.5 h-1.5 rounded-full bg-[#00ADD8]" />}
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="shrink-0 bg-white/60 backdrop-blur-md p-1 rounded-lg border border-white/80 shadow-md">
                          <img
                            src="/iflytek-astron.png"
                            alt="QR Code"
                            className="w-16 h-16 rounded-sm mix-blend-multiply opacity-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              <div className="h-3 bg-transparent" />
            </div>
          </div>
        </div>

        {/* Save Button - Fixed at bottom right for better accessibility and no obstruction */}
        <button
          onClick={handleDownload}
          className="fixed bottom-10 right-10 flex items-center gap-2 px-6 py-3 bg-indigo-600/90 hover:bg-indigo-700 backdrop-blur-md text-white rounded-full transition-all shadow-2xl font-bold z-[200] hover:scale-105 active:scale-95 group"
        >
          <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
          {isZH ? '保存高清图片' : 'Save HD Image'}
        </button>
      </main>
      
      <Footer />
    </div>
  );
};

export default AstronLandscape;
