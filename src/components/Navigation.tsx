import React, { useState } from 'react';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface NavChild {
  href: string;
  label: string;
  tip?: string;
}

interface NavItem {
  href?: string;
  label: string;
  children?: NavChild[];
}

const isExternal = (href: string) => /^https?:\/\//.test(href);

const NavLink: React.FC<{ href: string; className: string; onClick?: () => void; children: React.ReactNode }> = ({
  href,
  className,
  onClick,
  children,
}) =>
  isExternal(href) ? (
    <a href={href} className={className} onClick={onClick} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : href.startsWith('/#') ? (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ) : (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh-CN' : 'en');
  };

  const navItems: NavItem[] = [
    {
      href: '/#home',
      label: t('nav.home'),
      children: [
        { href: '/#workflows', label: t('nav.workflows') },
        { href: '/#way-to-super-agent', label: t('nav.wayToSuperAgent') },
        { href: '/#community', label: t('nav.community') },
        { href: '/#about', label: t('nav.about') },
      ],
    },
    { href: '/landscape', label: t('nav.landscape') },
    {
      label: t('nav.demo'),
      children: [
        {
          href: 'https://astron-agent-nginx.zeabur.app',
          label: t('nav.astronAgent'),
          tip: t('nav.astronAgentTip'),
        },
      ],
    },
    {
      href: '/activities',
      label: t('nav.activities'),
      children: [
        { href: '/activities/lucky_draw', label: t('nav.luckyDraw') },
      ],
    },
    { href: '/chat', label: t('nav.chat') },
    { href: '/stats', label: t('nav.stats') },
  ];

  const itemClass = 'whitespace-nowrap text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors duration-200';

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center flex-shrink-0">
            <h1 className="text-2xl font-bold text-indigo-600">Astron</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {item.href ? (
                    <NavLink href={item.href} className={`${itemClass} inline-flex items-center gap-0.5`}>
                      {item.label}
                      <ChevronDown className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    </NavLink>
                  ) : (
                    <button className={`${itemClass} inline-flex items-center gap-0.5`}>
                      {item.label}
                      <ChevronDown className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    </button>
                  )}
                  {openDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-0 w-max min-w-[10rem] bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                      {item.children.map((child) => (
                        <div key={child.href} className="relative group/child">
                          <NavLink
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-gray-50 whitespace-nowrap"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {child.label}
                          </NavLink>
                          {child.tip && (
                            <div className="pointer-events-none absolute top-0 left-full ml-2 w-60 rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white shadow-xl opacity-0 translate-x-1 transition-all duration-200 group-hover/child:opacity-100 group-hover/child:translate-x-0 z-50">
                              {child.tip}
                              <span className="absolute top-3 -left-1 h-2 w-2 rotate-45 bg-gray-900" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink key={item.href} href={item.href!} className={itemClass}>
                  {item.label}
                </NavLink>
              )
            )}

            <button
              onClick={toggleLanguage}
              className={`${itemClass} flex items-center gap-1.5`}
            >
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span>{t('language.toggle')}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="text-gray-700 hover:text-indigo-600 p-2"
            >
              <Globe className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    onClick={() =>
                      setOpenMobileDropdown(openMobileDropdown === item.label ? null : item.label)
                    }
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        openMobileDropdown === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openMobileDropdown === item.label && (
                    <div className="ml-4 mt-0.5 space-y-0.5">
                      {item.href && (
                        <NavLink
                          href={item.href}
                          className="block px-3 py-2 text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          {t('nav.viewAll')}
                        </NavLink>
                      )}
                      {item.children.map((child) => (
                        <div key={child.href}>
                          <NavLink
                            href={child.href}
                            className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            {child.label}
                          </NavLink>
                          {child.tip && (
                            <p className="px-3 pb-2 text-xs leading-relaxed text-gray-400">{child.tip}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.href}
                  href={item.href!}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </NavLink>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
