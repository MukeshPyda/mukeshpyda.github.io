import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: '404: Not Found',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-green-500 font-mono pt-16 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full space-y-6">
          <p className="text-green-500/40 text-xs md:text-sm uppercase tracking-[0.4em]">Error 404</p>
          <div className="bg-black/60 border border-green-500/20 rounded-xl p-6 md:p-10 space-y-3 text-sm md:text-xl">
            <p>&gt; ERROR: Nice try, Agent.</p>
            <p>&gt; This page does not exist in this universe.</p>
            <p className="text-green-500/60">&gt; <span className="animate-pulse">█</span></p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="px-6 py-3 bg-green-500 text-black font-bold uppercase tracking-widest text-xs md:text-sm rounded-lg hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all">
              Return to base
            </Link>
            <Link href="/intelligence/" className="px-6 py-3 border border-green-500/30 text-green-400 font-bold uppercase tracking-widest text-xs md:text-sm rounded-lg hover:border-green-500 transition-all">
              Intelligence archive
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
