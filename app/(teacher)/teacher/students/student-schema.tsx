import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required" }),
  lastName: z.string().trim().min(1, { message: "Last name is required" }),
  parentName: z.string().trim().optional(),
  parentContact: z.string().trim().optional(),
  classId: z.string().uuid({ message: "Assigned class field is required" }),
  conduct: z.string().trim().optional(),
  daysAbsent: z.number().optional(),
});

export const updateStudentSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required" }),
  lastName: z.string().trim().min(1, { message: "Last name is required" }),
  parentName: z.string().trim().optional(),
  parentContact: z.string().trim().optional(),
  classId: z.string().uuid({ message: "Assigned class field is required" }),
  conduct: z.string().trim().optional(),
  daysAbsent: z.number().optional(),
});
