import { FolderKanban } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { PreviewNotice } from "@/components/dashboard/preview-notice";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Create and manage your projects. Only you can see them."
        actions={<ProjectFormDialog />}
      />
      <PreviewNotice />
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Use “New project” to create your first one. Projects are saved once the database is connected."
      />
    </>
  );
}
