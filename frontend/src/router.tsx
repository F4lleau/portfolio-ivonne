import { createBrowserRouter } from 'react-router-dom';
import App, { NotFound } from './App';
import { homeRoute } from './pages/home/route';
import { projectsRoute } from './pages/projects/route';
import { projectDetailRoute } from './pages/project-detail/route';
import { aboutRoute } from './pages/about/route';
import { cvRoute } from './pages/cv/route';
import { contactRoute } from './pages/contact/route';
import { adminRoutes } from './pages/admin/route';
export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <NotFound />,
    children: [
      homeRoute,
      projectsRoute,
      projectDetailRoute,
      aboutRoute,
      cvRoute,
      contactRoute,
      ...adminRoutes,
      { path: '*', element: <NotFound /> },
    ],
  },
]);
