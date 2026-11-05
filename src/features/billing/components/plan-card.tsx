import { Check } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { PLAN } from "../config";

export function PlanCard({ children }: { children?: React.ReactNode }) {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>{PLAN.name}</CardTitle>
        <CardDescription>{PLAN.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p>
          <span className="text-3xl font-semibold tracking-tight">{PLAN.price}</span>
          <span className="text-muted-foreground"> / {PLAN.interval}</span>
        </p>
        <ul className="space-y-2 text-sm">
          {PLAN.features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="size-4 text-success" aria-hidden /> {f}
            </li>
          ))}
        </ul>
        {children}
      </CardContent>
    </Card>
  );
}
