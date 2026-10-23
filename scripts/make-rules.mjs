// Writes firestore.rules (git-ignored) from firestore.rules.template with the admin email.
// Usage: npm run rules -- you@example.com
import fs from 'node:fs';

const email = (process.argv[2] ?? '').trim().toLowerCase();
if (!/^[^\s@'\\]+@[^\s@'\\]+\.[^\s@'\\]{2,}$/.test(email)) {
  console.error('Usage: npm run rules -- you@example.com');
  process.exit(1);
}
const template = fs.readFileSync(new URL('../firestore.rules.template', import.meta.url), 'utf8');
fs.writeFileSync(new URL('../firestore.rules', import.meta.url), template.replaceAll('__ADMIN_EMAIL__', email));
console.log('Wrote firestore.rules. Paste it into Firebase console > Firestore > Rules, then Publish.');
