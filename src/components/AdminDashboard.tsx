'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, LogOut, Trash2, Image as ImageIcon, FileImage, Edit3, Save, X, RefreshCw } from 'lucide-react';
import { TimelineEvent } from '@/lib/data';
import { usePersistence } from '@/lib/persistence';

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { data: events, saveData } = usePersistence();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
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
      reader.onloadend = () => setNewEvent({ ...newEvent, mainImage: reader.result as string });
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

    const eventToSave: TimelineEvent = {
      id: editingId || Date.now(),
      title: newEvent.title!,
      date: newEvent.date!,
      summary: newEvent.summary || '',
      description: newEvent.description || '',
      mainImage: newEvent.mainImage || '',
      collage: newEvent.collage || []
    };

    // --- HYBRID PERSISTENCE LOGIC ---
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const response = await fetch('/api/save-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: eventToSave, allEvents: events })
        });
        
        if (response.ok) {
          const result = await response.json();
          saveData(result.allEvents);
          resetForm();
          setIsSyncing(false);
          return;
        }
      } catch (err) {
        console.warn('Local API failed, falling back to browser storage only.');
      }
    }

    const updatedEvents = editingId 
      ? events.map(e => e.id === editingId ? eventToSave : e)
      : [eventToSave, ...events];

    saveData(updatedEvents);
    resetForm();
    setIsSyncing(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('PERMANENTLY DELETE THIS RECORD?')) return;
    setIsSyncing(true);

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const response = await fetch('/api/save-event', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, allEvents: events })
        });
        
        if (response.ok) {
          const result = await response.json();
          saveData(result.allEvents);
          setIsSyncing(false);
          return;
        }
      } catch (err) {
        console.error('Delete sync failed:', err);
      }
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
    const dataString = `import { TimelineEvent } from './data';\n\nexport const initialTimelineData: TimelineEvent[] = ${JSON.stringify(events, null, 2)};\n\nexport const siteConfig = {\n  name: "Mukesh Pyda",\n  role: "Subject Matter Expert in Cybersecurity",\n  bio: "A visionary Subject Matter Expert in Cybersecurity.",\n  adminHash: "338a4805c297641ce81f27dd7d3a983159f5a18552a268e625999210ba5f4e19"\n};`;
    const blob = new Blob([dataString], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.ts';
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-green-500 font-mono p-4 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-green-500/20 pb-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tighter text-white">Hybrid Terminal</h1>
            <p className="text-green-900/80 tracking-widest text-xs mt-2 uppercase">Local Sync Active: {window.location.hostname === 'localhost' ? 'YES' : 'NO'}</p>
          </div>
          <div className="flex gap-4 mt-6 md:mt-0">
            <button type="button" onClick={handleExport} className="flex items-center gap-2 bg-green-900/20 border border-green-500/50 hover:bg-green-500 hover:text-black px-6 py-2 rounded-lg transition-all font-bold text-xs uppercase">
              <Download size={16} /> Export Dossier
            </button>
            <button type="button" onClick={() => { localStorage.removeItem('admin_auth'); onLogout(); }} className="flex items-center gap-2 bg-red-900/20 border border-red-500/50 hover:bg-red-500 hover:text-black px-6 py-2 rounded-lg transition-all font-bold text-xs uppercase">
              <LogOut size={16} /> Terminate
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Add/Edit Form */}
          <div className="bg-[#111] p-8 rounded-2xl border border-green-500/10 h-fit sticky top-28">
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
    </div>
  );
}
