import { z } from "zod";

/** Shared by the client form and (from C2) the server action. The server re-validates. */
export const projectStatuses = ["active", "paused", "archived"] as const;

export const projectInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name must be 80 characters or fewer."),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer."),
  status: z.enum(projectStatuses),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export const statusLabels: Record<(typeof projectStatuses)[number], string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};
