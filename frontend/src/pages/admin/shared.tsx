import { useState } from 'react';
import { useSettings } from '@/lib/providers';
import { Button } from '@/components/ui/button';
import type { Text } from '@/types';
export function BilingualField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: Text;
  onChange: (value: Text) => void;
  multiline?: boolean;
}) {
  return (
    <fieldset className="bilingual-field">
      <legend>{label}</legend>
      <div className="form-two">
        {(['es', 'en'] as const).map((lang) => (
          <label key={lang}>
            <span className="field-locale">{lang === 'es' ? 'Español' : 'English'}</span>
            {multiline ? (
              <textarea
                rows={4}
                value={value[lang] || ''}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              />
            ) : (
              <input
                value={value[lang] || ''}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              />
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export function DeleteButton({
  onDelete,
  pending = false,
}: {
  onDelete: () => void;
  pending?: boolean;
}) {
  const { t } = useSettings();
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <span className="inline-actions">
      <Button type="button" variant="danger" disabled={pending} onClick={onDelete}>
        {t('confirmDelete')}
      </Button>
      <Button variant="ghost" type="button" onClick={() => setConfirm(false)}>
        {t('cancel')}
      </Button>
    </span>
  ) : (
    <Button variant="danger" type="button" onClick={() => setConfirm(true)}>
      {t('delete')}
    </Button>
  );
}
export function JsonField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [raw, setRaw] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState('');
  return (
    <label>
      {label}
      <textarea
        rows={10}
        className="json-editor"
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            e.target.setCustomValidity('');
            setError('');
          } catch {
            e.target.setCustomValidity('Invalid JSON');
            setError('JSON inválido / Invalid JSON');
          }
        }}
      />
      {error && <span className="error">{error}</span>}
    </label>
  );
}
