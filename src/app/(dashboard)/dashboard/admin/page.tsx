import { Search, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshStatsButton } from "@/features/admin/components/refresh-stats-button";
import { UsersTable } from "@/features/admin/components/users-table";
import { getLatestStats, listUsers, requireAdmin } from "@/features/admin/queries";
import { usersQuerySchema, type UserFilter } from "@/features/admin/schema";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };

const FILTER_LABELS: Record<UserFilter, string> = {
  all: "All",
  // @module:payments
  paying: "Paying",
  // @end:payments
  admin: "Admins",
} as Record<UserFilter, string>;

export default function AdminPage({ searchParams }: PageProps<"/dashboard/admin">) {
  return (
    <>
      <PageHeader
        title="Admin"
        description="Users and headline numbers. Visible to admins only."
        actions={<RefreshStatsButton />}
      />
      <Suspense fallback={<Skeleton className="h-96" role="status" aria-label="Loading admin" />}>
        <AdminContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function AdminContent({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard/admin">["searchParams"];
}) {
  await requireAdmin();
  const { q, filter } = usersQuerySchema.parse(await searchParams);
  const [stats, users] = await Promise.all([getLatestStats(), listUsers(q, filter)]);
  const money = new Intl.NumberFormat("en", { style: "currency", currency: "USD" });

  const cards = [
    { label: "Users", value: stats?.users ?? 0 },
    // @module:payments
    { label: "Paying users", value: stats?.paying_users ?? 0 },
    { label: "Revenue (all time)", value: money.format((stats?.revenue_cents ?? 0) / 100) },
    // @end:payments
  ];

  return (
    <div className="space-y-6">
      <section aria-label="Stats" className="space-y-2">
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <Card key={c.label}>
              <CardHeader>
                <CardDescription>{c.label}</CardDescription>
                <CardTitle className="text-2xl">{c.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {stats
            ? `Updated ${new Date(stats.updated_at).toUTCString()}. Refreshed hourly by a database job.`
            : "No stats yet. They're computed hourly, or use Refresh stats."}
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {/* GET on purpose: a search term is not a secret, and the URL stays shareable. */}
            <form className="flex items-end gap-2" role="search">
              <FormField label="Search users">
                <Input
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="Email or name"
                  maxLength={100}
                />
              </FormField>
              {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
              <Button type="submit" variant="outline">
                <Search aria-hidden /> Search
              </Button>
            </form>
            <nav aria-label="Filter users" className="flex gap-1">
              {Object.entries(FILTER_LABELS).map(([id, label]) => {
                const params = new URLSearchParams({
                  ...(q && { q }),
                  ...(id !== "all" && { filter: id }),
                });
                return (
                  <Link
                    key={id}
                    href={`/dashboard/admin${params.size ? `?${params}` : ""}`}
                    aria-current={filter === id ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium",
                      filter === id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
          {users.length ? (
            <UsersTable users={users} />
          ) : (
            <EmptyState icon={Users} title="No users match" description="Try a different search." />
          )}
          {users.length === 100 && (
            <p className="text-xs text-muted-foreground">Showing the first 100 matches.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
