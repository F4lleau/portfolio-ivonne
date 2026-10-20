import { useState } from 'react';
import { useTechnologies } from '@/pages/home/hooks';
import { useSettings } from '@/lib/providers';
import { useSave, useDelete } from './hooks';
import { DeleteButton } from './shared';
import { Button } from '@/components/ui/button';
import type { Technology } from '@/types';
const initial = { name: '', slug: '', category: 'frontend', sort_order: 0 };
export default function Technologies() {
  const query = useTechnologies();
  const { t } = useSettings();
  const [editing, setEditing] = useState<string>();
  const [draft, setDraft] = useState(initial);
  const save = useSave();
  const remove = useDelete();
  const edit = (tech: Technology) => {
    setEditing(tech.id);
    setDraft(tech);
  };
  return (
    <>
      <div className="admin-heading">
        <h1>{t('technologies')}</h1>
      </div>
      <form
        className="card technology-form"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(
            {
              path: `/technologies/${editing ? editing + '/' : ''}`,
              method: editing ? 'PATCH' : 'POST',
              data: draft,
            },
            {
              onSuccess: () => {
                setDraft(initial);
                setEditing(undefined);
              },
            },
          );
        }}
      >
        <h2>{editing ? t('edit') : t('newTechnology')}</h2>
        <div className="form-two">
          <label>
            {t('name')}
            <input
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label>
            Slug
            <input
              required
              pattern="[a-z0-9-]+"
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
            />
          </label>
          <label>
            {t('category')}
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              {['frontend', 'backend', 'database', 'ai', 'devops', 'tooling'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            {t('order')}
            <input
              type="number"
              min={0}
              value={draft.sort_order}
              onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
            />
          </label>
        </div>
        <div className="inline-actions">
          <Button disabled={save.isPending}>{t('save')}</Button>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDraft(initial);
                setEditing(undefined);
              }}
            >
              {t('cancel')}
            </Button>
          )}
        </div>
        {save.error && <p className="error">{save.error.message}</p>}
      </form>
      {query.error && <p className="error">{query.error.message}</p>}
      {remove.error && <p className="error">{remove.error.message}</p>}
      <div className="admin-list">
        {query.data?.map((tech) => (
          <div className="admin-list-row card" key={tech.id}>
            <div>
              <strong>{tech.name}</strong>
              <p>{tech.category}</p>
            </div>
            <Button variant="ghost" onClick={() => edit(tech)}>
              {t('edit')}
            </Button>
            <DeleteButton
              pending={remove.isPending}
              onDelete={() => remove.mutate(`/technologies/${tech.id}/`)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
