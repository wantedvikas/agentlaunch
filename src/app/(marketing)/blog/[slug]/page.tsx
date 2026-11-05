import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPostDate, getPost, postSlugs } from "@/features/blog/posts";

export function generateStaticParams() {
  return postSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.meta.title,
      description: post.meta.description,
      publishedTime: post.meta.date,
    },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPost(slug); // only files in src/content/blog; anything else is a 404
  if (!post) notFound();
  const { meta, Content } = post;

  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 md:py-20">
      <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
        ← All posts
      </Link>
      <header className="mt-6 mb-8 space-y-3">
        <h1 className="font-heading text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
          {meta.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          <time dateTime={meta.date}>{formatPostDate(meta.date)}</time> · {meta.author}
        </p>
      </header>
      {meta.demo && (
        <Alert variant="info" className="mb-8">
          <AlertDescription>
            This is demo content that ships with the starter. Edit or delete it before launch.
          </AlertDescription>
        </Alert>
      )}
      <Content />
    </article>
  );
}
