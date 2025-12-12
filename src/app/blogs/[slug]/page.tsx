import { Metadata } from "next";
import { getBlogBySlug } from "@@/data/blogs";
import BlogPostClient from "./BlogPostClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = getBlogBySlug(resolvedParams.slug);

  if (!blog) {
    return {
      title: "Blog Not Found | Zigla City",
      description: "This blog post does not exist.",
    };
  }

  const image = blog.image || "/zigla.png";

  return {
    title: `${blog.title} | Zigla City`,
    description: blog.excerpt,
    openGraph: {
      title: `${blog.title} | Zigla City`,
      description: blog.excerpt,
      url: `https://ziglacity.tech/blogs/${blog.slug}`,
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: blog.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${blog.title} | Zigla City`,
      description: blog.excerpt,
      images: [image],
    },
  };
}

// render client component and pass blog data
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const blog = getBlogBySlug(resolvedParams.slug);
  if (!blog) return <div>Blog Not Found</div>;

  return <BlogPostClient slug_={blog.slug} />;
}
