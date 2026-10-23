import blogs from './blogs.json';
import type { BlogPost } from './types';

export type { BlogPost, BlogStep } from './types';

// Posts live in blogs.json so the Blog Maker (/terminal-x-92) can rewrite them
// safely. Order matters: newest first, and it drives prev/next navigation.
export const initialBlogData: BlogPost[] = blogs;
