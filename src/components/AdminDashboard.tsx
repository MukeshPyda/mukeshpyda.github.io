'use client';
import { useState, type ReactNode } from 'react';
import { BookOpen, FileText, LogOut, Radar, Users } from 'lucide-react';
import OperationsPanel from './admin/OperationsPanel';
import BlogMaker from './admin/BlogMaker';
import CoursesPanel from './admin/CoursesPanel';
import LearnersPanel from './admin/LearnersPanel';
import { isLocalHost } from './admin/ui';

type Tab = 'operations' | 'blog' | 'courses' | 'learners';

const TAB_KEY = 'admin_tab';

function loadTab(): Tab {
  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (saved === 'operations' || saved === 'blog' || saved === 'courses' || saved === 'learners') return saved;
  } catch {
    // ignore
  }
  return 'operations';
}

export default function AdminDashboard({
  onLogout,
  signedInAs,
  cloudReady,
}: {
  onLogout: () => void;
  signedInAs?: string;
  /** True when Firebase is configured and the admin is signed in, so Courses/Learners work. */
  cloudReady: boolean;
}) {
  const [tab, setTab] = useState<Tab>(loadTab);
  const local = isLocalHost();

  const selectTab = (next: Tab) => {
    setTab(next);
    try {
      localStorage.setItem(TAB_KEY, next);
    } catch {
      // ignore
    }
  };

  const tabs: { id: Tab; name: string; icon: ReactNode }[] = [
    { id: 'operations', name: 'Operations', icon: <Radar size={16} /> },
    { id: 'blog', name: 'Blog Maker', icon: <FileText size={16} /> },
    { id: 'courses', name: 'Courses', icon: <BookOpen size={16} /> },
    { id: 'learners', name: 'Learners', icon: <Users size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-green-500 font-mono p-4 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-green-500/20 pb-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tighter text-white">Hybrid Terminal</h1>
            <p className="text-green-700 tracking-widest text-xs mt-2 uppercase">
              Local Sync Active: {local ? 'YES' : 'NO'}
              {signedInAs && <> · Signed in: {signedInAs}</>}
            </p>
          </div>
          <button type="button" onClick={onLogout} className="flex items-center gap-2 bg-red-900/20 border border-red-500/50 hover:bg-red-500 hover:text-black px-6 py-2 rounded-lg transition-all font-bold text-xs uppercase">
            <LogOut size={16} /> Terminate
          </button>
        </header>

        <nav className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Admin sections">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => selectTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg border font-bold text-xs uppercase tracking-widest transition-all ${
                tab === t.id
                  ? 'bg-green-500 border-green-500 text-black shadow-[0_0_20px_rgba(0,255,0,0.3)]'
                  : 'border-green-500/20 text-green-600 hover:border-green-500/60 hover:text-green-400'
              }`}
            >
              {t.icon} {t.name}
            </button>
          ))}
        </nav>

        <div role="tabpanel">
          {tab === 'operations' && <OperationsPanel />}
          {tab === 'blog' && <BlogMaker />}
          {tab === 'courses' && <CoursesPanel cloudReady={cloudReady} />}
          {tab === 'learners' && <LearnersPanel cloudReady={cloudReady} />}
        </div>
      </div>
    </div>
  );
}
