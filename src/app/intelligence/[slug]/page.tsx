import { initialBlogData } from '../data';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';

export function generateStaticParams() {
  return initialBlogData.map((blog) => ({
    slug: blog.slug,
  }));
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const blogIndex = initialBlogData.findIndex(b => b.slug === resolvedParams.slug);
  
  if (blogIndex === -1) {
    notFound();
  }

  const blog = initialBlogData[blogIndex];
  const prevBlog = blogIndex > 0 ? { slug: initialBlogData[blogIndex - 1].slug, title: initialBlogData[blogIndex - 1].title } : undefined;
  const nextBlog = blogIndex < initialBlogData.length - 1 ? { slug: initialBlogData[blogIndex + 1].slug, title: initialBlogData[blogIndex + 1].title } : undefined;

  return <BlogDetailClient blog={blog} prevBlog={prevBlog} nextBlog={nextBlog} />;
}
