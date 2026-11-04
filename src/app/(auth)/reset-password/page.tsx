import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/features/auth/components/auth-card";
import { SupabaseNotConfigured } from "@/features/auth/components/not-configured";
import { ResetRequestForm } from "@/features/auth/components/reset-request-form";
import { getSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your account email and we'll send you a reset link."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {getSupabaseEnv() ? <ResetRequestForm /> : <SupabaseNotConfigured />}
    </AuthCard>
  );
}
