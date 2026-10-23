import { CalendarDays, Clock, FileText, Hourglass, Radio, Users, Video } from 'lucide-react';
import { classTimes, enrollmentOpen, formatDay, seatsLeft } from '@/lib/courses/schedule';
import type { CourseSchedule, LessonType } from '@/lib/courses/types';

export type EnrollState = 'open' | 'closed' | 'full';

/** `now` is 0 until the client clock is running; treat that as open. */
export function enrollState(course: CourseSchedule, now: number): EnrollState {
  if (now && !enrollmentOpen(course, now)) return 'closed';
  if (seatsLeft(course) === 0) return 'full';
  return 'open';
}

export function LessonIcon({ type, className = '' }: { type: LessonType; className?: string }) {
  if (type === 'session') return <CalendarDays size={16} className={className} />;
  if (type === 'video') return <Video size={16} className={className} />;
  return <FileText size={16} className={className} />;
}

/** Format, dates, class time (course zone + viewer's zone), seats and deadline. */
export default function CohortDetails({ course, now, compact = false }: { course: CourseSchedule; now: number; compact?: boolean }) {
  const times = classTimes(course);
  const left = seatsLeft(course);
  const state = enrollState(course, now);
  const rows: { icon: React.ReactNode; text: React.ReactNode; tone?: string }[] = [];

  if (course.format && !compact) rows.push({ icon: <Radio size={14} />, text: course.format });
  if (course.startDate) {
    rows.push({
      icon: <CalendarDays size={14} />,
      text: course.endDate
        ? `${formatDay(course.startDate, !compact)} – ${formatDay(course.endDate, true)}`
        : `Starts ${formatDay(course.startDate, true)}`,
    });
  }
  if (times && !compact) {
    rows.push({
      icon: <Clock size={14} />,
      text: (
        <>
          {course.classDays && <>{course.classDays} · </>}
          {times.course}
          {times.local && <span className="block text-green-500/60">= {times.local} your time</span>}
        </>
      ),
    });
  }
  if (left !== null) {
    rows.push({
      icon: <Users size={14} />,
      text: left === 0 ? 'Batch full' : `${left} of ${course.seats} seats left`,
      tone: left === 0 ? 'text-red-400' : left <= 5 ? 'text-yellow-400' : undefined,
    });
  }
  if (course.enrollBy) {
    rows.push({
      icon: <Hourglass size={14} />,
      text: state === 'closed' ? 'Enrollment closed' : `Enroll by ${formatDay(course.enrollBy, !compact)}`,
      tone: state === 'closed' ? 'text-red-400' : undefined,
    });
  }
  if (!rows.length) return null;

  return (
    <ul className={`space-y-2 font-mono ${compact ? 'text-xs' : 'text-sm'} text-green-300`}>
      {rows.map((r, i) => (
        <li key={i} className={`flex gap-2 ${r.tone ?? ''}`}>
          <span className="mt-0.5 shrink-0 text-green-500/60">{r.icon}</span>
          <span>{r.text}</span>
        </li>
      ))}
    </ul>
  );
}
