'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, LogOut, RefreshCw } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import { isLocalHost } from './admin/ui';
import { describeAuthError, signInWithGoogle, signOutUser, useFirebaseUser } from '@/lib/firebase/client';
import { isPermissionDenied, probeAdmin } from '@/lib/courses/api';
import { useMounted } from '@/lib/useMounted';

// Admin access is decided by Firestore: only the admin account may read admin/access.
// No admin email or password hash is shipped in the page.

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4 font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-black border border-green-500/20 rounded-2xl shadow-[0_0_50px_rgba(0,255,0,0.1)] text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="p-5 rounded-full bg-green-500/10 text-green-500 border border-green-500/30 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
            <Lock size={40} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-[0.3em]">Secure Access</h1>
        {children}
      </motion.div>
    </div>
  );
}

const primary = 'w-full bg-green-600 hover:bg-green-500 text-black font-black py-4 rounded-lg transition-all shadow-[0_0_30px_rgba(0,255,0,0.3)] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50';

export default function AdminGate() {
  const mounted = useMounted();
  const { configured, loading, user } = useFirebaseUser();
  const [probe, setProbe] = useState<{ uid: string; status: 'ok' | 'denied' | 'error' } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    probeAdmin()
      .then(() => !cancelled && setProbe({ uid: user.uid, status: 'ok' }))
      .catch((err) => !cancelled && setProbe({ uid: user.uid, status: isPermissionDenied(err) ? 'denied' : 'error' }));
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!mounted) return null;

  if (!configured) {
    // Before Firebase is set up, the local dev server still gets the file-based tabs.
    if (isLocalHost()) return <AdminDashboard onLogout={() => window.location.assign('/')} cloudReady={false} />;
    return (
      <Screen>
        <p className="text-green-700 text-sm">Admin sign-in is not configured yet.</p>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <RefreshCw className="animate-spin mx-auto text-green-500" />
      </Screen>
    );
  }

  const signIn = async () => {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(describeAuthError(err));
    }
    setBusy(false);
  };

  if (!user) {
    return (
      <Screen>
        <p className="text-green-700 text-xs uppercase tracking-widest">Private terminal</p>
        <button type="button" onClick={signIn} disabled={busy} className={primary}>
          {busy ? <RefreshCw className="animate-spin" /> : 'Sign in with Google'}
        </button>
        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
      </Screen>
    );
  }

  const status = probe?.uid === user.uid ? probe.status : 'checking';

  if (status === 'checking') {
    return (
      <Screen>
        <p className="text-green-700 text-xs uppercase tracking-widest">Verifying clearance…</p>
        <RefreshCw className="animate-spin mx-auto text-green-500" />
      </Screen>
    );
  }

  if (status !== 'ok') {
    return (
      <Screen>
        <p className="text-red-500 text-sm font-bold">
          {status === 'denied' ? 'CRITICAL ERROR: UNAUTHORIZED ACCESS' : 'Could not verify access. Check your connection and try again.'}
        </p>
        <p className="text-green-700 text-xs break-all">Signed in as {user.email}</p>
        <button type="button" onClick={() => signOutUser()} className={primary}>
          <LogOut size={18} /> Sign out
        </button>
      </Screen>
    );
  }

  return <AdminDashboard onLogout={() => signOutUser()} signedInAs={user.email ?? undefined} cloudReady />;
}
