import React from 'react';
import { Github, Plus, Edit3, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import GitHubContributionInsights from './GitHubContributionInsights';
import ContributionViewer from './ContributionViewer';

const Contribute: React.FC = () => {
  const { t } = useLanguage();
  const [token, setToken] = React.useState<string | null>(() => localStorage.getItem('github_access_token'));

  React.useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('github_access_token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const contributionSteps = [
    {
      icon: Github,
      title: t('contribute.steps.fork.title'),
      description: t('contribute.steps.fork.description')
    },
    {
      icon: Plus,
      title: t('contribute.steps.add.title'),
      description: t('contribute.steps.add.description')
    },
    {
      icon: Edit3,
      title: t('contribute.steps.document.title'),
      description: t('contribute.steps.document.description')
    },
    {
      icon: Star,
      title: t('contribute.steps.submit.title'),
      description: t('contribute.steps.submit.description')
    }
  ];

  return (
    <section id="contribute" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('contribute.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contribute.subtitle')}
          </p>
        </div>

        {/* Contribution Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contributionSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                    <IconComponent className="h-8 w-8 text-indigo-600" />
                  </div>
                  {index < contributionSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-indigo-200 transform -translate-x-1/2"></div>
                  )}
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* What to Contribute */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('contribute.guidelines.title')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('contribute.guidelines.workflow.title')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {t('contribute.guidelines.workflow.description')}
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('contribute.guidelines.improvement.title')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {t('contribute.guidelines.improvement.description')}
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('contribute.guidelines.documentation.title')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {t('contribute.guidelines.documentation.description')}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Contribution Requirements */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('contribute.requirements.title')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('contribute.requirements.tested.title')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {t('contribute.requirements.tested.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('contribute.requirements.documented.title')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {t('contribute.requirements.documented.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('contribute.requirements.original.title')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {t('contribute.requirements.original.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Contribution Insights */}
        <div className="mb-16">
          {token ? (
            <ContributionViewer token={token} />
          ) : (
            <GitHubContributionInsights />
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              {t('contribute.cta.title')}
            </h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              {t('contribute.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/your-username/Awesome-Astron-Workflow"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Github className="h-5 w-5 mr-2" />
                {t('contribute.cta.github')}
              </a>
              <a
                href="https://github.com/your-username/Awesome-Astron-Workflow/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors duration-200"
              >
                {t('contribute.cta.issues')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contribute;