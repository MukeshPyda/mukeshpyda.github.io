import { useSyncExternalStore } from 'react';

// A shared clock for "enrollment closed", "next class" and "live now" labels.
// Reading Date.now() during render is impure, so components subscribe instead.

let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
  now = Date.now();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(tick, 30_000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Current time in ms, refreshed every 30 seconds (0 during prerender). */
export function useNow() {
  return useSyncExternalStore(subscribe, () => now, () => 0);
}
