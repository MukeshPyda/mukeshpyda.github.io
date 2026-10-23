import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { BlogPost, BlogStep } from '@/app/intelligence/types';
import { getYouTubeId } from '@/app/intelligence/utils';
import {
  LocalStoreError,
  assertLocalDev,
  errorResponse,
  isDataUrl,
  resolveInside,
  safeSlug,
  writeDataUrl,
} from '@/lib/server/localStore';

// Dev-only backend for the Blog Maker. Posts live in src/app/intelligence/blogs.json
// and each post's images live in public/intelligence/<slug>/. The list on disk is
// the source of truth; the client only sends the one post being saved.

const BLOGS_FILE = path.join(process.cwd(), 'src', 'app', 'intelligence', 'blogs.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'intelligence');

function readBlogs(): BlogPost[] {
  return JSON.parse(fs.readFileSync(BLOGS_FILE, 'utf-8'));
}

function writeBlogs(blogs: BlogPost[]) {
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2) + '\n');
}

function text(value: unknown, field: string, max: number, required = false): string {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string' || value.length > max) {
    throw new LocalStoreError(`${field} must be text under ${max} characters.`);
  }
  const trimmed = value.trim();
  if (required && !trimmed) throw new LocalStoreError(`${field} is required.`);
  return trimmed;
}

/** Like text(), but keeps leading indentation (only blank lines around it are dropped). */
function codeText(value: unknown): string {
  const raw = text(value, 'Code', 50000) ? (value as string) : '';
  return raw.replace(/^\s*\n/, '').replace(/\s+$/, '');
}

function imageRef(value: unknown): string {
  if (typeof value !== 'string') throw new LocalStoreError('Images must be uploads or site paths.');
  if (!isDataUrl(value) && !value.startsWith('/') && !value.startsWith('https://')) {
    throw new LocalStoreError('Images must be uploads or site paths.');
  }
  return value;
}

function list<T>(value: unknown, field: string, max: number, parse: (item: unknown, i: number) => T): T[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > max) {
    throw new LocalStoreError(`${field} must be a list of at most ${max} items.`);
  }
  return value.map(parse);
}

function parseStep(raw: unknown, i: number): BlogStep {
  if (!raw || typeof raw !== 'object') throw new LocalStoreError(`Step ${i + 1} is invalid.`);
  const s = raw as Record<string, unknown>;
  const step: BlogStep = { title: text(s.title, `Step ${i + 1} title`, 300, true) };
  const description = text(s.description, 'Description', 20000);
  const code = codeText(s.code);
  const images = list(s.images, 'Step images', 30, imageRef);
  if (description) step.description = description;
  if (code) step.code = code;
  if (images.length) step.images = images;
  return step;
}

function parseBlog(raw: unknown): Omit<BlogPost, 'id'> {
  if (!raw || typeof raw !== 'object') throw new LocalStoreError('Post is missing.');
  const b = raw as Record<string, unknown>;
  const videoUrl = text(b.videoUrl, 'YouTube URL', 500);
  if (videoUrl && !getYouTubeId(videoUrl)) throw new LocalStoreError('YouTube URL is not a valid video link.');
  const mainImage = b.mainImage ? imageRef(b.mainImage) : '';
  return {
    slug: safeSlug(b.slug),
    title: text(b.title, 'Title', 300, true),
    date: text(b.date, 'Date', 100, true),
    summary: text(b.summary, 'Summary', 3000),
    ...(videoUrl ? { videoUrl } : {}),
    mainImage,
    tags: list(b.tags, 'Tags', 20, (t) => text(t, 'Tag', 40, true)),
    steps: list(b.steps, 'Steps', 100, parseStep),
  };
}

/** Writes uploaded images into the post folder and returns the post with site paths. */
function storeImages(post: Omit<BlogPost, 'id'>): Omit<BlogPost, 'id'> {
  const dir = resolveInside(PUBLIC_DIR, post.slug);
  const prefix = `/intelligence/${post.slug}`;
  const stamp = Date.now().toString(36);
  const store = (img: string, name: string) => (isDataUrl(img) ? writeDataUrl(dir, `${name}-${stamp}`, img, prefix) : img);
  return {
    ...post,
    mainImage: post.mainImage ? store(post.mainImage, 'main') : '',
    steps: post.steps.map((step, s) =>
      step.images ? { ...step, images: step.images.map((img, i) => store(img, `step-${s + 1}-${i + 1}`)) } : step
    ),
  };
}

