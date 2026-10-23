import { DATE_PATTERN, DEFAULT_TIME_ZONE, TIME_PATTERN, type CourseSchedule, type Lesson, type SessionLesson } from './types';

// Live-cohort date maths with Intl only (no date library). Class times are
// entered in the course's time zone (IST by default) and shown to each visitor
// in their own time zone as well.

const ZONE_LABELS: Record<string, string> = { 'Asia/Kolkata': 'IST' };

export function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function zoneOf(course: Pick<CourseSchedule, 'timeZone'>) {
  return course.timeZone && isValidTimeZone(course.timeZone) ? course.timeZone : DEFAULT_TIME_ZONE;
}

/** Minutes the zone is ahead of UTC at the given instant. */
function offsetMinutes(instant: number, tz: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const wall = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((wall - instant) / 60000);
}

/** The instant of a wall-clock date + time in a time zone. */
export function zonedInstant(date: string, time: string, tz: string): number {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  const first = guess - offsetMinutes(guess, tz) * 60000;
  return guess - offsetMinutes(first, tz) * 60000;
}

/** "Mon, 2 Nov 2026" for a YYYY-MM-DD date, independent of the viewer's zone. */
export function formatDay(date: string, withYear = false) {
  if (!DATE_PATTERN.test(date)) return date;
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}),
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function formatClock(instant: number, tz: string) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date(instant));
}

function zoneLabel(instant: number, tz: string) {
  if (ZONE_LABELS[tz]) return ZONE_LABELS[tz];
  const part = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
    .formatToParts(new Date(instant))
    .find((p) => p.type === 'timeZoneName');
  return part?.value ?? tz;
}

export function viewerTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

export interface ClassTimes {
  /** e.g. "8:00 PM – 10:00 PM IST" */
  course: string;
  /** Same window in the viewer's zone, or null when it is the same zone. */
  local: string | null;
}

/** Class window on a given date (defaults to the course start date). */
export function classTimes(course: CourseSchedule, date?: string): ClassTimes | null {
  if (!TIME_PATTERN.test(course.classStart) || !TIME_PATTERN.test(course.classEnd)) return null;
  const day = date && DATE_PATTERN.test(date) ? date : DATE_PATTERN.test(course.startDate) ? course.startDate : '2026-01-05';
  const tz = zoneOf(course);
  const start = zonedInstant(day, course.classStart, tz);
  const end = zonedInstant(day, course.classEnd, tz);
  const label = (zone: string) => `${formatClock(start, zone)} – ${formatClock(end, zone)} ${zoneLabel(start, zone)}`;
  const viewer = viewerTimeZone();
  const sameZone = offsetMinutes(start, viewer) === offsetMinutes(start, tz);
  let local: string | null = null;
  if (!sameZone) {
    const startDay = new Intl.DateTimeFormat('en-GB', { timeZone: viewer, weekday: 'short' }).format(new Date(start));
    const courseDay = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short' }).format(new Date(start));
    local = `${label(viewer)}${startDay !== courseDay ? ` (${startDay})` : ''}`;
  }
  return { course: label(tz), local };
}

/** Enrollment is open until 23:59 on the enroll-by date in the course's zone. */
export function enrollmentOpen(course: CourseSchedule, now: number) {
  if (!DATE_PATTERN.test(course.enrollBy)) return true;
  return now <= zonedInstant(course.enrollBy, '23:59', zoneOf(course)) + 59_999;
}

/** Seats left, or null when the course has no seat limit. */
export function seatsLeft(course: CourseSchedule): number | null {
  return course.seats > 0 ? Math.max(0, course.seats - course.enrolledCount) : null;
}

export interface SessionWindow {
  lesson: SessionLesson;
  start: number;
  end: number;
}

function sessionWindow(course: CourseSchedule, lesson: SessionLesson): SessionWindow | null {
  if (!DATE_PATTERN.test(lesson.date)) return null;
  const tz = zoneOf(course);
  const startTime = TIME_PATTERN.test(course.classStart) ? course.classStart : '00:00';
  const endTime = TIME_PATTERN.test(course.classEnd) ? course.classEnd : '23:59';
  return { lesson, start: zonedInstant(lesson.date, startTime, tz), end: zonedInstant(lesson.date, endTime, tz) };
}

export function sessionStatus(course: CourseSchedule, lesson: SessionLesson, now: number): 'upcoming' | 'live' | 'past' {
  const w = sessionWindow(course, lesson);
  if (!w) return 'upcoming';
  return now < w.start ? 'upcoming' : now < w.end ? 'live' : 'past';
}

/** The class happening now, or the next one; null when all are over. */
export function nextSession(course: CourseSchedule, lessons: Lesson[], now: number): SessionWindow | null {
  return (
    lessons
      .filter((l): l is SessionLesson => l.type === 'session')
      .map((l) => sessionWindow(course, l))
      .filter((w): w is SessionWindow => w !== null && w.end > now)
      .sort((a, b) => a.start - b.start)[0] ?? null
  );
}
