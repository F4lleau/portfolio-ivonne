import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LockKeyhole } from 'lucide-react';
import { login } from './service';
import { useSession } from './hooks';
import { useSettings } from '@/lib/providers';
import { loginSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
export default function Login() {
  const { t } = useSettings();
  const session = useSession();
  const client = useQueryClient();
  const navigate = useNavigate();
  const [invalid, setInvalid] = useState(false);
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await client.invalidateQueries();
      navigate('/admin');
    },
  });
  if (session.data?.authenticated) return <Navigate to="/admin" replace />;
  return (
    <div className="login-container">
      <div className="card login-card">
        <span className="login-icon">
          <LockKeyhole size={27} />
        </span>
        <span className="eyebrow">PRIVATE WORKSPACE</span>
        <h1>{t('login')}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const result = loginSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
            if (!result.success) {
              setInvalid(true);
              return;
            }
            setInvalid(false);
            mutation.mutate(result.data);
          }}
        >
          <label>
            {t('email')}
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            {t('password')}
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          {(mutation.error || invalid) && (
            <p className="error" role="alert">
              {mutation.error?.message || 'Email / password'}
            </p>
          )}
          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? t('loading') : t('login')}
          </Button>
        </form>
        <p className="form-help">{t('loginNote')}</p>
      </div>
    </div>
  );
}
