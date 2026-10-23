import { getYouTubeId } from '@/app/intelligence/utils';
import { DATE_PATTERN } from '@/lib/courses/types';

// Parses the Courses editor's "Bulk add" text:
//   # Week 1 · Foundations                         -> new module
//   2026-11-02 | Orientation & setup               -> live session
//   2026-11-02 | Orientation & setup | <YouTube>   -> live session with recording
//   Intro to Burp Suite | <YouTube link>           -> video lesson
// Lines before the first "#" go into the last existing module.

export type BulkLesson =
  | { type: 'session'; title: string; date: string; url: string }
  | { type: 'video'; title: string; url: string };

export interface BulkModule {
  /** null = append to the last module already in the editor. */
  title: string | null;
  lessons: BulkLesson[];
}

export function parseBulkLessons(text: string): { modules: BulkModule[]; errors: string[] } {
  const modules: BulkModule[] = [];
  const errors: string[] = [];
  let current: BulkModule | null = null;

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const where = `Line ${i + 1}`;

    if (line.startsWith('#')) {
      const title = line.replace(/^#+/, '').trim();
      if (!title) errors.push(`${where}: module title is empty.`);
      current = { title, lessons: [] };
      modules.push(current);
      return;
    }

    const parts = line.split('|').map((p) => p.trim());
    let lesson: BulkLesson | null = null;
    if (DATE_PATTERN.test(parts[0])) {
      const [date, title = '', url = ''] = parts;
      const [y, m, d] = date.split('-').map(Number);
      const real = new Date(Date.UTC(y, m - 1, d));
      if (real.getUTCFullYear() !== y || real.getUTCMonth() !== m - 1 || real.getUTCDate() !== d) errors.push(`${where}: ${date} is not a real date.`);
      else if (!title) errors.push(`${where}: the session needs a title after the date.`);
      else if (url && !getYouTubeId(url)) errors.push(`${where}: the recording is not a valid YouTube link.`);
      else lesson = { type: 'session', title, date, url };
    } else if (parts.length >= 2 && parts[0]) {
      const url = parts[parts.length - 1];
      if (!getYouTubeId(url)) errors.push(`${where}: "${url}" is not a valid YouTube link.`);
      else lesson = { type: 'video', title: parts.slice(0, -1).join(' | '), url };
    } else {
      errors.push(`${where}: expected "# Module", "YYYY-MM-DD | Title" or "Title | YouTube link".`);
    }

    if (lesson) {
      if (!current) {
        current = { title: null, lessons: [] };
        modules.push(current);
      }
      current.lessons.push(lesson);
    }
  });

  return { modules, errors };
}
