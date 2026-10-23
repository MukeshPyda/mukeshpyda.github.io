'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Trash2, Image as ImageIcon, FileImage, Edit3, Save, X, RefreshCw } from 'lucide-react';
import { TimelineEvent, siteConfig } from '@/lib/data';
import { usePersistence } from '@/lib/persistence';
import { ghostButton, isLocalHost, type Notice } from './ui';

const newEventId = () => Date.now();

export default function OperationsPanel() {
  const { data: events, saveData } = usePersistence();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    title: '',
    date: '',
    summary: '',
    description: '',
    mainImage: '',
    collage: []
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'main' | 'collage') => {
    const files = e.target.files;
    if (!files) return;

    if (field === 'main') {
      const reader = new FileReader();
      reader.onloadend = () => setNewEvent(prev => ({ ...prev, mainImage: reader.result as string }));
      reader.readAsDataURL(files[0]);
    } else {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewEvent(prev => ({
            ...prev,
            collage: [...(prev.collage || []), reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setIsSyncing(true);
    setNotice(null);

    const eventToSave: TimelineEvent = {
      id: editingId || newEventId(),
      title: newEvent.title!,
      date: newEvent.date!,
      summary: newEvent.summary || '',
      description: newEvent.description || '',
      mainImage: newEvent.mainImage || '',
      collage: newEvent.collage || []
    };

    // --- HYBRID PERSISTENCE LOGIC ---
    if (isLocalHost()) {
      try {
        const response = await fetch('/api/save-event/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: eventToSave, allEvents: events })
        });
        const result = await response.json();
        if (response.ok) {
          saveData(result.allEvents);
          resetForm();
          setNotice({ kind: 'ok', text: 'Saved to src/lib/data.ts. Commit and push to publish.' });
        } else {
          setNotice({ kind: 'error', text: result.error || 'Local sync failed.' });
        }
      } catch {
        setNotice({ kind: 'error', text: 'Local API unreachable. Is npm run dev running?' });
      }
      setIsSyncing(false);
      return;
    }

    const updatedEvents = editingId
      ? events.map(e => e.id === editingId ? eventToSave : e)
      : [eventToSave, ...events];

    saveData(updatedEvents);
    resetForm();
    setIsSyncing(false);
    setNotice({ kind: 'ok', text: 'Preview only: changes are lost on reload. Use Export Dossier or run locally to save.' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('PERMANENTLY DELETE THIS RECORD?')) return;
    setIsSyncing(true);
    setNotice(null);

    if (isLocalHost()) {
      try {
        const response = await fetch('/api/save-event/', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, allEvents: events })
        });
        const result = await response.json();
        if (response.ok) saveData(result.allEvents);
        else setNotice({ kind: 'error', text: result.error || 'Delete failed.' });
      } catch {
        setNotice({ kind: 'error', text: 'Local API unreachable. Is npm run dev running?' });
      }
      setIsSyncing(false);
      return;
    }

    const updatedEvents = events.filter(e => e.id !== id);
    saveData(updatedEvents);
    setIsSyncing(false);
  };

  const startEdit = (event: TimelineEvent) => {
    setEditingId(event.id);
    setNewEvent(event);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewEvent({ title: '', date: '', summary: '', description: '', mainImage: '', collage: [] });
  };

  const handleExport = () => {
    const dataString = `export interface TimelineEvent {\n  id: number;\n  title: string;\n  date: string;\n  summary: string;\n  description: string;\n  mainImage: string;\n  collage: string[];\n}\n\nexport const initialTimelineData: TimelineEvent[] = ${JSON.stringify(events, null, 2)};\n\nexport const siteConfig = ${JSON.stringify(siteConfig, null, 2)};\n`;
    const blob = new Blob([dataString], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-green-700 text-xs uppercase tracking-widest">Timeline events on the home page</p>
        <button type="button" onClick={handleExport} className={ghostButton}>
          <Download size={16} /> Export Dossier
        </button>
      </div>

      {notice && (
        <p className={`text-sm font-mono ${notice.kind === 'ok' ? 'text-green-400' : 'text-red-400'}`}>{notice.text}</p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Add/Edit Form */}
        <div className="bg-[#111] p-8 rounded-2xl border border-green-500/10 h-fit xl:sticky xl:top-8">
          <div className="flex justify-between items-center mb-8 border-b border-green-500/20 pb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white uppercase tracking-widest">
              {editingId ? <><Edit3 size={20}/> Modify Record</> : <><Plus size={20}/> New Operation</>}
            </h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-red-500 hover:text-white flex items-center gap-1 uppercase">
                <X size={14}/> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSaveEvent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="OPERATION TITLE" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-black border border-green-500/30 p-4 rounded-lg focus:border-green-500 text-white placeholder:text-green-900" />
              <input placeholder="DATE (e.g. JAN 2025)" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-black border border-green-500/30 p-4 rounded-lg focus:border-green-500 text-white placeholder:text-green-900" />
            </div>
            <textarea placeholder="SHORT SUMMARY" value={newEvent.summary} onChange={e => setNewEvent({...newEvent, summary: e.target.value})} className="w-full bg-black border border-green-500/30 p-4 rounded-lg focus:border-green-500 text-white h-20 placeholder:text-green-900" />
            <textarea placeholder="LONG DESCRIPTION" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full bg-black border border-green-500/30 p-4 rounded-lg focus:border-green-500 text-white h-40 placeholder:text-green-900" />

            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] text-green-900 uppercase font-black tracking-[0.2em]">Primary Evidence</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex flex-col items-center justify-center gap-2 w-24 h-24 bg-green-900/5 border border-dashed border-green-500/20 rounded-lg cursor-pointer hover:bg-green-500/10 transition-colors">
                    <ImageIcon size={18} className="text-green-800" />
                    <span className="text-[8px]">SELECT</span>
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'main')} />
                  </label>
                  {newEvent.mainImage && (
                    <div className="relative w-24 h-24 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={newEvent.mainImage} className="w-full h-full object-cover rounded-lg border border-green-500/30" alt="" />
                      <button type="button" onClick={() => setNewEvent({...newEvent, mainImage: ''})} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] text-green-900 uppercase font-black tracking-[0.2em]">Dossier Collage Pre-Flight</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex flex-col items-center justify-center gap-2 w-24 h-24 bg-green-900/5 border border-dashed border-green-500/20 rounded-lg cursor-pointer hover:bg-green-500/10 transition-colors">
                    <FileImage size={18} className="text-green-800" />
                    <span className="text-[8px]">BATCH</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={e => handleFileUpload(e, 'collage')} />
                  </label>
                  <AnimatePresence mode="popLayout">
                    {newEvent.collage?.map((img, idx) => (
                      <motion.div
                        key={`pre-${idx}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout
                        className="relative w-24 h-24 group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} className="w-full h-full object-cover rounded-lg border border-green-500/20" alt="" />
                        <button type="button" onClick={() => setNewEvent({...newEvent, collage: newEvent.collage?.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <button disabled={isSyncing} type="submit" className="w-full bg-green-600 text-black font-black py-5 rounded-lg hover:bg-green-500 transition-all shadow-[0_0_30px_rgba(0,255,0,0.2)] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
              {isSyncing ? <RefreshCw className="animate-spin" /> : editingId ? <><Save size={20}/> Sync Record</> : <><Plus size={20}/> Inject Operation</>}
            </button>
          </form>
        </div>

        {/* Records List */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white uppercase tracking-widest border-b border-green-500/20 pb-4">Stored Expertise</h3>
          <div className="space-y-4">
            {events.map((event) => (
              <motion.div layout key={event.id} className="flex items-center gap-6 bg-[#111] p-4 rounded-xl border border-green-500/5 group hover:border-green-500/20 transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {event.mainImage ? <img src={event.mainImage} className="w-16 h-16 object-cover rounded-lg group-hover:scale-110 transition-all" alt="" /> : <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center text-green-900 border border-green-500/10 text-xs">NO-IMG</div>}
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm uppercase tracking-tight">{event.title}</h4>
                  <p className="text-green-900 text-[10px] tracking-[0.3em] font-black">{event.date}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(event)} className="p-3 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all" title="Edit Record">
                    <Edit3 size={18} />
                  </button>
                  <button type="button" onClick={() => handleDelete(event.id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Delete Record">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
