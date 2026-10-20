import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight } from 'lucide-react';
import { useProjects } from '@/pages/projects/hooks';
import { useSettings } from '@/lib/providers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QueryState } from '@/components/shared/query-state';
export default function AdminProjects() {
  const query = useProjects();
  const { t, tx } = useSettings();
  return (
    <>
      <div className="admin-heading heading-actions">
        <h1>{t('projects')}</h1>
        <Button asChild>
          <Link to="/admin/projects/new">
            <Plus size={17} />
            {t('newProject')}
          </Link>
        </Button>
      </div>
      {query.isPending ? (
        <QueryState loading />
      ) : query.error ? (
        <QueryState error={query.error} />
      ) : (
        <div className="admin-list">
          {query.data?.map((p) => (
            <div className="card admin-list-row" key={p.id}>
              <div>
                <h3>{tx(p.title)}</h3>
                <p>
                  {p.year} · {p.category}
                </p>
              </div>
              <Badge>{p.published ? t('published') : t('draft')}</Badge>
              <Link className="text-link" to={`/admin/projects/${p.slug}`}>
                {t('edit')}
                <ArrowUpRight size={17} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
