'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, ChevronLeft, Lock, LogOut, Mail, RefreshCw, Terminal } from 'lucide-react';
import type { User } from 'firebase/auth';
import Navbar from '@/components/Navbar';
import PriceTag from '@/components/courses/PriceTag';
import CohortDetails, { LessonIcon, enrollState } from '@/components/courses/CohortDetails';
import Player from '@/components/courses/Classroom';
import { formatDay } from '@/lib/courses/schedule';
import { catalogBySlug, catalogUrl } from '@/lib/courses/catalog';
import { useNow } from '@/lib/useNow';
import { describeAuthError, signInWithGoogle, signOutUser, useFirebaseUser, verifiedEmail } from '@/lib/firebase/client';
import { getCourse, getMyCourses, hasPendingRequest, requestAccess } from '@/lib/courses/api';
import type { Course } from '@/lib/courses/types';
import { siteConfig } from '@/lib/data';

const shell = 'min-h-screen bg-[#0a0a0a] text-white pt-20 pb-20 px-4 md:px-6 overflow-hidden';
const grid = { backgroundImage: 'radial-gradient(#00ff00 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' };

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className={shell}>
      <Navbar />
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={grid} />
      <div className="relative z-10 max-w-7xl mx-auto pt-8 md:pt-12">
        <Link href="/courses/" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-mono text-xs md:text-lg uppercase tracking-widest mb-10 group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> All courses
        </Link>
        {children}
      </div>
    </main>
  );
}

export default function CourseViewClient() {
  const id = useSearchParams().get('c') ?? '';
  const router = useRouter();
  const inCatalog = Boolean(catalogBySlug(id));

  // Website-defined courses have their own page.
  useEffect(() => {
    if (inCatalog) router.replace(catalogUrl(id));
  }, [inCatalog, id, router]);

  if (inCatalog) return null;
  // Keyed so every state resets when the course in the URL changes.
  return <CourseView key={id} courseId={id} />;
}

function CourseView({ courseId }: { courseId: string }) {
  const { configured, loading: authLoading, user } = useFirebaseUser();
  const [course, setCourse] = useState<Course | null | undefined>(undefined);
  const [access, setAccess] = useState<{ uid: string; enrolled: boolean; pending: boolean } | null>(null);

  useEffect(() => {
    if (!configured || !courseId) return;
    getCourse(courseId)
      .then(setCourse)
      .catch(() => setCourse(null));
  }, [configured, courseId]);

  useEffect(() => {
    const email = verifiedEmail(user);
    if (!user || !email || !courseId) return;
    Promise.all([getMyCourses(email), hasPendingRequest(email, courseId)])
      .then(([ids, pending]) => setAccess({ uid: user.uid, enrolled: ids.includes(courseId), pending }))
      .catch(() => setAccess({ uid: user.uid, enrolled: false, pending: false }));
  }, [user, courseId]);

  if (!configured || !courseId || course === null) {
    return (
      <Frame>
        <p className="text-center text-green-700 font-mono uppercase tracking-[0.3em] py-24 border border-dashed border-green-500/10 rounded-2xl">
          {configured && courseId ? 'Course not found.' : 'Courses open soon.'}
        </p>
      </Frame>
    );
  }

  if (course === undefined || authLoading) {
    return (
      <Frame>
        <RefreshCw className="animate-spin text-green-500 mx-auto" />
      </Frame>
    );
  }

  const myAccess = user && access?.uid === user.uid ? access : null;

  if (myAccess?.enrolled && user) {
    return (
      <Frame>
        <Player course={course} uid={user.uid} email={user.email ?? ''} />
      </Frame>
    );
  }

  return (
    <Frame>
      <CourseOverview course={course} user={user} access={myAccess} checking={Boolean(user) && !myAccess} onRequested={() => user && setAccess({ uid: user.uid, enrolled: false, pending: true })} />
    </Frame>
  );
}

