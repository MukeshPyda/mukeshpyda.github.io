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
      title: "Week 1 · Foundations & Linux",
      sessions: [
        { id: 's01', date: '2026-11-02', title: "Orientation, lab architecture & rules of engagement: scoping, authorization, operating safely with AI assistants" },
        { id: 's02', date: '2026-11-03', title: "Network foundations for offensive security: TCP/IP, DNS, TLS 1.3, HTTP/1.1, HTTP/2 & HTTP/3" },
        { id: 's03', date: '2026-11-04', title: "Linux internals & the command line: filesystem, permissions, SUID & capabilities, processes, services" },
        { id: 's04', date: '2026-11-05', title: "Offensive Linux & shell craft: scripting, text processing, automation, tooling setup" },
        { id: 's05', date: '2026-11-06', title: "Guided Linux labs: enumeration, privilege & filesystem drills" },
      ],
    },
    {
      key: 'week-2',
      title: "Week 2 · Web Foundations & Reconnaissance",
      sessions: [
        { id: 's06', date: '2026-11-09', title: "HTTP protocol deep dive: state, sessions, caching semantics, header & encoding behavior" },
        { id: 's07', date: '2026-11-10', title: "The modern web attack surface: SPAs, REST & GraphQL APIs, microservices, cloud edge & CDNs" },
        { id: 's08', date: '2026-11-11', title: "Attack-surface mapping & asset discovery: subdomain, content & parameter discovery" },
        { id: 's09', date: '2026-11-12', title: "Client-side reconnaissance: JavaScript analysis, source maps, hidden & undocumented endpoints" },
        { id: 's10', date: '2026-11-13', title: "Interception workflow & a repeatable, evidence-driven testing methodology" },
      ],
    },
    {
      key: 'week-3',
      title: "Week 3 · Server-Side Exploitation I",
      sessions: [
        { id: 's11', date: '2026-11-16', title: "Advanced SQL injection: blind, time-based, out-of-band, second-order & filter evasion" },
        { id: 's12', date: '2026-11-17', title: "NoSQL, ORM & query-language injection" },
        { id: 's13', date: '2026-11-18', title: "OS command & argument injection: blind and chained execution" },
        { id: 's14', date: '2026-11-19', title: "Path traversal, LFI/RFI & file-handling abuse" },
        { id: 's15', date: '2026-11-20', title: "Unrestricted file upload to code execution: content-type, polyglot & parser confusion" },
      ],
    },
    {
      key: 'week-4',
      title: "Week 4 · Server-Side Exploitation II",
      sessions: [
        { id: 's16', date: '2026-11-23', title: "Server-side request forgery (SSRF): blind SSRF, cloud metadata & internal pivoting" },
        { id: 's17', date: '2026-11-24', title: "XML external entities (XXE) & insecure deserialization: object injection to RCE" },
        { id: 's18', date: '2026-11-25', title: "Server-side template injection (SSTI): sandbox escapes to RCE" },
        { id: 's19', date: '2026-11-26', title: "Authentication & session attacks: fixation, token prediction, MFA weaknesses" },
        { id: 's20', date: '2026-11-27', title: "Broken access control & business-logic flaws: IDOR, broken function-level authorization, workflow abuse" },
      ],
    },
    {
      key: 'week-5',
      title: "Week 5 · Client-Side Exploitation",
      sessions: [
        { id: 's21', date: '2026-11-30', title: "Cross-site scripting: reflected, stored & context-aware payload construction" },
        { id: 's22', date: '2026-12-01', title: "DOM-based XSS & DOM clobbering: source/sink analysis in modern frameworks" },
        { id: 's23', date: '2026-12-02', title: "CSRF, CORS misconfiguration & SameSite bypass" },
        { id: 's24', date: '2026-12-03', title: "Clickjacking, UI redressing & cross-origin leaks (XS-Leaks)" },
        { id: 's25', date: '2026-12-04', title: "Client-side prototype pollution & browser-side supply-chain risks" },
      ],
    },
    {
      key: 'week-6',
      title: "Week 6 · Advanced Exploitation & AI I",
      sessions: [
        { id: 's26', date: '2026-12-07', title: "Web cache poisoning & cache deception" },
        { id: 's27', date: '2026-12-08', title: "HTTP request smuggling (CL.TE / TE.CL) & HTTP/2 desync" },
        { id: 's28', date: '2026-12-09', title: "HTTP Host header & routing-based attacks" },
        { id: 's29', date: '2026-12-10', title: "OAuth 2.0 / OIDC & JWT exploitation: flow abuse, key confusion, token forgery" },
        { id: 's30', date: '2026-12-11', title: "GraphQL & REST API exploitation: introspection abuse, batching & authorization gaps (OWASP API Security Top 10)" },
      ],
    },
    {
      key: 'week-7',
      title: "Week 7 · Advanced Exploitation & AI II",
      sessions: [
        { id: 's31', date: '2026-12-14', title: "Server-side prototype pollution & gadget-chain exploitation" },
        { id: 's32', date: '2026-12-15', title: "Race conditions & concurrency flaws: limit-overrun & multi-endpoint" },
        { id: 's33', date: '2026-12-16', title: "AI-augmented offensive testing: LLM-driven recon, analysis & payload synthesis, with verification and opsec" },
        { id: 's34', date: '2026-12-17', title: "Attacking LLM-powered applications I: prompt injection (direct & indirect) & insecure output handling" },
        { id: 's35', date: '2026-12-18', title: "Attacking LLM-powered applications II: excessive agency, tool-call abuse & data/model leakage (OWASP LLM Top 10)" },
      ],
    },
    {
      key: 'week-8',
      title: "Week 8 · Job-Ready",
      sessions: [
        { id: 's36', date: '2026-12-21', title: "Professional reporting & risk communication: CVSS, evidence, executive & technical narratives" },
        { id: 's37', date: '2026-12-22', title: "Capstone engagement kickoff: scoping & testing a deliberately vulnerable application" },
        { id: 's38', date: '2026-12-23', title: "Capstone working session: full-chain exploitation (+ optional offensive automation with Python & nuclei)" },
        { id: 's39', date: '2026-12-24', title: "Capstone debrief & mentor-reviewed report for your portfolio" },
        { id: 's40', date: '2026-12-25', title: "Career launch: resume, LinkedIn, GitHub portfolio & interview question bank" },
      ],
    },
    {
      key: 'wrap-up',
      title: "Wrap-up",
      sessions: [
        { id: 's41', date: '2026-12-28', title: "Capstone demonstrations & peer review" },
        { id: 's42', date: '2026-12-29', title: "Mock technical interviews I" },
        { id: 's43', date: '2026-12-30', title: "Mock technical interviews II & doubt clearing" },
        { id: 's44', date: '2026-12-31', title: "Graduation: certification roadmap (eJPT, PNPT/BSCP, OSWE/OSCP), referrals & next steps" },
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
