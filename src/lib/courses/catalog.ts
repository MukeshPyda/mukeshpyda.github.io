import { DEFAULT_TIER, syllabusOf, type Course, type CourseContent, type CourseModule, type Lesson } from './types';

// Courses defined in the website code. Public details (this file) render as static
// pages at /courses/<slug>/. The admin page copies each course into Firestore on
// sign-in (syncCatalog in api.ts) so enrollment works; recordings, PDFs and the
// Discord/Telegram links are then added from the admin and stay private.

export interface CatalogSession {
  id: string;
  date: string;
  title: string;
}

export interface CatalogWeek {
  key: string;
  title: string;
  sessions: CatalogSession[];
}

export interface CatalogCourse {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  description: string[];
  highlights: string[];
  audience: string[];
  enrollmentSteps: string[];
  faq: { q: string; a: string }[];
  cover: string;
  priceUsd: number;
  tier: string;
  format: string;
  startDate: string;
  endDate: string;
  enrollBy: string;
  classDays: string;
  classStart: string;
  classEnd: string;
  timeZone: string;
  seats: number;
  weeks: CatalogWeek[];
}

export const CATALOG: CatalogCourse[] = [
  {
    slug: 'ai-era-web-hacking',
    title: 'AI-Era Web Hacking: From Linux Basics to Your First Pentest Job',
    tagline: 'A live 8-week intensive: Linux, networking and web hacking, built for the AI era.',
    summary: 'Live classes on Discord, Mon–Fri 8–10 PM IST, from Linux basics to job-ready web pentesting with AI-era skills.',
    description: [
      'A live, hands-on path from Linux basics to your first web pentesting job, built for how security work is done today: with AI as your assistant, and AI features as a new attack surface.',
      'Every class is taught live on Discord, Monday to Friday, 8–10 PM IST. Missed one? The recording is added to your classroom after the class.',
    ],
    highlights: [
      '44 live classes on Discord (88 hours), with a recording of every class',
      'Networking and Linux foundations with 30+ hands-on Linux labs',
      'Web hacking from SQL injection to request smuggling, with PDF walkthroughs and cheatsheets',
      'API security and AI-era hacking: using AI safely in pentests, and attacking AI features',
      'A capstone assessment with a reviewed report for your portfolio',
      'Resume preparation, an interview question bank, mock interviews and referrals within my network',
      'Private Discord and Telegram groups for doubts and updates',
      'Lifetime access to materials and recordings',
    ],
    audience: [
      'Beginners and intermediates aiming for VAPT and pentesting roles',
      'Students and working professionals who can give 2 hours on weekday evenings',
      'No prior hacking experience needed: basic computer skills are enough',
    ],
    enrollmentSteps: [
      'Click Enroll and sign in with your Google account.',
      'Press Enroll on your dashboard. An email to us opens with your details: just send it.',
      'We reply by email to complete your enrollment.',
      'Once approved, your classroom unlocks on your dashboard.',
    ],
    faq: [
      { q: 'Where do classes happen?', a: 'Live on Discord, Monday to Friday, 8–10 PM IST. You get the invite once you are enrolled.' },
      { q: 'What if I miss a class?', a: 'Every class is recorded and added to your classroom afterwards.' },
      { q: 'Do classes run on holidays?', a: 'Yes. Classes run every weekday from 2 November to 31 December, festivals included.' },
      { q: 'What do I need?', a: 'A laptop that can run Kali Linux (8 GB RAM recommended), a stable internet connection and about 2 hours each weekday evening.' },
      { q: 'How long do I keep access?', a: 'Materials and recordings stay available to you for life.' },
      { q: 'Is a job guaranteed?', a: 'No. You get career preparation and referrals within my network when you are ready, but no job guarantee.' },
    ],
    cover: '/courses/ai-era-web-hacking/cover.png',
    priceUsd: 99,
    tier: DEFAULT_TIER,
    format: '8-week live intensive on Discord',
    startDate: '2026-11-02',
    endDate: '2026-12-31',
    enrollBy: '2026-10-31',
    classDays: 'Mon–Fri',
    classStart: '20:00',
    classEnd: '22:00',
    timeZone: 'Asia/Kolkata',
    seats: 20,
    weeks: [
    {
      key: 'week-1',
      title: "Week 1 · Foundations",
      sessions: [
        { id: 's01', date: '2026-11-02', title: "Orientation: lab setup, note-taking, rules of engagement, legal basics, using AI safely" },
        { id: 's02', date: '2026-11-03', title: "Networking I: OSI & TCP/IP, IP addressing & subnetting, TCP/UDP, ports" },
        { id: 's03', date: '2026-11-04', title: "Networking II: DNS, HTTP/HTTPS & TLS, proxies, VPN, NAT, common services" },
        { id: 's04', date: '2026-11-05', title: "Networking III: Wireshark, tcpdump & nmap (lab)" },
        { id: 's05', date: '2026-11-06', title: "Linux I: filesystem, permissions, SUID, users & groups" },
      ],
    },
    {
      key: 'week-2',
      title: "Week 2 · Linux",
      sessions: [
        { id: 's06', date: '2026-11-09', title: "Linux II: processes, grep/sed/awk, pipes, find" },
        { id: 's07', date: '2026-11-10', title: "Linux III: networking commands, SSH/scp, encodings, cron, tmux, bash scripting" },
        { id: 's08', date: '2026-11-11', title: "Hands-on Linux labs 1–12" },
        { id: 's09', date: '2026-11-12', title: "Hands-on Linux labs 13–24" },
        { id: 's10', date: '2026-11-13', title: "Hands-on Linux labs 25–34 + review" },
      ],
    },
    {
      key: 'week-3',
      title: "Week 3 · Web & recon",
      sessions: [
        { id: 's11', date: '2026-11-16', title: "Web for hackers: HTTP, cookies & sessions, same-origin policy, encodings" },
        { id: 's12', date: '2026-11-17', title: "Burp Suite in depth + browser DevTools" },
        { id: 's13', date: '2026-11-18', title: "Recon I: subdomains, content discovery, fingerprinting" },
        { id: 's14', date: '2026-11-19', title: "Recon II: JavaScript analysis, parameters, OWASP testing checklist" },
        { id: 's15', date: '2026-11-20', title: "SQL injection I" },
      ],
    },
    {
      key: 'week-4',
      title: "Week 4 · Server-side I",
      sessions: [
        { id: 's16', date: '2026-11-23', title: "SQL injection II: blind, out-of-band, sqlmap" },
        { id: 's17', date: '2026-11-24', title: "Authentication vulnerabilities" },
        { id: 's18', date: '2026-11-25', title: "Path traversal + OS command injection" },
        { id: 's19', date: '2026-11-26', title: "Business logic vulnerabilities" },
        { id: 's20', date: '2026-11-27', title: "Information disclosure + weekly mini-CTF" },
      ],
    },
    {
      key: 'week-5',
      title: "Week 5 · Server-side II",
      sessions: [
        { id: 's21', date: '2026-11-30', title: "Access control & IDOR" },
        { id: 's22', date: '2026-12-01', title: "File upload vulnerabilities" },
        { id: 's23', date: '2026-12-02', title: "Race conditions + NoSQL injection" },
        { id: 's24', date: '2026-12-03', title: "Server-side request forgery (SSRF)" },
        { id: 's25', date: '2026-12-04', title: "XXE injection + web cache deception" },
      ],
    },
    {
      key: 'week-6',
      title: "Week 6 · Client-side & APIs",
      sessions: [
        { id: 's26', date: '2026-12-07', title: "Cross-site scripting (XSS) I" },
        { id: 's27', date: '2026-12-08', title: "XSS II + DOM-based vulnerabilities" },
        { id: 's28', date: '2026-12-09', title: "CSRF, CORS & clickjacking" },
        { id: 's29', date: '2026-12-10', title: "WebSockets + API testing (OWASP API Top 10)" },
        { id: 's30', date: '2026-12-11', title: "GraphQL API vulnerabilities + API labs" },
      ],
    },
    {
      key: 'week-7',
      title: "Week 7 · Advanced & AI",
      sessions: [
        { id: 's31', date: '2026-12-14', title: "Server-side template injection + insecure deserialization" },
        { id: 's32', date: '2026-12-15', title: "Web cache poisoning + HTTP Host header attacks" },
        { id: 's33', date: '2026-12-16', title: "HTTP request smuggling" },
        { id: 's34', date: '2026-12-17', title: "OAuth, JWT attacks & prototype pollution" },
        { id: 's35', date: '2026-12-18', title: "AI-era hacking: AI-assisted pentesting & attacking LLM features" },
      ],
    },
    {
      key: 'week-8',
      title: "Week 8 · Job-ready",
      sessions: [
        { id: 's36', date: '2026-12-21', title: "Reporting: structure, CVSS, evidence & remediation" },
        { id: 's37', date: '2026-12-22', title: "Capstone kickoff: testing OWASP Juice Shop" },
        { id: 's38', date: '2026-12-23', title: "Capstone working session (+ optional Python/nuclei automation)" },
        { id: 's39', date: '2026-12-24', title: "Capstone report reviews + getting started with bug bounty" },
        { id: 's40', date: '2026-12-25', title: "Career day: resume, LinkedIn, portfolio & interview questions" },
      ],
    },
    {
      key: 'wrap-up',
      title: "Wrap-up",
      sessions: [
        { id: 's41', date: '2026-12-28', title: "Capstone demos I" },
        { id: 's42', date: '2026-12-29', title: "Capstone demos II + mock interviews" },
        { id: 's43', date: '2026-12-30', title: "Mock interviews + doubt clearing" },
        { id: 's44', date: '2026-12-31', title: "Graduation: certification roadmap, referrals & next steps" },
      ],
    },
    ],
  },
];

