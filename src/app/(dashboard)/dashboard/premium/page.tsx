import { Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportProjectsButton } from "@/features/billing/components/billing-buttons";
import { PLAN } from "@/features/billing/config";
import { hasActiveSubscription } from "@/features/billing/queries";
import { requireUser } from "@/lib/permissions/auth";

export const metadata: Metadata = { title: "Premium" };

export default function PremiumPage() {
  return (
    <>
      <PageHeader
        title="Premium"
        description="An example of a paid feature. Access is checked on the server."
      />
      <Suspense fallback={<Skeleton className="h-48" role="status" aria-label="Loading" />}>
        <PremiumContent />
      </Suspense>
    </>
  );
}

async function PremiumContent() {
  const user = await requireUser("/dashboard/premium");
  if (!(await hasActiveSubscription(user.id))) {
    return (
      <EmptyState
        icon={Lock}
        title={`This page needs ${PLAN.name}`}
        description="Subscribe to unlock premium features."
        action={
          <Button asChild>
            <Link href="/dashboard/billing">See plans</Link>
          </Button>
        }
      />
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export your projects</CardTitle>
        <CardDescription>Download every project as a CSV file.</CardDescription>
      </CardHeader>
      <CardContent>
        <ExportProjectsButton />
      </CardContent>
    </Card>
  );
}
