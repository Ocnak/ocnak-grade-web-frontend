import { z } from "zod";

export const createScannerSchema = z.object({
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
  location: z.string().trim().min(1, {
    message: "Location is required",
  }),
});

export const updateScannerSchema = createScannerSchema.extend({
  user_id: z.string().uuid(),
});
