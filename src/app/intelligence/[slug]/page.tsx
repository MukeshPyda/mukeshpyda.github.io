import type { Metadata } from 'next';
import { getBlogs } from '../posts';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';

export function generateStaticParams() {
  return getBlogs().map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogs().find((b) => b.slug === slug);
  if (!blog) return {};
  return {
    title: blog.title,
    description: blog.summary,
    keywords: blog.tags,
    alternates: { canonical: `/intelligence/${blog.slug}/` },
    openGraph: {
      type: 'article',
      title: blog.title,
      description: blog.summary,
      url: `/intelligence/${blog.slug}/`,
      ...(blog.mainImage ? { images: [blog.mainImage] } : {}),
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const initialBlogData = getBlogs();
  const blogIndex = initialBlogData.findIndex(b => b.slug === resolvedParams.slug);

  if (blogIndex === -1) {
    notFound();
  }

  const blog = initialBlogData[blogIndex];
  const prevBlog = blogIndex > 0 ? { slug: initialBlogData[blogIndex - 1].slug, title: initialBlogData[blogIndex - 1].title } : undefined;
  const nextBlog = blogIndex < initialBlogData.length - 1 ? { slug: initialBlogData[blogIndex + 1].slug, title: initialBlogData[blogIndex + 1].title } : undefined;

  return <BlogDetailClient blog={blog} prevBlog={prevBlog} nextBlog={nextBlog} />;
}
