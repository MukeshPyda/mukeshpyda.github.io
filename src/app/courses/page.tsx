import type { Metadata } from 'next';
import CoursesClient from './CoursesClient';

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Hands-on cybersecurity training with personal mentorship from Mukesh Pyda.',
  alternates: { canonical: '/courses/' },
};

export default function CoursesPage() {
  return <CoursesClient />;
}
