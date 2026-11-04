"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { FormMessage } from "@/features/auth/components/form-error";

import { createProject, updateProject } from "../actions";
import type { Project } from "../queries";
import { projectInputSchema, projectStatuses, statusLabels, type ProjectInput } from "../schema";

/** Create (no `project`) or edit (with `project`) dialog. The trigger is passed as children. */
export function ProjectFormDialog({
  project,
  children,
}: {
  project?: Project;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const defaults: ProjectInput = {
    name: project?.name ?? "",
    description: project?.description ?? "",
    status: project?.status ?? "active",
  };
  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectInputSchema),
    defaultValues: defaults,
  });
  const { errors, isSubmitting } = form.formState;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(defaults);
      setServerError(null);
    }
  }

  async function onSubmit(values: ProjectInput) {
    setServerError(null);
    const result = project ? await updateProject(project.id, values) : await createProject(values);
    if (result.ok) {
      setOpen(false);
      toast({ title: project ? "Project updated" : "Project created", variant: "success" });
      return;
    }
    setServerError(result.error);
    Object.entries(result.fieldErrors ?? {}).forEach(([k, message]) =>
      form.setError(k as keyof ProjectInput, { message }),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>
            {project
              ? "Update the details below."
              : "Give your project a name and an optional description."}
          </DialogDescription>
        </DialogHeader>
        <form
          method="post"
          noValidate
          className="grid gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormMessage error={serverError} />
          <FormField label="Name" required error={errors.name?.message}>
            <Input autoComplete="off" {...form.register("name")} />
          </FormField>
          <FormField
            label="Description"
            hint="Up to 500 characters."
            error={errors.description?.message}
          >
            <Textarea {...form.register("description")} />
          </FormField>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormField label="Status" error={errors.status?.message}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusLabels[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={isSubmitting}>
              {project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
