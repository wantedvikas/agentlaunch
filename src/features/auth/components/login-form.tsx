"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

import { signIn } from "../actions";
import { signInSchema, type SignInInput } from "../schema";

import { FormMessage } from "./form-error";

const notices: Record<string, string> = {
  "signed-out": "You've been signed out.",
};
const errors: Record<string, string> = {
  link: "That link is invalid or has expired. If you just confirmed your email, sign in below.",
  oauth: "Google sign-in couldn't start. Try again or use your email and password.",
};

export function LoginForm({
  next,
  notice,
  error,
}: {
  next?: string;
  notice?: string;
  error?: string;
}) {
  const [serverError, setServerError] = React.useState<string | null>(
    error ? (errors[error] ?? null) : null,
  );
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", next },
  });
  const { errors: fieldErrors, isSubmitting } = form.formState;

  async function onSubmit(values: SignInInput) {
    setServerError(null);
    const result = await signIn(values); // redirects on success
    if (result && !result.ok) {
      setServerError(result.error);
      Object.entries(result.fieldErrors ?? {}).forEach(([k, message]) =>
        form.setError(k as keyof SignInInput, { message }),
      );
    }
  }

  return (
    <form method="post" noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <FormMessage error={serverError} success={notice ? notices[notice] : null} />
      <FormField label="Email" error={fieldErrors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <FormField label="Password" error={fieldErrors.password?.message}>
        <Input type="password" autoComplete="current-password" {...form.register("password")} />
      </FormField>
      <div className="-mt-2 text-right">
        <Link href="/reset-password" className="text-sm text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" loading={isSubmitting} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
