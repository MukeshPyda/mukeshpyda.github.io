'use client';
import Link from 'next/link';
import type { User } from 'firebase/auth';
import { Lock, LogOut, Mail } from 'lucide-react';
import { signOutUser } from '@/lib/firebase/client';
import { siteConfig } from '@/lib/data';

/** Shown instead of learner sign-in while every website course is closed. */
export default function SignInClosed({ user }: { user: User | null }) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-6 border border-red-500/30 rounded-2xl bg-black/60 p-8">
      <Lock className="mx-auto text-red-400" size={36} />
      <h1 className="text-2xl font-black uppercase tracking-tight">Sign-in is closed for now</h1>
      <p className="font-mono text-sm text-white/70">Enrollment is closed. Check back soon for the next batch.</p>
      <div className="flex flex-wrap justify-center gap-4 font-mono text-xs uppercase tracking-widest">
        <Link href="/courses/" className="text-green-300 hover:text-white">View courses</Link>
        <a href={`mailto:${siteConfig.contactEmail}`} className="flex items-center gap-1 text-green-300 hover:text-white"><Mail size={12} /> {siteConfig.contactEmail}</a>
      </div>
      {user && (
        <button type="button" onClick={() => signOutUser()} className="inline-flex items-center gap-2 text-red-400 hover:text-white font-mono text-xs uppercase tracking-widest">
          <LogOut size={12} /> Sign out
        </button>
      )}
    </div>
  );
}
