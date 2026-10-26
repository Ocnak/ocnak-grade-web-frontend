import { z } from "zod";

export const adminSignupFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email field is required" })
    .email({
      message: "Invalid email address",
    }),
  first_name: z.string().trim().min(2, {
    message: "First name must be at least 2 characters long",
  }),
  last_name: z.string().trim().min(2, {
    message: "Last name must be at least 2 characters long",
  }),
  user_role: z.string().trim(),
});
