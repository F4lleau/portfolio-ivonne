import { useSettings } from '@/lib/providers';
import { Button } from '@/components/ui/button';
export function QueryState({
  loading,
  error,
  retry,
}: {
  loading?: boolean;
  error?: Error | null;
  retry?: () => void;
}) {
  const { t } = useSettings();
  return (
    <div className="status" role={error ? 'alert' : 'status'}>
      {loading ? (
        <>
          <span className="spinner" />
          {t('loading')}
        </>
      ) : (
        <>
          <p>{t('loadError')}</p>
          <p className="text-muted">{error?.message}</p>
          {retry && (
            <Button onClick={retry} variant="outline">
              {t('retry')}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
