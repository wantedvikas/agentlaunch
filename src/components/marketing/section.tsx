import * as React from "react";

import { cn } from "@/lib/utils";

/** Consistent vertical rhythm and max width for marketing sections. */
export function Section({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl space-y-3", className)}>
      {eyebrow && (
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="font-heading text-4xl leading-none font-light text-balance sm:text-5xl"
      >
        {title}
      </h2>
      {description && <p className="text-lg text-pretty text-muted-foreground">{description}</p>}
    </div>
  );
}
