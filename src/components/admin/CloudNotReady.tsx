import { CloudOff } from 'lucide-react';
import { firebaseConfigured } from '@/lib/firebase/config';
import { panel } from './ui';

/** Shown on the Courses/Learners tabs until Firebase is configured and the admin has signed in. */
export default function CloudNotReady({ what }: { what: string }) {
  return (
    <div className={`${panel} space-y-4 max-w-3xl`}>
      <h3 className="flex items-center gap-2 text-white font-bold uppercase tracking-widest">
        <CloudOff size={20} /> {what} need Firebase
      </h3>
      {firebaseConfigured ? (
        <p className="text-green-600 text-sm">Sign in with the admin Google account to manage {what.toLowerCase()}.</p>
      ) : (
        <ol className="list-decimal pl-5 space-y-2 text-green-600 text-sm">
          <li>Create the Firebase project (Google sign-in + Firestore).</li>
          <li>Paste its web config into <code className="text-green-300">src/lib/firebase/config.ts</code>.</li>
          <li>Run <code className="text-green-300">npm run rules -- &lt;admin email&gt;</code> and publish <code className="text-green-300">firestore.rules</code> in the Firebase console.</li>
          <li>Reload this page and sign in with Google.</li>
        </ol>
      )}
    </div>
  );
}
