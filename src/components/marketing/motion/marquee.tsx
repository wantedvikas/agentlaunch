/**
 * Infinite, pausable ticker. The list is rendered twice and slid by half its width; the copy
 * is aria-hidden. Reduced motion shows a static, wrapped list.
 */
export function Marquee({ items, label }: { items: readonly string[]; label: string }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-12 pr-12">
      {items.map((item) => (
        <li
          key={item}
          className="font-heading text-2xl font-semibold tracking-tight whitespace-nowrap text-muted-foreground/80"
        >
          {item}
        </li>
      ))}
    </ul>
  );
  return (
    <div
      aria-label={label}
      role="region"
      className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
        {row(false)}
        <div className="contents motion-reduce:hidden">{row(true)}</div>
      </div>
    </div>
  );
}
