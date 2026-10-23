import Link from 'next/link';
import { BookOpen, CheckCircle2, FileText, Video } from 'lucide-react';
import PriceTag from './PriceTag';
import { courseUrl, type Course } from '@/lib/courses/types';

export default function CourseCard({ course, enrolled }: { course: Course; enrolled: boolean }) {
  const videos = course.syllabus.reduce((n, m) => n + m.lessons.filter((l) => l.type === 'video').length, 0);
  const pdfs = course.lessonCount - videos;

  return (
    <article className="group relative flex flex-col h-full overflow-hidden rounded-xl border border-green-500/10 bg-black/40 backdrop-blur-md p-6 transition-all duration-300 hover:border-green-500/40 hover:shadow-[0_0_40px_rgba(0,255,0,0.1)]">
      <div className="flex items-center justify-between gap-2 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-green-500/60 font-bold mb-4">
        <span className="flex items-center gap-2"><BookOpen size={14} /> {course.tier}</span>
        {enrolled && <span className="flex items-center gap-1 text-green-300"><CheckCircle2 size={14} /> Enrolled</span>}
      </div>
      <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-green-400 transition-colors leading-tight uppercase italic tracking-tight mb-3">
        <Link href={courseUrl(course.id)} className="after:absolute after:inset-0">{course.title}</Link>
      </h3>
      <p className="text-white/60 text-sm md:text-base leading-relaxed line-clamp-3 font-mono mb-6">{course.description}</p>
      <div className="mt-auto space-y-4">
        <div className="flex flex-wrap gap-4 text-xs text-green-500/70 font-mono uppercase tracking-widest">
          <span>{course.syllabus.length} modules</span>
          {videos > 0 && <span className="flex items-center gap-1"><Video size={12} /> {videos}</span>}
          {pdfs > 0 && <span className="flex items-center gap-1"><FileText size={12} /> {pdfs}</span>}
        </div>
        {/* Above the stretched link so the currency button stays clickable */}
        <div className="relative z-10">
          {enrolled ? (
            <Link href={courseUrl(course.id)} className="inline-block px-5 py-2 bg-green-500 text-black font-bold uppercase tracking-widest text-xs rounded-lg">Continue</Link>
          ) : (
            <PriceTag priceUsd={course.priceUsd} />
          )}
        </div>
      </div>
    </article>
  );
}
