import { useQuery } from '@tanstack/react-query';
import { getProjects, getProject } from './service';
export const useProjects = (query = '') =>
  useQuery({ queryKey: ['projects', query], queryFn: () => getProjects(query) });
export const useProject = (slug: string) =>
  useQuery({ queryKey: ['project', slug], queryFn: () => getProject(slug), enabled: !!slug });
