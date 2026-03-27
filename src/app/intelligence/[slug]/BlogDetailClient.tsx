'use client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Tag, Shield, Terminal, Play, Code, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { BlogPost } from '../data';

export default function BlogDetailClient({ 
  blog, 
  prevBlog, 
  nextBlog 
}: { 
  blog: BlogPost, 
  prevBlog?: { slug: string, title: string }, 
  nextBlog?: { slug: string, title: string } 
}) {
  // Convert watch URL to embed URL
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const embedUrl = getEmbedUrl(blog.videoUrl);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-6 overflow-hidden">
      <Navbar />
      
      {/* Background Grid Decoration */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#00ff00 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Back */}
        <Link 
          href="/intelligence" 
          className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-mono text-xs md:text-xl uppercase tracking-widest transition-colors mb-12 md:mb-20 group"
        >
          <div className="hidden md:block"><ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" /></div>
          <div className="md:hidden"><ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /></div>
          <span>Return to Archive</span>
        </Link>

        {/* Header Section */}
        <div className="space-y-6 md:space-y-12 mb-12 md:mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-green-500 font-mono text-sm md:text-xl tracking-[0.3em] uppercase font-bold"
          >
            <div className="hidden md:block"><Terminal size={28} /></div>
            <div className="md:hidden"><Terminal size={16} /></div>
            <span>Mission Briefing</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight"
          >
            {blog.title}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 md:gap-10 text-[10px] md:text-lg font-mono uppercase tracking-widest text-green-400/60"
          >
            <div className="flex items-center gap-2">
              <div className="hidden md:block"><Calendar size={24} /></div>
              <div className="md:hidden"><Calendar size={14} /></div>
              <span>{blog.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:block"><Tag size={24} /></div>
              <div className="md:hidden"><Tag size={14} /></div>
              <div className="flex gap-2">
                {blog.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 md:px-4 md:py-1 border border-green-500/10 rounded">#{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:block"><Shield size={24} /></div>
              <div className="md:hidden"><Shield size={14} /></div>
              <span>SME Classified</span>
            </div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/90 font-mono text-sm md:text-2xl italic leading-relaxed"
          >
            {blog.summary}
          </motion.p>
        </div>

        {/* YouTube Briefing Feed */}
        {embedUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative aspect-video w-full overflow-hidden rounded-2xl border border-green-500/20 bg-black mb-12 md:mb-24 shadow-[0_0_50px_rgba(0,255,0,0.1)] group"
          >
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10 flex items-center gap-2 text-green-500/60 font-mono text-[10px] md:text-xl uppercase tracking-widest">
              <Play size={12} fill="currentColor" className="md:hidden" />
              <Play size={20} fill="currentColor" className="hidden md:block" />
              <span>Live Tactical Feed</span>
            </div>
            <iframe 
              src={embedUrl}
              title="YouTube video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </motion.div>
        )}

        {/* Lab Walkthrough Steps */}
        <div className="space-y-16 md:space-y-32">
          <div className="flex items-center gap-4 mb-12 md:mb-20">
            <div className="h-px flex-1 bg-green-500/10" />
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter">Lab Walkthrough</h2>
            <div className="h-px flex-1 bg-green-500/10" />
          </div>

          {blog.steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8 md:space-y-12"
            >
              <div className="flex items-start gap-6 md:gap-10">
                <span className="text-4xl md:text-6xl font-black text-green-500/30 font-mono leading-none">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <div className="space-y-4 md:space-y-8">
                  <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight italic">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-white/80 font-mono text-sm md:text-xl leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {step.code && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-black/60 border border-green-500/10 rounded-xl p-6 md:p-12 font-mono text-xs md:text-xl text-green-400 overflow-x-auto">
                    <div className="flex items-center gap-2 mb-4 md:mb-10 text-green-400/60 text-[10px] md:text-lg uppercase tracking-widest border-b border-green-500/5 pb-2">
                      <Code size={12} className="md:hidden" />
                      <Code size={24} className="hidden md:block" />
                      <span>Terminal Input / Command</span>
                    </div>
                    <pre><code>{step.code}</code></pre>
                  </div>
                </div>
              )}

              {step.images && step.images.map((img, imgIdx) => (
                <div key={imgIdx} className="relative w-full overflow-hidden rounded-xl border border-green-500/5 bg-black/20 group">
                  <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10 flex items-center gap-2 text-green-500/40 font-mono text-[10px] md:text-lg uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon size={14} className="md:hidden" />
                    <ImageIcon size={24} className="hidden md:block" />
                    <span>Tactical Evidence Asset</span>
                  </div>
                  <Image 
                    src={img} 
                    alt={`${step.title} asset`} 
                    width={1200}
                    height={800}
                    className="block opacity-80 group-hover:opacity-100 transition-all duration-500" 
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="mt-24 md:mt-48 pt-12 md:pt-20 border-t border-green-500/10 grid grid-cols-2 gap-6 md:gap-12 font-mono">
          {prevBlog ? (
            <Link href={`/intelligence/${prevBlog.slug}`} className="group space-y-2 md:space-y-4 text-left">
              <span className="text-green-500/40 text-[10px] md:text-lg uppercase tracking-[0.2em]">Previous Briefing</span>
              <div className="flex items-center gap-2 md:gap-4 text-green-400 group-hover:text-green-300 transition-colors">
                <ChevronLeft size={16} className="md:hidden" />
                <ChevronLeft size={28} className="hidden md:block" />
                <span className="text-xs md:text-xl uppercase font-bold truncate">{prevBlog.title}</span>
              </div>
            </Link>
          ) : <div />}

          {nextBlog ? (
            <Link href={`/intelligence/${nextBlog.slug}`} className="group space-y-2 md:space-y-4 text-right">
              <span className="text-green-500/40 text-[10px] md:text-lg uppercase tracking-[0.2em]">Next Briefing</span>
              <div className="flex items-center gap-2 md:gap-4 text-green-400 group-hover:text-green-300 transition-colors justify-end">
                <span className="text-xs md:text-xl uppercase font-bold truncate">{nextBlog.title}</span>
                <ChevronRight size={16} className="md:hidden" />
                <ChevronRight size={28} className="hidden md:block" />
              </div>
            </Link>
          ) : <div />}
        </div>

        {/* Home Navigation */}
        <div className="mt-16 md:mt-32 flex justify-center">
          <Link 
            href="/intelligence" 
            className="px-8 py-4 md:px-12 md:py-6 bg-green-500 text-black font-bold uppercase tracking-widest text-sm md:text-xl rounded-lg hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all hover:scale-105"
          >
            Archive Home
          </Link>
        </div>
      </div>
    </main>
  );
}
