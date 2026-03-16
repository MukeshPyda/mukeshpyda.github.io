'use client';
import Hero from '@/components/Hero';
import Timeline from '@/components/Timeline';
import Navbar from '@/components/Navbar';
import { usePersistence } from '@/lib/persistence';

export default function Home() {
  const { data: events } = usePersistence();

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#00ff00] font-mono selection:bg-[#00ff00] selection:text-black pt-16">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="text-center mb-10">
          <h2 className="text-[10px] uppercase tracking-[0.6em] text-green-900 font-black">
            Chronicle of Expertise
          </h2>
          <div className="h-px w-8 bg-green-950 mx-auto mt-3" />
        </div>
        <Timeline events={events} />
      </div>
      <footer className="py-10 text-center border-t border-green-900/5 text-green-950 text-[10px] tracking-[0.4em] uppercase">
        Mukesh Pyda • Subject Matter Expert • {new Date().getFullYear()}
      </footer>
    </main>
  );
}
