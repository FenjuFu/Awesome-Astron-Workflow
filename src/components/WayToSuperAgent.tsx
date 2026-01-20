import React from 'react';
import { Video, Mic, PlayCircle, ExternalLink, Youtube, Twitter, GraduationCap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const WayToSuperAgent: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="way-to-super-agent" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Video className="h-10 w-10 text-indigo-600 mr-3" />
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t('way.title')}
            </h2>
          </div>
          <p className="mt-4 text-xl text-gray-500">
            {t('way.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Talk Section */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-indigo-100 transition-transform duration-300 hover:scale-[1.02]">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4">
                <Mic className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{t('way.talk.title')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('way.talk.description')}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <a 
                href="https://www.aidaxue.com/course/search?search=astron" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-indigo-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <GraduationCap className="h-6 w-6 text-indigo-500 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {t('way.talk.aiUniversity')}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-indigo-500" />
                </div>
              </a>
            </div>
          </div>

          {/* Showcase Section */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-lg border border-blue-100 transition-transform duration-300 hover:scale-[1.02]">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4">
                <PlayCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{t('way.showcase.title')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('way.showcase.description')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <a 
                href="https://youtube.com/playlist?list=PLpSUIRpjMINCELDvnnHdVmPKEINljeluw&si=byo0riXQHOMQ3ZZc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-red-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Youtube className="h-6 w-6 text-red-600 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                      {t('way.showcase.youtube')}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                </div>
              </a>

              <a 
                href="https://vimeo.com/showcase/12038826" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-sky-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Video className="h-6 w-6 text-sky-500 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-gray-900 group-hover:text-sky-600 transition-colors">
                      {t('way.showcase.vimeo')}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-sky-500" />
                </div>
              </a>

              <a 
                href="https://x.com/i/lists/2005516617174954267" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Twitter className="h-6 w-6 text-slate-900 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-gray-900 group-hover:text-slate-700 transition-colors">
                      {t('way.showcase.x')}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-slate-500" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WayToSuperAgent;
