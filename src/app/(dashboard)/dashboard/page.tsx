import { ArrowRight, FolderKanban } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatStrip } from "@/components/dashboard/stat-strip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile } from "@/features/profile/queries";
import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog";
import { listProjects } from "@/features/projects/queries";
import { statusLabels } from "@/features/projects/schema";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Overview searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Overview({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const [profile, projects, sp] = await Promise.all([getProfile(), listProjects(), searchParams]);
  const counts = { active: 0, paused: 0, archived: 0 };
  projects.forEach((p) => counts[p.status]++);

  return (
    <>
      <PageHeader
        title={profile.displayName ? `Welcome, ${profile.displayName}` : "Welcome"}
        description="Your workspace at a glance."
      />
      {sp.notice === "password-updated" && (
        <Alert variant="success">
          <AlertDescription className="text-foreground">
            Your password has been updated.
          </AlertDescription>
        </Alert>
      )}
      <StatStrip
        label="Projects by status"
        stats={(Object.keys(counts) as (keyof typeof counts)[]).map((s) => ({
          label: `${statusLabels[s]} projects`,
          value: counts[s],
        }))}
      />
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to see it here."
          action={
            <ProjectFormDialog>
              <Button>New project</Button>
            </ProjectFormDialog>
          }
        />
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent projects</CardTitle>
              <CardDescription>Your latest work.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/projects">
                View all <ArrowRight aria-hidden />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="truncate font-medium">{p.name}</span>
                  <Badge variant="outline">{statusLabels[p.status]}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <Skeleton className="h-7 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
