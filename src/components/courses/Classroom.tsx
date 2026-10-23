'use client';
import { useEffect, useRef, useState } from 'react';
import {
  CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Circle, Download, ExternalLink, FileText, LogOut, Radio, RefreshCw,
} from 'lucide-react';
import { LessonIcon } from './CohortDetails';
import { signOutUser } from '@/lib/firebase/client';
import { downloadPdf, getContent, getProgress, setLessonDone } from '@/lib/courses/api';
import { classTimes, formatDay, nextSession, sessionStatus } from '@/lib/courses/schedule';
import { allLessons, type Course, type CourseContent, type CourseLink, type Lesson } from '@/lib/courses/types';
import { useNow } from '@/lib/useNow';

// The enrolled learner's classroom: next-class banner, lessons sidebar, live
// sessions with recordings, videos and PDFs, and "mark as done" progress.

export default function Player({ course, uid, email }: { course: Course; uid: string; email: string }) {
  const [data, setData] = useState<{ content: CourseContent; done: string[] } | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [pdf, setPdf] = useState<{ lessonId: string; url: string } | null>(null);
  const [pdfState, setPdfState] = useState<{ lessonId: string; status: 'loading' | 'error' } | null>(null);
  const pdfUrl = useRef<string | null>(null);
  const now = useNow();

  useEffect(() => {
    Promise.all([getContent(course.id), getProgress(uid, course.id).catch(() => [] as string[])])
      .then(([content, done]) => setData({ content: content ?? { modules: [], links: [] }, done }))
      .catch(() => setError('Could not load the course. Your access may have changed; refresh the page.'));
  }, [course.id, uid]);

  useEffect(() => () => {
    if (pdfUrl.current) URL.revokeObjectURL(pdfUrl.current);
  }, []);

  if (error) return <p className="text-center text-red-400 font-mono py-16">{error}</p>;
  if (!data) return <RefreshCw className="animate-spin text-green-500 mx-auto" />;

  const lessons = allLessons(data.content);
  const upcoming = now ? nextSession(course, lessons, now) : null;
  const current: Lesson | undefined =
    lessons.find((l) => l.id === selected) ??
    (upcoming ? upcoming.lesson : undefined) ??
    lessons.find((l) => !data.done.includes(l.id)) ??
    lessons[0];
  const index = current ? lessons.indexOf(current) : -1;
  const doneCount = lessons.filter((l) => data.done.includes(l.id)).length;
  const isDone = current ? data.done.includes(current.id) : false;

  const toggleDone = async () => {
    if (!current) return;
    const next = !isDone;
    setData({ ...data, done: next ? [...data.done, current.id] : data.done.filter((d) => d !== current.id) });
    try {
      await setLessonDone(uid, course.id, current.id, next);
    } catch {
      // Progress is a convenience; keep the local tick.
    }
  };

  const openPdf = async (lesson: Lesson) => {
    if (lesson.type !== 'pdf') return;
    setPdfState({ lessonId: lesson.id, status: 'loading' });
    try {
      const blob = await downloadPdf(course.id, lesson.fileId);
      if (pdfUrl.current) URL.revokeObjectURL(pdfUrl.current);
      pdfUrl.current = URL.createObjectURL(blob);
      setPdf({ lessonId: lesson.id, url: pdfUrl.current });
      setPdfState(null);
    } catch {
      setPdfState({ lessonId: lesson.id, status: 'error' });
    }
  };

  const go = (i: number) => lessons[i] && setSelected(lessons[i].id);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-green-500 font-mono text-xs md:text-base tracking-[0.3em] uppercase font-bold">
          <CheckCircle2 size={18} /> Enrolled
          <span className="text-green-500/50 normal-case tracking-normal font-normal break-all">({email})</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-tight">{course.title}</h1>
        <div className="space-y-2 max-w-xl">
          <div className="h-2 rounded-full bg-green-500/10 overflow-hidden">
            <div className="h-full bg-green-500 shadow-[0_0_10px_#00ff00] transition-all" style={{ width: `${lessons.length ? (doneCount / lessons.length) * 100 : 0}%` }} />
          </div>
          <p className="text-green-500/70 font-mono text-xs md:text-sm">{doneCount} of {lessons.length} lessons done</p>
        </div>
      </div>

      {upcoming && (
        <NextClassBanner course={course} lesson={upcoming.lesson} live={now >= upcoming.start} links={data.content.links} onOpen={() => setSelected(upcoming.lesson.id)} />
      )}

      {lessons.length === 0 ? (
        <p className="text-green-700 font-mono py-16 text-center border border-dashed border-green-500/10 rounded-2xl">Lessons are being added. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8">
          <div className="space-y-6 min-w-0">
            {current && (
              <>
                <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
                  <span className="text-green-500/40 font-mono mr-3">{String(index + 1).padStart(2, '0')}</span>
                  {current.title}
                </h2>
                {current.type === 'session' ? (
                  <SessionView course={course} lesson={current} now={now} links={data.content.links} />
                ) : current.type === 'video' ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-green-500/20 bg-black shadow-[0_0_50px_rgba(0,255,0,0.1)]">
                    <iframe
                      key={current.id}
                      src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?rel=0`}
                      title={current.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                ) : pdf?.lessonId === current.id && current.type === 'pdf' ? (
                  <div className="space-y-3">
                    <iframe src={pdf.url} title={current.title} className="w-full h-[75vh] rounded-2xl border border-green-500/20 bg-white" />
                    <a href={pdf.url} download={current.fileName} className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-mono text-sm uppercase tracking-widest">
                      <Download size={16} /> Download {current.fileName}
                    </a>
                  </div>
                ) : current.type === 'pdf' ? (
                  <div className="flex flex-col items-center justify-center gap-4 aspect-video rounded-2xl border border-dashed border-green-500/20 bg-black/40 p-6 text-center">
                    <FileText size={40} className="text-green-500/60" />
                    <p className="font-mono text-white/70">{current.fileName}</p>
                    <button type="button" onClick={() => openPdf(current)} disabled={pdfState?.lessonId === current.id && pdfState.status === 'loading'} className="px-6 py-3 bg-green-500 text-black font-bold uppercase tracking-widest text-xs rounded-lg disabled:opacity-50">
                      {pdfState?.lessonId === current.id && pdfState.status === 'loading' ? 'Loading…' : 'Open PDF'}
                    </button>
                    {pdfState?.lessonId === current.id && pdfState.status === 'error' && <p className="text-red-400 text-sm">Could not load this PDF. Try again.</p>}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button type="button" onClick={() => go(index - 1)} disabled={index <= 0} className="flex items-center gap-2 px-4 py-3 border border-green-500/20 rounded-lg text-green-400 font-mono text-xs uppercase tracking-widest disabled:opacity-20">
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <button type="button" onClick={toggleDone} className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-widest ${isDone ? 'bg-green-500 text-black' : 'border border-green-500/40 text-green-400'}`}>
                    {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />} {isDone ? 'Done' : 'Mark as done'}
                  </button>
                  <button type="button" onClick={() => go(index + 1)} disabled={index >= lessons.length - 1} className="flex items-center gap-2 px-4 py-3 border border-green-500/20 rounded-lg text-green-400 font-mono text-xs uppercase tracking-widest disabled:opacity-20">
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}

            {data.content.links.length > 0 && (
              <section className="border border-green-500/10 rounded-xl p-5 space-y-3 bg-black/40">
                <h3 className="text-green-500 font-mono text-xs uppercase tracking-[0.3em] font-bold">Mentorship & resources</h3>
                <ul className="space-y-2">
                  {data.content.links.map((l, i) => (
                    <li key={i}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-300 hover:text-white font-mono text-sm md:text-base">
                        <ExternalLink size={14} /> {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <nav aria-label="Lessons" className="lg:sticky lg:top-28 h-fit max-h-[80vh] overflow-y-auto custom-modal-scroll border border-green-500/10 rounded-xl bg-black/40 p-4 space-y-5">
            {data.content.modules.map((m, mi) => (
              <div key={mi} className="space-y-2">
                <h3 className="text-xs font-black text-green-500/60 uppercase tracking-[0.2em]">{String(mi + 1).padStart(2, '0')} · {m.title}</h3>
                <ul className="space-y-1">
                  {m.lessons.map((l) => {
                    const active = current?.id === l.id;
                    const done = data.done.includes(l.id);
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(l.id)}
                          aria-current={active ? 'true' : undefined}
                          className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg font-mono text-sm transition-colors ${active ? 'bg-green-500/15 text-white' : 'text-white/70 hover:bg-green-500/5'}`}
                        >
                          {done ? <CheckCircle2 size={14} className="text-green-400 shrink-0" /> : <LessonIcon type={l.type} className="text-green-500/50 shrink-0 w-3.5 h-3.5" />}
                          {l.type === 'session' && <span className="text-green-500/50 text-xs shrink-0">{formatDay(l.date)}</span>}
                          <span className="truncate">{l.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <button type="button" onClick={() => signOutUser()} className="flex items-center gap-2 text-red-400 hover:text-white font-mono text-xs uppercase tracking-widest pt-2">
              <LogOut size={12} /> Sign out
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

function LinkButtons({ links }: { links: CourseLink[] }) {
  if (!links.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border border-green-500/40 hover:bg-green-500 hover:text-black rounded-lg text-green-300 font-mono text-xs uppercase tracking-widest transition-colors">
          <ExternalLink size={12} /> {l.label}
        </a>
      ))}
    </div>
  );
}

function NextClassBanner({
  course, lesson, live, links, onOpen,
}: {
  course: Course;
  lesson: Extract<Lesson, { type: 'session' }>;
  live: boolean;
  links: CourseLink[];
  onOpen: () => void;
}) {
  const times = classTimes(course, lesson.date);
  return (
    <section className={`rounded-2xl border p-5 md:p-6 space-y-3 ${live ? 'border-red-500/50 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
      <p className={`flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] font-bold ${live ? 'text-red-400' : 'text-green-400'}`}>
        <Radio size={14} className={live ? 'animate-pulse' : ''} /> {live ? 'Live now' : 'Next class'}
      </p>
      <button type="button" onClick={onOpen} className="text-left text-lg md:text-2xl font-black text-white uppercase tracking-tight hover:text-green-300">
        {lesson.title}
      </button>
      <p className="font-mono text-sm text-green-300">
        {formatDay(lesson.date, true)}
        {times && <> · {times.course}{times.local && <span className="text-green-500/60"> (= {times.local} your time)</span>}</>}
      </p>
      <LinkButtons links={links} />
    </section>
  );
}

function SessionView({
  course, lesson, now, links,
}: {
  course: Course;
  lesson: Extract<Lesson, { type: 'session' }>;
  now: number;
  links: CourseLink[];
}) {
  const times = classTimes(course, lesson.date);
  const status = now ? sessionStatus(course, lesson, now) : 'upcoming';
  if (lesson.youtubeId) {
    return (
      <div className="space-y-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-green-500/20 bg-black shadow-[0_0_50px_rgba(0,255,0,0.1)]">
          <iframe
            key={lesson.id}
            src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?rel=0`}
            title={`Recording: ${lesson.title}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <p className="font-mono text-xs text-green-500/60">Recording of the class on {formatDay(lesson.date, true)}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-4 aspect-video rounded-2xl border border-dashed border-green-500/20 bg-black/40 p-6 text-center">
      <CalendarDays size={40} className={status === 'live' ? 'text-red-400' : 'text-green-500/60'} />
      <p className="font-mono text-white/80">
        {formatDay(lesson.date, true)}
        {times && <span className="block text-green-400 mt-1">{times.course}{times.local && <span className="block text-green-500/60">= {times.local} your time</span>}</span>}
      </p>
      <p className={`font-mono text-sm ${status === 'live' ? 'text-red-400' : 'text-green-500/70'}`}>
        {status === 'live' ? 'This class is live now.' : status === 'upcoming' ? 'Upcoming live class.' : 'The recording will be added after the class.'}
      </p>
      {status !== 'past' && <LinkButtons links={links} />}
    </div>
  );
}
