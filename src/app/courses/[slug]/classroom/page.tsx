import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClassroomClient from './ClassroomClient';
import { CATALOG, catalogBySlug } from '@/lib/courses/catalog';

export const dynamicParams = false;

export function generateStaticParams() {
  return CATALOG.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = catalogBySlug((await params).slug);
  return { title: entry ? `Classroom: ${entry.title}` : 'Classroom', robots: { index: false, follow: false } };
}

export default async function ClassroomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!catalogBySlug(slug)) notFound();
  return <ClassroomClient slug={slug} />;
}
