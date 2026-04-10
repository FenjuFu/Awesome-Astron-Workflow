import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';

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

const AIChat: React.FC = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const BASE_URL = '/api/chat';
  const MODEL = 'astron-code-latest';

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('astron_chat_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('astron_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
        content: error instanceof Error
          ? `抱歉，AI Chat 暂时不可用：${error.message}`
          : '抱歉，我现在无法处理您的请求。请稍后再试。',
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
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col max-w-5xl">
        <div className="bg-white rounded-2xl shadow-xl flex flex-col h-[75vh] overflow-hidden">
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
          <div className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <Bot className="w-16 h-16 opacity-20" />
                <p className="text-lg">开始一段对话吧！您可以向我询问任何编程或工作流相关的问题。</p>
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
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
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
            <div ref={messagesEndRef} />
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
                placeholder="输入您的问题..."
                className="flex-grow p-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none max-h-32 transition-all duration-200"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-gray-400 text-center">
              Powered by Astron Coding Plan
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIChat;
