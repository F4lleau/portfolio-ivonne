import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession, saveResource, deleteResource, uploadImage } from './service';
export const useSession = () =>
  useQuery({ queryKey: ['session'], queryFn: getSession, staleTime: 30000, retry: false });
export function useSave() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ path, data, method }: { path: string; data: unknown; method?: string }) =>
      saveResource(path, data, method),
    onSuccess: () => client.invalidateQueries(),
  });
}
export function useDelete() {
  const client = useQueryClient();
  return useMutation({ mutationFn: deleteResource, onSuccess: () => client.invalidateQueries() });
}
export function useUpload() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ path, field, file }: { path: string; field: string; file: File }) =>
      uploadImage(path, field, file),
    onSuccess: () => client.invalidateQueries(),
  });
}
