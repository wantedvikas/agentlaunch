/** Headline numbers in one ruled strip: label in mono, value in the display face. */
export function StatStrip({
  stats,
  label,
}: {
  stats: { label: string; value: React.ReactNode }[];
  label: string;
}) {
  return (
    <dl
      aria-label={label}
      className="grid divide-y rounded-lg border bg-card sm:auto-cols-fr sm:grid-flow-col sm:divide-x sm:divide-y-0"
    >
      {stats.map((s) => (
        <div key={s.label} className="space-y-2 px-5 py-4">
          <dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            {s.label}
          </dt>
          <dd className="font-heading text-4xl leading-[1.05] font-semibold tracking-tight tabular-nums">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
