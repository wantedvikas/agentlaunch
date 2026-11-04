import "server-only";

import { requireUser } from "@/lib/permissions/auth";
import { createClient } from "@/lib/supabase/server";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
};

const COLUMNS = "id, name, description, status, created_at, updated_at";

/**
 * Lists the signed-in user's projects. Authorization is enforced twice on purpose:
 * the explicit owner filter here, and owner-only RLS in the database.
 */
export async function listProjects(limit = 100): Promise<Project[]> {
  const user = await requireUser("/dashboard/projects");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Could not load projects.");
  return data;
}
