'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Mail, RefreshCw } from 'lucide-react';
import PriceTag from './PriceTag';
import CohortDetails, { enrollState } from './CohortDetails';
import { catalogBySlug, catalogToCourse } from '@/lib/courses/catalog';
import { getCourse } from '@/lib/courses/api';
import { describeAuthError, signInWithGoogle, useFirebaseUser } from '@/lib/firebase/client';
import { siteConfig } from '@/lib/data';
import { useNow } from '@/lib/useNow';

export const dashboardUrl = (slug?: string) => (slug ? `/dashboard/?enroll=${encodeURIComponent(slug)}` : '/dashboard/');

/** Price, live seats/deadline and the Enroll button (Google sign-in, then the dashboard). */
export default function EnrollPanel({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const entry = catalogBySlug(slug)!;
  const router = useRouter();
  const now = useNow();
  const { configured, user } = useFirebaseUser();
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!configured) return;
    getCourse(slug)
      .then((c) => c && setEnrolledCount(c.enrolledCount))
      .catch(() => {});
  }, [configured, slug]);

  const course = catalogToCourse(entry, enrolledCount);
  const state = enrollState(course, now);

  const enroll = async () => {
    setError('');
    if (user) {
      router.push(dashboardUrl(slug));
      return;
    }
    setBusy(true);
    try {
      await signInWithGoogle();
      router.push(dashboardUrl(slug));
    } catch (err) {
      setError(describeAuthError(err));
      setBusy(false);
    }
  };

  const nextBatch = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`Next batch: ${entry.title}`)}`;

  return (
    <div className="space-y-6">
      <PriceTag priceUsd={entry.priceUsd} large={!compact} />
      {!compact && <CohortDetails course={course} now={now} />}
      {state === 'open' ? (
        <button
          type="button"
          onClick={enroll}
          disabled={busy || !configured}
          className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-green-500 text-black font-black uppercase tracking-widest text-sm rounded-lg hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all disabled:opacity-60"
        >
          {busy ? <RefreshCw size={18} className="animate-spin" /> : 'Enroll now'}
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-red-400 font-mono text-sm border border-red-500/30 rounded-lg p-4">
            {state === 'full' ? 'This batch is full.' : 'Enrollment for this batch is closed.'}
          </p>
          <a href={nextBatch} className="flex items-center justify-center gap-2 w-full px-6 py-4 border border-green-500/40 text-green-300 font-bold uppercase tracking-widest text-xs rounded-lg hover:border-green-500">
            <Mail size={16} /> Contact about the next batch
          </a>
        </div>
      )}
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {!compact && (
        <Link href={dashboardUrl()} className="flex items-center justify-center gap-2 text-green-500/70 hover:text-green-300 font-mono text-xs uppercase tracking-widest">
          <LayoutDashboard size={14} /> Already enrolled? Open your dashboard
        </Link>
      )}
    </div>
  );
}
