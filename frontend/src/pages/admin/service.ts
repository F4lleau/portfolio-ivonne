import { api } from '@/lib/api';
import type { Message, Repository, Project } from '@/types';
export const getSession = () =>
  api<{ authenticated: boolean; csrfToken: string }>('/auth/session/');
export const login = (data: { email: string; password: string }) =>
  api('/auth/login/', { method: 'POST', body: JSON.stringify(data) });
export const logout = () => api('/auth/logout/', { method: 'POST', body: '{}' });
export const getMessages = () => api<Message[]>('/admin/messages/');
export const getRepositories = () => api<Repository[]>('/github/');
export const importRepository = (id: number) =>
  api<Project>('/github/', { method: 'POST', body: JSON.stringify({ repo_id: id }) });
export const saveResource = (path: string, data: unknown, method = 'PATCH') =>
  api(path, { method, body: JSON.stringify(data) });
export const deleteResource = (path: string) => api(path, { method: 'DELETE' });
export const uploadImage = (path: string, field: string, file: File) => {
  const body = new FormData();
  body.set(field, file);
  return api(path, { method: 'PATCH', body });
};
