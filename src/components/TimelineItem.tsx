'use client';
import { motion } from 'framer-motion';
import { TimelineEvent } from '@/lib/data';

export default function TimelineItem({ event, index, onClick }: { event: TimelineEvent, index: number, onClick: () => void }) {
  const isEven = index % 2 === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onClick={onClick}
      className={`relative flex flex-col lg:flex-row items-start lg:items-center justify-between w-full mb-12 lg:mb-24 cursor-pointer group`}
    >
      {/* Content Area */}
      <div className={`w-full lg:w-[42%] pl-10 lg:pl-0 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="relative overflow-hidden rounded-xl border border-green-500/10 bg-black/40 backdrop-blur-md p-4 lg:p-6 transition-all duration-300 group-hover:border-green-500/60 group-hover:shadow-[0_0_30px_rgba(0,255,0,0.15)]">
          {/* Image */}
          <div className="w-full h-40 lg:h-64 mb-4 overflow-hidden rounded-lg">
            <img 
              src={event.mainImage} 
              alt={event.title} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-105 group-hover:scale-100" 
            />
          </div>
          
          {/* Intel Briefing */}
          <div className="space-y-1">
            <span className="text-[10px] lg:text-xs text-green-500/60 block font-mono uppercase tracking-[0.3em] font-bold">
              {event.date}
            </span>
            <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-green-400 transition-colors tracking-tight uppercase italic leading-tight">
              {event.title}
            </h3>
            <p className="text-green-400/70 leading-relaxed text-xs lg:text-sm italic line-clamp-2 lg:line-clamp-none">
              {event.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Center Circle */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-green-500 border-4 border-[#0f0f0f] shadow-[0_0_15px_#00ff00] z-10 hidden lg:block" />
      
      {/* Mobile Circle Indicator */}
      <div className="absolute left-4 top-5 transform -translate-x-1/2 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#00ff00] lg:hidden" />

      {/* Spacer for the other side (Desktop only) */}
      <div className={`w-full lg:w-[42%] hidden lg:block ${isEven ? 'lg:order-2' : 'lg:order-1'}`} />
    </motion.div>
  );
}
