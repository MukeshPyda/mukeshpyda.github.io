export interface TimelineEvent {
  id: number;
  title: string;
  date: string;
  summary: string;
  description: string;
  mainImage: string;
  collage: string[];
}

export const initialTimelineData: TimelineEvent[] = [
  {
    id: 1,
    title: "Global VAPT Operation",
    date: "January 2025",
    summary: "Mukesh Pyda led a comprehensive security audit for a Fortune 500 firm.",
    description: "In this high-stakes engagement, Mukesh demonstrated expert-level mastery of offensive security, identifying critical zero-day vulnerabilities and architecting a zero-trust recovery plan.",
    mainImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    collage: []
  }
];

export const siteConfig = {
  name: "Mukesh Pyda",
  role: "Elite Cybersecurity Specialist",
  bio: "A visionary in digital defense. Mukesh has spent years securing global infrastructures and mentoring the next generation of security leaders through his direct, hands-on expertise.",
  adminHash: "83e57f12c140c83a73c15381a179374092b37267f5c78663b652758f1f54d19b" // 'nimukesh'
};
