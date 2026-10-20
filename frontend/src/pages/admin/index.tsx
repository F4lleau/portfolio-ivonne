import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  UserRound,
  Inbox,
  Github,
  LogOut,
  ArrowUpRight,
} from 'lucide-react';
import { useSession } from './hooks';
import { logout } from './service';
import { useSettings } from '@/lib/providers';
import { QueryState } from '@/components/shared/query-state';
export default function AdminLayout() {
  const session = useSession();
  const { t } = useSettings();
  const navigate = useNavigate();
  const client = useQueryClient();
  if (session.isPending) return <QueryState loading />;
  if (session.error) return <QueryState error={session.error} retry={() => session.refetch()} />;
  if (!session.data?.authenticated) return <Navigate to="/admin/login" replace />;
  return (
    <div className="admin-layout container">
      <aside className="admin-sidebar">
        <span className="eyebrow">WORKSPACE</span>
        <h2>{t('admin')}</h2>
        <nav>
          {(
            [
              ['/admin', 'dashboard', LayoutDashboard],
              ['/admin/projects', 'projects', FolderKanban],
              ['/admin/technologies', 'technologies', Layers],
              ['/admin/profile', 'profile', UserRound],
              ['/admin/messages', 'messages', Inbox],
              ['/admin/github', 'githubImport', Github],
            ] as const
          ).map(([path, label, Icon]) => (
            <NavLink key={path} to={path} end={path === '/admin'}>
              <Icon size={18} />
              {t(label)}
            </NavLink>
          ))}
        </nav>
        <a className="text-link" href="/" target="_blank" rel="noreferrer">
          {t('goSite')}
          <ArrowUpRight size={16} />
        </a>
        <button
          className="text-link"
          onClick={async () => {
            await logout();
            client.clear();
            navigate('/admin/login');
          }}
        >
          <LogOut size={17} />
          {t('logout')}
        </button>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