export function catalogBySlug(slug: string): CatalogCourse | undefined {
  return CATALOG.find((c) => c.slug === slug);
}

export function catalogUrl(slug: string) {
  return `/courses/${slug}/`;
}

export function classroomUrl(slug: string) {
  return `/courses/${slug}/classroom/`;
}

/** Course content from the catalog, keeping recordings, PDFs and links already stored in Firestore. */
export function mergeCatalogContent(entry: CatalogCourse, existing: CourseContent | null): CourseContent {
  const old = existing?.modules ?? [];
  const used = new Set<CourseModule>();
  const modules: CourseModule[] = entry.weeks.map((week) => {
    const prev = old.find((m) => m.key === week.key) ?? old.find((m) => !m.key && m.title === week.title);
    if (prev) used.add(prev);
    const prevSessions = new Map((prev?.lessons ?? []).filter((l) => l.type === 'session').map((l) => [l.id, l]));
    const sessions: Lesson[] = week.sessions.map((s) => {
      const p = prevSessions.get(s.id);
      const youtubeId = p && p.type === 'session' ? p.youtubeId : undefined;
      return { id: s.id, type: 'session', title: s.title, date: s.date, ...(youtubeId ? { youtubeId } : {}) };
    });
    const extras = (prev?.lessons ?? []).filter((l) => l.type !== 'session');
    return { key: week.key, title: week.title, lessons: [...sessions, ...extras] };
  });
  // Never drop admin-added material: unknown modules stay at the end.
  for (const m of old) if (!used.has(m) && m.lessons.some((l) => l.type !== 'session')) modules.push({ ...m, lessons: m.lessons.filter((l) => l.type !== 'session') });
  return { modules, links: existing?.links ?? [] };
}

