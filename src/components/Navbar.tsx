'use client';
import { motion } from 'framer-motion';
import { Menu, Shield } from 'lucide-react';
import { siteConfig } from '@/lib/data';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0f0f0f]/80 backdrop-blur-lg border-b border-green-500/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="text-green-500" size={20} />
          <span className="font-mono font-bold text-white tracking-widest uppercase text-sm">
            {siteConfig.name} <span className="text-green-900">| Terminal</span>
          </span>
        </div>
        
        {/* Placeholder for future links */}
        <div className="hidden md:flex gap-8 items-center text-xs font-mono text-green-700 uppercase tracking-widest">
          <a href="#" className="hover:text-green-500 transition-colors">Operations</a>
          <a href="#" className="opacity-30 cursor-not-allowed">Intelligence</a>
          <a href="#" className="opacity-30 cursor-not-allowed">Directives</a>
        </div>

        <button className="md:hidden text-green-500">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
}
