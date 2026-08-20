import { z } from "zod";

export const createClassSchema = z.object({
  className: z.string().trim().min(1, {
    message: "Class name is required",
  }),
});
