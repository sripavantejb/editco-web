import type { Metadata } from "next";
import { getPost } from "@/content/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { getBlogPostSchema } from "@/lib/schema/pages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return buildPageMetadata({
      path: `/blog/${slug}`,
      title: "Article Not Found",
      noIndex: true,
    });
  }

  return buildPageMetadata({
    path: `/blog/${slug}`,
    title: post.title,
    description: post.excerpt,
    ogType: "article",
  });
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const schema = getBlogPostSchema(slug);

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      {children}
    </>
  );
}
