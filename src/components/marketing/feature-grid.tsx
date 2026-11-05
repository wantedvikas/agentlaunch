import type { LucideIcon } from "lucide-react";

export type Feature = { icon: LucideIcon; title: string; description: string };

/** Hairline-ruled list: no boxed icons or cards, so the words carry the section. */
export function FeatureGrid({
  features,
}: {
  features: readonly (Feature & { status?: "ready" | "planned" })[];
}) {
  return (
    <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {features.map(({ icon: Icon, title, description, status }) => (
        <li key={title} className="space-y-2 border-t pt-5">
          <div className="flex items-center justify-between gap-3">
            <Icon className="size-5 text-muted-foreground" strokeWidth={1.5} aria-hidden />
            {status && (
              <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                {status === "ready" ? "Ready" : "Planned"}
              </span>
            )}
          </div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </li>
      ))}
    </ul>
  );
}
