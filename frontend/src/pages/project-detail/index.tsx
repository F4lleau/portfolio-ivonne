import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { useProject } from './hooks';
import { useSettings } from '@/lib/providers';
import { QueryState } from '@/components/shared/query-state';
import { Button } from '@/components/ui/button';
export default function ProjectDetail() {
  const { slug = '' } = useParams();
  const query = useProject(slug);
  const { tx, t } = useSettings();
  if (!query.data)
    return query.error ? (
      <div className="container page">
        <h1>{t('projectMissing')}</h1>
        <Link to="/projects">{t('backProjects')}</Link>
      </div>
    ) : (
      <QueryState loading />
    );
  const p = query.data;
  return (
    <article className="container page case-study">
      <Link className="text-link" to="/projects">
        <ArrowLeft size={17} />
        {t('backProjects')}
      </Link>
      <div className="page-heading">
        <span className="eyebrow">
          {p.category} / {p.year}
          {!p.published && ` / ${t('draft')}`}
        </span>
        <h1>{tx(p.title)}</h1>
        <p>{tx(p.summary)}</p>
        <div className="hero-actions">
          {p.demo_url && (
            <Button asChild>
              <a href={p.demo_url} target="_blank" rel="noreferrer">
                Demo
                <ExternalLink size={16} />
              </a>
            </Button>
          )}
          {p.repo_url && (
            <Button asChild variant="outline">
              <a href={p.repo_url} target="_blank" rel="noreferrer">
                <Github size={17} />
                {t('repository')}
              </a>
            </Button>
          )}
        </div>
      </div>
      {p.cover && <img className="case-cover" src={p.cover} alt={p.cover_alt || tx(p.title)} />}
      <div className="case-grid">
        <div>
          {(
            [
              ['context', p.description],
              ['myRole', p.role],
              ['decisions', p.decisions],
              ['result', p.result],
            ] as const
          ).map(
            ([label, text]) =>
              tx(text) && (
                <section className="case-section" key={label}>
                  <h2>{t(label)}</h2>
                  <p>{tx(text)}</p>
                </section>
              ),
          )}
        </div>
        <aside className="case-stack card">
          <span className="eyebrow">STACK</span>
          <div className="chips">
            {p.technologies.map((tech) => (
              <Link className="badge" key={tech.id} to={`/projects?tech=${tech.slug}`}>
                {tech.name}
              </Link>
            ))}
          </div>
        </aside>
      </div>
      {p.gallery.length > 0 && (
        <section className="case-section">
          <h2>{t('gallery')}</h2>
          <div className="gallery-grid">
            {p.gallery.map((item) => (
              <figure key={item.id}>
                <a href={item.image} target="_blank" rel="noreferrer">
                  <img src={item.image} alt={item.alt} loading="lazy" />
                </a>
                <figcaption>{item.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
