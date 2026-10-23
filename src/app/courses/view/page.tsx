import { Suspense } from 'react';
import type { Metadata } from 'next';
import CourseViewClient from './CourseViewClient';

export const metadata: Metadata = {
  title: 'Course',
  description: 'Cybersecurity training with personal mentorship from Mukesh Pyda.',
};

export default function CourseViewPage() {
  return (
    <Suspense fallback={null}>
      <CourseViewClient />
    </Suspense>
  );
}
