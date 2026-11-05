import "server-only";

import { requireUser } from "@/lib/permissions/auth";
import { createClient } from "@/lib/supabase/server";

export const BUCKET = "uploads";
const SIGNED_URL_SECONDS = 60;

export type StoredFile = {
  path: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  url: string | null;
};

/** The signed-in user's files, newest first, with short-lived download links. */
export async function listFiles(): Promise<StoredFile[]> {
  const user = await requireUser("/dashboard/files");
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(user.id, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw new Error("Could not load files.");

  const files = data.filter((f) => f.id && f.metadata);
  const paths = files.map((f) => `${user.id}/${f.name}`);
  const { data: signed } = paths.length
    ? await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS)
    : { data: [] };

  return files.map((f, i) => ({
    path: paths[i]!,
    // Stored as "<uuid>-<name>"; show the original name.
    name: f.name.replace(/^[0-9a-f-]{36}-/, ""),
    size: f.metadata!.size,
    type: f.metadata!.mimetype,
    createdAt: f.created_at ?? "",
    url: signed?.[i]?.signedUrl ?? null,
  }));
}
