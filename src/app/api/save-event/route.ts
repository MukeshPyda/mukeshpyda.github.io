import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { TimelineEvent } from '@/lib/data';
import {
  LocalStoreError,
  assertLocalDev,
  errorResponse,
  isDataUrl,
  replaceExportedArray,
  resolveInside,
  safeId,
  writeDataUrl,
} from '@/lib/server/localStore';

// Dev-only: writes timeline images to public/images/events/<id>/ and rewrites
// initialTimelineData in src/lib/data.ts. Refused outside a local dev server.

const EVENTS_DIR = path.join(process.cwd(), 'public', 'images', 'events');
const DATA_FILE = path.join(process.cwd(), 'src', 'lib', 'data.ts');
const DECLARATION = 'export const initialTimelineData: TimelineEvent[]';

function text(value: unknown, field: string, max: number): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string' || value.length > max) {
    throw new LocalStoreError(`${field} must be text under ${max} characters.`);
  }
  return value;
}

function imageRef(value: unknown): string {
  const ref = text(value, 'Image', 20 * 1024 * 1024);
  if (ref && !isDataUrl(ref) && !ref.startsWith('/')) {
    throw new LocalStoreError('Images must be uploads or site paths.');
  }
  return ref;
}

function parseEvent(raw: unknown): TimelineEvent {
  if (!raw || typeof raw !== 'object') throw new LocalStoreError('Event is missing.');
  const e = raw as Record<string, unknown>;
  if (!Array.isArray(e.collage ?? [])) throw new LocalStoreError('Collage must be a list.');
  return {
    id: safeId(e.id),
    title: text(e.title, 'Title', 300),
    date: text(e.date, 'Date', 100),
    summary: text(e.summary, 'Summary', 2000),
    description: text(e.description, 'Description', 20000),
    mainImage: imageRef(e.mainImage),
    collage: ((e.collage as unknown[]) ?? []).map(imageRef),
  };
}

function parseEvents(raw: unknown): TimelineEvent[] {
  if (!Array.isArray(raw)) throw new LocalStoreError('Event list is missing.');
  return raw.map(parseEvent);
}

/** Deletes files in an event folder that the saved event no longer references. */
function pruneFolder(dir: string, keep: string[]) {
  if (!fs.existsSync(dir)) return;
  const kept = new Set(keep.map((p) => path.basename(p)));
  for (const file of fs.readdirSync(dir)) {
    if (!kept.has(file)) fs.rmSync(resolveInside(dir, file), { force: true });
  }
}

export async function POST(request: Request) {
  const denied = assertLocalDev(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const event = parseEvent(body.event);
    const allEvents = parseEvents(body.allEvents);
    const id = String(event.id);
    const eventDir = resolveInside(EVENTS_DIR, id);
    const prefix = `/images/events/${id}`;

    const mainImage = isDataUrl(event.mainImage)
      ? writeDataUrl(eventDir, 'main', event.mainImage, prefix)
      : event.mainImage;
    const collage = event.collage.map((img, idx) =>
      isDataUrl(img) ? writeDataUrl(eventDir, `collage-${idx}-${Date.now()}`, img, prefix) : img
    );
    pruneFolder(eventDir, [mainImage, ...collage].filter((p) => p.startsWith(`${prefix}/`)));

    const updatedEvent = { ...event, mainImage, collage };
    const exists = allEvents.some((e) => e.id === event.id);
    const finalEvents = exists
      ? allEvents.map((e) => (e.id === event.id ? updatedEvent : e))
      : [updatedEvent, ...allEvents];

    replaceExportedArray(DATA_FILE, DECLARATION, finalEvents);
    return NextResponse.json({ success: true, updatedEvent, allEvents: finalEvents });
  } catch (err) {
    return errorResponse(err, 'Local Sync Error (POST)');
  }
}

export async function DELETE(request: Request) {
  const denied = assertLocalDev(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const id = safeId(body.id);
    const allEvents = parseEvents(body.allEvents);

    fs.rmSync(resolveInside(EVENTS_DIR, String(id)), { recursive: true, force: true });

    const finalEvents = allEvents.filter((e) => e.id !== id);
    replaceExportedArray(DATA_FILE, DECLARATION, finalEvents);
    return NextResponse.json({ success: true, allEvents: finalEvents });
  } catch (err) {
    return errorResponse(err, 'Local Sync Error (DELETE)');
  }
}
