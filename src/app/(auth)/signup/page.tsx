import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/features/auth/components/auth-card";
import { GoogleButton } from "@/features/auth/components/google-button";
import { SupabaseNotConfigured } from "@/features/auth/components/not-configured";
import { SignupForm } from "@/features/auth/components/signup-form";
import { getSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Free to start. We'll email you a link to confirm your address."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {getSupabaseEnv() ? (
        <>
          <GoogleButton />
          <SignupForm />
        </>
      ) : (
        <SupabaseNotConfigured />
      )}
    </AuthCard>
  );
}
