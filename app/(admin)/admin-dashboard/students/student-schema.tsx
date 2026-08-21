import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required" }),
  lastName: z.string().trim().min(1, { message: "Last name is required" }),
  parentName: z.string().trim().optional(),
  parentContact: z.string().trim().optional(),
  parentEmail: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .optional()
    .or(z.literal("")),
  classId: z.string().uuid({ message: "Assigned class field is required" }),
  conduct: z.string().trim().optional(),
  daysAbsent: z.number().optional(),
  sick: z.number().optional(),
  timesTardy: z.number().optional(),
  location: z.string().trim().min(1, { message: "Location is required" }),
});

export const updateStudentSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required" }),
  lastName: z.string().trim().min(1, { message: "Last name is required" }),
  parentName: z.string().trim().optional(),
  parentContact: z.string().trim().optional(),
  parentEmail: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .optional()
    .or(z.literal("")),
  classId: z.string().uuid({ message: "Assigned class field is required" }),
  conduct: z.string().trim().optional(),
  daysAbsent: z.number().optional(),
  sick: z.number().optional(),
  timesTardy: z.number().optional(),
  location: z.string().trim().min(1, { message: "Location is required" }),
});
