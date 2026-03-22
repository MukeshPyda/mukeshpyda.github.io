'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Terminal } from 'lucide-react';
import { initialBlogData, BlogPost } from '@/lib/data';
import Navbar from '@/components/Navbar';

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
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-6">
      <Navbar />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-2 text-green-500 font-mono text-sm tracking-widest uppercase">
            <Terminal size={16} />
            <span>Archive Access Granted</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic italic">
            Tactical Intelligence
          </h1>
          <p className="text-green-700 font-mono text-sm max-w-2xl">
            A comprehensive repository of offensive security research, infrastructure defense protocols, and SME-level technical briefings.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12 max-w-xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-900" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH DATABASE (TITLE, TAGS, SUMMARY)..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-black/40 border border-green-500/20 rounded-lg py-4 pl-12 pr-4 text-green-400 font-mono text-sm focus:outline-none focus:border-green-500/60 transition-all placeholder:text-green-900"
          />
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence mode="popLayout">
            {currentBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-xl border border-green-500/10 bg-black/40 backdrop-blur-md p-4 transition-all duration-300 hover:border-green-500/60 hover:shadow-[0_0_30px_rgba(0,255,0,0.1)]"
              >
                <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                  <img 
                    src={blog.mainImage} 
                    alt={blog.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-green-500/60">
                    <span>{blog.date}</span>
                    <div className="flex gap-2">
                      {blog.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-1 border border-green-500/20">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors leading-tight uppercase">
                    {blog.title}
                  </h3>
                  <p className="text-green-700 text-xs leading-relaxed line-clamp-2 italic font-mono">
                    {blog.summary}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredBlogs.length === 0 && (
          <div className="text-center py-24 border border-dashed border-green-500/10 rounded-xl">
            <p className="text-green-900 font-mono text-sm uppercase tracking-widest">
              No matching intelligence files found in the archive.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 font-mono text-sm">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-green-500/20 text-green-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-500/10 transition-colors rounded"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 border rounded transition-all ${
                    currentPage === i + 1 
                      ? 'bg-green-500 border-green-500 text-black font-bold' 
                      : 'border-green-500/20 text-green-500 hover:border-green-500/60'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-green-500/20 text-green-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-500/10 transition-colors rounded"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
