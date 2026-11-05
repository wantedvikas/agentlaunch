import { CircleAlert, CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutButton, PortalButton } from "@/features/billing/components/billing-buttons";
import { PlanCard } from "@/features/billing/components/plan-card";
import { PLAN } from "@/features/billing/config";
import { getStripeCustomerId, getSubscription, isActive } from "@/features/billing/queries";
import { isBillingConfigured } from "@/features/billing/stripe";
import { requireUser } from "@/lib/permissions/auth";

export const metadata: Metadata = { title: "Billing" };

const dateFmt = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

export default function BillingPage({ searchParams }: PageProps<"/dashboard/billing">) {
  return (
    <>
      <PageHeader title="Billing" description="Your plan and payment details." />
      <Suspense fallback={<Skeleton className="h-64" role="status" aria-label="Loading billing" />}>
        <BillingPanel searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function BillingPanel({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard/billing">["searchParams"];
}) {
  const user = await requireUser("/dashboard/billing");
  const [{ checkout }, subscription, customer] = await Promise.all([
    searchParams,
    getSubscription(user.id),
    getStripeCustomerId(user.id),
  ]);
  const configured = isBillingConfigured();
  const active = isActive(subscription);

  return (
    <div className="space-y-6">
      {checkout === "success" && !active && (
        <Alert>
          <CircleCheck aria-hidden />
          <AlertTitle>Thanks! Your payment is being confirmed</AlertTitle>
          <AlertDescription>
            Your plan activates as soon as Stripe confirms it, usually within a few seconds. Refresh
            this page if it doesn&apos;t update.
          </AlertDescription>
        </Alert>
      )}
      {!configured && (
        <Alert variant="warning">
          <CircleAlert aria-hidden />
          <AlertTitle>Billing isn&apos;t configured</AlertTitle>
          <AlertDescription>
            Set <code>STRIPE_SECRET_KEY</code> and <code>STRIPE_PRICE_ID</code> on the server and
            restart. See <code>docs/BILLING.md</code>.
          </AlertDescription>
        </Alert>
      )}

      {subscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {PLAN.name}
              <Badge variant={active ? "success" : "warning"}>
                {subscription.status.replace("_", " ")}
              </Badge>
            </CardTitle>
            <CardDescription>
              {active &&
                subscription.current_period_end &&
                (subscription.cancel_at_period_end ? "Ends on " : "Renews on ") +
                  dateFmt.format(new Date(subscription.current_period_end))}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {customer && configured && <PortalButton />}
            {!active && configured && <CheckoutButton />}
          </CardContent>
        </Card>
      ) : (
        <PlanCard>{configured && <CheckoutButton />}</PlanCard>
      )}
    </div>
  );
}
