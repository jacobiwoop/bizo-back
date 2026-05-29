import { useMutation } from "@tanstack/react-query";

import * as authApi from "@/src/lib/api/auth";
import { useSessionStore } from "@/src/store/session";

export function useLoginMutation() {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await setSession(data.token, data.user);
    },
  });
}

export function useRegisterMutation() {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      await setSession(data.token, data.user);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: authApi.sendPasswordOtp,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: authApi.resetPasswordWithOtp,
  });
}

export function useLogoutMutation() {
  const clearSession = useSessionStore((state) => state.clearSession);

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      await clearSession();
    },
  });
}
