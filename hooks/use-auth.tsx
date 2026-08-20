import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function useSendVerificationOtp() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (error) throw new Error(error.message);
      return data;
    },
  });
}
