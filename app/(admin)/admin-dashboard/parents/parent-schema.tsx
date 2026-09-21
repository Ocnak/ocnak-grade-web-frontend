import { z } from "zod";

export const updateParentSchema = z.object({
  first_name: z.string().trim().min(1, {
    message: "First name is required",
  }),
  last_name: z.string().trim().min(1, {
    message: "Last name is required",
  }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email field is required" })
    .email({
      message: "Invalid email address",
    }),

  contact: z
    .string()
    .trim()
    .regex(/^[+()\d\s-]*$/, { message: "Enter a valid phone number" })
    .refine((v) => v === "" || v.replace(/\D/g, "").length >= 7, {
      message: "Phone number is too short",
    })
    .optional(),
  // user_id: z.string().uuid(),
});
