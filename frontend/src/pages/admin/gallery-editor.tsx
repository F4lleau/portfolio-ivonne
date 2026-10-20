import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/lib/providers';
import { api } from '@/lib/api';
import { useDelete } from './hooks';
import { DeleteButton } from './shared';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types';
export function GalleryEditor({ project }: { project: Project }) {
  const { t } = useSettings();
  const client = useQueryClient();
  const remove = useDelete();
  const upload = useMutation({
    mutationFn: (data: FormData) => api('/admin/gallery/', { method: 'POST', body: data }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['project', project.slug] }),
  });
  return (
    <section className="gallery-editor">
      <h2>{t('gallery')}</h2>
      <p className="form-help">{t('uploadHelp')}</p>
      <div className="gallery-grid">
        {project.gallery.map((item) => (
          <figure className="card" key={item.id}>
            <img src={item.image} alt={item.alt} />
            <figcaption>{item.alt}</figcaption>
            <DeleteButton
              pending={remove.isPending}
              onDelete={() => remove.mutate(`/admin/gallery/${item.id}/`)}
            />
          </figure>
        ))}
      </div>
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = new FormData(form);
          data.set('project', project.id);
          upload.mutate(data, { onSuccess: () => form.reset() });
        }}
      >
        <label>
          {t('cover')}
          <input name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
        </label>
        <label>
          {t('coverAlt')}
          <input name="alt" required maxLength={240} />
        </label>
        <label>
          {t('order')}
          <input name="sort_order" type="number" defaultValue={0} min={0} />
        </label>
        <Button disabled={upload.isPending}>{t('upload')}</Button>
      </form>
      {(upload.error || remove.error) && (
        <p className="error" role="alert">
          {upload.error?.message || remove.error?.message}
        </p>
      )}
    </section>
  );
}
