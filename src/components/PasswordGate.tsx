'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { siteConfig } from '@/lib/data';

export default function PasswordGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hashHex === siteConfig.adminHash) {
        localStorage.setItem('admin_auth', 'true');
        onAuthenticated();
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-black border border-green-500/20 rounded-2xl shadow-[0_0_50px_rgba(0,255,0,0.1)]"
      >
        <div className="flex justify-center mb-8">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="p-5 rounded-full bg-green-500/10 text-green-500 border border-green-500/30 shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          >
            <Lock size={40} />
          </motion.div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 text-white uppercase tracking-[0.3em] font-mono">Secure Access</h1>
        <p className="text-center text-green-900 text-xs mb-8 uppercase tracking-widest">Mukesh Pyda Private Terminal</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="password"
            placeholder="ACCESS KEY..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full bg-black border ${error ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-green-500/40'} rounded-lg p-4 text-green-500 focus:outline-none focus:border-green-500 transition-all font-mono text-center tracking-[0.5em] placeholder:tracking-normal placeholder:text-green-900/50`}
            autoFocus
          />
          <button 
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-4 rounded-lg transition-all shadow-[0_0_30px_rgba(0,255,0,0.3)] uppercase tracking-widest"
          >
            Initialize Session
          </button>
        </form>
        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center mt-6 font-mono font-bold">CRITICAL ERROR: UNAUTHORIZED ACCESS</motion.p>}
      </motion.div>
    </div>
  );
}
