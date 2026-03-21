'use client';
import { useState, useEffect } from 'react';
import { initialTimelineData, TimelineEvent } from '@/lib/data';

export function usePersistence() {
  const sortEvents = (events: TimelineEvent[]) => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateB - dateA;
    });
  };

  const [data, setData] = useState<TimelineEvent[]>(sortEvents(initialTimelineData));

  useEffect(() => {
    // Caching disabled to ensure real-time data from source (GitHub Pages)
  }, []);

  const saveData = (newData: TimelineEvent[]) => {
    setData(sortEvents(newData));
  };

  return { data, saveData };
}
