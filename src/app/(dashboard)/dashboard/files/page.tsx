import { FileUp } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { FilesTable } from "@/features/uploads/components/files-table";
import { UploadForm } from "@/features/uploads/components/upload-form";
import { listFiles } from "@/features/uploads/queries";

export const metadata: Metadata = { title: "Files" };

export default function FilesPage() {
  return (
    <>
      <PageHeader
        title="Files"
        description="Upload and download your files. They're private to you."
      />
      <Card>
        <CardContent>
          <UploadForm />
        </CardContent>
      </Card>
      <Suspense fallback={<Skeleton className="h-48" role="status" aria-label="Loading files" />}>
        <FileList />
      </Suspense>
    </>
  );
}

async function FileList() {
  const files = await listFiles();
  if (files.length === 0)
    return (
      <EmptyState
        icon={FileUp}
        title="No files yet"
        description="Files you upload will appear here."
      />
    );
  return <FilesTable files={files} />;
}
