import { z } from "zod";

export const createTeacherSchema = z.object({
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
  class_ids: z.array(z.string()).min(1, "Select at least one class"),
  user_role: z.literal("teacher"),
});

export const updateTeacherSchema = z.object({
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
  class_ids: z.array(z.string()).min(1, "Select at least one class"),
  user_id: z.string().uuid(),
});
