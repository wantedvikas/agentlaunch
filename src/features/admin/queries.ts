import "server-only";

import { notFound } from "next/navigation";

import { requireUser } from "@/lib/permissions/auth";
import { createClient } from "@/lib/supabase/server";

import type { UserFilter } from "./schema";

/** Reads the admin flag from the database (profiles.is_admin), never from the client. */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}

/** Signed-out users go to /login; signed-in non-admins get a 404 so the page isn't revealed. */
export async function requireAdmin() {
  const user = await requireUser("/dashboard/admin");
  if (!(await isAdmin())) notFound();
  return user;
}

export type AdminUser = {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  is_admin: boolean;
  is_paying: boolean;
};

export async function listUsers(search: string, filter: UserFilter): Promise<AdminUser[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_users", {
    p_search: search,
    p_filter: filter,
  });
  if (error) throw new Error("Could not load users.");
  return data;
}

export type DailyStats = {
  day: string;
  users: number;
  paying_users: number;
  revenue_cents: number;
  updated_at: string;
};

export async function getLatestStats(): Promise<DailyStats | null> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_stats")
    .select("day, users, paying_users, revenue_cents, updated_at")
    .order("day", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Could not load stats.");
  return data;
}
