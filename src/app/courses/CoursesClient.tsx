'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, Terminal } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/courses/CourseCard';
import { CATALOG, catalogToCourse, catalogUrl } from '@/lib/courses/catalog';
import { listPublishedCourses } from '@/lib/courses/api';
import { firebaseConfigured } from '@/lib/firebase/config';
import type { Course } from '@/lib/courses/types';
import { siteConfig } from '@/lib/data';

export default function CoursesClient() {
  // Website courses render from code at build time; Firestore adds live seat counts
  // and any courses created only in the admin.
  const [live, setLive] = useState<Course[]>([]);

  useEffect(() => {
    if (!firebaseConfigured) return;
    listPublishedCourses()
      .then(setLive)
      .catch(() => {});
  }, []);

  const countFor = (slug: string) => live.find((c) => c.id === slug)?.enrolledCount ?? 0;
  const extra = live.filter((c) => !CATALOG.some((e) => e.slug === c.id));

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-12 px-6 overflow-hidden">
      <Navbar />
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00ff00 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="py-16 md:py-24 flex flex-col items-center text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-green-500 font-mono text-sm md:text-lg tracking-[0.3em] uppercase font-bold">
            <Terminal size={18} /> <span>Directives</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
            Training <span className="text-green-500">Courses</span>
          </motion.h1>
          <div className="h-0.5 w-16 bg-green-500 rounded-full shadow-[0_0_15px_#00ff00]" />
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/80 font-mono text-xs md:text-xl max-w-3xl leading-relaxed uppercase tracking-wider">
            Hands-on cybersecurity training with personal mentorship. Enrollment is by approval.
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs md:text-sm">
            <Link href="/dashboard/" className="flex items-center gap-2 px-5 py-2 border border-green-500/30 hover:border-green-500 text-green-400 rounded-lg uppercase tracking-widest">
              <LayoutDashboard size={14} /> My dashboard
            </Link>
            <a className="text-green-500/70 underline hover:text-green-300" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATALOG.map((entry) => (
            <CourseCard key={entry.slug} course={catalogToCourse(entry, countFor(entry.slug))} href={catalogUrl(entry.slug)} image={entry.cover} />
          ))}
          {extra.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </div>
    </main>
  );
}
