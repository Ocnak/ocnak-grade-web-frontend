import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email field is required" })
    .email({
      message: "Invalid email address",
    }),
});
