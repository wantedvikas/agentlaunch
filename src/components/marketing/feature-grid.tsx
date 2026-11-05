import type { LucideIcon } from "lucide-react";

import { Reveal } from "./motion/reveal";

export type Feature = { icon: LucideIcon; title: string; description: string };

/** Soft cards that rise in, one after another, as the grid scrolls into view. */
export function FeatureGrid({
  features,
}: {
  features: readonly (Feature & { status?: "ready" | "planned" })[];
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map(({ icon: Icon, title, description, status }, i) => (
        <Reveal
          as="li"
          key={title}
          delay={(i % 3) * 90}
          className="group space-y-3 rounded-3xl border bg-card p-6 shadow-xs transition-[box-shadow,translate] duration-(--duration-base) hover:-translate-y-1 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-transform duration-(--duration-base) ease-(--ease-spring) group-hover:scale-110 group-hover:-rotate-6">
              <Icon className="size-5" aria-hidden />
            </span>
            {status && (
              <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                {status === "ready" ? "Ready" : "Planned"}
              </span>
            )}
          </div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </Reveal>
      ))}
    </ul>
  );
}
