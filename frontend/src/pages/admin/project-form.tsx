import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProject } from '@/pages/projects/hooks';
import { useTechnologies } from '@/pages/home/hooks';
import { useSave, useDelete, useUpload } from './hooks';
import { useSettings } from '@/lib/providers';
import { projectSchema } from '@/lib/schemas';
import { GalleryEditor } from './gallery-editor';
import { BilingualField, DeleteButton } from './shared';
import { Button } from '@/components/ui/button';
import { QueryState } from '@/components/shared/query-state';
import type { Project } from '@/types';
const emptyText = () => ({ es: '', en: '' });
type Draft = Omit<Project, 'id' | 'technologies' | 'cover' | 'gallery'> & {
  technology_ids: string[];
};
const initial: Draft = {
  slug: '',
  title: emptyText(),
  summary: emptyText(),
  description: emptyText(),
  role: emptyText(),
  decisions: emptyText(),
  result: emptyText(),
  cover_alt: '',
  repo_url: '',
  demo_url: '',
  year: new Date().getFullYear(),
  category: 'fullstack',
  published: false,
  featured: false,
  sort_order: 0,
  technology_ids: [],
};
export default function ProjectForm() {
  const { slug } = useParams();
  const isNew = !slug;
  const query = useProject(slug || '');
  const technologies = useTechnologies();
  const { t } = useSettings();
  const save = useSave();
  const remove = useDelete();
  const upload = useUpload();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft>(initial);
  const [error, setError] = useState('');
  useEffect(() => {
    if (query.data) {
      const { id: _, technologies, cover: __, gallery: ___, ...rest } = query.data;
      setDraft({ ...rest, technology_ids: technologies.map((v) => v.id) });
    }
  }, [query.data]);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((v) => ({ ...v, [key]: value }));
  if (!isNew && query.isPending) return <QueryState loading />;
  if (query.error) return <QueryState error={query.error} />;
  return (
    <>
      <div className="admin-heading">
        <Link className="text-link" to="/admin/projects">
          ← {t('projects')}
        </Link>
        <h1>{isNew ? t('newProject') : t('edit')}</h1>
      </div>
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          const result = projectSchema.safeParse(draft);
          if (!result.success) {
            setError(
              result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · '),
            );
            return;
          }
          setError('');
          save.mutate(
            {
              path: isNew ? '/projects/' : `/projects/${slug}/`,
              method: isNew ? 'POST' : 'PATCH',
              data: draft,
            },
            { onSuccess: () => navigate(`/admin/projects/${draft.slug}`) },
          );
        }}
      >
        <label>
          Slug
          <input
            required
            pattern="[a-z0-9-]+"
            value={draft.slug}
            onChange={(e) => set('slug', e.target.value)}
          />
        </label>
        {(['title', 'summary', 'description', 'role', 'decisions', 'result'] as const).map(
          (field) => (
            <BilingualField
              key={field}
              label={t(field)}
              value={draft[field]}
              onChange={(v) => set(field, v)}
              multiline={field !== 'title' && field !== 'role'}
            />
          ),
        )}
        <p className="form-help">{t('noMetrics')}</p>
        <div className="form-two">
          <label>
            {t('year')}
            <input
              type="number"
              min={1990}
              max={2100}
              value={draft.year}
              onChange={(e) => set('year', Number(e.target.value))}
            />
          </label>
          <label>
            {t('category')}
            <select value={draft.category} onChange={(e) => set('category', e.target.value)}>
              {['frontend', 'backend', 'database', 'ai', 'devops', 'fullstack'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            {t('repository')}
            <input
              type="url"
              value={draft.repo_url}
              onChange={(e) => set('repo_url', e.target.value)}
            />
          </label>
          <label>
            Demo
            <input
              type="url"
              value={draft.demo_url}
              onChange={(e) => set('demo_url', e.target.value)}
            />
          </label>
        </div>
        <fieldset>
          <legend>{t('technologies')} (3–6)</legend>
          <div className="technology-picker">
            {technologies.data?.map((tech) => (
              <label key={tech.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={draft.technology_ids.includes(tech.id)}
                  onChange={(e) =>
                    set(
                      'technology_ids',
                      e.target.checked
                        ? [...draft.technology_ids, tech.id]
                        : draft.technology_ids.filter((id) => id !== tech.id),
                    )
                  }
                />
                {tech.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="form-two">
          <label>
            {t('order')}
            <input
              type="number"
              min={0}
              value={draft.sort_order}
              onChange={(e) => set('sort_order', Number(e.target.value))}
            />
          </label>
          <label>
            {t('coverAlt')}
            <input value={draft.cover_alt} onChange={(e) => set('cover_alt', e.target.value)} />
          </label>
        </div>
        <div className="inline-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => set('featured', e.target.checked)}
            />
            {t('featured')}
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => set('published', e.target.checked)}
            />
            {t('published')}
          </label>
        </div>
        <p className="form-help">{t('uploadHelp')}</p>
        {!isNew && (
          <label>
            {t('cover')}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                if (e.target.files?.[0])
                  upload.mutate({
                    path: `/projects/${slug}/`,
                    field: 'cover',
                    file: e.target.files[0],
                  });
              }}
            />
            {query.data?.cover && (
              <img
                className="admin-cover-preview"
                src={query.data.cover}
                alt={query.data.cover_alt}
              />
            )}
          </label>
        )}
        {(error || save.error || upload.error) && (
          <p className="error" role="alert">
            {error || save.error?.message || upload.error?.message}
          </p>
        )}
        {(save.isSuccess || upload.isSuccess) && (
          <p className="success" role="status">
            {t('saved')}
          </p>
        )}
        <div className="form-actions">
          <Button disabled={save.isPending || upload.isPending}>
            {save.isPending ? t('loading') : t('save')}
          </Button>
          {!isNew && (
            <DeleteButton
              pending={remove.isPending}
              onDelete={() =>
                remove.mutate(`/projects/${slug}/`, {
                  onSuccess: () => navigate('/admin/projects'),
                })
              }
            />
          )}
        </div>
        {remove.error && <p className="error">{remove.error.message}</p>}
      </form>
      {query.data && <GalleryEditor project={query.data} />}
    </>
  );
}