function CourseOverview({
  course, user, access, checking, onRequested,
}: {
  course: Course;
  user: User | null;
  access: { enrolled: boolean; pending: boolean } | null;
  checking: boolean;
  onRequested: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const now = useNow();
  const state = enrollState(course, now);
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`${state === 'open' ? 'Enroll' : 'Next batch'}: ${course.title}`)}`;
  const sessions = course.syllabus.reduce((n, m) => n + m.lessons.filter((l) => l.type === 'session').length, 0);

  const signIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(describeAuthError(err));
    }
  };

  const request = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      await requestAccess(user, course.id);
      onRequested();
    } catch {
      setError('Could not send the request. Please try again.');
    }
    setBusy(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
      <div className="lg:col-span-2 space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-green-500 font-mono text-sm md:text-xl tracking-[0.3em] uppercase font-bold">
            <Terminal size={20} /> <span>Course Briefing</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">{course.title}</h1>
          <span className="inline-block px-3 py-1 border border-green-500/20 rounded font-mono text-xs md:text-base text-green-400 uppercase tracking-widest">{course.tier}</span>
          {course.description && <p className="text-white/85 font-mono text-sm md:text-xl leading-relaxed whitespace-pre-line">{course.description}</p>}
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter">Syllabus</h2>
            <div className="h-px flex-1 bg-green-500/10" />
            <span className="text-green-500/60 font-mono text-xs md:text-base">
              {sessions ? `${sessions} live classes${course.lessonCount > sessions ? ` + ${course.lessonCount - sessions} resources` : ''}` : `${course.lessonCount} lessons`}
            </span>
          </div>
          <div className="space-y-4">
            {course.syllabus.map((m, mi) => (
              <div key={mi} className="border border-green-500/10 rounded-xl bg-black/40 p-5 md:p-6">
                <h3 className="flex items-baseline gap-3 text-lg md:text-2xl font-black text-white uppercase tracking-tight">
                  <span className="text-green-500/40 font-mono text-sm md:text-lg">{String(mi + 1).padStart(2, '0')}</span> {m.title}
                </h3>
                <ul className="mt-4 space-y-2 font-mono text-sm md:text-lg text-white/70">
                  {m.lessons.map((l, li) => (
                    <li key={li} className="flex items-center gap-3">
                      <LessonIcon type={l.type} className="text-green-500/60 shrink-0" />
                      {l.date && <span className="text-green-500/60 shrink-0 w-24 md:w-32">{formatDay(l.date)}</span>}
                      <span>{l.title}</span>
                      <Lock size={12} className="text-green-500/30 ml-auto shrink-0" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 h-fit space-y-6 border border-green-500/20 rounded-2xl bg-black/60 p-6 md:p-8 shadow-[0_0_50px_rgba(0,255,0,0.08)]">
        <PriceTag priceUsd={course.priceUsd} large />
        <CohortDetails course={course} now={now} />
        <div className="space-y-3">
          {state !== 'open' && (
            <p className="text-center text-red-400 font-mono text-sm border border-red-500/30 rounded-lg p-4">
              {state === 'full' ? 'This batch is full.' : 'Enrollment for this batch is closed.'} Contact us to join the next one.
            </p>
          )}
          <a href={mailto} className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-green-500 text-black font-bold uppercase tracking-widest text-sm rounded-lg hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all">
            <Mail size={18} /> {state === 'open' ? 'Contact to enroll' : 'Contact about the next batch'}
          </a>
          {!user ? (
            <button type="button" onClick={signIn} className="w-full px-6 py-4 border border-green-500/30 hover:border-green-500 text-green-400 font-bold uppercase tracking-widest text-xs rounded-lg transition-all">
              Already enrolled? Sign in with Google
            </button>
          ) : checking ? (
            <p className="text-center text-green-600 font-mono text-xs flex items-center justify-center gap-2"><RefreshCw size={12} className="animate-spin" /> Checking access…</p>
          ) : access?.pending ? (
            <p className="text-center text-yellow-400 font-mono text-sm border border-yellow-500/30 rounded-lg p-4">Request sent. The course unlocks here once it is approved.</p>
          ) : state !== 'open' ? null : (
            <button type="button" onClick={request} disabled={busy} className="w-full px-6 py-4 border border-green-500/30 hover:border-green-500 text-green-400 font-bold uppercase tracking-widest text-xs rounded-lg transition-all disabled:opacity-50">
              {busy ? 'Sending…' : 'Request access'}
            </button>
          )}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
        <p className="text-green-500/60 font-mono text-xs leading-relaxed">
          Access is linked to the Google account you sign in with{user?.email ? <> (<span className="break-all">{user.email}</span>)</> : ''}. Questions: <a className="underline" href={mailto}>{siteConfig.contactEmail}</a>
        </p>
        {user && (
          <button type="button" onClick={() => signOutUser()} className="flex items-center gap-2 text-red-400 hover:text-white font-mono text-xs uppercase tracking-widest">
            <LogOut size={12} /> Sign out
          </button>
        )}
        <div className="flex items-center gap-2 text-green-500/40 font-mono text-xs"><BookOpen size={14} /> Lifetime access to materials{sessions ? ' & recordings' : ''}</div>
      </aside>
    </div>
  );
}
