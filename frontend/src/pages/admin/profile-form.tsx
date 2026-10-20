import { useEffect, useState } from 'react';
import { useProfile } from '@/pages/home/hooks';
import { useSave, useUpload } from './hooks';
import { useSettings } from '@/lib/providers';
import { BilingualField, JsonField } from './shared';
import { Button } from '@/components/ui/button';
import { QueryState } from '@/components/shared/query-state';
import type { Profile } from '@/types';
export default function ProfileForm() {
  const query = useProfile();
  const { t } = useSettings();
  const [draft, setDraft] = useState<Profile>();
  const save = useSave();
  const upload = useUpload();
  useEffect(() => {
    if (query.data && !draft) setDraft(query.data);
  }, [query.data, draft]);
  if (!draft) return <QueryState loading={query.isPending} error={query.error} />;
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setDraft((v) => (v ? { ...v, [key]: value } : v));
  return (
    <>
      <div className="admin-heading">
        <h1>{t('profile')}</h1>
        <p>{t('jsonHelp')}</p>
      </div>
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          const { photo: _, id: __, ...data } = draft;
          save.mutate({ path: '/profile/', data });
        }}
      >
        <div className="form-two">
          {(
            [
              ['full_name', 'fullName'],
              ['email', 'email'],
              ['phone', 'phone'],
              ['location', 'location'],
              ['timezone', 'timezone'],
            ] as const
          ).map(([field, label]) => (
            <label key={field}>
              {t(label)}
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={draft[field]}
                required={field === 'email' || field === 'full_name'}
                onChange={(e) => set(field, e.target.value)}
              />
            </label>
          ))}
        </div>
        {(['headline', 'summary', 'availability'] as const).map((field) => (
          <BilingualField
            key={field}
            label={t(field)}
            value={draft[field]}
            multiline={field === 'summary'}
            onChange={(v) => set(field, v)}
          />
        ))}
        <div className="form-two">
          {(['linkedin_url', 'github_url', 'website_url'] as const).map((field) => (
            <label key={field}>
              {field.replace('_url', '')}
              <input type="url" value={draft[field]} onChange={(e) => set(field, e.target.value)} />
            </label>
          ))}
        </div>
        <label>
          {t('photo')}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              if (e.target.files?.[0])
                upload.mutate({ path: '/profile/', field: 'photo', file: e.target.files[0] });
            }}
          />
        </label>
        {query.data?.photo && (
          <img className="admin-photo-preview" src={query.data.photo} alt={draft.full_name} />
        )}
        <h2>{t('structuredData')}</h2>
        {(['languages', 'experience', 'education', 'skills'] as const).map((field) => (
          <JsonField
            key={field}
            label={t(field)}
            value={draft[field]}
            onChange={(value) => set(field, value as never)}
          />
        ))}
        {(save.error || upload.error) && (
          <p className="error" role="alert">
            {save.error?.message || upload.error?.message}
          </p>
        )}
        {(save.isSuccess || upload.isSuccess) && (
          <p className="success" role="status">
            {t('saved')}
          </p>
        )}
        <Button disabled={save.isPending || upload.isPending}>
          {save.isPending ? t('loading') : t('save')}
        </Button>
      </form>
    </>
  );
}
