'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { User } from 'firebase/auth';
import { CalendarDays, CheckCircle2, Hourglass, LayoutDashboard, LogOut, Mail, RefreshCw, Terminal } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CohortDetails, { enrollState } from '@/components/courses/CohortDetails';
import { CATALOG, catalogToCourse, catalogUrl, classroomUrl, enrollmentMailto, mergeCatalogContent, type CatalogCourse } from '@/lib/courses/catalog';
import { cancelRequest, getCourse, hasPendingRequest, requestAccess, watchMyCourses } from '@/lib/courses/api';
import { classTimes, formatDay, nextSession } from '@/lib/courses/schedule';
import { courseUrl } from '@/lib/courses/types';
import { describeAuthError, signInWithGoogle, signOutUser, useFirebaseUser, verifiedEmail } from '@/lib/firebase/client';
import { siteConfig } from '@/lib/data';
import { useNow } from '@/lib/useNow';

type Status = 'none' | 'sending' | 'pending' | 'emailed';

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-20 px-4 md:px-6 overflow-hidden">
      <Navbar />
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00ff00 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
      <div className="relative z-10 max-w-6xl mx-auto pt-8 md:pt-12 space-y-10">{children}</div>
    </main>
  );
}

export default function DashboardClient() {
  const focus = useSearchParams().get('enroll') ?? '';
  const { configured, loading, user } = useFirebaseUser();
  const [mine, setMine] = useState<{ uid: string; ids: string[] } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const email = verifiedEmail(user);
    if (!user || !email) return;
    return watchMyCourses(email, (ids) => setMine({ uid: user.uid, ids }));
  }, [user]);

  if (!configured || loading) {
    return (
      <Frame>
        <RefreshCw className="animate-spin text-green-500 mx-auto" />
      </Frame>
    );
  }

  if (!user) {
    return (
      <Frame>
        <div className="max-w-lg mx-auto text-center space-y-6 border border-green-500/20 rounded-2xl bg-black/60 p-8">
          <LayoutDashboard className="mx-auto text-green-500" size={36} />
          <h1 className="text-2xl font-black uppercase tracking-tight">Sign in to your dashboard</h1>
          <p className="font-mono text-sm text-white/70">Use the Google account you want your course access linked to.</p>
          <button
            type="button"
            onClick={() => signInWithGoogle().catch((err) => setError(describeAuthError(err)))}
            className="w-full px-6 py-4 bg-green-500 text-black font-black uppercase tracking-widest text-sm rounded-lg"
          >
            Sign in with Google
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </Frame>
    );
  }

  const enrolled = user && mine?.uid === user.uid ? mine.ids : null;
  const otherCourses = (enrolled ?? []).filter((id) => !CATALOG.some((c) => c.slug === id));

  return (
    <Frame>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-green-500/10 pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-500 font-mono text-sm md:text-lg tracking-[0.3em] uppercase font-bold">
            <Terminal size={18} /> <span>My dashboard</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Welcome{user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}</h1>
          <p className="font-mono text-sm text-green-500/70 break-all">Signed in as {user.email}</p>
        </div>
        <button type="button" onClick={() => signOutUser()} className="flex items-center gap-2 text-red-400 hover:text-white font-mono text-xs uppercase tracking-widest">
          <LogOut size={14} /> Sign out
        </button>
      </header>

      {enrolled === null ? (
        <RefreshCw className="animate-spin text-green-500 mx-auto" />
      ) : (
        <div className="space-y-8">
          {CATALOG.map((entry) => (
            <DashboardCourse key={entry.slug} entry={entry} user={user} enrolled={enrolled.includes(entry.slug)} focused={entry.slug === focus} />
          ))}
          {otherCourses.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-black uppercase tracking-tight">Other courses</h2>
              {otherCourses.map((id) => (
                <Link key={id} href={courseUrl(id)} className="block border border-green-500/20 rounded-xl p-4 font-mono text-green-300 hover:border-green-500">
                  {id} → Open
                </Link>
              ))}
            </section>
          )}
        </div>
      )}
    </Frame>
  );
}

