import { FolderKanban } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/page-header";
import { PreviewNotice } from "@/components/dashboard/preview-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Overview" };

const setup = [
  { label: "Copy .env.example to .env.local", hint: "Add your own Supabase project URL and keys." },
  {
    label: "Apply database migrations",
    hint: "Creates the profiles and projects tables with RLS.",
  },
  { label: "Create an account", hint: "Sign up, confirm your email and come back here." },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Overview" description="Your workspace at a glance." />
      <PreviewNotice />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Finish setup</CardTitle>
            <CardDescription>These steps connect the dashboard to real data.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {setup.map((s, i) => (
                <li key={s.label} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-sm text-muted-foreground">{s.hint}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Projects you create will show up here."
          action={
            <Button asChild variant="outline">
              <Link href="/dashboard/projects">Go to projects</Link>
            </Button>
          }
        />
      </div>
    </>
  );
}
