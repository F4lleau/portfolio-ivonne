import { Download, Printer } from 'lucide-react';
import { useProfile } from './hooks';
import { useSettings } from '@/lib/providers';
import { apiUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { QueryState } from '@/components/shared/query-state';
export default function Cv() {
  const query = useProfile();
  const { tx, t, fm } = useSettings();
  if (!query.data) return <QueryState loading={query.isPending} error={query.error} />;
  const p = query.data;
  return (
    <div className="container page cv-page">
      <div className="page-heading no-print">
        <span className="eyebrow">03 / {t('resume')}</span>
        <h1>{t('cvTitle')}</h1>
        <div className="hero-actions">
          <Button asChild>
            <a href={apiUrl('/cv/es/')}>
              <Download size={17} />
              PDF ES
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={apiUrl('/cv/en/')}>
              <Download size={17} />
              PDF EN
            </a>
          </Button>
          <Button variant="ghost" onClick={() => window.print()}>
            <Printer size={17} />
            {t('print')}
          </Button>
        </div>
        <p className="cv-note">{t('cvNote')}</p>
      </div>
      <article className="cv-document">
        <header className="cv-header">
          {p.photo && <img src={p.photo} alt={p.full_name} />}
          <h1>{p.full_name}</h1>
          <p className="cv-headline">{tx(p.headline)}</p>
          <div className="cv-contact">
            <span>{p.email}</span>
            {p.phone && <span>{p.phone}</span>}
            <span>
              {p.location} · {p.timezone}
            </span>
            {p.linkedin_url && <a href={p.linkedin_url}>LinkedIn ↗</a>}
            {p.github_url && <a href={p.github_url}>GitHub ↗</a>}
          </div>
          <p className="cv-summary">{tx(p.summary)}</p>
        </header>
        <section>
          <h2>{t('experienceLabel')}</h2>
          {p.experience.map((exp, i) => (
            <div className="cv-entry" key={i}>
              <div className="cv-entry-heading">
                <h3>
                  {tx(exp.role)} · {exp.company}
                </h3>
                <span>{fm(exp.period)}</span>
              </div>
              <p>{tx(exp.description)}</p>
              <small>{exp.stack.join(' / ')}</small>
            </div>
          ))}
        </section>
        <section className="cv-page-two">
          <h2>{t('skills')}</h2>
          {p.skills.map((group, i) => (
            <div className="cv-skill" key={i}>
              <strong>{tx(group.name)}</strong>
              <p>{group.items.join(' · ')}</p>
            </div>
          ))}
          <h2>{t('education')}</h2>
          {p.education.map((item, i) => (
            <div className="cv-entry" key={i}>
              <h3>{tx(item.title)}</h3>
              <p>
                {item.school} · {fm(item.period)} · {tx(item.status)}
              </p>
            </div>
          ))}
          <h2>{t('languages')}</h2>
          <p>{p.languages.map((l) => `${tx(l.name)}: ${fm(l.level)}`).join(' · ')}</p>
        </section>
      </article>
    </div>
  );
}
