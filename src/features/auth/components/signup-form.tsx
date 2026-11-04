"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

import { signUp } from "../actions";
import { signUpSchema, type SignUpInput } from "../schema";

import { FormMessage } from "./form-error";

export function SignupForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: "", email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: SignUpInput) {
    setServerError(null);
    const result = await signUp(values);
    if (result.ok) return setSentTo(result.message ?? values.email);
    setServerError(result.error);
    Object.entries(result.fieldErrors ?? {}).forEach(([k, message]) =>
      form.setError(k as keyof SignUpInput, { message }),
    );
  }

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MailCheck className="size-5" aria-hidden />
        </span>
        <h2 className="font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          If <strong className="text-foreground">{sentTo}</strong> can be registered, we&apos;ve
          sent a confirmation link to it. Open it in this browser to finish signing up.
        </p>
      </div>
    );
  }

  return (
    <form method="post" noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <FormMessage error={serverError} />
      <FormField
        label="Name"
        hint="Optional. Shown in your dashboard."
        error={errors.displayName?.message}
      >
        <Input autoComplete="name" {...form.register("displayName")} />
      </FormField>
      <FormField label="Email" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <FormField
        label="Password"
        required
        hint="At least 8 characters."
        error={errors.password?.message}
      >
        <Input type="password" autoComplete="new-password" {...form.register("password")} />
      </FormField>
      <Button type="submit" loading={isSubmitting} className="w-full">
        Create account
      </Button>
    </form>
  );
}
