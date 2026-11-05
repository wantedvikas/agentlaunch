"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/features/auth/components/form-error";

import { askClaude } from "../actions";
import { askSchema, type AskInput } from "../schema";

export function AskForm() {
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const form = useForm<AskInput>({
    resolver: zodResolver(askSchema),
    defaultValues: { prompt: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: AskInput) {
    setServerError(null);
    setAnswer(null);
    const result = await askClaude(values);
    if (result.ok) setAnswer(result.data ?? "");
    else setServerError(result.error);
  }

  return (
    <div className="grid gap-6">
      <form method="post" noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormMessage error={serverError} />
        <FormField
          label="Your question"
          hint="Up to 2,000 characters."
          error={errors.prompt?.message}
        >
          <Textarea rows={4} {...form.register("prompt")} />
        </FormField>
        <div>
          <Button type="submit" loading={isSubmitting}>
            {!isSubmitting && <Sparkles aria-hidden />} Ask Claude
          </Button>
        </div>
      </form>
      <div aria-live="polite">
        {answer && (
          <Card>
            <CardContent className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">Answer</h2>
              <p className="text-sm leading-7 whitespace-pre-wrap">{answer}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
