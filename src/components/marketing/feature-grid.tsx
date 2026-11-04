import type { LucideIcon } from "lucide-react";

export type Feature = { icon: LucideIcon; title: string; description: string };

export function FeatureGrid({ features }: { features: readonly Feature[] }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {features.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex flex-col gap-3 bg-card p-6">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="size-4.5" aria-hidden />
          </span>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </li>
      ))}
    </ul>
  );
}
