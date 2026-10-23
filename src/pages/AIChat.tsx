import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, Bot, User, Loader2, ShieldCheck } from 'lucide-react';
import Navigation from '../components/Navigation';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../contexts/LanguageContext';

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

function formatChatError(error: unknown, t: (key: string) => string) {
  if (!(error instanceof Error)) {
    return t('chat.error.generic');
  }

  if (error.message.includes('Missing server configuration: ASTRON_MAAS_API_KEY')) {
    return t('chat.error.configuration');
  }

  if (
    error.message.includes('Upstream API error: 401')
    || error.message.includes('Upstream API error: 403')
  ) {
    return t('chat.error.credentials');
  }

  if (error.message.includes('Upstream request timed out')) {
    return t('chat.error.timeout');
  }

  return t('chat.error.generic');
}

// Render markdown links as new-tab anchors (used in the greeting and replies).
const markdownComponents = {
  a: (props: React.ComponentPropsWithoutRef<'a'>) => (
    <a {...props} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" />
  ),
};

const AIChat: React.FC = () => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consent, setConsent] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

  const BASE_URL = '/api/chat';

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
          language,
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
        content: formatChatError(error, t),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm(t('chat.clearConfirm'))) {
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
              <h3 className="font-bold text-lg text-gray-900">{t('chat.consent.title')}</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                {t('chat.consent.providerPrefix')}{' '}
                <a
                  href="https://maas.xfyun.cn/modelSquare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline hover:opacity-80"
                >
                  {t('chat.consent.provider')}
                </a>{' '}
                {t('chat.consent.providerSuffix')}
              </p>
              <p>
                {t('chat.consent.logPrefix')}<strong>{t('chat.consent.logContent')}</strong>{t('chat.consent.logSuffix')}{' '}
                <Link to="/privacy" className="text-indigo-600 underline hover:opacity-80">
                  {t('chat.consent.policy')}
                </Link>
                {t('chat.consent.period')}
              </p>
              <p className="text-gray-500">{t('chat.consent.agreement')}</p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={acceptConsent}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                {t('chat.consent.accept')}
              </button>
              <Link
                to="/"
                className="w-full py-2.5 text-center text-gray-500 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                {t('chat.consent.decline')}
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
                <h2 className="font-bold text-lg">{t('chat.title')}</h2>
              </div>
            </div>
            <button 
              onClick={clearHistory}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title={t('chat.clearHistory')}
              aria-label={t('chat.clearHistory')}
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
                    <ReactMarkdown components={markdownComponents}>{t('chat.welcome')}</ReactMarkdown>
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
                    <span className="text-gray-500 text-sm">{t('chat.thinking')}</span>
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
                aria-label={t('chat.inputLabel')}
                placeholder={t(consent ? 'chat.inputPlaceholder' : 'chat.consentPlaceholder')}
                disabled={!consent}
                className="flex-grow p-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none max-h-32 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={1}
              />
              <button
                onClick={handleSend}
                aria-label={t('chat.send')}
                disabled={!input.trim() || isLoading || !consent}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-gray-400 text-center">
              {t('chat.poweredBy')}{' '}
              <a
                href="https://huggingface.co/collections/XHToken/spark-x26"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-indigo-600"
              >
                Spark-X2.6-4B
              </a>
              {' · '}
              <Link to="/privacy" className="underline hover:text-indigo-600">
                {t('chat.privacy')}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIChat;
