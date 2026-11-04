"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

import { requestPasswordReset } from "../actions";
import { resetRequestSchema, type ResetRequestInput } from "../schema";

import { FormMessage } from "./form-error";

export function ResetRequestForm() {
  const [message, setMessage] = React.useState<{ error?: string; success?: string }>({});
  const form = useForm<ResetRequestInput>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: { email: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: ResetRequestInput) {
    const result = await requestPasswordReset(values);
    setMessage(
      result.ok
        ? {
            success:
              "If an account exists for that email, a reset link is on its way. Open it in this browser.",
          }
        : { error: result.error },
    );
  }

  return (
    <form method="post" noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <FormMessage error={message.error} success={message.success} />
      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <Button type="submit" loading={isSubmitting} className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
