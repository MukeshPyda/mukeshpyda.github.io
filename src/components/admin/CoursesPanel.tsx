'use client';
import { useEffect, useState } from 'react';
import {
  ArrowDown, ArrowUp, BookOpen, CalendarDays, Edit3, ExternalLink, Eye, EyeOff, FileText, Link2, ListPlus, Plus, RefreshCw, Save,
  Trash2, Video, X,
} from 'lucide-react';
import { getYouTubeId } from '@/app/intelligence/utils';
import { deleteCourse, getContent, listAllCourses, saveCourse, setCourseOrder } from '@/lib/courses/api';
import {
  COURSE_ID_PATTERN, DATE_PATTERN, DEFAULT_TIER, DEFAULT_TIME_ZONE, MAX_PDF_BYTES, TIME_PATTERN, courseIdFromTitle, courseUrl,
  formatBytes, newId, type Course, type CourseContent, type CourseLink, type Lesson,
} from '@/lib/courses/types';
import { formatDay, isValidTimeZone } from '@/lib/courses/schedule';
import { parseBulkLessons } from './bulkLessons';
import { dangerButton, ghostButton, iconButton, input, label, panel, primaryButton, sectionTitle, type Notice } from './ui';
import CloudNotReady from './CloudNotReady';

type EditVideo = { id: string; type: 'video'; title: string; url: string };
type EditPdf = { id: string; type: 'pdf'; title: string; fileId: string; fileName: string; size: number };
/** `url` is the optional recording (unlisted YouTube), added after the class. */
type EditSession = { id: string; type: 'session'; title: string; date: string; url: string };
type EditLesson = EditVideo | EditPdf | EditSession;
type EditModule = { title: string; lessons: EditLesson[] };

interface Editor {
  isNew: boolean;
  idTouched: boolean;
  id: string;
  title: string;
  description: string;
  price: string;
  tier: string;
  published: boolean;
  order: number;
  format: string;
  startDate: string;
  endDate: string;
  enrollBy: string;
  classDays: string;
  classStart: string;
  classEnd: string;
  timeZone: string;
  seats: string;
  enrolledCount: number;
  modules: EditModule[];
  links: CourseLink[];
  previous: CourseContent | null;
}

const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

function toEditLesson(l: Lesson): EditLesson {
  if (l.type === 'video') return { id: l.id, type: 'video', title: l.title, url: watchUrl(l.youtubeId) };
  if (l.type === 'session') return { id: l.id, type: 'session', title: l.title, date: l.date, url: l.youtubeId ? watchUrl(l.youtubeId) : '' };
  return { id: l.id, type: 'pdf', title: l.title, fileId: l.fileId, fileName: l.fileName, size: l.size };
}

function toLesson(l: EditLesson): Lesson {
  if (l.type === 'video') return { id: l.id, type: 'video', title: l.title.trim(), youtubeId: getYouTubeId(l.url.trim())! };
  if (l.type === 'session') {
    const youtubeId = l.url.trim() ? getYouTubeId(l.url.trim()) : null;
    return { id: l.id, type: 'session', title: l.title.trim(), date: l.date, ...(youtubeId ? { youtubeId } : {}) };
  }
  return { id: l.id, type: 'pdf', title: l.title.trim(), fileId: l.fileId, fileName: l.fileName, size: l.size };
}

const lessonIcon = (type: EditLesson['type']) =>
  type === 'video' ? <Video size={14} /> : type === 'session' ? <CalendarDays size={14} /> : <FileText size={14} />;

function blankEditor(order: number): Editor {
  return {
    isNew: true, idTouched: false, id: '', title: '', description: '', price: '', tier: DEFAULT_TIER, published: false, order,
    format: '', startDate: '', endDate: '', enrollBy: '', classDays: '', classStart: '', classEnd: '', timeZone: DEFAULT_TIME_ZONE,
    seats: '', enrolledCount: 0,
    modules: [{ title: 'Module 1', lessons: [] }], links: [], previous: null,
  };
}

