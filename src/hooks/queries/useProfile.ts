import { profileService } from '@/src/services/profile.service';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useProfileQuery() {
  return useQuery({ queryKey: ['profile'], queryFn: profileService.me });
}

export function useUpdateProfileMutation() {
  return useMutation({ mutationFn: profileService.update });
}
