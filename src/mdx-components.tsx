import type { MDXComponents } from "mdx/types";
import Link from "next/link";

/**
 * Global styles for MDX content (blog posts). Required by @next/mdx in the App Router.
 * Styled with design tokens instead of a typography plugin.
 */
const components: MDXComponents = {
  h2: (props) => (
    <h2 className="mt-12 mb-3 font-heading text-3xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props) => <h3 className="mt-8 mb-2 text-xl font-semibold" {...props} />,
  p: (props) => <p className="my-4 leading-7 text-foreground/90" {...props} />,
  ul: (props) => <ul className="my-4 ml-6 list-disc space-y-2" {...props} />,
  ol: (props) => <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />,
  li: (props) => <li className="leading-7" {...props} />,
  a: ({ href = "", ...props }) =>
    href.startsWith("/") ? (
      <Link
        href={href}
        className="font-medium text-primary underline underline-offset-4"
        {...props}
      />
    ) : (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-4"
        rel="noreferrer"
        {...props}
      />
    ),
  blockquote: (props) => (
    <blockquote className="my-6 border-l-2 pl-4 text-muted-foreground italic" {...props} />
  ),
  code: (props) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]" {...props} />
  ),
  pre: (props) => (
    <pre
      // Scrolls sideways on small screens, so it must be reachable by keyboard.
      tabIndex={0}
      className="my-6 overflow-x-auto rounded-xl border bg-card p-4 font-mono text-sm leading-relaxed [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-border" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
