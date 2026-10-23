import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Check, ChevronLeft, ChevronDown, Lock, Terminal } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EnrollPanel from '@/components/courses/EnrollPanel';
import { CATALOG, catalogBySlug, catalogUrl } from '@/lib/courses/catalog';
import { formatDay } from '@/lib/courses/schedule';

export const dynamicParams = false;

export function generateStaticParams() {
  return CATALOG.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = catalogBySlug((await params).slug);
  if (!entry) return {};
  const image = { url: entry.cover, width: 1200, height: 630, alt: entry.title };
  return {
    title: entry.title,
    description: `${entry.tagline} ${entry.summary}`,
    alternates: { canonical: catalogUrl(entry.slug) },
    openGraph: { type: 'website', title: entry.title, description: entry.tagline, url: catalogUrl(entry.slug), images: [image] },
    twitter: { card: 'summary_large_image', title: entry.title, description: entry.tagline, images: [entry.cover] },
  };
}

const sectionTitle = 'text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter';

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = catalogBySlug((await params).slug);
  if (!entry) notFound();
  const sessions = entry.weeks.reduce((n, w) => n + w.sessions.length, 0);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-24 px-4 md:px-6 overflow-hidden">
      <Navbar />
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00ff00 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />

      <div className="relative z-10 max-w-7xl mx-auto pt-8 md:pt-12 space-y-16 md:space-y-24">
        <Link href="/courses/" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-mono text-xs md:text-lg uppercase tracking-widest group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> All courses
        </Link>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-2 text-green-500 font-mono text-sm md:text-xl tracking-[0.3em] uppercase font-bold">
              <Terminal size={20} /> <span>Live course</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">{entry.title}</h1>
            <p className="text-white/85 font-mono text-base md:text-2xl leading-relaxed">{entry.tagline}</p>
            <div className="flex flex-wrap gap-3 font-mono text-xs md:text-sm uppercase tracking-widest">
              <span className="px-3 py-1.5 border border-green-500/30 rounded text-green-300">{entry.tier}</span>
              <span className="px-3 py-1.5 border border-green-500/30 rounded text-green-300">{sessions} live classes</span>
              <span className="px-3 py-1.5 border border-green-500/30 rounded text-green-300">{formatDay(entry.startDate)} – {formatDay(entry.endDate, true)}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={entry.cover} alt={`${entry.title} course cover`} width={1200} height={630} className="w-full rounded-2xl border border-green-500/20 shadow-[0_0_60px_rgba(0,255,0,0.08)]" />
          </div>

          <aside className="lg:sticky lg:top-28 h-fit border border-green-500/20 rounded-2xl bg-black/60 p-6 md:p-8 shadow-[0_0_50px_rgba(0,255,0,0.08)]">
            <EnrollPanel slug={entry.slug} />
          </aside>
        </div>

        {/* About */}
        <section className="max-w-4xl space-y-6">
          <h2 className={sectionTitle}>About this course</h2>
          {entry.description.map((p, i) => (
            <p key={i} className="text-white/85 font-mono text-sm md:text-xl leading-relaxed">{p}</p>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="space-y-6">
            <h2 className={sectionTitle}>What you get</h2>
            <ul className="space-y-3">
              {entry.highlights.map((h) => (
                <li key={h} className="flex gap-3 font-mono text-sm md:text-lg text-white/85">
                  <Check size={20} className="text-green-400 shrink-0 mt-0.5" /> {h}
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-6">
            <h2 className={sectionTitle}>Who it&apos;s for</h2>
            <ul className="space-y-3">
              {entry.audience.map((a) => (
                <li key={a} className="flex gap-3 font-mono text-sm md:text-lg text-white/85">
                  <Check size={20} className="text-green-400 shrink-0 mt-0.5" /> {a}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Syllabus */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className={sectionTitle}>Syllabus</h2>
            <div className="h-px flex-1 bg-green-500/10" />
            <span className="text-green-500/60 font-mono text-xs md:text-base">{sessions} live classes · Mon–Fri</span>
          </div>
          <div className="space-y-4">
            {entry.weeks.map((w, wi) => (
              <div key={w.key} className="border border-green-500/10 rounded-xl bg-black/40 p-5 md:p-6">
                <h3 className="flex items-baseline gap-3 text-lg md:text-2xl font-black text-white uppercase tracking-tight">
                  <span className="text-green-500/40 font-mono text-sm md:text-lg">{String(wi + 1).padStart(2, '0')}</span> {w.title}
                </h3>
                <ul className="mt-4 space-y-2 font-mono text-sm md:text-lg text-white/75">
                  {w.sessions.map((s) => (
                    <li key={s.id} className="flex items-start gap-3">
                      <CalendarDays size={16} className="text-green-500/60 shrink-0 mt-1" />
                      <span className="text-green-500/60 shrink-0 w-24 md:w-32">{formatDay(s.date)}</span>
                      <span>{s.title}</span>
                      <Lock size={12} className="text-green-500/30 ml-auto shrink-0 mt-1.5" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How enrollment works + FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="space-y-6">
            <h2 className={sectionTitle}>How enrollment works</h2>
            <ol className="space-y-4">
              {entry.enrollmentSteps.map((step, i) => (
                <li key={step} className="flex gap-4 font-mono text-sm md:text-lg text-white/85">
                  <span className="shrink-0 w-8 h-8 rounded-full border border-green-500/40 text-green-400 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="space-y-6">
            <h2 className={sectionTitle}>FAQ</h2>
            <div className="space-y-3">
              {entry.faq.map((f) => (
                <details key={f.q} className="group border border-green-500/10 rounded-xl bg-black/40 p-4 md:p-5">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-mono text-sm md:text-lg text-white font-bold">
                    {f.q}
                    <ChevronDown size={18} className="text-green-500 shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-3 font-mono text-sm md:text-base text-white/75 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom call to action */}
        <section className="border border-green-500/20 rounded-2xl bg-black/60 p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">Ready to start?</h2>
            <p className="font-mono text-sm md:text-lg text-white/75">Classes begin {formatDay(entry.startDate, true)}. Seats are limited to {entry.seats}.</p>
          </div>
          <EnrollPanel slug={entry.slug} compact />
        </section>
      </div>
    </main>
  );
}
