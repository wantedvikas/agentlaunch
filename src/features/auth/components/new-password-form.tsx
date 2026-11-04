"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

import { updatePassword } from "../actions";
import { newPasswordSchema, type NewPasswordInput } from "../schema";

import { FormMessage } from "./form-error";

export function NewPasswordForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: NewPasswordInput) {
    setServerError(null);
    const result = await updatePassword(values); // redirects on success
    if (result && !result.ok) setServerError(result.error);
  }

  return (
    <form method="post" noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <FormMessage error={serverError} />
      <FormField
        label="New password"
        hint="At least 8 characters."
        error={errors.password?.message}
      >
        <Input type="password" autoComplete="new-password" {...form.register("password")} />
      </FormField>
      <FormField label="Confirm new password" error={errors.confirm?.message}>
        <Input type="password" autoComplete="new-password" {...form.register("confirm")} />
      </FormField>
      <Button type="submit" loading={isSubmitting} className="w-full">
        Update password
      </Button>
    </form>
  );
}
