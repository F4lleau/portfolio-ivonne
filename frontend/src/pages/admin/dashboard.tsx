import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useProjects } from '@/pages/projects/hooks';
import { getMessages } from './service';
import { useSettings } from '@/lib/providers';
import { QueryState } from '@/components/shared/query-state';
export default function Dashboard() {
  const { t } = useSettings();
  const projects = useProjects();
  const messages = useQuery({ queryKey: ['messages'], queryFn: getMessages });
  if (projects.error || messages.error)
    return <QueryState error={projects.error || messages.error} />;
  return (
    <>
      <div className="admin-heading">
        <h1>{t('dashboard')}</h1>
        <p>{t('adminHelp')}</p>
      </div>
      <div className="stats-grid">
        {[
          [t('published'), projects.data?.filter((p) => p.published).length],
          [t('drafts'), projects.data?.filter((p) => !p.published).length],
          [t('unread'), messages.data?.filter((m) => !m.is_read).length],
        ].map(([label, count]) => (
          <div className="card stat" key={label}>
            <span>{label}</span>
            <strong>{count ?? '—'}</strong>
          </div>
        ))}
      </div>
      <div className="admin-shortcuts">
        <Link className="card" to="/admin/github">
          ↗ {t('githubImport')}
        </Link>
        <Link className="card" to="/admin/profile">
          ↗ {t('profile')}
        </Link>
      </div>
    </>
  );
}
