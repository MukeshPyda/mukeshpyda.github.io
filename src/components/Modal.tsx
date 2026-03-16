'use client';
import { motion } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { TimelineEvent } from '@/lib/data';
import { useEffect } from 'react';

export default function Modal({ event, onClose }: { event: TimelineEvent, onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 lg:p-4 bg-black/98 backdrop-blur-3xl overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-7xl bg-[#050505] border border-green-500/20 rounded-[2rem] overflow-hidden shadow-[0_0_150px_rgba(0,255,0,0.15)]"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black to-transparent z-20">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#00ff00] animate-pulse" />
            <span className="text-[10px] text-green-500 font-mono tracking-[0.6em] uppercase font-black">Intel Dossier: {event.id}</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-3 rounded-full bg-black/80 border border-green-500/30 text-green-500 hover:bg-green-500 hover:text-black transition-all hover:scale-110 active:scale-95 z-30"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[95vh] lg:max-h-[90vh]">
          {/* Subject Matter Description */}
          <div className="lg:w-[35%] p-8 lg:p-12 pt-24 lg:pt-28 border-b lg:border-b-0 lg:border-r border-green-500/10 overflow-y-auto bg-black/40">
            <span className="text-[10px] text-green-800 font-mono mb-4 block tracking-[0.4em] font-black uppercase">{event.date}</span>
            <h2 className="text-4xl font-black mb-10 text-white tracking-tighter uppercase leading-[0.9] italic border-l-4 border-green-500 pl-6">
              {event.title}
            </h2>
            <div className="prose prose-invert prose-green max-w-none">
              <p className="text-green-400/70 leading-relaxed text-lg whitespace-pre-line font-mono selection:bg-green-500 selection:text-black">
                {event.description}
              </p>
            </div>
          </div>

          {/* Evidence Stream (Vertical Landscape Gallery) */}
          <div className="lg:w-[65%] p-4 lg:p-12 pt-24 lg:pt-28 bg-black/60 flex flex-col relative">
            <div className="flex items-center justify-between mb-8 border-b border-green-500/10 pb-4">
              <h3 className="text-xs font-black text-green-900 font-mono uppercase tracking-[0.5em] flex items-center gap-2">
                Evidence Stream <ChevronDown size={14} className="animate-bounce" />
              </h3>
              <span className="text-[10px] text-green-900 font-mono uppercase">Total Artifacts: {event.collage.length + (event.mainImage ? 1 : 0)}</span>
            </div>
            
            {/* Vertical Scroll Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-modal-scroll">
              {event.mainImage && (
                <motion.div 
                  key={`modal-main-${event.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="w-full aspect-video rounded-xl overflow-hidden border border-green-500/20 shadow-2xl relative group"
                >
                  <img src={event.mainImage} alt="Main Evidence" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-[10px] text-green-400 font-mono tracking-widest uppercase font-bold">Primary Artifact</span>
                  </div>
                </motion.div>
              )}
              
              {event.collage.map((img, idx) => (
                <motion.div 
                  key={`modal-collage-${event.id}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="w-full aspect-video rounded-xl overflow-hidden border border-green-500/20 shadow-2xl relative group"
                >
                  <img src={img} alt={`Evidence ${idx}`} className="w-full h-full object-cover transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-[10px] text-green-400 font-mono tracking-widest uppercase font-bold">Artifact Fragment {idx + 1}</span>
                  </div>
                </motion.div>
              ))}

              {(!event.mainImage && event.collage.length === 0) && (
                <div key="no-evidence" className="w-full aspect-video flex flex-col items-center justify-center border border-dashed border-green-500/10 rounded-xl text-green-900 font-mono uppercase text-xs tracking-[0.5em]">
                  No Visual Intel Stored
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
