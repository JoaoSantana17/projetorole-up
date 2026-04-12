import { profileService } from '@/src/services/profile.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useProfileQuery() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getMe,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}