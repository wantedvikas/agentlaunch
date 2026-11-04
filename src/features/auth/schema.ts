import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email("Enter a valid email address."));
// bcrypt (used by Supabase Auth) only reads the first 72 bytes.
const newPassword = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(72),
  next: z.string().optional(),
});

export const signUpSchema = z.object({
  displayName: z.string().trim().max(80, "Use 80 characters or fewer."),
  email,
  password: newPassword,
});

export const resetRequestSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetRequestInput = z.infer<typeof resetRequestSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
