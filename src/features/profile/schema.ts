import { z } from "zod";

export const profileInputSchema = z.object({
  displayName: z.string().trim().max(80, "Use 80 characters or fewer."),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
