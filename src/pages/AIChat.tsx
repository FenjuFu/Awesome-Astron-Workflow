import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, Bot, User, Loader2, ShieldCheck } from 'lucide-react';
import Navigation from '../components/Navigation';
import ReactMarkdown from 'react-markdown';

const CONSENT_KEY = 'astron_chat_consent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatApiResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: string;
  details?: string;
}

function formatChatError(error: unknown) {
  if (!(error instanceof Error)) {
    return '抱歉，我现在无法处理您的请求。请稍后再试。';
  }

  if (error.message.includes('Missing server configuration: ASTRON_MAAS_API_KEY')) {
    return '抱歉，AI Chat 尚未完成配置。请在项目根目录的 `.env` 中设置 `ASTRON_MAAS_API_KEY`，或在部署平台补充同名环境变量后重试。';
  }

  if (
    error.message.includes('Upstream API error: 401')
    || error.message.includes('Upstream API error: 403')
  ) {
    return '抱歉，AI Chat 的服务凭证无效或权限不足，请检查 `ASTRON_MAAS_API_KEY` 是否填写正确。';
  }

  if (error.message.includes('Upstream request timed out')) {
    return '抱歉，AI Chat 响应超时，请稍后再试。';
  }

  return `抱歉，AI Chat 暂时不可用：${error.message}`;
}

// Default greeting shown (as an assistant bubble) before the first message.
const WELCOME_MARKDOWN = `你好！我是 **Astron 学习助手（Learning Assistant）** 🤖

欢迎来到 **iFLYTEK Astron 智能体开源项目**！🚀 Astron 是企业级 AI Agent 开源项目矩阵，涵盖 Agent 工作流编排、RPA 自动化、MCP 工具生态、企业级技能管理、多智能体协同等核心能力，助力打造可规模化落地的 SuperAgents。

请问你有什么需求？希望先体验哪款工具？告诉我，我会为你推荐并引导下一步操作。

- 🌐 项目全景图：[awesome-astron-workflow.dev/landscape](https://awesome-astron-workflow.dev/landscape)
- 💻 参与项目贡献：[github.com/topics/iflytek-astron](https://github.com/topics/iflytek-astron) —— ⭐ Star ｜ 🍴 Fork ｜ 🐞 Issue ｜ 🔧 PR，参与社区共建即可攒积分换好礼
- 🎁 社区积分商城：[awesome-astron-workflow.dev/stats](https://awesome-astron-workflow.dev/stats)`;

// Render markdown links as new-tab anchors (used in the greeting and replies).
const markdownComponents = {
  a: (props: React.ComponentPropsWithoutRef<'a'>) => (
    <a {...props} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" />
  ),
};

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consent, setConsent] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

  const BASE_URL = '/api/chat';
  const MODEL = 'astron-code-latest';

  // Load chat history + consent state from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('astron_chat_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }

    const savedConsent = localStorage.getItem(CONSENT_KEY);
    if (savedConsent === 'granted') {
      setConsent(true);
    } else {
      setShowConsentModal(true);
    }
  }, []);

  const acceptConsent = () => {
    localStorage.setItem(CONSENT_KEY, 'granted');
    setConsent(true);
    setShowConsentModal(false);
  };

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('astron_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      previousMessageCountRef.current = 0;
      return;
    }

    const behavior = previousMessageCountRef.current === 0 ? 'auto' : 'smooth';
    if (messages.length !== previousMessageCountRef.current) {
      scrollToBottom(behavior);
    }

    previousMessageCountRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      scrollToBottom('smooth');
    }
  }, [isLoading]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!consent) {
      setShowConsentModal(true);
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: newMessages,
          max_tokens: 32768,
          temperature: 0.7,
          logConsent: consent,
        }),
      });

      const data: ChatApiResponse = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      const assistantContent = data.choices?.[0]?.message?.content;
      if (!assistantContent) {
        throw new Error('AI response payload is missing message content');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI response', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: formatChatError(error),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('确定要清空所有聊天记录吗？')) {
      setMessages([]);
      localStorage.removeItem('astron_chat_history');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col pt-16 overflow-hidden">
      <Navigation />

      {/* Consent gate modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">使用前须知</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                为了向你返回回答，你的提问会发送至{' '}
                <a
                  href="https://maas.xfyun.cn/modelSquare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline hover:opacity-80"
                >
                  讯飞星辰 MaaS
                </a>{' '}
                进行大模型推理。
              </p>
              <p>
                在你同意后，我们会将<strong>问答内容</strong>保存到受控的后端数据库，仅用于分析高频问题、改进知识库与产品体验，不会出售你的数据。详情见{' '}
                <Link to="/privacy" className="text-indigo-600 underline hover:opacity-80">
                  《隐私政策》
                </Link>
                。
              </p>
              <p className="text-gray-500">点击“同意并开始”即表示你已阅读并同意上述说明。</p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={acceptConsent}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                同意并开始
              </button>
              <Link
                to="/"
                className="w-full py-2.5 text-center text-gray-500 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                暂不使用
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-1 min-h-0 container mx-auto px-4 py-8 flex flex-col max-w-5xl overflow-hidden">
        <div className="bg-white rounded-2xl shadow-xl flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Astron AI Assistant</h2>
              </div>
            </div>
            <button 
              onClick={clearHistory}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] space-x-3 flex-row">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="p-4 rounded-2xl shadow-sm prose prose-sm max-w-none bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100">
                    <ReactMarkdown components={markdownComponents}>{WELCOME_MARKDOWN}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                      {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm prose prose-sm max-w-none ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                      <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-3">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="text-gray-500 text-sm">AI 正在思考...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
            <div className="relative flex items-end space-x-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={consent ? '输入您的问题...' : '请先阅读并同意隐私政策后开始对话'}
                disabled={!consent}
                className="flex-grow p-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none max-h-32 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !consent}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-gray-400 text-center">
              Powered by{' '}
              <a
                href="https://maas.xfyun.cn/modelSquare"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-indigo-600"
              >
                讯飞星辰 MaaS
              </a>
              {' · '}
              <Link to="/privacy" className="underline hover:text-indigo-600">
                隐私政策
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIChat;
