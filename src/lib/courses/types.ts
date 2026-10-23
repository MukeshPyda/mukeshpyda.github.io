// Firestore layout (enforced by firestore.rules):
//   courses/{courseId}                         public catalog entry (when published)
//   courses/{courseId}/private/content         lessons + links, enrolled learners only
//   courses/{courseId}/files/{fileId}          PDF metadata, enrolled learners only
//   courses/{courseId}/files/{fileId}/chunks/{n}   PDF bytes in ~900 KB pieces
//   enrollments/{email}                        { courses: [courseId] }, written by the admin
//   requests/{email__courseId}                 "Request access" from a signed-in learner
//   progress/{uid}/courses/{courseId}          { done: [lessonId] }, the learner's own

export const COURSE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const DEFAULT_TIER = 'Training + Mentorship';
export const PDF_CHUNK_BYTES = 900 * 1024;
export const MAX_PDF_BYTES = 20 * 1024 * 1024;
export const DEFAULT_TIME_ZONE = 'Asia/Kolkata';
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface SyllabusModule {
  title: string;
  /** `date` is set for live sessions (YYYY-MM-DD). */
  lessons: { title: string; type: LessonType; date?: string }[];
}

/** Live-cohort details; every field is optional ('' / 0 when unused). */
export interface CourseSchedule {
  format: string;
  startDate: string;
  endDate: string;
  enrollBy: string;
  classDays: string;
  classStart: string;
  classEnd: string;
  timeZone: string;
  /** 0 means no seat limit. */
  seats: number;
  /** Kept up to date by the admin's Learners tab. */
  enrolledCount: number;
}

/** Public catalog entry. Contains no video ids, files or links. */
export interface Course extends CourseSchedule {
  id: string;
  title: string;
  description: string;
  priceUsd: number;
  tier: string;
  published: boolean;
  order: number;
  syllabus: SyllabusModule[];
  lessonCount: number;
}

export type LessonType = 'video' | 'pdf' | 'session';

export interface VideoLesson {
  id: string;
  type: 'video';
  title: string;
  youtubeId: string;
}

export interface PdfLesson {
  id: string;
  type: 'pdf';
  title: string;
  fileId: string;
  fileName: string;
  size: number;
}

/** A live class on a given day; the recording (unlisted YouTube) is added afterwards. */
export interface SessionLesson {
  id: string;
  type: 'session';
  title: string;
  date: string;
  youtubeId?: string;
}

export type Lesson = VideoLesson | PdfLesson | SessionLesson;

export interface CourseModule {
  title: string;
  lessons: Lesson[];
}

export interface CourseLink {
  label: string;
  url: string;
}

/** Private part of a course: only enrolled learners and the admin can read it. */
export interface CourseContent {
  modules: CourseModule[];
  links: CourseLink[];
}

export interface AccessRequest {
  id: string;
  email: string;
  name: string;
  courseId: string;
  createdAt: Date | null;
}

export interface Enrollment {
  email: string;
  courses: string[];
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function requestId(email: string, courseId: string) {
  return `${normalizeEmail(email)}__${courseId}`;
}

export function newId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

export function courseIdFromTitle(title: string) {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

export function syllabusOf(content: CourseContent): SyllabusModule[] {
  return content.modules.map((m) => ({
    title: m.title,
    lessons: m.lessons.map((l) => (l.type === 'session' ? { title: l.title, type: l.type, date: l.date } : { title: l.title, type: l.type })),
  }));
}

export function allLessons(content: CourseContent | null): Lesson[] {
  return content ? content.modules.flatMap((m) => m.lessons) : [];
}

export function courseUrl(id: string) {
  return `/courses/view/?c=${encodeURIComponent(id)}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
