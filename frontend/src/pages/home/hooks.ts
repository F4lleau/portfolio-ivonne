import { useQuery } from '@tanstack/react-query';
import { getProfile, getTechnologies } from './service';
export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: getProfile });
export const useTechnologies = () =>
  useQuery({ queryKey: ['technologies'], queryFn: getTechnologies });
