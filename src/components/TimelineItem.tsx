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
      {/* Mobile-Only Timeline Line (Vertical on the left) */}
      <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-green-500/20 lg:hidden" />

      {/* Content Area */}
      <div className={`w-full lg:w-[42%] ml-10 lg:ml-0 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="relative overflow-hidden rounded-xl border border-green-500/20 bg-black/60 backdrop-blur-md p-6 transition-all duration-300 group-hover:border-green-500/60 group-hover:shadow-[0_0_30px_rgba(0,255,0,0.15)]">
          {/* Always Image on Top for Mobile, Alternating for Desktop */}
          <img src={event.mainImage} alt={event.title} className="w-full h-48 lg:h-64 object-cover rounded-lg mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
          <span className="text-xs text-green-500/70 mb-2 block font-mono uppercase tracking-widest">{event.date}</span>
          <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-green-400 transition-colors">{event.title}</h3>
          <p className="text-green-400/80 leading-relaxed text-sm italic">"{event.summary}"</p>
        </div>
      </div>

      {/* Desktop Center Circle */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-green-500 border-4 border-[#0f0f0f] shadow-[0_0_15px_#00ff00] z-10 hidden lg:block" />
      
      {/* Mobile Circle Indicator */}
      <div className="absolute left-4 top-10 transform -translate-x-1/2 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#00ff00] lg:hidden" />

      {/* Spacer for the other side (Desktop only) */}
      <div className={`w-full lg:w-[42%] hidden lg:block ${isEven ? 'lg:order-2' : 'lg:order-1'}`} />
    </motion.div>
  );
}
