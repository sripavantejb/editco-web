import { blog1To5 } from "./blog-1";
import { blog6To10 } from "./blog-2";
import { blog11To15 } from "./blog-3";
import { blog16To20 } from "./blog-4";
import { parseBlogContent, type BlogFaqItem } from "@/lib/parseBlogFaqs";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  accent: string;
  date: string;
  readTime: string;
  content?: string;
  faqs?: BlogFaqItem[];
};

const rawBlogPosts: BlogPost[] = [
  {
    slug: "ai-call-agent-why-your-business-needs-one",
    title: "What Is an AI Call Agent — And Why Your Business Needs One Right Now",
    excerpt: "An AI call agent listens, understands, thinks, and responds — just like a real person. It answers calls 24/7, books appointments, and updates your CRM while you sleep.",
    category: "AI Agents",
    accent: "#ff8c61",
    date: "2026-05-01",
    readTime: "5 min",
  },
  {
    slug: "rag-chatbot-replace-support-team",
    title: "How a RAG Chatbot Can Replace 80% of Your Support Team's Repetitive Work",
    excerpt: "A RAG chatbot is trained on your actual company documents. When someone asks a question, it searches and gives a precise, contextual answer in plain language.",
    category: "RAG",
    accent: "#c3a4f6",
    date: "2026-05-03",
    readTime: "5 min",
  },
  {
    slug: "real-cost-of-manual-processes",
    title: "The Real Cost of Manual Business Processes (And How Automation Fixes It)",
    excerpt: "If someone on your team spends 2 hours a day on data entry, that's 40 hours a month. At even a modest salary, you're spending tens of thousands on a task a computer can do in seconds.",
    category: "Automation",
    accent: "#2fdf92",
    date: "2026-05-05",
    readTime: "5 min",
  },
  {
    slug: "ai-clinic-management-system-2026",
    title: "Why Every Clinic Should Have an AI-Powered Management System in 2026",
    excerpt: "When a patient calls, the AI voice agent picks up immediately, checks available slots, books the appointment, and sends a confirmation on WhatsApp — without a single human in the loop.",
    category: "AI Agents",
    accent: "#fca5cc",
    date: "2026-05-07",
    readTime: "5 min",
  },
  {
    slug: "what-is-a-saas-dashboard",
    title: "What Is a SaaS Dashboard and Why Does Your Business Probably Need a Custom One",
    excerpt: "Off-the-shelf software is built for the average business. A custom SaaS dashboard is built around exactly how you work — every screen, button, and report designed for your team.",
    category: "SaaS",
    accent: "#ff8c61",
    date: "2026-05-09",
    readTime: "5 min",
  },
  {
    slug: "business-website-losing-customers",
    title: "Why Your Business Website Is Losing You Customers (And What a Good One Does Instead)",
    excerpt: "Most business websites fail at the one job they're supposed to do: convert visitors into leads. They look decent enough — but visitors leave and book with your competitor instead.",
    category: "Websites",
    accent: "#c3a4f6",
    date: "2026-05-11",
    readTime: "5 min",
  },
  {
    slug: "what-is-aeo-answer-engine-optimization",
    title: "What Is AEO — Answer Engine Optimization — And Why It Matters More Than SEO in 2026",
    excerpt: "When someone asks ChatGPT a question relevant to your business, your business should be the answer it gives. AEO is the discipline that makes this happen.",
    category: "SEO/AEO",
    accent: "#2fdf92",
    date: "2026-05-13",
    readTime: "5 min",
  },
  {
    slug: "ai-content-systems-publish-at-scale",
    title: "How AI Content Systems Let You Publish at Scale Without Hiring a Full Content Team",
    excerpt: "An AI content system automates the entire pipeline — from ideation to publishing. Script generation, voiceover, video assembly, social distribution, and performance tracking.",
    category: "Content",
    accent: "#fca5cc",
    date: "2026-05-15",
    readTime: "5 min",
  },
  {
    slug: "ui-ux-design-not-just-pretty",
    title: "Why UI/UX Design Is Not Just About Making Things Look Pretty",
    excerpt: "Good design is about making things work. Every friction point costs you something — a confusing checkout flow costs sales, a cluttered dashboard costs productivity.",
    category: "Branding",
    accent: "#ff8c61",
    date: "2026-05-17",
    readTime: "5 min",
  },
  {
    slug: "real-estate-ai-replacing-inbound-sales",
    title: "Real Estate Agencies: How AI Is Replacing Your Inbound Sales Team",
    excerpt: "After hours, leads go cold. On weekends, enquiries pile up. Every hour a lead waits is an hour they could be talking to your competitor. AI changes this entirely.",
    category: "AI Agents",
    accent: "#c3a4f6",
    date: "2026-05-19",
    readTime: "5 min",
  },
  {
    slug: "what-is-n8n-workflow-automation",
    title: "What Is n8n and Why the Best Businesses Are Using It for Workflow Automation",
    excerpt: "n8n is an open-source workflow automation platform — the central nervous system of your business operations. It connects your tools and triggers actions automatically.",
    category: "Automation",
    accent: "#2fdf92",
    date: "2026-05-21",
    readTime: "5 min",
  },
  {
    slug: "build-website-that-ranks-on-google",
    title: "How to Build a Business Website That Ranks on Google From Day One",
    excerpt: "SEO is not something you add after a website is built. It has to be baked into the architecture, the code, and the content structure from the very first line of development.",
    category: "SEO/AEO",
    accent: "#fca5cc",
    date: "2026-05-23",
    readTime: "6 min",
  },
  {
    slug: "whatsapp-business-automation-india",
    title: "WhatsApp Business Automation: The Most Underused Growth Tool for Indian Businesses",
    excerpt: "India runs on WhatsApp. Your customers are on it all day. Yet most businesses still treat it as a manual tool — leaving massive efficiency and revenue on the table.",
    category: "Automation",
    accent: "#ff8c61",
    date: "2026-05-25",
    readTime: "5 min",
  },
  {
    slug: "voice-cloning-ai-agents-brand",
    title: "What Is Voice Cloning and How AI Agents Use It to Sound Like Your Brand",
    excerpt: "Modern AI voice agents use voice cloning technology — the voice your callers hear is warm, natural, and designed for your brand. Most callers can't tell it's AI.",
    category: "AI Agents",
    accent: "#c3a4f6",
    date: "2026-05-27",
    readTime: "4 min",
  },
  {
    slug: "small-business-automated-lead-follow-up",
    title: "Why Small Businesses in India Are Automating Lead Follow-Up (And What Happens When They Do)",
    excerpt: "The odds of converting a lead drop dramatically after the first hour. After 24 hours, you're fighting an uphill battle. Automation solves this problem completely.",
    category: "Automation",
    accent: "#2fdf92",
    date: "2026-05-29",
    readTime: "5 min",
  },
  {
    slug: "business-owners-guide-to-ai-agents",
    title: "The Business Owner's Guide to Understanding AI Agents (Without the Technical Jargon)",
    excerpt: "AI agent. RAG system. LLM. Vector database. You don't need to understand the engineering. You just need to know what these systems do and when they make sense.",
    category: "AI Agents",
    accent: "#fca5cc",
    date: "2026-05-31",
    readTime: "5 min",
  },
  {
    slug: "internal-knowledge-base-team-will-use",
    title: "How to Build an Internal Knowledge Base That Your Team Will Actually Use",
    excerpt: "An AI-powered knowledge base lets you ask a question in plain language and get a specific, contextual answer — the same way you'd ask a knowledgeable colleague.",
    category: "RAG",
    accent: "#ff8c61",
    date: "2026-06-02",
    readTime: "5 min",
  },
  {
    slug: "good-enough-web-design-killing-brand",
    title: "Why 'Good Enough' Web Design Is Quietly Killing Your Brand",
    excerpt: "The website built in 2020. The logo made in Canva. Together, they signal to customers: this business doesn't take itself seriously. And if you don't, why should they?",
    category: "Branding",
    accent: "#c3a4f6",
    date: "2026-06-04",
    readTime: "5 min",
  },
  {
    slug: "ai-changing-customer-support",
    title: "How AI Is Changing Customer Support — And What It Means for Your Business",
    excerpt: "AI handles what it can and escalates what it can't — with full context — to a human agent. No customer has to explain themselves twice. Support never stops at 6 PM.",
    category: "AI Agents",
    accent: "#2fdf92",
    date: "2026-06-06",
    readTime: "5 min",
  },
  {
    slug: "is-your-business-ready-for-ai-checklist",
    title: "How to Know If Your Business Is Ready for AI — A Practical Checklist",
    excerpt: "AI is genuinely useful for specific business problems. It's not a magic fix for everything. Knowing the difference separates businesses that get real ROI from ones that don't.",
    category: "AI Agents",
    accent: "#fca5cc",
    date: "2026-06-08",
    readTime: "6 min",
  },
];

const allContents = [...blog1To5, ...blog6To10, ...blog11To15, ...blog16To20];

type BlogContentEntry = {
  slug: string;
  content: string;
  faqs?: BlogFaqItem[];
};

export const blogPosts: BlogPost[] = rawBlogPosts.map((post) => {
  const contentObj = allContents.find((c) => c.slug === post.slug) as
    | BlogContentEntry
    | undefined;
  if (!contentObj?.content) {
    return { ...post, content: undefined, faqs: [] };
  }
  if (contentObj.faqs?.length) {
    return { ...post, content: contentObj.content, faqs: contentObj.faqs };
  }
  const { content, faqs } = parseBlogContent(contentObj.content);
  return { ...post, content, faqs };
});

export const categoryColors: Record<string, string> = {
  "AI Agents": "#ff8c61",
  "RAG": "#c3a4f6",
  "Automation": "#2fdf92",
  "Websites": "#fca5cc",
  "SaaS": "#ff8c61",
  "Content": "#c3a4f6",
  "Branding": "#2fdf92",
  "SEO/AEO": "#fca5cc",
};

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
