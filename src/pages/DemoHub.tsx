import React from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Boxes,
  ExternalLink,
  KeyRound,
  Rocket,
  Workflow,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import { useLanguage } from '../contexts/LanguageContext';

interface DemoLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
}

interface DemoProduct {
  key: string;
  name: string;
  icon: React.ReactNode;
  desc: string;
  links: DemoLink[];
  notes: string[];
  repo: string;
}

const DemoHub: React.FC = () => {
  const { t } = useLanguage();

  const products: DemoProduct[] = [
    {
      key: 'agent',
      name: 'Astron Agent',
      icon: <Bot className="h-6 w-6" />,
      desc: t('demo.agent.desc'),
      links: [
        {
          href: 'https://astron-agent-nginx.zeabur.app',
          label: t('demo.tryLive'),
          icon: <ExternalLink className="h-4 w-4" />,
          primary: true,
        },
        {
          href: 'https://astron-agent-casdoor.zeabur.app',
          label: t('demo.loginEntry'),
          icon: <KeyRound className="h-4 w-4" />,
        },
        {
          href: 'https://zeabur.com/templates/H6KENX',
          label: t('demo.deployTemplate'),
          icon: <Rocket className="h-4 w-4" />,
        },
      ],
      notes: [t('demo.agent.note1'), t('demo.agent.note2'), t('demo.agent.note3')],
      repo: 'https://github.com/iflytek/astron-agent',
    },
    {
      key: 'rpa',
      name: 'Astron RPA Server Stack',
      icon: <Workflow className="h-6 w-6" />,
      desc: t('demo.rpa.desc'),
      links: [
        {
          href: 'https://astron-rpa-gw-fenjufu-20260715.zeabur.app',
          label: t('demo.tryLive'),
          icon: <ExternalLink className="h-4 w-4" />,
          primary: true,
        },
        {
          href: 'https://astron-rpa-auth-fenjufu-20260715.zeabur.app',
          label: t('demo.loginEntry'),
          icon: <KeyRound className="h-4 w-4" />,
        },
        {
          href: 'https://zeabur.com/templates/CDW03E',
          label: t('demo.deployTemplate'),
          icon: <Rocket className="h-4 w-4" />,
        },
      ],
      notes: [t('demo.rpa.note1'), t('demo.rpa.note2'), t('demo.rpa.note3')],
      repo: 'https://github.com/iflytek/astron-rpa',
    },
    {
      key: 'skillhub',
      name: 'SkillHub',
      icon: <Boxes className="h-6 w-6" />,
      desc: t('demo.skillhub.desc'),
      links: [
        {
          href: 'https://skillhub-fenjufu-20260701.zeabur.app',
          label: t('demo.tryLive'),
          icon: <ExternalLink className="h-4 w-4" />,
          primary: true,
        },
        {
          href: 'https://zeabur.com/templates/KG76EW',
          label: t('demo.deployTemplate'),
          icon: <Rocket className="h-4 w-4" />,
        },
      ],
      notes: [t('demo.skillhub.note0'), t('demo.skillhub.note1'), t('demo.skillhub.note2')],
      repo: 'https://github.com/iflytek/skillhub',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('demo.title')}</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">{t('demo.subtitle')}</p>
        </header>

        <section className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-amber-800">{t('demo.shared.title')}</h2>
          </div>
          <ul className="space-y-2 text-sm text-amber-900 list-disc pl-5">
            <li>{t('demo.shared.1')}</li>
            <li>{t('demo.shared.2')}</li>
            <li>{t('demo.shared.3')}</li>
            <li>{t('demo.shared.4')}</li>
          </ul>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.key}
              className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  {product.icon}
                </span>
                <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{product.desc}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {product.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      link.primary
                        ? 'inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors'
                        : 'inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors'
                    }
                  >
                    {link.icon}
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4 flex-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  {t('demo.notesTitle')}
                </h3>
                <ul className="space-y-1.5 text-xs text-gray-600 list-disc pl-4 leading-relaxed">
                  {product.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>

              <a
                href={product.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
              >
                GitHub
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-5 w-5 text-indigo-600 flex-shrink-0" />
            <h2 className="text-lg font-semibold text-gray-900">{t('demo.deploy.title')}</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{t('demo.deploy.desc')}</p>
        </section>
      </main>
    </div>
  );
};

export default DemoHub;
