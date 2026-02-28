import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import GitHubConnect from '../components/GitHubConnect';
import { useLanguage } from '../contexts/LanguageContext';

const ContributionStats: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('contribute.github.title') || 'Contribution Statistics'}
            </h1>
            <p className="text-gray-600">
              {t('contribute.github.subtitle') || 'Detailed breakdown of your contributions to the Astron ecosystem.'}
            </p>
          </div>
          
          <GitHubConnect />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContributionStats;
