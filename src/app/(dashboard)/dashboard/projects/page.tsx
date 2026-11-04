import { FolderKanban, Plus } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog";
import { ProjectsTable } from "@/features/projects/components/projects-table";
import { listProjects } from "@/features/projects/queries";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Create and manage your projects. Only you can see them."
        actions={
          <ProjectFormDialog>
            <Button>
              <Plus aria-hidden /> New project
            </Button>
          </ProjectFormDialog>
        }
      />
      <Suspense
        fallback={<Skeleton className="h-64" role="status" aria-label="Loading projects" />}
      >
        <ProjectsList />
      </Suspense>
    </>
  );
}

async function ProjectsList() {
  const projects = await listProjects();
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Use “New project” to create your first one."
      />
    );
  }
  return <ProjectsTable projects={projects} />;
}
