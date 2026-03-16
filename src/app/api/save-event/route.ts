import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  // Security Check: Only allow local requests to modify the filesystem
  const origin = request.headers.get('origin');
  if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    return NextResponse.json({ error: 'Unauthorized: Global access to file system is disabled for security.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { event, allEvents } = body;
    const { id, mainImage, collage } = event;

    // 1. Create Directory Structure
    const eventDir = path.join(process.cwd(), 'public', 'images', 'events', id.toString());
    if (!fs.existsSync(eventDir)) {
      fs.mkdirSync(eventDir, { recursive: true });
    }

    // 2. Process Main Image
    let mainImagePath = mainImage;
    if (mainImage.startsWith('data:image')) {
      const base64Data = mainImage.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `main.jpg`;
      fs.writeFileSync(path.join(eventDir, filename), buffer);
      mainImagePath = `/images/events/${id}/${filename}`;
    }

    // 3. Process Collage Images
    const collagePaths = await Promise.all(collage.map((img: string, idx: number) => {
      if (img.startsWith('data:image')) {
        const base64Data = img.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `collage-${idx}.jpg`;
        fs.writeFileSync(path.join(eventDir, filename), buffer);
        return `/images/events/${id}/${filename}`;
      }
      return img;
    }));

    // 4. Update the Event Object
    const updatedEvent = { ...event, mainImage: mainImagePath, collage: collagePaths };
    const finalEvents = allEvents.map((e: any) => e.id === id ? updatedEvent : e);
    if (!allEvents.find((e: any) => e.id === id)) {
        finalEvents.unshift(updatedEvent);
    }

    // 5. Update src/lib/data.ts (SELF-MODIFYING CODE)
    const dataPath = path.join(process.cwd(), 'src', 'lib', 'data.ts');
    const currentData = fs.readFileSync(dataPath, 'utf-8');
    
    // Replace initialTimelineData array in data.ts
    const newDataTs = currentData.replace(
      /export const initialTimelineData: TimelineEvent\[\] = \[[\s\S]*?\];/,
      `export const initialTimelineData: TimelineEvent[] = ${JSON.stringify(finalEvents, null, 2)};`
    );

    fs.writeFileSync(dataPath, newDataTs);

    return NextResponse.json({ success: true, updatedEvent });
  } catch (err: any) {
    console.error('Local Sync Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
