'use client';
import { useEffect, useState } from 'react';
import {
  ArrowDown, ArrowUp, Copy, Download, Edit3, ExternalLink, Eye, Image as ImageIcon, Plus, RefreshCw, Save, Terminal, Trash2, X,
} from 'lucide-react';
import BlogDetailClient from '@/app/intelligence/[slug]/BlogDetailClient';
import { initialBlogData, type BlogPost } from '@/app/intelligence/data';
import { getEmbedUrl, slugify } from '@/app/intelligence/utils';
import {
  dangerButton, ghostButton, iconButton, input, isLocalHost, label, panel, primaryButton, readFilesAsDataUrls, sectionTitle,
  type Notice,
} from './ui';

// Creates and edits Intelligence posts with exactly the fields BlogDetailClient renders.
// Saving goes through /api/save-blog, which only works on the local dev server.

interface DraftStep {
  title: string;
  description: string;
  code: string;
  images: string[];
}

interface Draft {
  slug: string;
  title: string;
  date: string;
  summary: string;
  videoUrl: string;
  mainImage: string;
  tags: string[];
  steps: DraftStep[];
}

interface StoredDraft {
  draft: Draft;
  originalSlug: string | null;
  slugTouched: boolean;
}

const DRAFT_KEY = 'blogmaker_draft_v1';
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const SLUG_PATTERN = /^[A-Za-z0-9-]{1,120}$/;

const emptyStep = (): DraftStep => ({ title: '', description: '', code: '', images: [] });

function emptyDraft(): Draft {
  return {
    slug: '',
    title: '',
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    summary: '',
    videoUrl: '',
    mainImage: '',
    tags: [],
    steps: [emptyStep()],
  };
}

function fromPost(post: BlogPost): Draft {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    summary: post.summary,
    videoUrl: post.videoUrl ?? '',
    mainImage: post.mainImage,
    tags: [...post.tags],
    steps: post.steps.map((s) => ({
      title: s.title,
      description: s.description ?? '',
      code: s.code ?? '',
      images: [...(s.images ?? [])],
    })),
  };
}

function toPost(draft: Draft, id = 0): BlogPost {
  return {
    id,
    slug: draft.slug,
    title: draft.title,
    date: draft.date,
    summary: draft.summary,
    ...(draft.videoUrl.trim() ? { videoUrl: draft.videoUrl.trim() } : {}),
    mainImage: draft.mainImage,
    tags: draft.tags,
    steps: draft.steps.map((s) => ({
      title: s.title,
      ...(s.description.trim() ? { description: s.description } : {}),
      ...(s.code.trim() ? { code: s.code } : {}),
      ...(s.images.length ? { images: s.images } : {}),
    })),
  };
}

function validate(draft: Draft): string[] {
  const errors: string[] = [];
  if (!draft.title.trim()) errors.push('Title is required.');
  if (!SLUG_PATTERN.test(draft.slug)) errors.push('Slug must be letters, numbers and dashes only.');
  if (!draft.date.trim()) errors.push('Date is required.');
  if (draft.videoUrl.trim() && !getEmbedUrl(draft.videoUrl.trim())) errors.push('YouTube URL is not a valid video link.');
  draft.steps.forEach((s, i) => {
    if (!s.title.trim()) errors.push(`Step ${i + 1} needs a title.`);
  });
  return errors;
}

function loadStoredDraft(): StoredDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as StoredDraft) : null;
  } catch {
    return null;
  }
}

function storeDraft(value: StoredDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
  } catch {
    // Probably over the storage quota because of image data: keep the text only.
    try {
      const textOnly: StoredDraft = {
        ...value,
        draft: { ...value.draft, mainImage: '', steps: value.draft.steps.map((s) => ({ ...s, images: [] })) },
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(textOnly));
    } catch {
      // Storage unavailable; autosave is a convenience only.
    }
  }
}

function clearStoredDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

