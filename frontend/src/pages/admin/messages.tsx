import { useQuery } from '@tanstack/react-query';
import { getMessages } from './service';
import { useSave, useDelete } from './hooks';
import { useSettings } from '@/lib/providers';
import { Button } from '@/components/ui/button';
import { DeleteButton } from './shared';
import { QueryState } from '@/components/shared/query-state';
export default function Messages() {
  const query = useQuery({ queryKey: ['messages'], queryFn: getMessages });
  const { t, locale } = useSettings();
  const save = useSave();
  const remove = useDelete();
  return (
    <>
      <div className="admin-heading">
        <h1>{t('messages')}</h1>
      </div>
      {query.isPending ? (
        <QueryState loading />
      ) : query.error ? (
        <QueryState error={query.error} />
      ) : !query.data?.length ? (
        <p className="empty-state">{t('noMessages')}</p>
      ) : (
        query.data.map((m) => (
          <article className={`card message-card ${m.is_read ? '' : 'unread'}`} key={m.id}>
            <div className="heading-actions">
              <h3>{m.name}</h3>
              <time>{new Date(m.created_at).toLocaleString(locale)}</time>
            </div>
            <a className="text-primary" href={`mailto:${m.email}`}>
              {m.email}
            </a>
            <p className="message-body">{m.message}</p>
            <div className="inline-actions">
              <Button
                variant="outline"
                size="sm"
                disabled={save.isPending}
                onClick={() =>
                  save.mutate({ path: `/admin/messages/${m.id}/`, data: { is_read: !m.is_read } })
                }
              >
                {m.is_read ? t('markUnread') : t('markRead')}
              </Button>
              <DeleteButton
                pending={remove.isPending}
                onDelete={() => remove.mutate(`/admin/messages/${m.id}/`)}
              />
            </div>
          </article>
        ))
      )}
      {(save.error || remove.error) && (
        <p className="error">{save.error?.message || remove.error?.message}</p>
      )}
    </>
  );
}
