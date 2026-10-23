'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, RefreshCw, Terminal } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/courses/CourseCard';
import { describeAuthError, signInWithGoogle, signOutUser, useFirebaseUser, verifiedEmail } from '@/lib/firebase/client';
import { getMyCourses, listPublishedCourses } from '@/lib/courses/api';
import type { Course } from '@/lib/courses/types';
import { siteConfig } from '@/lib/data';

export default function CoursesClient() {
  const { configured, user } = useFirebaseUser();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState('');
  const [mine, setMine] = useState<{ uid: string; ids: string[] } | null>(null);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!configured) return;
    listPublishedCourses()
      .then(setCourses)
      .catch(() => setError('Could not load courses. Please refresh the page.'));
  }, [configured]);

  useEffect(() => {
    const email = verifiedEmail(user);
    if (!user || !email) return;
    getMyCourses(email)
      .then((ids) => setMine({ uid: user.uid, ids }))
      .catch(() => setMine({ uid: user.uid, ids: [] }));
  }, [user]);

  const enrolledIds = user && mine?.uid === user.uid ? mine.ids : [];
  const myCourses = (courses ?? []).filter((c) => enrolledIds.includes(c.id));

  const signIn = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(describeAuthError(err));
    }
  };

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
          <p className="text-green-500/70 font-mono text-xs md:text-base">
            To enroll, contact <a className="underline hover:text-green-300" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          </p>

          {configured && (
            <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs md:text-sm">
              {user ? (
                <>
                  <span className="text-green-600 break-all">Signed in as {user.email}</span>
                  <button type="button" onClick={() => signOutUser()} className="flex items-center gap-2 text-red-400 hover:text-white uppercase tracking-widest">
                    <LogOut size={14} /> Sign out
                  </button>
                </>
              ) : (
                <button type="button" onClick={signIn} className="px-5 py-2 border border-green-500/30 hover:border-green-500 text-green-400 rounded-lg uppercase tracking-widest">
                  Learner sign in
                </button>
              )}
              {authError && <span className="text-red-400">{authError}</span>}
            </div>
          )}
        </div>

        {!configured ? (
          <p className="text-center text-green-700 font-mono uppercase tracking-[0.3em] py-24 border border-dashed border-green-500/10 rounded-2xl">Courses open soon.</p>
        ) : error ? (
          <p className="text-center text-red-400 font-mono py-16">{error}</p>
        ) : !courses ? (
          <RefreshCw className="animate-spin text-green-500 mx-auto" />
        ) : (
          <div className="space-y-16">
            {myCourses.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter text-green-400">My courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {myCourses.map((c) => <CourseCard key={c.id} course={c} enrolled />)}
                </div>
              </section>
            )}
            <section className="space-y-6">
              {myCourses.length > 0 && <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter text-white">All courses</h2>}
              {courses.length === 0 ? (
                <p className="text-center text-green-700 font-mono uppercase tracking-[0.3em] py-24 border border-dashed border-green-500/10 rounded-2xl">New courses are on the way.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map((c) => <CourseCard key={c.id} course={c} enrolled={enrolledIds.includes(c.id)} />)}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
