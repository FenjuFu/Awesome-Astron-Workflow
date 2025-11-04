import React from 'react';
import { ExternalLink, Github, ArrowRight, Sparkles, Users, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { workflows } from '../types/workflow';
import { getIcon } from '../utils/icons';

const WorkflowShowcase: React.FC = () => {
  const { t, language } = useLanguage();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity':
        return <Zap className="h-5 w-5 text-green-600" />;
      case 'ai':
        return <Sparkles className="h-5 w-5 text-purple-600" />;
      case 'content':
        return <Users className="h-5 w-5 text-blue-600" />;
      default:
        return <Sparkles className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity':
        return 'bg-green-100 text-green-800';
      case 'ai':
        return 'bg-purple-100 text-purple-800';
      case 'content':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section id="workflows" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('workflows.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('workflows.subtitle')}
          </p>
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workflows.map((workflow) => {
            const Icon = getIcon(workflow.icon);
            return (
              <div
                key={workflow.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        {Icon && <Icon className="h-6 w-6 text-indigo-600" />}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(workflow.category)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(workflow.category)}`}>
                          {t(`categories.${workflow.category}`)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                    {workflow.title}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {workflow.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      {t('workflows.keyFeatures')}
                    </h4>
                    <ul className="space-y-2">
                      {workflow.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={workflow.userCaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('workflows.viewCase')}
                    </a>
                    <a
                      href={workflow.workflowUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      {t('workflows.viewWorkflow')}
                    </a>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {t('workflows.workflowId')}: {workflow.id}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('workflows.ctaTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('workflows.ctaDescription')}
            </p>
            <a
              href="#contribute"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              {t('workflows.contribute')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowShowcase;