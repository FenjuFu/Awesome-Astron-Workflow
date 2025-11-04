import React from 'react';
import { BookOpen, Users, Zap, Target } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Zap,
      title: t('about.features.powerful.title'),
      description: t('about.features.powerful.description')
    },
    {
      icon: Users,
      title: t('about.features.community.title'),
      description: t('about.features.community.description')
    },
    {
      icon: BookOpen,
      title: t('about.features.documented.title'),
      description: t('about.features.documented.description')
    },
    {
      icon: Target,
      title: t('about.features.focused.title'),
      description: t('about.features.focused.description')
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('about.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Column - Text Content */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('about.whatIs.title')}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t('about.whatIs.description')}
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {t('about.whatIs.description2')}
            </p>
            
            <div className="bg-indigo-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-indigo-900 mb-3">
                {t('about.whyUse.title')}
              </h4>
              <ul className="space-y-2 text-indigo-800">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{t('about.whyUse.point1')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{t('about.whyUse.point2')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{t('about.whyUse.point3')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Image/Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg mb-3"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg mb-3"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-8 h-8 bg-green-600 rounded-lg mb-3"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-8 h-8 bg-pink-600 rounded-lg mb-3"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <IconComponent className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;