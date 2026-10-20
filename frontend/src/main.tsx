import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { SettingsProvider, loadTranslations } from '@/lib/providers';
import { router } from './router';
import './index.css';
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60000, retry: 1, refetchOnWindowFocus: false } },
});
loadTranslations()
  .then(() =>
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <MotionConfig reducedMotion="user">
              <RouterProvider router={router} />
            </MotionConfig>
          </SettingsProvider>
        </QueryClientProvider>
      </React.StrictMode>,
    ),
  )
  .catch(() => {
    document.getElementById('root')!.textContent =
      'No se pudo iniciar el sitio. Recargá la página. / Unable to start. Please reload.';
  });