function DashboardCourse({ entry, user, enrolled, focused }: { entry: CatalogCourse; user: User; enrolled: boolean; focused: boolean }) {
  const now = useNow();
  const email = verifiedEmail(user) ?? '';
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [status, setStatus] = useState<{ email: string; value: Status } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getCourse(entry.slug)
      .then((c) => c && setEnrolledCount(c.enrolledCount))
      .catch(() => {});
  }, [entry.slug]);

  useEffect(() => {
    if (!email || enrolled) return;
    hasPendingRequest(email, entry.slug)
      .then((pending) => setStatus((s) => (s?.email === email ? s : { email, value: pending ? 'pending' : 'none' })))
      .catch(() => setStatus({ email, value: 'none' }));
  }, [email, entry.slug, enrolled]);

  const course = catalogToCourse(entry, enrolledCount);
  const state = enrollState(course, now);
  const current: Status | null = status?.email === email ? status.value : null;
  const mailto = enrollmentMailto(entry, siteConfig.contactEmail, { name: user.displayName, email: user.email });
  const next = now ? nextSession(course, mergeCatalogContent(entry, null).modules.flatMap((m) => m.lessons), now) : null;
  const nextTimes = next ? classTimes(course, next.lesson.date) : null;

  const enroll = () => {
    setError('');
    setStatus({ email, value: 'sending' });
    const saved = requestAccess(user, entry.slug);
    // Opens the learner's email app with a ready-to-send message to the instructor
    // (a link click keeps this page open, unlike navigating to the mailto: URL).
    const link = document.createElement('a');
    link.href = mailto;
    link.click();
    saved.then(
      () => setStatus({ email, value: 'pending' }),
      () => setStatus({ email, value: 'emailed' })
    );
  };

  const cancel = async () => {
    try {
      await cancelRequest(email, entry.slug);
      setStatus({ email, value: 'none' });
    } catch {
      setError('Could not cancel the request. Please try again.');
    }
  };

  return (
    <article className={`grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-6 border rounded-2xl bg-black/50 p-5 md:p-6 ${focused ? 'border-green-500/70 shadow-[0_0_40px_rgba(0,255,0,0.12)]' : 'border-green-500/15'}`}>
      <Link href={catalogUrl(entry.slug)} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entry.cover} alt="" width={1200} height={630} className="w-full rounded-xl border border-green-500/20" />
      </Link>
      <div className="space-y-4 min-w-0">
        <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight leading-tight">
          <Link href={catalogUrl(entry.slug)} className="hover:text-green-400">{entry.title}</Link>
        </h2>
        <CohortDetails course={course} now={now} />

        {enrolled ? (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-green-400 font-mono text-sm font-bold uppercase tracking-widest"><CheckCircle2 size={16} /> Enrolled</p>
            {next && (
              <p className="flex items-start gap-2 font-mono text-sm text-green-300">
                <CalendarDays size={14} className="mt-0.5 shrink-0" />
                <span>Next class: {formatDay(next.lesson.date, true)}{nextTimes && ` · ${nextTimes.course}`}{nextTimes?.local && ` (${nextTimes.local} your time)`}</span>
              </p>
            )}
            <Link href={classroomUrl(entry.slug)} className="inline-block px-6 py-3 bg-green-500 text-black font-black uppercase tracking-widest text-xs rounded-lg">Open classroom</Link>
          </div>
        ) : current === null ? (
          <RefreshCw className="animate-spin text-green-500" size={18} />
        ) : current === 'pending' || current === 'emailed' ? (
          <div className="space-y-3 border border-yellow-500/30 rounded-xl p-4 bg-yellow-500/5">
            <p className="flex items-center gap-2 text-yellow-400 font-mono text-sm font-bold uppercase tracking-widest"><Hourglass size={16} /> Pending approval</p>
            <p className="font-mono text-sm text-white/80">
              {current === 'pending'
                ? <>Your request is in. We&apos;ll reply to <span className="text-green-300 break-all">{user.email}</span> to complete your enrollment, and this page unlocks your classroom as soon as you&apos;re approved.</>
                : <>We&apos;ve opened an email to {siteConfig.contactEmail} with your details. Send it, and we&apos;ll approve you soon. This page updates automatically.</>}
            </p>
            <div className="flex flex-wrap gap-4 font-mono text-xs uppercase tracking-widest">
              <a href={mailto} className="flex items-center gap-1 text-green-300 hover:text-white"><Mail size={12} /> Email not sent? Send it now</a>
              {current === 'pending' && <button type="button" onClick={cancel} className="text-red-400 hover:text-white uppercase tracking-widest">Cancel request</button>}
            </div>
          </div>
        ) : state !== 'open' ? (
          <p className="text-red-400 font-mono text-sm border border-red-500/30 rounded-lg p-4">
            {state === 'full' ? 'This batch is full.' : 'Enrollment for this batch is closed.'}{' '}
            <a className="underline" href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`Next batch: ${entry.title}`)}`}>Ask about the next batch</a>
          </p>
        ) : (
          <div className="space-y-3">
            <button type="button" onClick={enroll} disabled={current === 'sending'} className="px-8 py-4 bg-green-500 text-black font-black uppercase tracking-widest text-sm rounded-lg hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] disabled:opacity-60">
              {current === 'sending' ? 'Sending…' : `Enroll · $${entry.priceUsd}`}
            </button>
            <p className="font-mono text-xs text-white/60">This sends your request and opens a ready-to-send email to {siteConfig.contactEmail}.</p>
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </article>
  );
}
