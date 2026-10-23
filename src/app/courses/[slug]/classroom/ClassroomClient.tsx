'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Lock, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Player from '@/components/courses/Classroom';
import { dashboardUrl } from '@/components/courses/EnrollPanel';
import { catalogBySlug, catalogToCourse, catalogUrl } from '@/lib/courses/catalog';
import { watchMyCourses } from '@/lib/courses/api';
import { describeAuthError, signInWithGoogle, useFirebaseUser, verifiedEmail } from '@/lib/firebase/client';

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-20 px-4 md:px-6 overflow-hidden">
      <Navbar />
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00ff00 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
      <div className="relative z-10 max-w-7xl mx-auto pt-8 md:pt-12">
        <Link href={dashboardUrl()} className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-mono text-xs md:text-lg uppercase tracking-widest mb-10 group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> My dashboard
        </Link>
        {children}
      </div>
    </main>
  );
}

export default function ClassroomClient({ slug }: { slug: string }) {
  const entry = catalogBySlug(slug)!;
  const { configured, loading, user } = useFirebaseUser();
  const [mine, setMine] = useState<{ uid: string; ids: string[] } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const email = verifiedEmail(user);
    if (!user || !email) return;
    return watchMyCourses(email, (ids) => setMine({ uid: user.uid, ids }));
  }, [user]);

  if (!configured || loading || (user && mine?.uid !== user.uid)) {
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
          <Lock className="mx-auto text-green-500" size={36} />
          <h1 className="text-2xl font-black uppercase tracking-tight">Sign in to open your classroom</h1>
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

  if (!mine?.ids.includes(slug)) {
    return (
      <Frame>
        <div className="max-w-xl mx-auto text-center space-y-6 border border-green-500/20 rounded-2xl bg-black/60 p-8">
          <Lock className="mx-auto text-green-500" size={36} />
          <h1 className="text-2xl font-black uppercase tracking-tight">Your classroom is locked</h1>
          <p className="font-mono text-white/75">It unlocks as soon as your enrollment in <strong>{entry.title}</strong> is approved.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={dashboardUrl(slug)} className="px-6 py-3 bg-green-500 text-black font-bold uppercase tracking-widest text-xs rounded-lg">My dashboard</Link>
            <Link href={catalogUrl(slug)} className="px-6 py-3 border border-green-500/40 text-green-300 font-bold uppercase tracking-widest text-xs rounded-lg">Course details</Link>
          </div>
        </div>
      </Frame>
    );
  }

  return (
    <Frame>
      <Player course={catalogToCourse(entry)} uid={user.uid} email={user.email ?? ''} />
    </Frame>
  );
}
