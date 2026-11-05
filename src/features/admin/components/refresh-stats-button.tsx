"use client";

import { RefreshCw } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

import { refreshStats } from "../actions";

export function RefreshStatsButton() {
  const [pending, startTransition] = React.useTransition();
  const run = () =>
    startTransition(async () => {
      const result = await refreshStats();
      if (result.ok) toast({ title: "Stats refreshed", variant: "success" });
      else toast({ title: "Refresh failed", description: result.error, variant: "error" });
    });
  return (
    <Button variant="outline" onClick={run} disabled={pending}>
      <RefreshCw aria-hidden className={pending ? "animate-spin" : undefined} />
      {pending ? "Refreshing…" : "Refresh stats"}
    </Button>
  );
}
