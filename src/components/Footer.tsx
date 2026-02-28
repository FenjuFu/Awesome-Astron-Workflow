import React from 'react';
import { Github, Heart, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold">Astron Workflows</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/your-username/Awesome-Astron-Workflow"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="/#home" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {t('nav.home')}
                </a>
              </li>
              <li>
                <a href="/#workflows" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {t('nav.workflows')}
                </a>
              </li>
              <li>
                <a href="/stats" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {t('nav.about')}
                </a>
              </li>
              <li>
                <a href="/#contribute" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {t('nav.contribute')}
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/your-username/Awesome-Astron-Workflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/your-username/Awesome-Astron-Workflow/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {t('footer.reportIssues')}
              </a>
              </li>
              <li>
                <a
                  href="https://github.com/your-username/Awesome-Astron-Workflow/pulls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {t('footer.contribute')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400">
              <Globe className="h-5 w-5" />
              <span className="text-sm">
                {language === 'zh-CN' ? '中文' : 'English'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">
                {t('footer.madeWithLove')}
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Awesome Astron Workflow. {t('footer.rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;