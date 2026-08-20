import { z } from "zod";

export const deleteStudentGradeSchema = z.object({
  period_id: z.string().trim().min(1, {
    message: "Period field is required",
  }),

  subject_id: z.string().trim().min(1, {
    message: "Subject field is required",
  }),

  student_id: z.string(),
});
