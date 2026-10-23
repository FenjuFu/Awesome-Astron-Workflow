import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Navigation from '../components/Navigation';
import { useLanguage } from '../contexts/LanguageContext';

const UPDATED = '2026-05-29';

const Privacy: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 prose prose-sm sm:prose max-w-none">
          <h1>{t('chat.privacy')}</h1>
          <p className="text-gray-500">{t('privacy.updated')} {UPDATED}</p>
          <ReactMarkdown components={{
            a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          }}>
            {t('privacy.content')}
          </ReactMarkdown>
          <p><Link to="/chat">{t('privacy.back')}</Link></p>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
