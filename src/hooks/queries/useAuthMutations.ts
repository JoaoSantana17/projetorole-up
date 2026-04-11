import { authService } from '@/src/services/auth.service';
import { useMutation } from '@tanstack/react-query';

export function useLoginMutation() {
  return useMutation({ mutationFn: authService.login });
}

export function useRegisterMutation() {
  return useMutation({ mutationFn: authService.register });
}
