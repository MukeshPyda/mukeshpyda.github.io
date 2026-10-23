'use client';
import {
  Bytes, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc,
  where, writeBatch, type DocumentData, type Timestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { getFirebase } from '@/lib/firebase/client';
import {
  DEFAULT_TIER, MAX_PDF_BYTES, PDF_CHUNK_BYTES, formatBytes, newId, normalizeEmail, requestId, syllabusOf,
  type AccessRequest, type Course, type CourseContent, type CourseSchedule, type Enrollment, type Lesson, type PdfLesson,
} from './types';

// All Firestore access for courses. The security rules decide who may read or
// write each document; these helpers only shape the data.

const db = () => getFirebase().db;

export function isPermissionDenied(err: unknown) {
  return (err as { code?: string })?.code === 'permission-denied';
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

function toSchedule(d: DocumentData): CourseSchedule {
  return {
    format: str(d.format),
    startDate: str(d.startDate),
    endDate: str(d.endDate),
    enrollBy: str(d.enrollBy),
    classDays: str(d.classDays),
    classStart: str(d.classStart),
    classEnd: str(d.classEnd),
    timeZone: str(d.timeZone),
    seats: num(d.seats),
    enrolledCount: num(d.enrolledCount),
  };
}

function toCourse(id: string, d: DocumentData): Course {
  return {
    ...toSchedule(d),
    id,
    title: d.title ?? id,
    description: d.description ?? '',
    priceUsd: typeof d.priceUsd === 'number' ? d.priceUsd : 0,
    tier: d.tier ?? DEFAULT_TIER,
    published: Boolean(d.published),
    order: typeof d.order === 'number' ? d.order : 0,
    syllabus: Array.isArray(d.syllabus) ? d.syllabus : [],
    lessonCount: typeof d.lessonCount === 'number' ? d.lessonCount : 0,
  };
}

const byOrder = (a: Course, b: Course) => a.order - b.order || a.title.localeCompare(b.title);

/** Resolves if the signed-in user is the admin; rejects with permission-denied otherwise. */
export async function probeAdmin() {
  await getDoc(doc(db(), 'admin', 'access'));
}

// ---------- Catalog ----------

export async function listPublishedCourses(): Promise<Course[]> {
  const snap = await getDocs(query(collection(db(), 'courses'), where('published', '==', true)));
  return snap.docs.map((d) => toCourse(d.id, d.data())).sort(byOrder);
}

export async function listAllCourses(): Promise<Course[]> {
  const snap = await getDocs(collection(db(), 'courses'));
  return snap.docs.map((d) => toCourse(d.id, d.data())).sort(byOrder);
}

/** A published course (or any course for the admin); null if missing or hidden. */
export async function getCourse(id: string): Promise<Course | null> {
  try {
    const snap = await getDoc(doc(db(), 'courses', id));
    return snap.exists() ? toCourse(snap.id, snap.data()) : null;
  } catch (err) {
    if (isPermissionDenied(err)) return null;
    throw err;
  }
}

export async function getContent(courseId: string): Promise<CourseContent | null> {
  const snap = await getDoc(doc(db(), 'courses', courseId, 'private', 'content'));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { modules: Array.isArray(d.modules) ? d.modules : [], links: Array.isArray(d.links) ? d.links : [] };
}

// ---------- PDFs (stored as chunks so no paid Storage bucket is needed) ----------

export async function uploadPdf(courseId: string, file: File, onProgress?: (done: number, total: number) => void) {
  if (file.size > MAX_PDF_BYTES) throw new Error(`${file.name} is ${formatBytes(file.size)}; the limit is ${formatBytes(MAX_PDF_BYTES)}.`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const fileId = newId();
  const total = Math.max(1, Math.ceil(bytes.length / PDF_CHUNK_BYTES));
  for (let i = 0; i < total; i++) {
    const piece = bytes.subarray(i * PDF_CHUNK_BYTES, (i + 1) * PDF_CHUNK_BYTES);
    await setDoc(doc(db(), 'courses', courseId, 'files', fileId, 'chunks', String(i).padStart(4, '0')), {
      data: Bytes.fromUint8Array(piece),
    });
    onProgress?.(i + 1, total);
  }
  // Metadata last: a file without it is an interrupted upload.
  await setDoc(doc(db(), 'courses', courseId, 'files', fileId), {
    name: file.name,
    size: file.size,
    chunks: total,
    contentType: 'application/pdf',
  });
  return { fileId, fileName: file.name, size: file.size };
}

export async function downloadPdf(courseId: string, fileId: string): Promise<Blob> {
  const snap = await getDocs(collection(db(), 'courses', courseId, 'files', fileId, 'chunks'));
  const parts = snap.docs
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((d) => (d.data().data as Bytes).toUint8Array() as Uint8Array<ArrayBuffer>);
  if (!parts.length) throw new Error('This PDF is missing. Ask the instructor to upload it again.');
  return new Blob(parts, { type: 'application/pdf' });
}

export async function deleteFile(courseId: string, fileId: string) {
  const chunks = await getDocs(collection(db(), 'courses', courseId, 'files', fileId, 'chunks'));
  await Promise.all(chunks.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db(), 'courses', courseId, 'files', fileId));
}

// ---------- Admin: saving and deleting courses ----------

export interface SaveCourseInput {
  course: Omit<Course, 'syllabus' | 'lessonCount'>;
  content: CourseContent;
  /** PDFs picked in the editor but not uploaded yet, keyed by lesson id. */
  pendingPdfs: Map<string, File>;
  previousContent: CourseContent | null;
  onStatus?: (text: string) => void;
}

export async function saveCourse({ course, content, pendingPdfs, previousContent, onStatus }: SaveCourseInput) {
  const modules = [];
  for (const m of content.modules) {
    const lessons: Lesson[] = [];
    for (const lesson of m.lessons) {
      const file = lesson.type === 'pdf' ? pendingPdfs.get(lesson.id) : undefined;
      if (lesson.type === 'pdf' && file) {
        const uploaded = await uploadPdf(course.id, file, (done, total) => onStatus?.(`Uploading ${file.name} (${done}/${total})…`));
        lessons.push({ ...lesson, ...uploaded } satisfies PdfLesson);
      } else {
        lessons.push(lesson);
      }
    }
    modules.push({ title: m.title, lessons });
  }
  const finalContent: CourseContent = { modules, links: content.links };

  onStatus?.('Saving course…');
  const batch = writeBatch(db());
  batch.set(doc(db(), 'courses', course.id), {
    format: course.format,
    startDate: course.startDate,
    endDate: course.endDate,
    enrollBy: course.enrollBy,
    classDays: course.classDays,
    classStart: course.classStart,
    classEnd: course.classEnd,
    timeZone: course.timeZone,
    seats: course.seats,
    enrolledCount: course.enrolledCount,
    title: course.title,
    description: course.description,
    priceUsd: course.priceUsd,
    tier: course.tier,
    published: course.published,
    order: course.order,
    syllabus: syllabusOf(finalContent),
    lessonCount: modules.reduce((n, m) => n + m.lessons.length, 0),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(db(), 'courses', course.id, 'private', 'content'), { ...finalContent, updatedAt: serverTimestamp() });
  await batch.commit();

  // Remove PDFs that no lesson uses any more.
  const used = new Set(modules.flatMap((m) => m.lessons).flatMap((l) => (l.type === 'pdf' ? [l.fileId] : [])));
  const previous = previousContent ? previousContent.modules.flatMap((m) => m.lessons) : [];
  for (const l of previous) {
    if (l.type === 'pdf' && l.fileId && !used.has(l.fileId)) await deleteFile(course.id, l.fileId);
  }
  return finalContent;
}

/** Writes each course's enrolled-learner count, for the public "seats left" display. */
export async function syncEnrolledCounts(courses: Course[], enrollments: Enrollment[]) {
  const counts = new Map(courses.map((c) => [c.id, 0]));
  for (const e of enrollments) for (const id of new Set(e.courses)) if (counts.has(id)) counts.set(id, counts.get(id)! + 1);
  const stale = courses.filter((c) => counts.get(c.id) !== c.enrolledCount);
  if (!stale.length) return courses;
  const batch = writeBatch(db());
  stale.forEach((c) => batch.set(doc(db(), 'courses', c.id), { enrolledCount: counts.get(c.id) }, { merge: true }));
  await batch.commit();
  return courses.map((c) => ({ ...c, enrolledCount: counts.get(c.id) ?? c.enrolledCount }));
}

export async function setCourseOrder(courses: Course[]) {
  const batch = writeBatch(db());
  courses.forEach((c, i) => batch.set(doc(db(), 'courses', c.id), { order: i }, { merge: true }));
  await batch.commit();
}

export async function deleteCourse(courseId: string) {
  const files = await getDocs(collection(db(), 'courses', courseId, 'files'));
  for (const f of files.docs) await deleteFile(courseId, f.id);
  const enrolled = await getDocs(query(collection(db(), 'enrollments'), where('courses', 'array-contains', courseId)));
  const requests = await getDocs(query(collection(db(), 'requests'), where('courseId', '==', courseId)));
  const batch = writeBatch(db());
  enrolled.docs.forEach((d) => batch.update(d.ref, { courses: arrayRemove(courseId) }));
  requests.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db(), 'courses', courseId, 'private', 'content'));
  batch.delete(doc(db(), 'courses', courseId));
  await batch.commit();
}

// ---------- Enrollment ----------

/** Course ids the signed-in learner can open ([] if none or not allowed to read). */
export async function getMyCourses(email: string): Promise<string[]> {
  try {
    const snap = await getDoc(doc(db(), 'enrollments', normalizeEmail(email)));
    return snap.exists() && Array.isArray(snap.data().courses) ? snap.data().courses : [];
  } catch (err) {
    if (isPermissionDenied(err)) return [];
    throw err;
  }
}

export async function listEnrollments(): Promise<Enrollment[]> {
  const snap = await getDocs(collection(db(), 'enrollments'));
  return snap.docs
    .map((d) => ({ email: d.id, courses: Array.isArray(d.data().courses) ? d.data().courses : [] }))
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function grantAccess(email: string, courseIds: string[]) {
  await setDoc(
    doc(db(), 'enrollments', normalizeEmail(email)),
    { courses: arrayUnion(...courseIds), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function revokeAccess(email: string, courseId: string) {
  await setDoc(doc(db(), 'enrollments', normalizeEmail(email)), { courses: arrayRemove(courseId), updatedAt: serverTimestamp() }, { merge: true });
}

export async function removeLearner(email: string) {
  await deleteDoc(doc(db(), 'enrollments', normalizeEmail(email)));
}

// ---------- Access requests ----------

export async function requestAccess(user: User, courseId: string) {
  const email = normalizeEmail(user.email ?? '');
  await setDoc(doc(db(), 'requests', requestId(email, courseId)), {
    email,
    name: (user.displayName ?? '').slice(0, 120),
    courseId,
    createdAt: serverTimestamp(),
  });
}

export async function hasPendingRequest(email: string, courseId: string) {
  try {
    return (await getDoc(doc(db(), 'requests', requestId(email, courseId)))).exists();
  } catch (err) {
    if (isPermissionDenied(err)) return false;
    throw err;
  }
}

export async function listRequests(): Promise<AccessRequest[]> {
  const snap = await getDocs(query(collection(db(), 'requests'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      email: data.email ?? '',
      name: data.name ?? '',
      courseId: data.courseId ?? '',
      createdAt: (data.createdAt as Timestamp | undefined)?.toDate() ?? null,
    };
  });
}

export async function approveRequest(req: AccessRequest) {
  const batch = writeBatch(db());
  batch.set(doc(db(), 'enrollments', normalizeEmail(req.email)), { courses: arrayUnion(req.courseId), updatedAt: serverTimestamp() }, { merge: true });
  batch.delete(doc(db(), 'requests', req.id));
  await batch.commit();
}

export async function dismissRequest(id: string) {
  await deleteDoc(doc(db(), 'requests', id));
}

// ---------- Progress ----------

export async function getProgress(uid: string, courseId: string): Promise<string[]> {
  const snap = await getDoc(doc(db(), 'progress', uid, 'courses', courseId));
  return snap.exists() && Array.isArray(snap.data().done) ? snap.data().done : [];
}

export async function setLessonDone(uid: string, courseId: string, lessonId: string, done: boolean) {
  await setDoc(doc(db(), 'progress', uid, 'courses', courseId), { done: done ? arrayUnion(lessonId) : arrayRemove(lessonId) }, { merge: true });
}