function move<T>(items: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export default function CoursesPanel({ cloudReady }: { cloudReady: boolean }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [pendingPdfs, setPendingPdfs] = useState<Map<string, File>>(new Map());
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  const refresh = () =>
    listAllCourses()
      .then((list) => {
        setCourses(list);
        setLoaded(true);
      })
      .catch((err) => setNotice({ kind: 'error', text: `Could not load courses: ${err.message}` }));

  useEffect(() => {
    if (cloudReady) refresh();
  }, [cloudReady]);

  if (!cloudReady) return <CloudNotReady what="Courses" />;

  const patch = (p: Partial<Editor>) => setEditor((e) => (e ? { ...e, ...p } : e));
  const patchModules = (fn: (m: EditModule[]) => EditModule[]) => setEditor((e) => (e ? { ...e, modules: fn(e.modules) } : e));
  const patchLessons = (mi: number, fn: (l: EditLesson[]) => EditLesson[]) =>
    patchModules((ms) => ms.map((m, i) => (i === mi ? { ...m, lessons: fn(m.lessons) } : m)));
  const patchLesson = (mi: number, li: number, p: Partial<EditVideo> | Partial<EditPdf> | Partial<EditSession>) =>
    patchLessons(mi, (ls) => ls.map((l, i) => (i === li ? ({ ...l, ...p } as EditLesson) : l)));

  const startNew = () => {
    setEditor(blankEditor(courses.length));
    setPendingPdfs(new Map());
    setNotice(null);
  };

  const startEdit = async (course: Course) => {
    setBusy(true);
    setNotice(null);
    try {
      const content = (await getContent(course.id)) ?? { modules: [], links: [] };
      setEditor({
        isNew: false, idTouched: true, id: course.id, title: course.title, description: course.description,
        price: String(course.priceUsd), tier: course.tier, published: course.published, order: course.order,
        format: course.format, startDate: course.startDate, endDate: course.endDate, enrollBy: course.enrollBy,
        classDays: course.classDays, classStart: course.classStart, classEnd: course.classEnd,
        timeZone: course.timeZone || DEFAULT_TIME_ZONE, seats: course.seats ? String(course.seats) : '', enrolledCount: course.enrolledCount,
        modules: content.modules.map((m) => ({ title: m.title, lessons: m.lessons.map(toEditLesson) })),
        links: content.links, previous: content,
      });
      setPendingPdfs(new Map());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setNotice({ kind: 'error', text: `Could not open course: ${(err as Error).message}` });
    }
    setBusy(false);
  };

  const addPdfs = (mi: number, files: FileList | null) => {
    if (!files?.length) return;
    const added: EditPdf[] = [];
    const next = new Map(pendingPdfs);
    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setNotice({ kind: 'error', text: `${file.name} is not a PDF.` });
        continue;
      }
      if (file.size > MAX_PDF_BYTES) {
        setNotice({ kind: 'error', text: `${file.name} is ${formatBytes(file.size)}; the limit is ${formatBytes(MAX_PDF_BYTES)}.` });
        continue;
      }
      const id = newId();
      next.set(id, file);
      added.push({ id, type: 'pdf', title: file.name.replace(/\.pdf$/i, ''), fileId: '', fileName: file.name, size: file.size });
    }
    setPendingPdfs(next);
    patchLessons(mi, (ls) => [...ls, ...added]);
  };

  const replacePdf = (mi: number, li: number, lesson: EditPdf, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_PDF_BYTES) {
      setNotice({ kind: 'error', text: `${file.name} is over ${formatBytes(MAX_PDF_BYTES)}.` });
      return;
    }
    // A new lesson id makes the old file an orphan, which saveCourse deletes.
    const id = newId();
    const next = new Map(pendingPdfs);
    next.delete(lesson.id);
    next.set(id, file);
    setPendingPdfs(next);
    patchLesson(mi, li, { id, fileId: '', fileName: file.name, size: file.size });
  };

  const applyBulk = () => {
    const { modules, errors } = parseBulkLessons(bulkText);
    setBulkErrors(errors);
    if (errors.length || !modules.length) {
      if (!errors.length) setBulkErrors(['Nothing to add.']);
      return;
    }
    const toEdit = (l: (typeof modules)[number]['lessons'][number]): EditLesson =>
      l.type === 'session' ? { id: newId(), ...l } : { id: newId(), ...l };
    patchModules((ms) => {
      // Drop empty placeholder modules ("Module 1" etc.) so a pasted outline starts clean.
      const next = ms.filter((m) => m.lessons.length || !/^Module \d+$/.test(m.title.trim())).map((m) => ({ ...m, lessons: [...m.lessons] }));
      for (const m of modules) {
        const lessons = m.lessons.map(toEdit);
        if (m.title === null && next.length) next[next.length - 1].lessons.push(...lessons);
        else next.push({ title: m.title ?? `Module ${next.length + 1}`, lessons });
      }
      return next;
    });
    const newModules = modules.filter((m) => m.title !== null).length;
    setBulkText('');
    setNotice({ kind: 'ok', text: `Added ${newModules} module(s) and ${modules.reduce((n, m) => n + m.lessons.length, 0)} lesson(s). Review, then Save course.` });
  };

  const validate = (e: Editor): string[] => {
    const errors: string[] = [];
    if (!e.title.trim()) errors.push('Title is required.');
    if (!COURSE_ID_PATTERN.test(e.id)) errors.push('Course ID must be lowercase letters, numbers and single dashes.');
    if (e.isNew && courses.some((c) => c.id === e.id)) errors.push(`Course ID "${e.id}" is already used.`);
    const price = Number(e.price);
    if (e.price.trim() === '' || !Number.isFinite(price) || price < 0) errors.push('Price must be a number in USD (0 for free).');
    for (const [name, value] of [['Start date', e.startDate], ['End date', e.endDate], ['Enroll-by date', e.enrollBy]] as const) {
      if (value && !DATE_PATTERN.test(value)) errors.push(`${name} must be a date.`);
    }
    if (e.startDate && e.endDate && e.endDate < e.startDate) errors.push('End date is before the start date.');
    if (Boolean(e.classStart) !== Boolean(e.classEnd)) errors.push('Set both class start and end times, or neither.');
    if (e.classStart && (!TIME_PATTERN.test(e.classStart) || !TIME_PATTERN.test(e.classEnd))) errors.push('Class times must be like 20:00.');
    if (e.classStart && e.classEnd && e.classEnd <= e.classStart) errors.push('Class end time must be after the start time.');
    if (!isValidTimeZone(e.timeZone || DEFAULT_TIME_ZONE)) errors.push(`"${e.timeZone}" is not a time zone (e.g. Asia/Kolkata).`);
    if (e.seats.trim() && !/^\d+$/.test(e.seats.trim())) errors.push('Seats must be a whole number (blank = no limit).');
    if (!e.modules.length) errors.push('Add at least one module.');
    e.modules.forEach((m, mi) => {
      if (!m.title.trim()) errors.push(`Module ${mi + 1} needs a title.`);
      m.lessons.forEach((l, li) => {
        const where = `Module ${mi + 1}, lesson ${li + 1}`;
        if (!l.title.trim()) errors.push(`${where} needs a title.`);
        if (l.type === 'video' && !getYouTubeId(l.url.trim())) errors.push(`${where}: not a valid YouTube link.`);
        if (l.type === 'session' && !DATE_PATTERN.test(l.date)) errors.push(`${where}: pick the class date.`);
        if (l.type === 'session' && l.url.trim() && !getYouTubeId(l.url.trim())) errors.push(`${where}: the recording is not a valid YouTube link.`);
        if (l.type === 'pdf' && !l.fileId && !pendingPdfs.has(l.id)) errors.push(`${where}: choose the PDF again.`);
      });
    });
    e.links.forEach((l, i) => {
      if (!l.label.trim() || !/^https?:\/\//.test(l.url.trim())) errors.push(`Link ${i + 1} needs a label and an http(s) URL.`);
    });
    return errors;
  };

  const handleSave = async () => {
    if (!editor) return;
    const errors = validate(editor);
    if (errors.length) {
      setNotice({ kind: 'error', text: errors.join(' ') });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const content: CourseContent = {
        modules: editor.modules.map((m) => ({
          title: m.title.trim(),
          lessons: m.lessons.map(toLesson),
        })),
        links: editor.links.map((l) => ({ label: l.label.trim(), url: l.url.trim() })),
      };
      const saved = await saveCourse({
        course: {
          id: editor.id, title: editor.title.trim(), description: editor.description.trim(), priceUsd: Number(editor.price),
          tier: editor.tier.trim() || DEFAULT_TIER, published: editor.published, order: editor.order,
          format: editor.format.trim(), startDate: editor.startDate, endDate: editor.endDate, enrollBy: editor.enrollBy,
          classDays: editor.classDays.trim(), classStart: editor.classStart, classEnd: editor.classEnd,
          timeZone: editor.timeZone.trim() || DEFAULT_TIME_ZONE, seats: editor.seats.trim() ? Number(editor.seats) : 0,
          enrolledCount: editor.enrolledCount,
        },
        content,
        pendingPdfs,
        previousContent: editor.previous,
        onStatus: setProgress,
      });
      setPendingPdfs(new Map());
      setEditor({
        ...editor, isNew: false, idTouched: true, previous: saved,
        modules: saved.modules.map((m) => ({ title: m.title, lessons: m.lessons.map(toEditLesson) })),
      });
      await refresh();
      setNotice({ kind: 'ok', text: `Saved "${editor.title.trim()}". ${editor.published ? 'It is live now.' : 'It is a hidden draft.'}` });
    } catch (err) {
      setNotice({ kind: 'error', text: `Save failed: ${(err as Error).message}` });
    }
    setProgress('');
    setBusy(false);
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Delete "${course.title}" with all its lessons and PDFs? Learners lose access. This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteCourse(course.id);
      if (editor?.id === course.id) setEditor(null);
      await refresh();
      setNotice({ kind: 'ok', text: `Deleted "${course.title}".` });
    } catch (err) {
      setNotice({ kind: 'error', text: `Delete failed: ${(err as Error).message}` });
    }
    setBusy(false);
  };

  const handleReorder = async (index: number, delta: number) => {
    const next = move(courses, index, delta);
    if (next === courses) return;
    setBusy(true);
    try {
      await setCourseOrder(next);
      await refresh();
    } catch (err) {
      setNotice({ kind: 'error', text: `Reorder failed: ${(err as Error).message}` });
    }
    setBusy(false);
  };

  return (
    <div className="space-y-8">
      {notice && <p role="status" className={`text-sm font-mono ${notice.kind === 'ok' ? 'text-green-400' : 'text-red-400'}`}>{notice.text}</p>}
      {progress && <p className="text-sm font-mono text-yellow-400 flex items-center gap-2"><RefreshCw size={14} className="animate-spin" /> {progress}</p>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-12">
        <div className="xl:col-span-2">
          {!editor ? (
            <div className={`${panel} text-center space-y-6`}>
              <BookOpen className="mx-auto text-green-700" size={40} />
              <p className="text-green-600 text-sm">Pick a course on the right to edit it, or start a new one.</p>
              <button type="button" onClick={startNew} className={`${primaryButton} mx-auto`}>
                <Plus size={20} /> New course
              </button>
            </div>
          ) : (
            <div className={`${panel} space-y-8`}>
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-green-500/20 pb-4">
                <h3 className={sectionTitle}>{editor.isNew ? <><Plus size={20} /> New Course</> : <><Edit3 size={20} /> Edit Course</>}</h3>
                <button type="button" onClick={() => (confirm('Close the editor? Unsaved changes are lost.') ? setEditor(null) : undefined)} className={dangerButton}>
                  <X size={16} /> Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={label} htmlFor="c-title">Title *</label>
                  <input
                    id="c-title" className={input} value={editor.title} placeholder="e.g. Web Application Pentesting"
                    onChange={(e) => patch(editor.isNew && !editor.idTouched ? { title: e.target.value, id: courseIdFromTitle(e.target.value) } : { title: e.target.value })}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="c-id">Course ID (in the link) *</label>
                  <input
                    id="c-id" className={`${input} font-mono`} value={editor.id} disabled={!editor.isNew} placeholder="web-app-pentesting"
                    onChange={(e) => patch({ idTouched: true, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  />
                  <p className="mt-2 text-[11px] text-green-700 font-mono break-all">{courseUrl(editor.id || '…')}{!editor.isNew && ' (fixed once created)'}</p>
                </div>
                <div>
                  <label className={label} htmlFor="c-price">Price (USD) *</label>
                  <input id="c-price" className={input} inputMode="decimal" value={editor.price} onChange={(e) => patch({ price: e.target.value })} placeholder="e.g. 199" />
                </div>
                <div>
                  <label className={label} htmlFor="c-tier">Package</label>
                  <input id="c-tier" className={input} value={editor.tier} onChange={(e) => patch({ tier: e.target.value })} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer select-none p-4 border border-green-500/30 rounded-lg w-full">
                    <input type="checkbox" checked={editor.published} onChange={(e) => patch({ published: e.target.checked })} className="accent-green-500 w-5 h-5" />
                    <span className="text-white text-sm">{editor.published ? 'Published: visible on /courses' : 'Draft: hidden from visitors'}</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className={label} htmlFor="c-desc">Description</label>
                  <textarea id="c-desc" className={`${input} h-36`} value={editor.description} onChange={(e) => patch({ description: e.target.value })} placeholder="What learners get, who it is for, what mentorship includes. Line breaks are kept." />
                </div>
              </div>

              {/* Live cohort details (all optional) */}
              <fieldset className="border border-green-500/15 rounded-xl p-4 lg:p-6 space-y-4">
                <legend className="px-2 text-white text-sm font-bold uppercase tracking-widest">Live cohort (optional)</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className={label} htmlFor="c-format">Format</label>
                    <input id="c-format" className={input} value={editor.format} onChange={(e) => patch({ format: e.target.value })} placeholder="e.g. 8-week live intensive on Discord" />
                  </div>
                  <div>
                    <label className={label} htmlFor="c-start">Start date</label>
                    <input id="c-start" type="date" className={input} value={editor.startDate} onChange={(e) => patch({ startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className={label} htmlFor="c-end">End date</label>
                    <input id="c-end" type="date" className={input} value={editor.endDate} onChange={(e) => patch({ endDate: e.target.value })} />
                  </div>
                  <div>
                    <label className={label} htmlFor="c-enroll">Enroll by</label>
                    <input id="c-enroll" type="date" className={input} value={editor.enrollBy} onChange={(e) => patch({ enrollBy: e.target.value })} />
                  </div>
                  <div>
                    <label className={label} htmlFor="c-days">Class days</label>
                    <input id="c-days" className={input} value={editor.classDays} onChange={(e) => patch({ classDays: e.target.value })} placeholder="Mon–Fri" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={label} htmlFor="c-from">Class from</label>
                      <input id="c-from" type="time" className={input} value={editor.classStart} onChange={(e) => patch({ classStart: e.target.value })} />
                    </div>
                    <div>
                      <label className={label} htmlFor="c-to">To</label>
                      <input id="c-to" type="time" className={input} value={editor.classEnd} onChange={(e) => patch({ classEnd: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className={label} htmlFor="c-tz">Time zone</label>
                    <input id="c-tz" className={`${input} font-mono`} value={editor.timeZone} onChange={(e) => patch({ timeZone: e.target.value })} placeholder={DEFAULT_TIME_ZONE} />
                  </div>
                  <div>
                    <label className={label} htmlFor="c-seats">Seats</label>
                    <input id="c-seats" inputMode="numeric" className={input} value={editor.seats} onChange={(e) => patch({ seats: e.target.value })} placeholder="blank = no limit" />
                  </div>
                  <p className="md:col-span-2 self-end text-xs text-green-700">
                    {editor.seats.trim() ? `${editor.enrolledCount} enrolled now. Seats left update when you approve or remove learners.` : 'Set seats to show "X of N seats left" and close enrollment when full.'}
                    {editor.enrollBy && ` Enrollment closes at 23:59 on ${formatDay(editor.enrollBy, true)} (${editor.timeZone || DEFAULT_TIME_ZONE}).`}
                  </p>
                </div>
              </fieldset>

              {/* Modules and lessons */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-green-500/10" />
                  <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Curriculum</h4>
                  <div className="h-px flex-1 bg-green-500/10" />
                </div>
                <p className="text-xs text-green-700">Set YouTube videos and recordings to <strong className="text-green-500">Unlisted</strong>. Private videos cannot play on the site.</p>

                <div className="border border-green-500/15 rounded-xl p-4 space-y-3 bg-black/40">
                  <button type="button" onClick={() => setBulkOpen((o) => !o)} aria-expanded={bulkOpen} className={ghostButton}>
                    <ListPlus size={14} /> {bulkOpen ? 'Hide bulk add' : 'Bulk add modules & lessons'}
                  </button>
                  {bulkOpen && (
                    <div className="space-y-3">
                      <p className="text-xs text-green-600 leading-relaxed">
                        One item per line. <code className="text-green-300"># Week 1 · Foundations</code> starts a module;{' '}
                        <code className="text-green-300">2026-11-02 | Orientation &amp; setup</code> adds a live session (optionally <code className="text-green-300">| recording link</code>);{' '}
                        <code className="text-green-300">Title | YouTube link</code> adds a video. Lines before the first # go into the last module. PDFs are still added with &ldquo;Add PDF&rdquo;.
                      </p>
                      <textarea aria-label="Bulk add" spellCheck={false} className={`${input} h-48 font-mono text-sm`} value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={'# Week 1 · Foundations\n2026-11-02 | Orientation & setup\n2026-11-03 | Networking I'} />
                      {bulkErrors.length > 0 && (
                        <ul className="text-xs text-red-400 space-y-1 font-mono">
                          {bulkErrors.slice(0, 12).map((err) => <li key={err}>{err}</li>)}
                          {bulkErrors.length > 12 && <li>…and {bulkErrors.length - 12} more</li>}
                        </ul>
                      )}
                      <button type="button" onClick={applyBulk} disabled={!bulkText.trim()} className={ghostButton}>
                        <Plus size={14} /> Add to curriculum
                      </button>
                    </div>
                  )}
                </div>

                {editor.modules.map((m, mi) => (
                  <div key={mi} className="border border-green-500/15 rounded-xl p-4 lg:p-6 space-y-4 bg-black/40">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-green-500/50 font-mono shrink-0">M{String(mi + 1).padStart(2, '0')}</span>
                      <input aria-label={`Module ${mi + 1} title`} className={`${input} flex-1 py-3`} value={m.title} onChange={(e) => patchModules((ms) => ms.map((x, i) => (i === mi ? { ...x, title: e.target.value } : x)))} placeholder="Module title *" />
                      <button type="button" aria-label={`Move module ${mi + 1} up`} disabled={mi === 0} onClick={() => patchModules((ms) => move(ms, mi, -1))} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ArrowUp size={16} /></button>
                      <button type="button" aria-label={`Move module ${mi + 1} down`} disabled={mi === editor.modules.length - 1} onClick={() => patchModules((ms) => move(ms, mi, 1))} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ArrowDown size={16} /></button>
                      <button type="button" aria-label={`Remove module ${mi + 1}`} onClick={() => (m.lessons.length === 0 || confirm(`Remove "${m.title}" and its ${m.lessons.length} lessons?`)) && patchModules((ms) => ms.filter((_, i) => i !== mi))} className={`${iconButton} text-red-500 hover:bg-red-500/10`}><Trash2 size={16} /></button>
                    </div>

                    <div className="space-y-3">
                      {m.lessons.map((l, li) => (
                        <div key={l.id} className="flex flex-col md:flex-row md:items-center gap-2 border border-green-500/10 rounded-lg p-3">
                          <span className="flex items-center gap-2 text-green-500/60 text-xs font-mono shrink-0 w-16">
                            {lessonIcon(l.type)} {String(li + 1).padStart(2, '0')}
                          </span>
                          {l.type === 'session' && (
                            <input aria-label="Class date" type="date" className={`${input} py-2 md:w-44 ${l.date ? '' : 'border-red-500'}`} value={l.date} onChange={(e) => patchLesson(mi, li, { date: e.target.value })} />
                          )}
                          <input aria-label="Lesson title" className={`${input} py-2 md:flex-1`} value={l.title} onChange={(e) => patchLesson(mi, li, { title: e.target.value })} placeholder={l.type === 'session' ? 'Class topic *' : 'Lesson title *'} />
                          {l.type === 'session' ? (
                            <input aria-label="Recording link" className={`${input} py-2 md:flex-1 font-mono text-sm ${l.url && !getYouTubeId(l.url) ? 'border-red-500' : ''}`} value={l.url} onChange={(e) => patchLesson(mi, li, { url: e.target.value })} placeholder="Recording link (add after class)" />
                          ) : l.type === 'video' ? (
                            <input aria-label="YouTube link" className={`${input} py-2 md:flex-1 font-mono text-sm ${l.url && !getYouTubeId(l.url) ? 'border-red-500' : ''}`} value={l.url} onChange={(e) => patchLesson(mi, li, { url: e.target.value })} placeholder="YouTube link" />
                          ) : (
                            <label className="md:flex-1 text-xs text-green-600 font-mono truncate cursor-pointer hover:text-green-300" title="Replace PDF">
                              {l.fileName} · {formatBytes(l.size)} {pendingPdfs.has(l.id) ? '(uploads on save)' : ''}
                              <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { replacePdf(mi, li, l, e.target.files); e.target.value = ''; }} />
                            </label>
                          )}
                          <div className="flex gap-1 justify-end">
                            <button type="button" aria-label="Move lesson up" disabled={li === 0} onClick={() => patchLessons(mi, (ls) => move(ls, li, -1))} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ArrowUp size={14} /></button>
                            <button type="button" aria-label="Move lesson down" disabled={li === m.lessons.length - 1} onClick={() => patchLessons(mi, (ls) => move(ls, li, 1))} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ArrowDown size={14} /></button>
                            {mi > 0 && <button type="button" title="Move to previous module" aria-label="Move lesson to previous module" onClick={() => patchModules((ms) => ms.map((x, i) => (i === mi - 1 ? { ...x, lessons: [...x.lessons, l] } : i === mi ? { ...x, lessons: x.lessons.filter((_, j) => j !== li) } : x)))} className={`${iconButton} text-blue-400 hover:bg-blue-500/10 text-[10px] font-bold`}>M↑</button>}
                            {mi < editor.modules.length - 1 && <button type="button" title="Move to next module" aria-label="Move lesson to next module" onClick={() => patchModules((ms) => ms.map((x, i) => (i === mi + 1 ? { ...x, lessons: [l, ...x.lessons] } : i === mi ? { ...x, lessons: x.lessons.filter((_, j) => j !== li) } : x)))} className={`${iconButton} text-blue-400 hover:bg-blue-500/10 text-[10px] font-bold`}>M↓</button>}
                            <button type="button" aria-label="Remove lesson" onClick={() => patchLessons(mi, (ls) => ls.filter((_, j) => j !== li))} className={`${iconButton} text-red-500 hover:bg-red-500/10`}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => patchLessons(mi, (ls) => [...ls, { id: newId(), type: 'session', title: '', date: '', url: '' }])} className={ghostButton}>
                        <CalendarDays size={14} /> Add session
                      </button>
                      <button type="button" onClick={() => patchLessons(mi, (ls) => [...ls, { id: newId(), type: 'video', title: '', url: '' }])} className={ghostButton}>
                        <Video size={14} /> Add video
                      </button>
                      <label className={`${ghostButton} cursor-pointer`}>
                        <FileText size={14} /> Add PDF
                        <input type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { addPdfs(mi, e.target.files); e.target.value = ''; }} />
                      </label>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={() => patchModules((ms) => [...ms, { title: `Module ${ms.length + 1}`, lessons: [] }])} className={`${ghostButton} w-full justify-center py-3`}>
                  <Plus size={16} /> Add module
                </button>
              </div>

              {/* Enrolled-only links */}
              <div className="space-y-4">
                <span className={label}>Links for enrolled learners (e.g. mentorship group, booking page)</span>
                {editor.links.map((l, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-2">
                    <input aria-label="Link label" className={`${input} py-2 md:w-1/3`} value={l.label} onChange={(e) => patch({ links: editor.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="Label" />
                    <input aria-label="Link URL" className={`${input} py-2 flex-1 font-mono text-sm`} value={l.url} onChange={(e) => patch({ links: editor.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="https://…" />
                    <button type="button" aria-label="Remove link" onClick={() => patch({ links: editor.links.filter((_, j) => j !== i) })} className={`${iconButton} text-red-500 hover:bg-red-500/10 self-center`}><Trash2 size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => patch({ links: [...editor.links, { label: '', url: '' }] })} className={ghostButton}>
                  <Link2 size={14} /> Add link
                </button>
              </div>

              <button type="button" disabled={busy} onClick={handleSave} className={`${primaryButton} w-full`}>
                {busy ? <RefreshCw className="animate-spin" /> : <><Save size={20} /> Save course</>}
              </button>
            </div>
          )}
        </div>

        {/* Course list */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-green-500/20 pb-4">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Courses ({courses.length})</h3>
            <button type="button" onClick={startNew} disabled={busy} className={ghostButton}><Plus size={14} /> New</button>
          </div>
          {!loaded && <RefreshCw className="animate-spin text-green-500" />}
          {loaded && courses.length === 0 && <p className="text-green-700 text-sm">No courses yet.</p>}
          <div className="space-y-3">
            {courses.map((c, i) => (
              <div key={c.id} className={`flex items-center gap-3 bg-[#111] p-3 rounded-xl border ${editor?.id === c.id ? 'border-green-500/60' : 'border-green-500/5'}`}>
                <span title={c.published ? 'Published' : 'Draft'} className={c.published ? 'text-green-400' : 'text-yellow-500'}>
                  {c.published ? <Eye size={16} /> : <EyeOff size={16} />}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm uppercase tracking-tight truncate" title={c.title}>{c.title}</h4>
                  <p className="text-green-700 text-[10px] tracking-[0.2em] font-black">{c.lessonCount} lessons · ${c.priceUsd}</p>
                </div>
                <div className="flex flex-col">
                  <button type="button" aria-label={`Move ${c.title} up`} disabled={busy || i === 0} onClick={() => handleReorder(i, -1)} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ArrowUp size={14} /></button>
                  <button type="button" aria-label={`Move ${c.title} down`} disabled={busy || i === courses.length - 1} onClick={() => handleReorder(i, 1)} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ArrowDown size={14} /></button>
                </div>
                <a href={courseUrl(c.id)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${c.title}`} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ExternalLink size={16} /></a>
                <button type="button" aria-label={`Edit ${c.title}`} disabled={busy} onClick={() => startEdit(c)} className={`${iconButton} text-blue-500 hover:bg-blue-500/10`}><Edit3 size={16} /></button>
                <button type="button" aria-label={`Delete ${c.title}`} disabled={busy} onClick={() => handleDelete(c)} className={`${iconButton} text-red-500 hover:bg-red-500/10`}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
