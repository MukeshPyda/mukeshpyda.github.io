'use client';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/data';

export default function Hero() {
  return (
    <section className="relative h-[50vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-green-500/5">
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#00ff00 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10"
      >
        <h1 className="text-5xl md:text-7xl font-black mb-2 tracking-tighter uppercase italic text-white">
          {siteConfig.name}
        </h1>
        <p className="text-lg md:text-xl text-green-500/80 mb-6 max-w-2xl mx-auto font-mono font-bold tracking-[0.2em] uppercase">
          {siteConfig.role}
        </p>
        <div className="h-0.5 w-16 bg-green-500 mx-auto rounded-full mb-6 shadow-[0_0_10px_#00ff00]" />
        <p className="max-w-2xl mx-auto text-sm md:text-base leading-relaxed text-green-700 font-mono">
          {siteConfig.bio}
        </p>
      </motion.div>
    </section>
  );
}
