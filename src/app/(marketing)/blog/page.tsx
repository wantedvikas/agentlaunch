import type { Metadata } from "next";
import Link from "next/link";

import { Section, SectionHeading } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPostDate, listPosts } from "@/features/blog/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "News, guides and notes.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await listPosts();
  return (
    <Section>
      <SectionHeading eyebrow="Blog" title="Notes and guides" className="mb-10" />
      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Add an .mdx file to src/content/blog to publish one."
        />
      ) : (
        <ul className="divide-y border-y">
          {posts.map(({ slug, meta }) => (
            <li key={slug}>
              <article className="flex flex-col gap-2 py-6">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <time dateTime={meta.date}>{formatPostDate(meta.date)}</time>
                  {meta.demo && <Badge variant="outline">Demo post</Badge>}
                </div>
                <h2 className="text-xl font-semibold tracking-tight">
                  <Link href={`/blog/${slug}`} className="hover:text-primary">
                    {meta.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground">{meta.description}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
