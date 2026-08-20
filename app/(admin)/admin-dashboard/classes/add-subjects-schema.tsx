import { z } from "zod";

export const addSubjectsSchema = z.object({
  subjectName: z.string().trim().min(1, {
    message: "Subject name is required",
  }),
  classIds: z.array(z.string()).min(1, "Select at least one class"),
});
