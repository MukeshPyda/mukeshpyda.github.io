import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Helpers for the dev-only "local sync" API routes. These routes write to the
// working tree, so every request must come from this machine and every path
// must stay inside its intended folder.

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export class LocalStoreError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function hostnameOf(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value.includes('://') ? value : `http://${value}`).hostname;
  } catch {
    return null;
  }
}

/** Returns a 403 response unless this is a dev server request from this machine. */
export function assertLocalDev(request: Request): NextResponse | null {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Local sync is disabled in production builds.' }, { status: 403 });
  }
  const host = hostnameOf(request.headers.get('host'));
  const origin = request.headers.get('origin');
  const originHost = origin ? hostnameOf(origin) : null;
  if (!host || !LOCAL_HOSTS.has(host) || (origin && (!originHost || !LOCAL_HOSTS.has(originHost)))) {
    return NextResponse.json({ error: 'Local sync only accepts requests from this machine.' }, { status: 403 });
  }
  return null;
}

export function safeSlug(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9-]{1,120}$/.test(value)) {
    throw new LocalStoreError('Slug must be 1-120 characters: letters, numbers and dashes only.');
  }
  return value;
}

export function safeId(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new LocalStoreError('Id must be a non-negative integer.');
  }
  return value;
}

/** Joins path parts onto base and refuses anything that escapes base. */
export function resolveInside(base: string, ...parts: string[]): string {
  const root = path.resolve(base);
  const target = path.resolve(root, ...parts);
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new LocalStoreError('Path escapes its folder.');
  }
  return target;
}

export function isDataUrl(value: unknown): value is `data:image/${string}` {
  return typeof value === 'string' && value.startsWith('data:image/');
}

/**
 * Writes a base64 image data URL to dir/name.<ext> (extension from its MIME type)
 * and returns the public URL path under publicPrefix.
 */
export function writeDataUrl(dir: string, name: string, dataUrl: string, publicPrefix: string): string {
  const match = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  const ext = match && IMAGE_EXTENSIONS[match[1]];
  if (!match || !ext) {
    throw new LocalStoreError('Images must be JPG, PNG, WebP or GIF.');
  }
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new LocalStoreError('Each image must be under 15 MB.');
  }
  const filename = `${name}.${ext}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(resolveInside(dir, filename), buffer);
  return `${publicPrefix}/${filename}`;
}

/** Replaces `<declaration> = [...];` in a TS source file, failing if it isn't found. */
export function replaceExportedArray(filePath: string, declaration: string, value: unknown) {
  const source = fs.readFileSync(filePath, 'utf-8');
  const escaped = declaration.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`${escaped} = \\[[\\s\\S]*?\\n\\];`);
  if (!pattern.test(source)) {
    throw new LocalStoreError(`Could not find "${declaration}" in ${path.basename(filePath)}.`, 500);
  }
  fs.writeFileSync(filePath, source.replace(pattern, () => `${declaration} = ${JSON.stringify(value, null, 2)};`));
}

export function errorResponse(err: unknown, context: string) {
  if (err instanceof LocalStoreError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(`${context}:`, err);
  return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
}
