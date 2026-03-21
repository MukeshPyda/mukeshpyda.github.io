'use client';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { useRef, useState, useMemo, useEffect } from 'react';
import TimelineItem from './TimelineItem';
import Modal from './Modal';
import { TimelineEvent } from '@/lib/data';

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  const containerRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="relative max-w-7xl mx-auto">
      {/* Central Glowing Line (Desktop) */}
      <motion.div 
        style={{ scaleY }}
        className="absolute left-1/2 transform -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-green-500 via-green-400 to-green-900 origin-top shadow-[0_0_15px_rgba(0,255,0,0.5)] z-0 hidden lg:block"
      />

      {/* Side Tactical Line (Mobile) */}
      <div className="absolute left-4 transform -translate-x-1/2 top-0 bottom-0 w-[1px] bg-green-500/10 lg:hidden" />
      <motion.div 
        style={{ scaleY }}
        className="absolute left-4 transform -translate-x-1/2 top-0 h-full w-[2px] bg-gradient-to-b from-green-500 via-green-400 to-green-900 origin-top shadow-[0_0_15px_rgba(0,255,0,0.5)] z-0 lg:hidden"
      />
      
      <div className="space-y-12 lg:space-y-0">
        {events.map((event, index) => (
          <TimelineItem 
            key={event.id} 
            event={event} 
            index={index} 
            onClick={() => setSelectedEvent(event)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <Modal 
            key={`modal-${selectedEvent.id}`} 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
