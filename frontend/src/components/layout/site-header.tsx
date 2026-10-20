import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sun, Moon, Menu, X, ArrowUpRight } from 'lucide-react';
import { useSettings } from '@/lib/providers';
import { useProfile } from '@/pages/home/hooks';
import { Button } from '@/components/ui/button';
export function SiteHeader() {
  const { t, locale, setLocale, theme, toggleTheme, tx } = useSettings();
  const { data: p } = useProfile();
  const [open, setOpen] = useState(false);
  const links = [
    ['/', t('home')],
    ['/projects', t('projects')],
    ['/about', t('about')],
    ['/cv', t('resume')],
    ['/contact', t('contact')],
  ];
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            {p?.full_name
              .split(' ')
              .map((s) => s[0])
              .slice(0, 2)
              .join('') || 'IF'}
          </span>
          <span>
            <strong>{p?.full_name || 'Portfolio'}</strong>
            <small>{p ? tx(p.headline) : 'FULL STACK DEVELOPMENT'}</small>
          </span>
        </Link>
        <nav className={open ? 'main-nav open' : 'main-nav'} aria-label={t('navigation')}>
          {links.map(([url, label]) => (
            <NavLink key={url} to={url} end={url === '/'} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <select
            aria-label={t('language')}
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'es' | 'en')}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
          <button className="icon-button" aria-label={t('toggleTheme')} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button asChild size="sm" className="talk-button">
            <Link to="/contact">
              {t('letsTalk')}
              <ArrowUpRight size={15} />
            </Link>
          </Button>
          <button
            className="icon-button mobile-menu"
            aria-label={t('menu')}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
