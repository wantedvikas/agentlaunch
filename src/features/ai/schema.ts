import { z } from "zod";

export const askSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(3, "Ask a question of at least 3 characters.")
    .max(2000, "Keep questions under 2,000 characters."),
});

export type AskInput = z.infer<typeof askSchema>;
