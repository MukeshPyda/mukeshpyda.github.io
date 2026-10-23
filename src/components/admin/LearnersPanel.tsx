'use client';
import { useEffect, useState } from 'react';
import { Check, Inbox, RefreshCw, Search, Trash2, UserPlus, X } from 'lucide-react';
import {
  approveRequest, dismissRequest, grantAccess, listAllCourses, listEnrollments, listRequests, removeLearner, revokeAccess,
  syncEnrolledCounts,
} from '@/lib/courses/api';
import { seatsLeft } from '@/lib/courses/schedule';
import { isEmail, normalizeEmail, type AccessRequest, type Course, type Enrollment } from '@/lib/courses/types';
import { ghostButton, input, label, panel, primaryButton, sectionTitle, type Notice } from './ui';
import CloudNotReady from './CloudNotReady';

/** Loads everything and refreshes each course's public "seats left" count. */
async function loadAll() {
  const [requests, enrollments, listed] = await Promise.all([listRequests(), listEnrollments(), listAllCourses()]);
  const courses = await syncEnrolledCounts(listed, enrollments);
  return { requests, enrollments, courses };
}

export default function LearnersPanel({ cloudReady }: { cloudReady: boolean }) {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newCourses, setNewCourses] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  const apply = (data: Awaited<ReturnType<typeof loadAll>>) => {
    setRequests(data.requests);
    setEnrollments(data.enrollments);
    setCourses(data.courses);
    setLoaded(true);
  };

  useEffect(() => {
    if (!cloudReady) return;
    loadAll()
      .then(apply)
      .catch((err) => setNotice({ kind: 'error', text: `Could not load learners: ${err.message}` }));
  }, [cloudReady]);

  if (!cloudReady) return <CloudNotReady what="Learners" />;

  const title = (id: string) => courses.find((c) => c.id === id)?.title ?? `${id} (deleted)`;
  const seatNote = (id: string) => {
    const c = courses.find((x) => x.id === id);
    const left = c ? seatsLeft(c) : null;
    return c && left !== null ? `${left} of ${c.seats} seats left` : null;
  };
  /** Confirms before going over a course's seat limit. */
  const roomFor = (ids: string[]) => {
    const full = courses.filter((c) => ids.includes(c.id) && seatsLeft(c) === 0);
    return !full.length || confirm(`${full.map((c) => c.title).join(', ')} ${full.length > 1 ? 'are' : 'is'} full. Grant access anyway?`);
  };

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      apply(await loadAll());
      setNotice({ kind: 'ok', text: success });
    } catch (err) {
      setNotice({ kind: 'error', text: (err as Error).message });
    }
    setBusy(false);
  };

  const handleGrant = () => {
    const email = normalizeEmail(newEmail);
    if (!isEmail(email)) return setNotice({ kind: 'error', text: 'Enter a valid email address.' });
    if (!newCourses.length) return setNotice({ kind: 'error', text: 'Pick at least one course.' });
    if (!roomFor(newCourses)) return;
    run(async () => {
      await grantAccess(email, newCourses);
      setNewEmail('');
      setNewCourses([]);
    }, `Access granted to ${email}.`);
  };

  const shown = enrollments.filter((e) => !filter || e.email.includes(filter.toLowerCase()));

  return (
    <div className="space-y-8">
      {notice && <p role="status" className={`text-sm font-mono ${notice.kind === 'ok' ? 'text-green-400' : 'text-red-400'}`}>{notice.text}</p>}
      {!loaded && <RefreshCw className="animate-spin text-green-500" />}

      {/* Pending requests */}
      <section className={`${panel} space-y-4`}>
        <h3 className={sectionTitle}><Inbox size={20} /> Pending requests ({requests.length})</h3>
        <p className="text-xs text-green-700">Learners who signed in with Google and pressed &ldquo;Request access&rdquo;. Approve once they have paid you.</p>
        {loaded && requests.length === 0 && <p className="text-green-700 text-sm">No pending requests.</p>}
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="flex flex-col md:flex-row md:items-center gap-3 border border-green-500/10 rounded-lg p-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold break-all">{r.email}</p>
                <p className="text-green-600 text-xs">
                  {r.name && <>{r.name} · </>}{title(r.courseId)}{r.createdAt && <> · {r.createdAt.toLocaleString()}</>}
                  {seatNote(r.courseId) && <span className="text-yellow-400"> · {seatNote(r.courseId)}</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={() => roomFor([r.courseId]) && run(() => approveRequest(r), `${r.email} can now open ${title(r.courseId)}.`)} className={ghostButton}>
                  <Check size={14} /> Approve
                </button>
                <button type="button" disabled={busy} onClick={() => confirm(`Dismiss the request from ${r.email}?`) && run(() => dismissRequest(r.id), 'Request dismissed.')} className="flex items-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-black px-4 py-2 rounded-lg transition-all font-bold text-xs uppercase disabled:opacity-40">
                  <X size={14} /> Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grant manually */}
      <section className={`${panel} space-y-4`}>
        <h3 className={sectionTitle}><UserPlus size={20} /> Grant access</h3>
        <p className="text-xs text-green-700">
          Use the exact Google account email the learner signs in with (Gmail keeps the dots as the account was created). When in doubt, ask them to press &ldquo;Request access&rdquo; instead.
        </p>
        <div>
          <label className={label} htmlFor="l-email">Learner email</label>
          <input id="l-email" type="email" className={input} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="learner@gmail.com" />
        </div>
        <div>
          <span className={label}>Courses</span>
          <div className="flex flex-wrap gap-2">
            {courses.map((c) => (
              <label key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${newCourses.includes(c.id) ? 'border-green-500 text-green-300' : 'border-green-500/20 text-green-600'}`}>
                <input type="checkbox" className="accent-green-500" checked={newCourses.includes(c.id)} onChange={(e) => setNewCourses((s) => (e.target.checked ? [...s, c.id] : s.filter((x) => x !== c.id)))} />
                {c.title}{!c.published && ' (draft)'}{seatNote(c.id) && <span className="text-green-700"> · {seatNote(c.id)}</span>}
              </label>
            ))}
            {loaded && courses.length === 0 && <p className="text-green-700 text-sm">Create a course first.</p>}
          </div>
        </div>
        <button type="button" disabled={busy} onClick={handleGrant} className={primaryButton}>
          <UserPlus size={18} /> Grant access
        </button>
      </section>

      {/* Enrolled learners */}
      <section className={`${panel} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className={sectionTitle}>Enrolled learners ({enrollments.length})</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-700" />
            <input aria-label="Search learners" className={`${input} py-2 pl-9 w-64`} value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search email" />
          </div>
        </div>
        {loaded && shown.length === 0 && <p className="text-green-700 text-sm">No learners{filter && ' match'}.</p>}
        <div className="space-y-3">
          {shown.map((e) => (
            <div key={e.email} className="flex flex-col md:flex-row md:items-center gap-3 border border-green-500/10 rounded-lg p-4">
              <p className="text-white font-bold break-all md:w-1/3">{e.email}</p>
              <div className="flex-1 flex flex-wrap gap-2">
                {e.courses.length === 0 && <span className="text-green-700 text-xs">No courses</span>}
                {e.courses.map((id) => (
                  <span key={id} className="flex items-center gap-1 px-3 py-1 border border-green-500/30 rounded text-xs text-green-300">
                    {title(id)}
                    <button type="button" disabled={busy} aria-label={`Revoke ${title(id)} from ${e.email}`} onClick={() => confirm(`Revoke ${title(id)} from ${e.email}?`) && run(() => revokeAccess(e.email, id), 'Access revoked.')} className="text-red-400 hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <button type="button" disabled={busy} aria-label={`Remove ${e.email}`} onClick={() => confirm(`Remove ${e.email} and all their access?`) && run(() => removeLearner(e.email), 'Learner removed.')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg self-end md:self-auto">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
