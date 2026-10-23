import fs from 'fs';
import path from 'path';
import type { BlogPost } from './types';

/**
 * Server-side read of blogs.json. Reading the file (instead of importing it) means
 * the dev server shows a post saved by the Blog Maker immediately, without a restart.
 */
export function getBlogs(): BlogPost[] {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'intelligence', 'blogs.json'), 'utf-8'));
}
