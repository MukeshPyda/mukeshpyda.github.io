import { initialBlogData } from '../data';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';

export function generateStaticParams() {
  return initialBlogData.map((blog) => ({
    id: blog.id.toString(),
  }));
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const blogIndex = initialBlogData.findIndex(b => b.id === parseInt(resolvedParams.id));
  
  if (blogIndex === -1) {
    notFound();
  }

  const blog = initialBlogData[blogIndex];
  const prevBlog = blogIndex > 0 ? { id: initialBlogData[blogIndex - 1].id, title: initialBlogData[blogIndex - 1].title } : undefined;
  const nextBlog = blogIndex < initialBlogData.length - 1 ? { id: initialBlogData[blogIndex + 1].id, title: initialBlogData[blogIndex + 1].title } : undefined;

  return <BlogDetailClient blog={blog} prevBlog={prevBlog} nextBlog={nextBlog} />;
}
