import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { NewPasswordForm } from "@/features/auth/components/new-password-form";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

// Reached from the reset email via /auth/callback, which signs the user in first.
// The proxy redirects signed-out visitors, and updatePassword re-checks the session.
export default function UpdatePasswordPage() {
  return (
    <AuthCard title="Choose a new password" description="You'll stay signed in after updating it.">
      <NewPasswordForm />
    </AuthCard>
  );
}
