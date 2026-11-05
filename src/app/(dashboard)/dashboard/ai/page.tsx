import { CircleAlert } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AskForm } from "@/features/ai/components/ask-form";
import { isAiConfigured } from "@/features/ai/config";

export const metadata: Metadata = { title: "AI assistant" };

export default function AiPage() {
  return (
    <>
      <PageHeader
        title="AI assistant"
        description="A server-side example of calling Claude. Your API key never reaches the browser."
      />
      <Suspense fallback={<Skeleton className="h-48" />}>
        <AiPanel />
      </Suspense>
    </>
  );
}

async function AiPanel() {
  await connection(); // read the env at request time, not at build time
  if (!isAiConfigured()) {
    return (
      <Alert variant="warning">
        <CircleAlert aria-hidden />
        <AlertTitle>AI isn&apos;t configured</AlertTitle>
        <AlertDescription>
          Set <code>ANTHROPIC_API_KEY</code> on the server (in <code>.env.local</code> locally) and
          restart. See <code>docs/AI.md</code>.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <Card>
      <CardContent>
        <AskForm />
      </CardContent>
    </Card>
  );
}
