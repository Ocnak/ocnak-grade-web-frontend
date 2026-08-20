import { z } from "zod";

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP must contain only digits" }),
});
