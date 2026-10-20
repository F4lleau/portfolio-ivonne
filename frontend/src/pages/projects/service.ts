import { api } from '@/lib/api';
import type { Project } from '@/types';
export const getProjects = (query = '') => api<Project[]>(`/projects/${query ? '?' + query : ''}`);
export const getProject = (slug: string) => api<Project>(`/projects/${encodeURIComponent(slug)}/`);
