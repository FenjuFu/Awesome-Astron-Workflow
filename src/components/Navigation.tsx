import React, { useRef, useState } from 'react';
import { Menu, X, Globe, ChevronDown, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface NavChild { href: string; label: string; tip?: string; shuttingDown?: boolean; }
interface NavItem { href: string; label: string; children?: NavChild[]; }
const NavLink: React.FC<{ href: string; className?: string; onClick?: () => void; children: React.ReactNode; current?: boolean }> = ({ href, className, onClick, children, current }) =>
  /^https?:\/\//.test(href) ? <a href={href} className={className} onClick={onClick} target="_blank" rel="noopener noreferrer">{children}</a>
  : href.startsWith('/#') ? <a href={href} className={className} onClick={onClick} aria-current={current ? 'page' : undefined}>{children}</a>
  : <Link to={href} className={className} onClick={onClick} aria-current={current ? 'page' : undefined}>{children}</Link>;

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const zh = language === 'zh-CN';
  const navItems: NavItem[] = [
    { href: '/#home', label: t('nav.home'), children: [
      { href: '/#workflows', label: t('nav.workflows') },
      { href: '/#way-to-super-agent', label: t('nav.wayToSuperAgent') },
      { href: '/#community', label: t('nav.community') },
      { href: '/#about', label: t('nav.about') },
    ] },
    { href: '/playground', label: t('nav.playground') },
    { href: '/api-sponsorship', label: zh ? 'API 赞助' : 'API Sponsorship' },
    { href: '/galaxy', label: zh ? '星系' : 'Galaxy' },
    { href: '/demo', label: t('nav.demo'), children: [
      { href: '/demo', label: t('nav.demoOverview'), tip: t('nav.demoOverviewTip') },
      { href: 'https://agent.xfyun.cn/agentbuilder/home', label: `${t('nav.astronAgent')} · ${t('demo.officialSaas')}` },
      { href: 'https://cowork.iflydigital.com/', label: `${t('demo.cowork')} · ${t('demo.officialSaas')}` },
      { href: 'https://skill.xfyun.cn/', label: `${t('nav.skillHub')} · ${t('demo.officialSaas')}` },
      { href: 'https://astron-agent-nginx.zeabur.app', label: t('nav.astronAgent'), tip: t('nav.astronAgentTip'), shuttingDown: true },
      { href: 'https://astron-rpa-gw-fenjufu-20260715.zeabur.app', label: t('nav.astronRpa'), tip: t('nav.astronRpaTip'), shuttingDown: true },
      { href: 'https://skillhub-fenjufu-20260701.zeabur.app', label: t('nav.skillHub'), tip: t('nav.skillHubTip'), shuttingDown: true },
      { href: 'https://zeabur.com/blogs/zeabur-is-shutting-down', label: t('demo.zeabur.link') },
    ] },
    { href: '/activities', label: t('nav.activities'), children: [{ href: '/activities/lucky_draw', label: t('nav.luckyDraw') }] },
    { href: '/chat', label: t('nav.chat') },
    { href: '/stats', label: t('nav.stats') },
  ];
  const close = () => { setIsOpen(false); setOpenDropdown(null); };
  return <nav className="spark-nav" ref={nav} aria-label={zh ? '主导航' : 'Main navigation'} onKeyDown={event => {
    if (event.key !== 'Escape') return;
    const expanded = nav.current?.querySelector<HTMLButtonElement>('.spark-dropdown-toggle[aria-expanded="true"]');
    close(); (expanded || menuButton.current)?.focus();
  }}>
    <div className="spark-nav-inner">
      <Link to="/" className="spark-wordmark" onClick={close} aria-label="Astron — Home"><Sparkles aria-hidden="true" size={23} /><span>Astron<span className="spark-wordmark-dot">.</span></span></Link>
      <div className={`spark-nav-links ${isOpen ? 'is-open' : ''}`} id="spark-navigation">
        {navItems.map((item, index) => <div className="spark-nav-item" key={item.href} onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpenDropdown(current => current === item.href ? null : current);
        }}>
          <div className="spark-nav-item-row">
            <NavLink href={item.href} onClick={close} current={item.href === '/#home' ? location.pathname === '/' : location.pathname === item.href}>{item.label}</NavLink>
            {item.children && <button className="spark-dropdown-toggle" aria-label={`${item.label} ${zh ? '子菜单' : 'submenu'}`} aria-expanded={openDropdown === item.href} aria-controls={`spark-submenu-${index}`} onClick={() => setOpenDropdown(openDropdown === item.href ? null : item.href)}><ChevronDown size={13} aria-hidden="true" /></button>}
          </div>
          {item.children && openDropdown === item.href && <div className="spark-submenu" id={`spark-submenu-${index}`}>
            {item.children.map(child => <NavLink key={child.href} href={child.href} onClick={close}><span>{child.label}{child.shuttingDown && <small className="spark-shutdown">{t('nav.shuttingDown')}</small>}</span>{child.tip && <small>{child.tip}</small>}</NavLink>)}
          </div>}
        </div>)}
      </div>
      <div className="spark-nav-actions">
        <button className="spark-language" onClick={() => { setLanguage(zh ? 'en' : 'zh-CN'); setOpenDropdown(null); }} aria-label={zh ? 'Switch to English' : '切换到中文'}><Globe size={17} aria-hidden="true" /><span>{zh ? 'EN' : '中文'}</span></button>
        <button className="spark-menu-toggle" ref={menuButton} onClick={() => { setIsOpen(!isOpen); setOpenDropdown(null); }} aria-label={zh ? (isOpen ? '关闭导航' : '打开导航') : (isOpen ? 'Close navigation' : 'Open navigation')} aria-expanded={isOpen} aria-controls="spark-navigation">{isOpen ? <X size={23} /> : <Menu size={23} />}</button>
      </div>
    </div>
  </nav>;
}
