"use client";

import { CreditCard, Download, ExternalLink } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/validation/action-result";

import { exportProjectsCsv, openBillingPortal, startCheckout } from "../actions";

function useRedirectAction(action: () => Promise<ActionResult<string>>, failTitle: string) {
  const [pending, startTransition] = React.useTransition();
  const run = () =>
    startTransition(async () => {
      const result = await action();
      if (result.ok && result.data) window.location.assign(result.data);
      else if (!result.ok) toast({ title: failTitle, description: result.error, variant: "error" });
    });
  return [pending, run] as const;
}

export function CheckoutButton() {
  const [pending, run] = useRedirectAction(startCheckout, "Checkout unavailable");
  return (
    <Button onClick={run} disabled={pending}>
      <CreditCard aria-hidden /> {pending ? "Opening checkout…" : "Subscribe"}
    </Button>
  );
}

export function PortalButton() {
  const [pending, run] = useRedirectAction(openBillingPortal, "Portal unavailable");
  return (
    <Button variant="outline" onClick={run} disabled={pending}>
      <ExternalLink aria-hidden /> {pending ? "Opening…" : "Manage billing"}
    </Button>
  );
}

export function ExportProjectsButton() {
  const [pending, startTransition] = React.useTransition();
  const run = () =>
    startTransition(async () => {
      const result = await exportProjectsCsv();
      if (!result.ok) {
        toast({ title: "Export failed", description: result.error, variant: "error" });
        return;
      }
      const url = URL.createObjectURL(new Blob([result.data ?? ""], { type: "text/csv" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: "projects.csv" });
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Projects exported", variant: "success" });
    });
  return (
    <Button onClick={run} disabled={pending}>
      <Download aria-hidden /> {pending ? "Exporting…" : "Export projects (CSV)"}
    </Button>
  );
}
