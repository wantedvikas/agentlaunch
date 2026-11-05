"use client";

import { Upload } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { FormMessage } from "@/features/auth/components/form-error";

import { uploadFile } from "../actions";
import { ACCEPT_ATTR, checkFile } from "../schema";

export function UploadForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hintId = React.useId();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = inputRef.current?.files?.[0];
    if (!file) return setError("Choose a file to upload.");
    const check = checkFile(file);
    if (!check.ok) return setError(check.error);
    setError(null);
    startTransition(async () => {
      const result = await uploadFile(new FormData(form));
      if (result.ok) {
        form.reset();
        toast({ title: "File uploaded", variant: "success" });
      } else setError(result.error);
    });
  }

  return (
    <form
      method="post"
      encType="multipart/form-data"
      onSubmit={onSubmit}
      className="grid gap-3"
      noValidate
    >
      <FormMessage error={error} />
      <label htmlFor="file" className="text-sm font-medium">
        Choose a file
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          id="file"
          name="file"
          type="file"
          accept={ACCEPT_ATTR}
          aria-describedby={hintId}
          aria-invalid={error ? true : undefined}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-muted"
        />
        <Button type="submit" loading={pending}>
          <Upload aria-hidden /> Upload
        </Button>
      </div>
      <p id={hintId} className="text-xs text-muted-foreground">
        PNG, JPEG, WebP, GIF, PDF or plain text, up to 5 MB. Only you can see your files.
      </p>
    </form>
  );
}
