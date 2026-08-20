import { z } from "zod";

export const studentGradeSchema = z
  .object({
    grades: z.record(z.string(), z.string().optional()),
  })
  .refine(
    (data) => {
      // Check if at least one grade has a value
      const hasAtLeastOneGrade = Object.values(data.grades).some(
        (grade) => grade !== undefined && grade.trim() !== "",
      );
      return hasAtLeastOneGrade;
    },
    {
      message: "Please enter at least one grade",
      path: ["grades"], // This will show the error on the grades field
    },
  );
