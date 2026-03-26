'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Terminal } from 'lucide-react';
import { initialBlogData } from './data';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function IntelligencePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredBlogs = useMemo(() => {
    return initialBlogData.filter(blog => 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-12 px-6 overflow-hidden">
      <Navbar />
      
      {/* Background Grid Decoration */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#00ff00 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Centered Header Section */}
        <div className="py-16 md:py-24 flex flex-col items-center text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-green-500 font-mono text-sm tracking-[0.3em] uppercase font-bold"
          >
            <Terminal size={16} />
            <span>Archive Access Granted</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none"
          >
            Tactical <span className="text-green-500">Intelligence</span>
          </motion.h1>
          
          <div className="h-0.5 w-16 bg-green-500 rounded-full shadow-[0_0_15px_#00ff00]" />

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-green-700 font-mono text-xs md:text-sm max-w-2xl leading-relaxed uppercase tracking-wider"
          >
            A comprehensive repository of security research, and SME-level technical briefings and tutorials.
          </motion.p>

          {/* Centered Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative w-full max-w-xl mt-8"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-900" size={18} />
            <input 
              type="text" 
              placeholder="SEARCH DATABASE (TITLE, TAGS, SUMMARY)..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-black/60 border border-green-500/20 rounded-lg py-5 pl-12 pr-4 text-green-400 font-mono text-xs md:text-sm focus:outline-none focus:border-green-500/60 focus:shadow-[0_0_20px_rgba(0,255,0,0.1)] transition-all placeholder:text-green-900"
            />
          </motion.div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <AnimatePresence mode="popLayout">
            {currentBlogs.map((blog, index) => (
              <Link href={`/intelligence/${blog.id}`} key={blog.id} className="h-full">
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-xl border border-green-500/5 bg-black/40 backdrop-blur-md p-5 transition-all duration-300 hover:border-green-500/40 hover:shadow-[0_0_40px_rgba(0,255,0,0.1)] cursor-pointer h-full"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden rounded-lg mb-5 relative">
                    <div className="absolute inset-0 bg-green-500/5 group-hover:bg-transparent transition-colors z-10" />
                    <img 
                      src={blog.mainImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-100" 
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.2em] text-green-500/40 font-bold">
                      <span>{blog.date}</span>
                      <div className="flex gap-2">
                        {blog.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 border border-green-500/10 rounded">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-white group-hover:text-green-400 transition-colors leading-tight uppercase italic tracking-tight">
                      {blog.title}
                    </h3>
                    <p className="text-green-700/60 text-[11px] leading-relaxed line-clamp-2 italic font-mono uppercase tracking-tighter">
                      {blog.summary}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredBlogs.length === 0 && (
          <div className="text-center py-32 border border-dashed border-green-500/5 rounded-2xl bg-black/20">
            <p className="text-green-900 font-mono text-sm uppercase tracking-[0.3em]">
              Access Denied: No matching intelligence files.
            </p>
          </div>
        )}

        {/* Tactical Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-16 font-mono">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 border border-green-500/10 text-green-500 disabled:opacity-10 disabled:cursor-not-allowed hover:bg-green-500/5 hover:border-green-500/40 transition-all rounded-lg group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div className="flex gap-3">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-12 h-12 border rounded-lg transition-all text-sm font-bold tracking-widest ${
                    currentPage === i + 1 
                      ? 'bg-green-500 border-green-500 text-black shadow-[0_0_20px_rgba(0,255,0,0.3)]' 
                      : 'border-green-500/10 text-green-900 hover:border-green-500/40 hover:text-green-500'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-3 border border-green-500/10 text-green-500 disabled:opacity-10 disabled:cursor-not-allowed hover:bg-green-500/5 hover:border-green-500/40 transition-all rounded-lg group"
            >
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
