import { apexPresenceService } from '@/src/services/apex-presence.service';
import { PresencePayload } from '@/src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePresencesQuery(roleId: string) {
  return useQuery({ queryKey: ['presences', roleId], queryFn: () => apexPresenceService.list(roleId), enabled: !!roleId });
}

export function useCreatePresenceMutation(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PresencePayload) => apexPresenceService.create(roleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presences', roleId] }),
  });
}

export function useUpdatePresenceMutation(roleId: string, presenceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PresencePayload) => apexPresenceService.update(roleId, presenceId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presences', roleId] }),
  });
}

export function useDeletePresenceMutation(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (presenceId: string) => apexPresenceService.remove(roleId, presenceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presences', roleId] }),
  });
}
