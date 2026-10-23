export interface BlogStep {
  title: string;
  description?: string;
  code?: string;
  images?: string[];
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  date: string;
  summary: string;
  videoUrl?: string;
  steps: BlogStep[];
  mainImage: string;
  tags: string[];
}
