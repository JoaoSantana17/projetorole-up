import { rolesService } from '@/src/services/roles.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useRolesQuery() {
  return useQuery({ queryKey: ['roles'], queryFn: rolesService.list });
}

export function useRoleDetailsQuery(id: string) {
  return useQuery({ queryKey: ['roles', id], queryFn: () => rolesService.getById(id), enabled: !!id });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rolesService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useUpdateRoleMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof rolesService.update>[1]) => rolesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', id] });
    },
  });
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rolesService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
}