function downloadJson(filename: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function readImages(files: FileList | null): Promise<string[]> {
  if (!files?.length) return [];
  const tooBig = Array.from(files).find((f) => f.size > MAX_IMAGE_BYTES);
  if (tooBig) throw new Error(`${tooBig.name} is over 15 MB.`);
  return readFilesAsDataUrls(files);
}

function Thumb({ src, title }: { src: string; title: string }) {
  if (!src) {
    return (
      <div className="w-16 h-16 shrink-0 bg-black rounded-lg flex items-center justify-center text-green-700 border border-green-500/10" title={title}>
        <Terminal size={20} />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="w-16 h-16 shrink-0 object-cover rounded-lg border border-green-500/10" />;
}

export default function BlogMaker() {
  const local = isLocalHost();
  const [stored] = useState(loadStoredDraft);
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogData);
  const [draft, setDraft] = useState<Draft>(stored?.draft ?? emptyDraft());
  const [originalSlug, setOriginalSlug] = useState<string | null>(stored?.originalSlug ?? null);
  const [slugTouched, setSlugTouched] = useState(stored?.slugTouched ?? false);
  const [dirty, setDirty] = useState(Boolean(stored));
  const [tagInput, setTagInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(
    stored ? { kind: 'ok', text: 'Restored your unsaved draft.' } : null
  );
  const [showPreview, setShowPreview] = useState(false);

  // The imported list is what the last build saw; on the dev server read the file itself.
  useEffect(() => {
    if (!local) return;
    fetch('/api/save-blog/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list' }) })
      .then((r) => r.json())
      .then((d) => d.blogs && setBlogs(d.blogs))
      .catch(() => setNotice({ kind: 'error', text: 'Local API unreachable. Is npm run dev running?' }));
  }, [local]);

  useEffect(() => {
    if (dirty) storeDraft({ draft, originalSlug, slugTouched });
  }, [draft, originalSlug, slugTouched, dirty]);

  useEffect(() => {
    if (!showPreview) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowPreview(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPreview]);

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  };

  const updateStep = (index: number, patch: Partial<DraftStep>) => {
    setDraft((d) => ({ ...d, steps: d.steps.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));
    setDirty(true);
  };

  const setSteps = (fn: (steps: DraftStep[]) => DraftStep[]) => {
    setDraft((d) => ({ ...d, steps: fn(d.steps) }));
    setDirty(true);
  };

  const moveItem = <T,>(items: T[], index: number, delta: number): T[] => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  };

  const onTitleChange = (title: string) => {
    update(slugTouched ? { title } : { title, slug: slugify(title) });
  };

  const addTags = (raw: string) => {
    const incoming = raw.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean);
    if (!incoming.length) return;
    update({ tags: Array.from(new Set([...draft.tags, ...incoming])).slice(0, 20) });
    setTagInput('');
  };

  const confirmDiscard = () => !dirty || confirm('Discard the unsaved changes in the editor?');

  const startNew = () => {
    if (!confirmDiscard()) return;
    setDraft(emptyDraft());
    setOriginalSlug(null);
    setSlugTouched(false);
    setDirty(false);
    setNotice(null);
    clearStoredDraft();
  };

  const startEdit = (post: BlogPost) => {
    if (!confirmDiscard()) return;
    setDraft(fromPost(post));
    setOriginalSlug(post.slug);
    setSlugTouched(true);
    setDirty(false);
    setNotice(null);
    clearStoredDraft();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const callApi = async (method: 'POST' | 'DELETE', body: unknown, retried = false): Promise<{ blogs: BlogPost[] }> => {
    const response = await fetch('/api/save-blog/', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => null);
    // The dev server can answer with an HTML 404 for a moment while it recompiles.
    if (!result && !retried) {
      await new Promise((r) => setTimeout(r, 800));
      return callApi(method, body, true);
    }
    if (!response.ok || !result) throw new Error(result?.error || `Request failed (${response.status}).`);
    return result;
  };

  const handleSave = async () => {
    const errors = validate(draft);
    if (errors.length) {
      setNotice({ kind: 'error', text: errors.join(' ') });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const { blogs: saved } = await callApi('POST', { action: 'save', blog: toPost(draft), originalSlug });
      setBlogs(saved);
      const savedPost = saved.find((b) => b.slug === draft.slug);
      if (savedPost) setDraft(fromPost(savedPost));
      setOriginalSlug(draft.slug);
      setSlugTouched(true);
      setDirty(false);
      clearStoredDraft();
      setNotice({ kind: 'ok', text: `Saved /intelligence/${draft.slug}. Commit and push to publish.` });
    } catch (err) {
      setNotice({ kind: 'error', text: err instanceof Error ? err.message : 'Save failed.' });
    }
    setBusy(false);
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Permanently delete "${post.title}" and its images?`)) return;
    setBusy(true);
    try {
      const { blogs: remaining } = await callApi('DELETE', { slug: post.slug });
      setBlogs(remaining);
      if (originalSlug === post.slug) {
        setDraft(emptyDraft());
        setOriginalSlug(null);
        setSlugTouched(false);
        setDirty(false);
        clearStoredDraft();
      }
      setNotice({ kind: 'ok', text: `Deleted "${post.title}".` });
    } catch (err) {
      setNotice({ kind: 'error', text: err instanceof Error ? err.message : 'Delete failed.' });
    }
    setBusy(false);
  };

  const handleReorder = async (index: number, delta: number) => {
    const reordered = moveItem(blogs, index, delta);
    if (reordered === blogs) return;
    setBusy(true);
    try {
      const { blogs: saved } = await callApi('POST', { action: 'reorder', slugs: reordered.map((b) => b.slug) });
      setBlogs(saved);
    } catch (err) {
      setNotice({ kind: 'error', text: err instanceof Error ? err.message : 'Reorder failed.' });
    }
    setBusy(false);
  };

  const handleDownload = () => {
    const post = toPost(draft, originalSlug ? blogs.find((b) => b.slug === originalSlug)?.id ?? 0 : blogs.reduce((m, b) => Math.max(m, b.id), 0) + 1);
    const merged = originalSlug ? blogs.map((b) => (b.slug === originalSlug ? post : b)) : [post, ...blogs];
    downloadJson('blogs.json', merged);
  };

  const withImages = async (files: FileList | null, apply: (urls: string[]) => void) => {
    try {
      const urls = await readImages(files);
      if (urls.length) apply(urls);
    } catch (err) {
      setNotice({ kind: 'error', text: err instanceof Error ? err.message : 'Could not read the image.' });
    }
  };

  // Preview uses the real page component, with prev/next as they will be after saving.
  const previewPost = toPost(draft);
  const previewList = originalSlug ? blogs.map((b) => (b.slug === originalSlug ? previewPost : b)) : [previewPost, ...blogs];
  const previewIndex = previewList.indexOf(previewPost);
  const neighbour = (i: number) => (previewList[i] ? { slug: previewList[i].slug, title: previewList[i].title } : undefined);
  const embedOk = !draft.videoUrl.trim() || Boolean(getEmbedUrl(draft.videoUrl.trim()));

  return (
    <div className="space-y-8">
      {notice && (
        <p role="status" className={`text-sm font-mono ${notice.kind === 'ok' ? 'text-green-400' : 'text-red-400'}`}>{notice.text}</p>
      )}
      {!local && (
        <p className="text-sm font-mono text-yellow-400">
          Saving only works on the local dev server (npm run dev, then open 127.0.0.1:3000/terminal-x-92). Here you can draft, preview and download blogs.json.
        </p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-12">
        {/* Editor */}
        <div className={`${panel} xl:col-span-2 space-y-8`}>
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-green-500/20 pb-4">
            <h3 className={sectionTitle}>
              {originalSlug ? <><Edit3 size={20} /> Edit Briefing</> : <><Plus size={20} /> New Briefing</>}
            </h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowPreview(true)} className={ghostButton}>
                <Eye size={16} /> Preview
              </button>
              {(originalSlug || dirty) && (
                <button type="button" onClick={startNew} className={dangerButton}>
                  <X size={16} /> {originalSlug ? 'Close' : 'Clear'}
                </button>
              )}
            </div>
          </div>

          {/* Header fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={label} htmlFor="bm-title">Title *</label>
              <input id="bm-title" className={input} value={draft.title} onChange={(e) => onTitleChange(e.target.value)} placeholder="e.g. OverTheWire Bandit: Level 0 → 1" />
            </div>
            <div>
              <label className={label} htmlFor="bm-slug">Slug (URL) *</label>
              <input
                id="bm-slug"
                className={`${input} font-mono`}
                value={draft.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update({ slug: e.target.value.replace(/[^A-Za-z0-9-]/g, '-') });
                }}
                placeholder="OverTheWire-Bandit-Level-0-to-1"
              />
              <p className="mt-2 text-[11px] text-green-700 font-mono break-all">/intelligence/{draft.slug || '…'}</p>
            </div>
            <div>
              <label className={label} htmlFor="bm-date">Date *</label>
              <input id="bm-date" className={input} value={draft.date} onChange={(e) => update({ date: e.target.value })} placeholder="October 2026" />
            </div>
            <div className="md:col-span-2">
              <label className={label} htmlFor="bm-summary">Summary</label>
              <textarea id="bm-summary" className={`${input} h-24`} value={draft.summary} onChange={(e) => update({ summary: e.target.value })} placeholder="One or two sentences shown on the archive card and under the title." />
            </div>
            <div className="md:col-span-2">
              <label className={label} htmlFor="bm-tags">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {draft.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 border border-green-500/30 rounded text-sm text-green-400">
                    #{tag}
                    <button type="button" aria-label={`Remove tag ${tag}`} onClick={() => update({ tags: draft.tags.filter((t) => t !== tag) })} className="text-red-400 hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                id="bm-tags"
                className={input}
                value={tagInput}
                onChange={(e) => (e.target.value.includes(',') ? addTags(e.target.value) : setTagInput(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTags(tagInput);
                  } else if (e.key === 'Backspace' && !tagInput && draft.tags.length) {
                    update({ tags: draft.tags.slice(0, -1) });
                  }
                }}
                onBlur={() => addTags(tagInput)}
                placeholder="Type a tag and press Enter or comma"
              />
            </div>
            <div className="md:col-span-2">
              <label className={label} htmlFor="bm-video">YouTube URL</label>
              <input id="bm-video" className={`${input} font-mono`} value={draft.videoUrl} onChange={(e) => update({ videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" />
              {!embedOk && <p className="mt-2 text-xs text-red-400">Not a valid YouTube video link.</p>}
              {embedOk && draft.videoUrl.trim() && <p className="mt-2 text-xs text-green-600">Video found. It will appear as the Live Tactical Feed.</p>}
            </div>
            <div className="md:col-span-2">
              <span className={label}>Main image (archive card)</span>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex flex-col items-center justify-center gap-2 w-24 h-24 bg-green-900/5 border border-dashed border-green-500/20 rounded-lg cursor-pointer hover:bg-green-500/10 transition-colors">
                  <ImageIcon size={18} className="text-green-700" />
                  <span className="text-[8px]">SELECT</span>
                  <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => { const f = e.target.files; withImages(f, ([url]) => update({ mainImage: url })); e.target.value = ''; }} />
                </label>
                {draft.mainImage ? (
                  <div className="relative w-40 h-24 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.mainImage} alt="" className="w-full h-full object-cover rounded-lg border border-green-500/30" />
                    <button type="button" aria-label="Remove main image" onClick={() => update({ mainImage: '' })} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-green-700">Optional. Without one, the archive shows a terminal-style card.</p>
                )}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-green-500/10" />
              <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Lab Walkthrough</h4>
              <div className="h-px flex-1 bg-green-500/10" />
            </div>

            {draft.steps.map((step, i) => (
              <div key={i} className="border border-green-500/10 rounded-xl p-4 lg:p-6 space-y-4 bg-black/40">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-green-500/30 font-mono leading-none">{String(i + 1).padStart(2, '0')}</span>
                  <input aria-label={`Step ${i + 1} title`} className={`${input} flex-1`} value={step.title} onChange={(e) => updateStep(i, { title: e.target.value })} placeholder="Step title *" />
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  <button type="button" title="Move up" aria-label={`Move step ${i + 1} up`} disabled={i === 0} onClick={() => setSteps((s) => moveItem(s, i, -1))} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ArrowUp size={16} /></button>
                  <button type="button" title="Move down" aria-label={`Move step ${i + 1} down`} disabled={i === draft.steps.length - 1} onClick={() => setSteps((s) => moveItem(s, i, 1))} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ArrowDown size={16} /></button>
                  <button type="button" title="Duplicate" aria-label={`Duplicate step ${i + 1}`} onClick={() => setSteps((s) => [...s.slice(0, i + 1), { ...s[i], images: [...s[i].images] }, ...s.slice(i + 1)])} className={`${iconButton} text-blue-400 hover:bg-blue-500/10`}><Copy size={16} /></button>
                  <button type="button" title="Remove" aria-label={`Remove step ${i + 1}`} disabled={draft.steps.length === 1} onClick={() => setSteps((s) => s.filter((_, j) => j !== i))} className={`${iconButton} text-red-500 hover:bg-red-500/10`}><Trash2 size={16} /></button>
                </div>
                <textarea aria-label={`Step ${i + 1} description`} className={`${input} h-28`} value={step.description} onChange={(e) => updateStep(i, { description: e.target.value })} placeholder="Description (line breaks are kept)" />
                <textarea aria-label={`Step ${i + 1} code`} spellCheck={false} className={`${input} h-28 font-mono text-green-400`} value={step.code} onChange={(e) => updateStep(i, { code: e.target.value })} placeholder="Terminal input / command (optional)" />
                <div className="flex flex-wrap gap-4">
                  <label className="flex flex-col items-center justify-center gap-2 w-24 h-24 bg-green-900/5 border border-dashed border-green-500/20 rounded-lg cursor-pointer hover:bg-green-500/10 transition-colors">
                    <ImageIcon size={18} className="text-green-700" />
                    <span className="text-[8px]">IMAGES</span>
                    <input type="file" className="hidden" multiple accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => { const f = e.target.files; withImages(f, (urls) => setSteps((s) => s.map((st, j) => (j === i ? { ...st, images: [...st.images, ...urls] } : st)))); e.target.value = ''; }} />
                  </label>
                  {step.images.map((img, k) => (
                    <div key={k} className="relative w-24 h-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-green-500/20" />
                      <button type="button" aria-label="Remove image" onClick={() => updateStep(i, { images: step.images.filter((_, j) => j !== k) })} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button type="button" onClick={() => setSteps((s) => [...s, emptyStep()])} className={`${ghostButton} w-full justify-center py-3`}>
              <Plus size={16} /> Add step
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button type="button" disabled={busy || !local} onClick={handleSave} className={`${primaryButton} flex-1`}>
              {busy ? <RefreshCw className="animate-spin" /> : <><Save size={20} /> {originalSlug ? 'Save changes' : 'Publish to archive'}</>}
            </button>
            {!local && (
              <button type="button" onClick={handleDownload} className={`${ghostButton} justify-center`}>
                <Download size={16} /> Download blogs.json
              </button>
            )}
          </div>
        </div>

        {/* Existing posts */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white uppercase tracking-widest border-b border-green-500/20 pb-4">Archive ({blogs.length})</h3>
          <p className="text-xs text-green-700">Top of the list shows first on /intelligence. The order also sets Previous / Next.</p>
          <div className="space-y-3">
            {blogs.map((post, i) => (
              <div key={post.slug} className={`flex items-center gap-3 bg-[#111] p-3 rounded-xl border ${post.slug === originalSlug ? 'border-green-500/60' : 'border-green-500/5'} hover:border-green-500/20 transition-all`}>
                <Thumb src={post.mainImage} title={post.title} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm uppercase tracking-tight truncate" title={post.title}>{post.title}</h4>
                  <p className="text-green-700 text-[10px] tracking-[0.2em] font-black">{post.date}</p>
                </div>
                <div className="flex flex-col">
                  <button type="button" title="Move up" aria-label={`Move ${post.title} up`} disabled={!local || busy || i === 0} onClick={() => handleReorder(i, -1)} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ArrowUp size={14} /></button>
                  <button type="button" title="Move down" aria-label={`Move ${post.title} down`} disabled={!local || busy || i === blogs.length - 1} onClick={() => handleReorder(i, 1)} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ArrowDown size={14} /></button>
                </div>
                <a href={`/intelligence/${post.slug}/`} target="_blank" rel="noopener noreferrer" title="Open live page" aria-label={`Open ${post.title}`} className={`${iconButton} text-green-500 hover:bg-green-500/10`}><ExternalLink size={16} /></a>
                <button type="button" title="Edit" aria-label={`Edit ${post.title}`} onClick={() => startEdit(post)} className={`${iconButton} text-blue-500 hover:bg-blue-500/10`}><Edit3 size={16} /></button>
                <button type="button" title="Delete" aria-label={`Delete ${post.title}`} disabled={!local || busy} onClick={() => handleDelete(post)} className={`${iconButton} text-red-500 hover:bg-red-500/10`}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-[#0a0a0a]"
          role="dialog"
          aria-modal="true"
          aria-label="Blog preview"
          onClickCapture={(e) => {
            // Keep the preview in place: links inside it would navigate away.
            if ((e.target as HTMLElement).closest('a')) e.preventDefault();
          }}
        >
          <button type="button" onClick={() => setShowPreview(false)} className="fixed top-20 right-4 z-[110] flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase shadow-lg">
            <X size={16} /> Close preview
          </button>
          <BlogDetailClient blog={previewPost} prevBlog={neighbour(previewIndex - 1)} nextBlog={neighbour(previewIndex + 1)} />
        </div>
      )}
    </div>
  );
}
