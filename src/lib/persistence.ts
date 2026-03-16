'use client';
import { useState, useEffect } from 'react';
import { initialTimelineData, TimelineEvent } from '@/lib/data';

export function usePersistence() {
  const [data, setData] = useState<TimelineEvent[]>(initialTimelineData);

  useEffect(() => {
    const savedData = localStorage.getItem('mukesh_timeline');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (err) {
        console.error("Data integrity failure, reverting to base profile.");
      }
    }
  }, []);

  const saveData = (newData: TimelineEvent[]) => {
    localStorage.setItem('mukesh_timeline', JSON.stringify(newData));
    setData(newData);
  };

  return { data, saveData };
}
