'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Shield, X } from 'lucide-react';
import { siteConfig } from '@/lib/data';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Operations', href: '/', disabled: false },
    { name: 'Intelligence', href: '/intelligence', disabled: false },
    { name: 'Directives', href: '#', disabled: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-lg border-b border-green-500/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" className="flex items-center gap-2 group">
          <Shield className="text-green-500 group-hover:scale-110 transition-transform" size={20} />
          <span className="font-mono font-bold text-white tracking-widest uppercase text-sm">
            {siteConfig.name} <span className="text-green-900 group-hover:text-green-500 transition-colors">| Terminal</span>
          </span>
        </a>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center text-xs font-mono text-green-700 uppercase tracking-widest">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href} 
              className={`${link.disabled ? 'opacity-30 cursor-not-allowed' : 'hover:text-green-500 transition-colors'}`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-green-500 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0f0f0f] border-b border-green-500/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4 font-mono text-xs uppercase tracking-widest">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className={`${link.disabled ? 'text-green-900' : 'text-green-500 hover:text-white transition-colors'}`}
                  onClick={() => !link.disabled && setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
