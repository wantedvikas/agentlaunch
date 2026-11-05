import { z } from "zod";

export const USER_FILTERS = ["all", "paying", "admin"] as const;
export type UserFilter = (typeof USER_FILTERS)[number];

/** Users-list query string. Bad values fall back to defaults instead of erroring. */
export const usersQuerySchema = z.object({
  q: z.string().trim().max(100).catch(""),
  filter: z.enum(USER_FILTERS).catch("all"),
});
