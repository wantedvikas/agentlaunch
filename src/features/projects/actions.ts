"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/permissions/auth";
import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, type ActionResult } from "@/lib/validation/action-result";

import { projectInputSchema, type ProjectInput } from "./schema";

const idSchema = z.uuid();
const SIGNED_OUT: ActionResult = { ok: false, error: "Your session has ended. Sign in again." };
const INVALID = "Check the highlighted fields.";

function done(): ActionResult {
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function createProject(input: ProjectInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: INVALID, fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const supabase = await createClient();
  // owner_id is set by the database default (auth.uid()); clients have no grant to set it.
  const { error } = await supabase.from("projects").insert(parsed.data);
  if (error) {
    console.error("createProject failed", error.code);
    return { ok: false, error: "We couldn't create the project. Please try again." };
  }
  return done();
}

export async function updateProject(id: string, input: ProjectInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  const parsed = projectInputSchema.safeParse(input);
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Project not found." };
  if (!parsed.success)
    return { ok: false, error: INVALID, fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update(parsed.data)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");
  if (error) {
    console.error("updateProject failed", error.code);
    return { ok: false, error: "We couldn't save your changes. Please try again." };
  }
  // RLS hides other users' rows, so a missing row and someone else's row look the same.
  if (data.length === 0) return { ok: false, error: "Project not found." };
  return done();
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Project not found." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");
  if (error) {
    console.error("deleteProject failed", error.code);
    return { ok: false, error: "We couldn't delete the project. Please try again." };
  }
  if (data.length === 0) return { ok: false, error: "Project not found." };
  return done();
}
