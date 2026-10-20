import { Link } from 'react-router-dom';
import { Github, Linkedin, ArrowUpRight } from 'lucide-react';
import { useProfile } from '@/pages/home/hooks';
import { useSettings } from '@/lib/providers';
export function SiteFooter() {
  const { data: p } = useProfile();
  const { t } = useSettings();
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div>
          <Link to="/" className="footer-name">
            {p?.full_name || 'Portfolio'}
            <span className="text-primary">.</span>
          </Link>
          <p>{p?.location} · UTC-3</p>
        </div>
        <div className="footer-links">
          {p?.github_url && (
            <a href={p.github_url} target="_blank" rel="noreferrer">
              <Github size={17} />
              GitHub
              <ArrowUpRight size={13} />
            </a>
          )}
          {p?.linkedin_url && (
            <a href={p.linkedin_url} target="_blank" rel="noreferrer">
              <Linkedin size={17} />
              LinkedIn
              <ArrowUpRight size={13} />
            </a>
          )}
          {p?.email && <a href={`mailto:${p.email}`}>{p.email}</a>}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {p?.full_name}
        </span>
        <span>{t('builtWith')}</span>
        <Link to="/admin">Admin ↗</Link>
      </div>
    </footer>
  );
}
