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
          className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-mono text-base uppercase tracking-widest transition-colors mb-16 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Return to Archive</span>
        </Link>

        {/* Header Section */}
        <div className="space-y-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-green-500 font-mono text-lg tracking-[0.3em] uppercase font-bold"
          >
            <Terminal size={24} />
            <span>Mission Briefing</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight"
          >
            {blog.title}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-8 text-sm font-mono uppercase tracking-widest text-green-400/60"
          >
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              <span>{blog.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={20} />
              <div className="flex gap-2">
                {blog.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 border border-green-500/10 rounded">#{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={20} />
              <span>SME Classified</span>
            </div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/90 font-mono text-lg md:text-xl italic leading-relaxed"
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
            className="relative aspect-video w-full overflow-hidden rounded-2xl border border-green-500/20 bg-black mb-20 shadow-[0_0_50px_rgba(0,255,0,0.1)] group"
          >
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2 text-green-500/60 font-mono text-base uppercase tracking-widest">
              <Play size={16} fill="currentColor" />
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
        <div className="space-y-24">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-px flex-1 bg-green-500/10" />
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Lab Walkthrough</h2>
            <div className="h-px flex-1 bg-green-500/10" />
          </div>

          {blog.steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-10"
            >
              <div className="flex items-start gap-8">
                <span className="text-5xl font-black text-green-500/30 font-mono leading-none">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <div className="space-y-6">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight italic">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-white/80 font-mono text-base leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {step.code && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-black/60 border border-green-500/10 rounded-xl p-8 font-mono text-base text-green-400 overflow-x-auto">
                    <div className="flex items-center gap-2 mb-6 text-green-400/60 text-base uppercase tracking-widest border-b border-green-500/5 pb-2">
                      <Code size={20} />
                      <span>Terminal Input / Command</span>
                    </div>
                    <pre><code>{step.code}</code></pre>
                  </div>
                </div>
              )}

              {step.images && step.images.map((img, imgIdx) => (
                <div key={imgIdx} className="relative w-full overflow-hidden rounded-xl border border-green-500/5 bg-black/20 group">
                  <div className="absolute top-6 left-6 z-10 flex items-center gap-2 text-green-500/40 font-mono text-base uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon size={18} />
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
        <div className="mt-40 pt-16 border-t border-green-500/10 grid grid-cols-2 gap-10 font-mono">
          {prevBlog ? (
            <Link href={`/intelligence/${prevBlog.slug}`} className="group space-y-3 text-left">
              <span className="text-green-500/40 text-base uppercase tracking-[0.2em]">Previous Briefing</span>
              <div className="flex items-center gap-3 text-green-400 group-hover:text-green-300 transition-colors">
                <ChevronLeft size={22} />
                <span className="text-lg uppercase font-bold truncate">{prevBlog.title}</span>
              </div>
            </Link>
          ) : <div />}

          {nextBlog ? (
            <Link href={`/intelligence/${nextBlog.slug}`} className="group space-y-3 text-right">
              <span className="text-green-500/40 text-base uppercase tracking-[0.2em]">Next Briefing</span>
              <div className="flex items-center gap-3 text-green-400 group-hover:text-green-300 transition-colors justify-end">
                <span className="text-lg uppercase font-bold truncate">{nextBlog.title}</span>
                <ChevronRight size={22} />
              </div>
            </Link>
          ) : <div />}
        </div>

        {/* Home Navigation */}
        <div className="mt-24 flex justify-center">
          <Link 
            href="/intelligence" 
            className="px-10 py-5 bg-green-500 text-black font-bold uppercase tracking-widest text-base rounded-lg hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all hover:scale-105"
          >
            Archive Home
          </Link>
        </div>
      </div>
    </main>
  );
}
