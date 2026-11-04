"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Plus } from "lucide-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

import { projectInputSchema, projectStatuses, type ProjectInput } from "../schema";

const statusLabels: Record<(typeof projectStatuses)[number], string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

/**
 * Create-project dialog. Validation is real; saving is not wired up until the database is
 * connected, so a valid submit says so plainly instead of pretending to save.
 */
export function ProjectFormDialog() {
  const [open, setOpen] = React.useState(false);
  const [notSaved, setNotSaved] = React.useState(false);
  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectInputSchema),
    defaultValues: { name: "", description: "", status: "active" },
  });
  const { errors, isSubmitting } = form.formState;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset();
      setNotSaved(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden /> New project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Give your project a name and an optional description.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="grid gap-4"
          onSubmit={form.handleSubmit(() => setNotSaved(true))}
        >
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
          {notSaved && (
            <Alert variant="warning">
              <CircleAlert aria-hidden />
              <AlertTitle>Not saved</AlertTitle>
              <AlertDescription>
                The form is valid, but no database is connected yet. Connect Supabase to save
                projects.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={isSubmitting}>
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
