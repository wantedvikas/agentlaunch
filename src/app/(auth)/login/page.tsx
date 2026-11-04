import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthCard } from "@/features/auth/components/auth-card";
import { FormSkeleton } from "@/features/auth/components/form-skeleton";
import { GoogleButton } from "@/features/auth/components/google-button";
import { LoginForm } from "@/features/auth/components/login-form";
import { SupabaseNotConfigured } from "@/features/auth/components/not-configured";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { safeNextPath } from "@/lib/validation/redirect";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function LoginFormWithParams({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const sp = await searchParams;
  const next = safeNextPath(first(sp.next));
  return (
    <>
      <GoogleButton next={next} />
      <LoginForm next={next} notice={first(sp.notice)} error={first(sp.error)} />
    </>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <AuthCard
      title="Sign in"
      description="Welcome back. Sign in to your dashboard."
      footer={
        <>
          No account yet?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {getSupabaseEnv() ? (
        <Suspense fallback={<FormSkeleton />}>
          <LoginFormWithParams searchParams={props.searchParams} />
        </Suspense>
      ) : (
        <SupabaseNotConfigured />
      )}
    </AuthCard>
  );
}