function referencedFiles(post: Omit<BlogPost, 'id'>): Set<string> {
  const prefix = `/intelligence/${post.slug}/`;
  const refs = [post.mainImage, ...post.steps.flatMap((s) => s.images ?? [])];
  return new Set(refs.filter((r) => r.startsWith(prefix)).map((r) => r.slice(prefix.length)));
}

/** Deletes files in the post folder that the saved post no longer uses. */
function pruneFolder(post: Omit<BlogPost, 'id'>) {
  const dir = resolveInside(PUBLIC_DIR, post.slug);
  if (!fs.existsSync(dir)) return;
  const keep = referencedFiles(post);
  for (const file of fs.readdirSync(dir)) {
    if (!keep.has(file)) fs.rmSync(resolveInside(dir, file), { recursive: true, force: true });
  }
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}

function renamePost(post: Omit<BlogPost, 'id'>, oldSlug: string): Omit<BlogPost, 'id'> {
  const from = resolveInside(PUBLIC_DIR, oldSlug);
  const to = resolveInside(PUBLIC_DIR, post.slug);
  if (fs.existsSync(from)) {
    if (fs.existsSync(to)) throw new LocalStoreError(`Folder public/intelligence/${post.slug} already exists.`);
    fs.renameSync(from, to);
  }
  const oldPrefix = `/intelligence/${oldSlug}/`;
  const move = (p: string) => (p.startsWith(oldPrefix) ? `/intelligence/${post.slug}/${p.slice(oldPrefix.length)}` : p);
  return {
    ...post,
    mainImage: move(post.mainImage),
    steps: post.steps.map((s) => (s.images ? { ...s, images: s.images.map(move) } : s)),
  };
}

function save(body: Record<string, unknown>) {
  const blogs = readBlogs();
  let post = parseBlog(body.blog);
  const originalSlug = body.originalSlug === undefined || body.originalSlug === null ? null : safeSlug(body.originalSlug);
  const index = originalSlug ? blogs.findIndex((b) => b.slug === originalSlug) : -1;
  if (originalSlug && index === -1) throw new LocalStoreError(`Post "${originalSlug}" no longer exists.`, 404);
  if (blogs.some((b, i) => b.slug === post.slug && i !== index)) {
    throw new LocalStoreError(`Another post already uses the slug "${post.slug}".`, 409);
  }

  if (originalSlug && originalSlug !== post.slug) post = renamePost(post, originalSlug);
  post = storeImages(post);
  pruneFolder(post);

  if (index === -1) {
    const id = blogs.reduce((max, b) => Math.max(max, b.id), 0) + 1;
    blogs.unshift({ id, ...post });
  } else {
    blogs[index] = { id: blogs[index].id, ...post };
  }
  writeBlogs(blogs);
  return blogs;
}

function reorder(body: Record<string, unknown>) {
  const blogs = readBlogs();
  const slugs = list(body.slugs, 'Order', 1000, safeSlug);
  if (slugs.length !== blogs.length || new Set(slugs).size !== slugs.length || !slugs.every((s) => blogs.some((b) => b.slug === s))) {
    throw new LocalStoreError('Order must list every post exactly once.');
  }
  const ordered = slugs.map((s) => blogs.find((b) => b.slug === s)!);
  writeBlogs(ordered);
  return ordered;
}

export async function POST(request: Request) {
  const denied = assertLocalDev(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    switch (body.action) {
      case 'list':
        return NextResponse.json({ blogs: readBlogs() });
      case 'save':
        return NextResponse.json({ success: true, blogs: save(body) });
      case 'reorder':
        return NextResponse.json({ success: true, blogs: reorder(body) });
      default:
        throw new LocalStoreError('Unknown action.');
    }
  } catch (err) {
    return errorResponse(err, 'Blog Maker Error (POST)');
  }
}

export async function DELETE(request: Request) {
  const denied = assertLocalDev(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const slug = safeSlug(body.slug);
    const blogs = readBlogs();
    if (!blogs.some((b) => b.slug === slug)) throw new LocalStoreError(`Post "${slug}" no longer exists.`, 404);
    fs.rmSync(resolveInside(PUBLIC_DIR, slug), { recursive: true, force: true });
    const remaining = blogs.filter((b) => b.slug !== slug);
    writeBlogs(remaining);
    return NextResponse.json({ success: true, blogs: remaining });
  } catch (err) {
    return errorResponse(err, 'Blog Maker Error (DELETE)');
  }
}
