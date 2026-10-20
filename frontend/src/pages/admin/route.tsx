import type { RouteObject } from 'react-router-dom';
import Layout from './index';
import Login from './login';
import Dashboard from './dashboard';
import Projects from './projects';
import ProjectForm from './project-form';
import Technologies from './technologies';
import ProfileForm from './profile-form';
import Messages from './messages';
import GitHubImport from './github';
export const adminRoutes: RouteObject[] = [
  { path: '/admin/login', element: <Login /> },
  {
    path: '/admin',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/new', element: <ProjectForm /> },
      { path: 'projects/:slug', element: <ProjectForm /> },
      { path: 'technologies', element: <Technologies /> },
      { path: 'profile', element: <ProfileForm /> },
      { path: 'messages', element: <Messages /> },
      { path: 'github', element: <GitHubImport /> },
    ],
  },
];
