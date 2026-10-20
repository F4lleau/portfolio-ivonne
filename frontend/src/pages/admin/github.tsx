import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRepositories, importRepository } from './service';
import { useSettings } from '@/lib/providers';
import { Button } from '@/components/ui/button';
import { QueryState } from '@/components/shared/query-state';
export default function GitHubImport() {
  const { t } = useSettings();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['repositories'], queryFn: getRepositories, retry: false });
  const mutation = useMutation({
    mutationFn: importRepository,
    onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }),
  });
  return (
    <>
      <div className="admin-heading">
        <h1>{t('githubImport')}</h1>
        <p>{t('importNote')}</p>
      </div>
      {mutation.error && (
        <p className="error" role="alert">
          {mutation.error.message}
        </p>
      )}
      {mutation.data && (
        <p className="success" role="status">
          {t('saved')} <Link to={`/admin/projects/${mutation.data.slug}`}>{t('edit')} →</Link>
        </p>
      )}
      {query.isPending ? (
        <QueryState loading />
      ) : query.error ? (
        <QueryState error={query.error} retry={() => query.refetch()} />
      ) : (
        query.data?.map((repo) => (
          <article className="card repo-card" key={repo.id}>
            <div>
              <h3>
                <a href={repo.url} target="_blank" rel="noreferrer">
                  {repo.name} ↗
                </a>
              </h3>
              <p>{repo.description}</p>
              <small>
                {repo.language} · {repo.year}
                {repo.fork ? ' · fork' : ''}
              </small>
            </div>
            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(repo.id)}
            >
              {t('importDraft')}
            </Button>
          </article>
        ))
      )}
    </>
  );
}