/** The public Firestore/course shape of a catalog entry. */
export function catalogToCourse(entry: CatalogCourse, enrolledCount = 0): Course {
  const content = mergeCatalogContent(entry, null);
  return {
    id: entry.slug,
    title: entry.title,
    description: entry.summary,
    priceUsd: entry.priceUsd,
    tier: entry.tier,
    published: true,
    order: -1000 + CATALOG.indexOf(entry),
    syllabus: syllabusOf(content),
    lessonCount: content.modules.reduce((n, m) => n + m.lessons.length, 0),
    format: entry.format,
    startDate: entry.startDate,
    endDate: entry.endDate,
    enrollBy: entry.enrollBy,
    classDays: entry.classDays,
    classStart: entry.classStart,
    classEnd: entry.classEnd,
    timeZone: entry.timeZone,
    seats: entry.seats,
    enrolledCount,
  };
}

/** Ready-to-send enrollment email from the learner to the course contact address. */
export function enrollmentMailto(entry: CatalogCourse, contact: string, learner: { name?: string | null; email?: string | null }) {
  const subject = `Enrollment request: ${entry.title}`;
  const body = [
    'Hi,',
    '',
    `I'd like to enroll in "${entry.title}" (batch starting ${entry.startDate}).`,
    '',
    `Name: ${learner.name || ''}`,
    `Google account: ${learner.email || ''}`,
    '',
    'Please let me know the next steps.',
  ].join('\n');
  return `mailto:${contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
