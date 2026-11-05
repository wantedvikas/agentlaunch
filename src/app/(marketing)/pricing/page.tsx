import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";
import { PlanCard } from "@/features/billing/components/plan-card";
import { PLAN } from "@/features/billing/config";

export const metadata: Metadata = {
  title: "Pricing",
  description: "One simple plan. Cancel any time.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <Section className="flex flex-col items-center gap-10">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pricing</h1>
        <p className="text-lg text-muted-foreground">One simple plan. Cancel any time.</p>
      </div>
      <PlanCard>
        <Button asChild className="w-full">
          <Link href="/dashboard/billing">Get {PLAN.name}</Link>
        </Button>
      </PlanCard>
    </Section>
  );
}
