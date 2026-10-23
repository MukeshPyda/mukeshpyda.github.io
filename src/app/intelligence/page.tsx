import type { Metadata } from 'next';
import IntelligenceClient from './IntelligenceClient';

export const metadata: Metadata = {
  title: 'Tactical Intelligence',
  description: 'Security research, lab walkthroughs and SME-level technical briefings by Mukesh Pyda.',
  alternates: { canonical: '/intelligence/' },
};

export default function IntelligencePage() {
  return <IntelligenceClient />;
}
