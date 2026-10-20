import { Outlet, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { PortfolioBot } from '@/components/portfolio/bot';
import { useSettings } from '@/lib/providers';
export default function App() {
  const { pathname } = useLocation();
  const { t } = useSettings();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#content">
        {t('skipContent')}
      </a>
      <SiteHeader />
      <main id="content">
        <Outlet />
      </main>
      <SiteFooter />
      {!pathname.startsWith('/admin') && <PortfolioBot />}
    </>
  );
}
export function NotFound() {
  const { t } = useSettings();
  return (
    <div className="container page empty-state">
      <span className="eyebrow">404</span>
      <h1>{t('notFound')}</h1>
      <Link to="/">{t('backHome')} →</Link>
    </div>
  );
}
