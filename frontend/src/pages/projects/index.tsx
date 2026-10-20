import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useProjects } from './hooks';
import { useTechnologies } from '@/pages/home/hooks';
import { useSettings } from '@/lib/providers';
import { ProjectCard } from '@/components/portfolio/project-card';
import { QueryState } from '@/components/shared/query-state';
export default function Projects() {
  const { t } = useSettings();
  const [params, setParams] = useSearchParams();
  const query = useProjects(params.toString());
  const techs = useTechnologies();
  const update = (name: string, value: string) =>
    setParams(
      (old) => {
        const next = new URLSearchParams(old);
        if (value) next.set(name, value);
        else next.delete(name);
        return next;
      },
      { replace: true },
    );
  const published = query.data?.filter((p) => p.published) || [];
  return (
    <div className="container page">
      <div className="page-heading">
        <span className="eyebrow">01 / {t('projects')}</span>
        <h1>
          {t('projects')}
          <span className="text-primary">.</span>
        </h1>
        <p>{t('projectsSubtitle')}</p>
      </div>
      <div className="filters">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label={t('searchProjects')}
            value={params.get('q') || ''}
            onChange={(e) => update('q', e.target.value)}
            placeholder={t('searchProjects')}
          />
        </div>
        <SlidersHorizontal size={17} className="filter-icon" />
        <select
          aria-label={t('technologies')}
          value={params.get('tech') || ''}
          onChange={(e) => update('tech', e.target.value)}
        >
          <option value="">{t('allTechnologies')}</option>
          {techs.data?.map((tech) => (
            <option key={tech.id} value={tech.slug}>
              {tech.name}
            </option>
          ))}
        </select>
        <select
          aria-label={t('category')}
          value={params.get('category') || ''}
          onChange={(e) => update('category', e.target.value)}
        >
          <option value="">{t('allCategories')}</option>
          {['frontend', 'backend', 'database', 'ai', 'devops', 'fullstack'].map((v) => (
            <option value={v} key={v}>
              {v}
            </option>
          ))}
        </select>
        {params.size > 0 && (
          <button className="text-link" onClick={() => setParams({})}>
            {t('clearFilters')}
          </button>
        )}
      </div>
      <p className="results-count">
        {published.length} {t('projectCount')}
      </p>
      {query.isPending ? (
        <QueryState loading />
      ) : query.error ? (
        <QueryState error={query.error} retry={() => query.refetch()} />
      ) : published.length ? (
        <div className="project-grid">
          {published.map((p, i) => (
            <ProjectCard project={p} index={i} key={p.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{params.size ? t('noResults') : t('noProjects')}</h2>
          <p>{t('noProjectsBody')}</p>
        </div>
      )}
    </div>
  );
}
