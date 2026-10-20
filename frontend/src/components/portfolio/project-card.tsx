import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Github } from 'lucide-react';
import { useSettings } from '@/lib/providers';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types';
export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const { tx, t } = useSettings();
  return (
    <article className="project-card card">
      <Link
        to={`/projects/${project.slug}`}
        className={`project-cover cover-${index % 3}`}
        aria-label={tx(project.title)}
      >
        {project.cover ? (
          <img src={project.cover} alt={project.cover_alt || tx(project.title)} loading="lazy" />
        ) : (
          <div className="cover-art" aria-hidden="true">
            <div className="art-window">
              <i />
              <i />
              <i />
              <div className="art-code">
                {'{'}
                <br />
                &nbsp; build: <span>something meaningful</span>
                <br />
                {'}'}
              </div>
            </div>
            <span className="cover-note">{t('projectIllustration')}</span>
          </div>
        )}
        <span className="cover-arrow">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="project-content">
        <div className="project-meta">
          <span>
            {project.category} / {project.year}
          </span>
          {!project.published && <Badge>{t('draft')}</Badge>}
          {project.featured && <span className="text-primary">✦ {t('featured')}</span>}
        </div>
        <h3>
          <Link to={`/projects/${project.slug}`}>{tx(project.title)}</Link>
        </h3>
        <p className="text-muted">{tx(project.summary)}</p>
        <p className="project-role">{tx(project.role)}</p>
        <div className="chips">
          {project.technologies.map((tech) => (
            <Link className="badge" key={tech.id} to={`/projects?tech=${tech.slug}`}>
              {tech.name}
            </Link>
          ))}
        </div>
        {tx(project.result) && <p className="project-result">↳ {tx(project.result)}</p>}
        <div className="project-links">
          <Link to={`/projects/${project.slug}`}>
            {t('caseStudy')} <ArrowRight size={15} />
          </Link>
          <div>
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
                aria-label={t('repository')}
              >
                <Github size={18} />
              </a>
            )}
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noreferrer">
                Demo <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
