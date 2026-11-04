"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { FormMessage } from "@/features/auth/components/form-error";

import { updateProfile } from "../actions";
import { profileInputSchema, type ProfileInput } from "../schema";

export function ProfileForm({ email, displayName }: { email: string; displayName: string }) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileInputSchema),
    defaultValues: { displayName },
  });
  const { errors, isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: ProfileInput) {
    setServerError(null);
    const result = await updateProfile(values);
    if (result.ok) {
      form.reset(values);
      toast({ title: "Profile saved", variant: "success" });
    } else {
      setServerError(result.error);
    }
  }

  return (
    <form
      method="post"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid max-w-md gap-4"
    >
      <FormMessage error={serverError} />
      <FormField label="Display name" error={errors.displayName?.message}>
        <Input autoComplete="name" {...form.register("displayName")} />
      </FormField>
      <FormField label="Email" hint="Your sign-in email. Contact support to change it.">
        <Input type="email" value={email} readOnly disabled />
      </FormField>
      <div>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
