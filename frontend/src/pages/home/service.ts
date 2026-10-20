import { api } from '@/lib/api';
import type { Profile, Technology } from '@/types';
export const getProfile = () => api<Profile>('/profile/');
export const getTechnologies = () => api<Technology[]>('/technologies/');
