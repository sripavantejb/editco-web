"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { 
  Globe, 
  PhoneCall, 
  MessageSquare, 
  Database, 
  Search, 
  TrendingUp, 
  Check, 
  X, 
  ArrowRight, 
  Sparkles,
  Building,
  GraduationCap,
  Home as HomeIcon,
  Utensils,
  UserCheck,
  Briefcase,
  Activity,
  Award
} from "lucide-react";
import { FooterSection } from "@/components/sections/FooterSection";
import { CalInlineEmbed } from "@/components/cal/CalInlineEmbed";
export default function ServicesPage() {
  const leadFormRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToLeadForm = () => {
    const el = document.getElementById("lead-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const servicesData = [
    {
      id: "web-dev",
      title: "Website Design & Development",
      icon: Globe,
      color: "gaude-orange",
      description: "We build professional, fast, mobile-friendly websites that create trust, explain your services clearly, and convert visitors into leads.",
      bullets: [
        "Business websites",
        "Clinic websites",
        "Landing pages",
        "Service pages",
        "Booking-focused websites",
        "SEO-ready structure"
      ],
      detailedHeading: "Websites That Make People Trust You Before They Call You",
      detailedParagraph: "Your website is often the first impression of your business. We design websites that are clean, professional, fast, and built with a clear purpose — to convert visitors into enquiries.",
      detailedFocus: [
        "Clear hero section",
        "Strong service explanation",
        "Trust-building layout",
        "Mobile-first design",
        "Lead capture forms",
        "WhatsApp and call buttons",
        "SEO-friendly pages",
        "Fast loading experience"
      ],
      bestFor: ["Clinics", "Schools", "Consultants", "Agencies", "Restaurants", "Local service businesses"],
      ctaText: "Build My Website"
    },
    {
      id: "ai-calling",
      title: "AI Calling Agents",
      icon: PhoneCall,
      color: "gaude-purple",
      description: "We create AI voice agents that can answer calls, handle common customer questions, collect lead information, and reduce missed opportunities.",
      bullets: [
        "Missed call handling",
        "Lead qualification",
        "Appointment enquiry support",
        "Multi-language conversations",
        "Call summaries",
        "Human handoff support"
      ],
      detailedHeading: "Never Lose a Lead Because of a Missed Call",
      detailedParagraph: "When customers call and no one answers, the lead is usually lost. Our AI calling agents help businesses handle enquiries, answer common questions, collect details, and push interested leads to the next step.",
      detailedFocus: [
        "Answer incoming calls",
        "Handle after-working-hour enquiries",
        "Collect customer name, phone number, and requirement",
        "Answer repeated questions",
        "Share appointment or service information",
        "Send summaries to the team",
        "Transfer to human when needed"
      ],
      bestFor: ["Clinics", "Hospitals", "Real estate businesses", "Education consultants", "Service agencies", "High-volume enquiry businesses"],
      ctaText: "Automate My Calls"
    },
    {
      id: "whatsapp-auto",
      title: "WhatsApp Automations",
      icon: MessageSquare,
      color: "gaude-green",
      description: "We automate WhatsApp conversations so your leads receive instant replies, reminders, updates, and follow-ups without manual effort.",
      bullets: [
        "Lead follow-ups",
        "Appointment reminders",
        "Demo reminders",
        "Customer support flows",
        "Broadcast journeys",
        "Personalized messages"
      ],
      detailedHeading: "Turn WhatsApp Into a Follow-Up Machine",
      detailedParagraph: "Most businesses receive leads but fail to follow up properly. We build WhatsApp automations that send timely messages, reminders, updates, and next-step instructions automatically.",
      detailedFocus: [
        "New lead welcome message",
        "Appointment reminder",
        "Demo reminder",
        "Payment follow-up",
        "Service update",
        "Customer support flow",
        "Reactivation campaign"
      ],
      bestFor: ["Clinics", "Consultants", "Agencies", "Education businesses", "Local businesses"],
      ctaText: "Automate WhatsApp"
    },
    {
      id: "crm-systems",
      title: "CRM & Lead Tracking Systems",
      icon: Database,
      color: "gaude-pink",
      description: "We build custom lead management systems where you can track every lead, status, payment, follow-up, and conversion in one place.",
      bullets: [
        "Lead dashboard",
        "Follow-up tracking",
        "Revenue tracking",
        "Pipeline stages",
        "Team activity tracking",
        "Reports and analytics"
      ],
      detailedHeading: "Track Every Lead, Every Status, Every Rupee",
      detailedParagraph: "Instead of managing leads in notebooks, Excel sheets, or random WhatsApp chats, we build a custom dashboard where your team can clearly track the entire business pipeline.",
      detailedFocus: [
        "New lead tracking",
        "Lead status management",
        "Follow-up reminders",
        "Payment status",
        "Revenue dashboard",
        "Team-wise lead ownership",
        "Conversion analytics",
        "Customer history"
      ],
      bestFor: ["Agencies", "Clinics", "Sales teams", "Consultants", "Service businesses"],
      ctaText: "Build My CRM"
    },
    {
      id: "seo-aeo-geo",
      title: "SEO, AEO & GEO Optimization",
      icon: Search,
      color: "blue-500",
      description: "We optimize your online presence so your business can appear better on Google, Google Maps, AI search engines, and answer-based platforms.",
      bullets: [
        "Website SEO",
        "Google Maps optimization",
        "Local SEO",
        "Answer Engine Optimization",
        "Geo-targeted content",
        "Service page optimization"
      ],
      detailedHeading: "Get Found Where Your Customers Are Searching",
      detailedParagraph: "People are no longer searching only on Google. They are asking AI tools, maps, and answer engines. We help your business become discoverable across search platforms.",
      detailedFocus: [
        "Google search optimization",
        "Google Maps visibility",
        "Location-based service pages",
        "FAQ-based content",
        "AI-search friendly content",
        "Schema markup",
        "Local keyword targeting"
      ],
      bestFor: ["Local businesses", "Clinics", "Restaurants", "Schools", "Consultants", "Service brands"],
      ctaText: "Improve My Visibility"
    },
    {
      id: "growth-systems",
      title: "Growth Systems & Marketing Funnels",
      icon: TrendingUp,
      color: "yellow-500",
      description: "We create complete growth funnels that bring traffic, capture leads, nurture them, and help convert them into paying customers.",
      bullets: [
        "Landing pages",
        "Lead magnets",
        "Ad funnel pages",
        "Follow-up automations",
        "Retargeting strategy",
        "Analytics tracking"
      ],
      detailedHeading: "Build a System That Brings, Tracks, and Converts Leads",
      detailedParagraph: "Growth does not come from one random ad or one website page. We build complete systems that connect your website, landing pages, WhatsApp, CRM, automation, and analytics together.",
      detailedFocus: [
        "Lead capture funnel",
        "Landing page strategy",
        "Follow-up automation",
        "Conversion copywriting",
        "Retargeting structure",
        "Analytics setup",
        "Customer journey tracking"
      ],
      bestFor: ["Businesses wanting predictable leads", "Agencies", "Clinics", "Education businesses", "High-ticket service providers"],
      ctaText: "Create My Growth System"
    }
  ];

  const withoutEditco = [
    "Basic website with no clear conversion flow",
    "Missed calls become missed revenue",
    "Manual WhatsApp replies take time",
    "Leads are scattered across phone, WhatsApp, and Excel",
    "Business depends only on referrals",
    "No proper tracking of customer journey",
    "Team wastes time on repeated tasks",
    "Customers forget appointments or demos",
    "Poor online trust"
  ];

  const withEditco = [
    "Conversion-focused website built to generate leads",
    "AI calling system captures and handles enquiries",
    "Automated WhatsApp follow-ups and reminders",
    "Central CRM to track every lead and payment",
    "SEO, AEO, and local visibility bring organic leads",
    "Complete funnel and analytics tracking",
    "Automations reduce manual work",
    "Reminder systems improve attendance",
    "Professional brand presence builds credibility"
  ];

  const industries = [
    { title: "Clinics & Hospitals", icon: Activity, text: "Automate calls, appointment enquiries, reminders, and patient lead tracking." },
    { title: "Schools & Colleges", icon: GraduationCap, text: "Generate enquiries, manage admissions leads, and improve parent communication." },
    { title: "Real Estate Businesses", icon: HomeIcon, text: "Capture property enquiries, qualify leads, and automate follow-ups." },
    { title: "Restaurants & Cafes", icon: Utensils, text: "Improve discovery, bookings, online presence, and customer engagement." },
    { title: "Consultants & Coaches", icon: UserCheck, text: "Build trust, capture leads, and automate client onboarding." },
    { title: "Agencies & Service Companies", icon: Briefcase, text: "Track clients, automate operations, and manage growth systems." },
    { title: "Gyms & Wellness Centers", icon: Award, text: "Handle enquiries, follow-ups, memberships, and class reminders." },
    { title: "Local High-Revenue Businesses", icon: Building, text: "Create a strong digital presence and convert more local customers." }
  ];

  return (
    <div className="relative w-full overflow-x-clip bg-gaude-black text-white pt-20 sm:pt-24">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[5%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gaude-orange/10 blur-[130px]" />
        <div className="absolute top-[25%] right-[-10%] h-[700px] w-[700px] rounded-full bg-gaude-purple/8 blur-[160px]" />
        <div className="absolute bottom-[20%] left-[-5%] h-[500px] w-[500px] rounded-full bg-gaude-green/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.02] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-6 py-12 md:py-24">
        <div className="max-w-3xl">
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-gaude-orange/30 bg-gaude-orange/5 px-4 py-1.5 backdrop-blur-sm mb-6">
                <Sparkles size={14} className="text-gaude-orange animate-pulse" />
                <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-gaude-orange/95">
                  OUR SERVICES
                </span>
              </div>
              
              <h1 className="font-archivo text-[clamp(2rem,5.5vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tighter text-white">
                Services That Turn <br />
                Your Business Into <br />
                A <span className="text-gaude-orange">Growth System</span>
              </h1>
              
              <p className="mt-6 max-w-[640px] font-inter text-base font-medium leading-relaxed text-white/70 md:text-xl">
                At Editco Media, we build smart websites, AI automations, growth systems, and digital experiences that help businesses get more leads, reduce manual work, and convert better.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={(e) => scrollToSection(e, "lead-form")}
                  className="flex h-14 cursor-pointer items-center justify-center rounded-full bg-gaude-orange border border-gaude-orange px-8 font-archivo text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Start Your Transformation
                </button>
                <button
                  onClick={(e) => scrollToSection(e, "overview")}
                  className="flex h-14 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-8 font-archivo text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-white/40"
                >
                  Explore Services
                </button>
              </div>

              <p className="mt-8 font-inter text-xs font-semibold tracking-wider text-white/40 uppercase">
                Built for clinics, schools, agencies, consultants, local businesses, and high-growth service brands.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES OVERVIEW SECTION */}
      <section id="overview" className="relative z-10 mx-auto max-w-[1200px] px-6 py-16 md:py-28">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-gaude-orange/90">
            SOLUTIONS FOR PROGRESS
          </span>
          <h2 className="mt-3 font-archivo text-3xl uppercase leading-[0.95] tracking-tighter text-white md:text-5xl lg:text-6xl">
            What We Build <br /> For Your Business
          </h2>
          <p className="mt-6 font-inter text-base font-medium leading-relaxed text-white/70 md:text-xl">
            We do not just design websites or create automations. We build complete digital systems that help your business attract, manage, and convert customers more effectively.
          </p>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {servicesData.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl transition-all hover:border-white/25 hover:bg-white/[0.08]"
            >
              <div>
                {/* Header Icon */}
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 bg-${service.color}/10 border border-${service.color}/20 text-white`}>
                  <service.icon size={22} className={`text-${service.color}`} />
                </div>
                
                <h3 className="font-space-grotesk text-xl font-bold uppercase tracking-tight text-white group-hover:text-gaude-orange transition-colors">
                  {service.title}
                </h3>
                
                <p className="mt-4 font-inter text-sm leading-relaxed text-white/70">
                  {service.description}
                </p>

                {/* Bullets */}
                <ul className="mt-6 space-y-3">
                  {service.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-white/80 font-medium">
                      <Check size={14} className="text-gaude-green shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={scrollToLeadForm}
                  className="group/btn flex items-center gap-2 font-archivo text-[10px] font-bold uppercase tracking-widest text-gaude-orange group-hover:text-white transition-colors"
                >
                  <span>{service.ctaText}</span>
                  <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. WITH EDITCO VS WITHOUT EDITCO COMPARISON SECTION */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-6 py-16 md:py-28">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-gaude-orange/90">
            GROWTH VS LOSS
          </span>
          <h2 className="mt-3 font-archivo text-3xl uppercase leading-[0.95] tracking-tighter text-white md:text-5xl lg:text-6xl">
            The Difference <br /> Is Not Just Design. <span className="text-gaude-orange">It Is Growth.</span>
          </h2>
          <p className="mt-6 font-inter text-base font-medium leading-relaxed text-white/70 md:text-xl">
            Most businesses lose leads because they depend only on manual follow-ups, basic websites, and random marketing. Editco helps you build a system that works even when your team is busy.
          </p>
        </div>

        {/* Parallel Comparison Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
          {/* WITHOUT EDITCO - Dull/Red Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-red-950/40 bg-red-950/10 p-8 backdrop-blur-md shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 border-b border-red-950/40 pb-6 mb-8">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <X size={20} className="text-red-400" />
                </div>
                <h3 className="font-archivo text-2xl uppercase tracking-tighter text-red-400">
                  Without Editco
                </h3>
              </div>

              <ul className="space-y-4">
                {withoutEditco.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-white/60">
                    <X size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-8 border-t border-red-950/40 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-400/60 text-center">
                High friction, lost opportunities, and heavy manual workload.
              </p>
            </div>
          </motion.div>

          {/* WITH EDITCO - Premium Green Glowing Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl border border-gaude-green/30 bg-gaude-green/5 p-8 backdrop-blur-md shadow-[0_0_50px_rgba(47,223,146,0.15)] flex flex-col justify-between"
          >
            {/* Green Glow */}
            <div className="absolute top-0 right-0 h-[250px] w-[250px] rounded-full bg-gaude-green/10 blur-[80px] pointer-events-none" />

            <div>
              <div className="flex flex-col gap-3 border-b border-gaude-green/20 pb-6 mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gaude-green/10 flex items-center justify-center">
                    <Check size={20} className="text-gaude-green" />
                  </div>
                  <h3 className="font-archivo text-xl uppercase tracking-tighter text-gaude-green sm:text-2xl">
                    With Editco
                  </h3>
                </div>
                
                <span className="w-fit rounded-full bg-gaude-green/15 px-3 py-1 font-inter text-[9px] font-black uppercase tracking-widest text-gaude-green">
                  THE FUTURE
                </span>
              </div>

              <ul className="space-y-4">
                {withEditco.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-white/90 font-medium">
                    <Check size={16} className="text-gaude-green shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-8 border-t border-gaude-green/20 pt-6">
              <button
                onClick={(e) => scrollToSection(e, "lead-form")}
                className="w-full flex h-12 cursor-pointer items-center justify-center rounded-full bg-gaude-green px-8 font-archivo text-[10px] font-bold uppercase tracking-widest text-black shadow-lg transition-transform hover:scale-102 active:scale-98"
              >
                Let's Build Your System
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. DETAILED SERVICE BREAKDOWN SECTION */}
      <section id="details" className="relative z-10 bg-[#050505] border-y border-white/5 py-16 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-gaude-orange/90">
              DEEP DIVES
            </span>
            <h2 className="mt-3 font-archivo text-3xl uppercase leading-[0.95] tracking-tighter text-white md:text-5xl lg:text-6xl">
              Systems Designed <br /> For Absolute Performance
            </h2>
          </div>

          <div className="flex flex-col gap-24 md:gap-36">
            {servicesData.map((service, index) => (
              <div 
                key={service.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Left/Detailed side */}
                <div className={`lg:col-span-7 flex flex-col items-start ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="font-archivo text-5xl md:text-7xl font-black text-white/5 select-none leading-none tracking-tighter block mb-2">
                      0{index + 1}
                    </span>
                    
                    <h3 className="font-space-grotesk text-2xl md:text-4xl font-black uppercase leading-tight tracking-tight text-white mb-6">
                      {service.detailedHeading}
                    </h3>
                    
                    <p className="font-inter text-base md:text-lg font-medium leading-relaxed text-white/70 mb-8">
                      {service.detailedParagraph}
                    </p>

                    <div className="mb-8">
                      <p className="font-archivo text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                        KEY AREAS OF FOCUS:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {service.detailedFocus.map((focus, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-gaude-orange" />
                            <span className="font-inter text-xs text-white/80 font-medium">{focus}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className="font-archivo text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                        BEST SUITED FOR:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {service.bestFor.map((bf, bfIdx) => (
                          <span key={bfIdx} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-inter text-[10px] font-bold uppercase tracking-wider text-white/60">
                            {bf}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={scrollToLeadForm}
                      className="flex h-12 cursor-pointer items-center justify-center rounded-full bg-gaude-orange px-8 font-archivo text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                      {service.ctaText}
                    </button>
                  </motion.div>
                </div>

                {/* Visual Graphic Representation */}
                <div className={`lg:col-span-5 flex items-center justify-center ${
                  index % 2 === 1 ? "lg:order-1" : ""
                }`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-[400px] min-h-[240px] h-auto sm:h-[280px] md:h-[300px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 h-[150px] w-[150px] rounded-full bg-gaude-orange/5 blur-[50px] pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-${service.color}/10 border border-${service.color}/20 text-white`}>
                        <service.icon size={22} className={`text-${service.color}`} />
                      </div>
                      <span className="font-archivo text-xs font-black tracking-widest text-white/20">EDITCO</span>
                    </div>

                    <div className="my-6">
                      <p className="font-space-grotesk text-xl font-bold uppercase tracking-tight text-white mb-2">
                        {service.title}
                      </p>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-3">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "100%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                          className="h-full bg-gaude-orange"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-4">
                      <Sparkles size={16} className="text-gaude-orange shrink-0" />
                      <p className="font-inter text-xs text-white/70 font-medium">
                        Standardizing workflows, capturing more value, scaling organically.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INDUSTRIES WE SERVE SECTION */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-6 py-16 md:py-28">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-gaude-orange/90">
            TARGET SECTORS
          </span>
          <h2 className="mt-3 font-archivo text-3xl uppercase leading-[0.95] tracking-tighter text-white md:text-5xl lg:text-6xl">
            Built For Businesses That Want <br /> More Than Just Online Presence
          </h2>
        </div>

        {/* 8 Industry cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((ind, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl flex flex-col items-start hover:border-white/20 hover:bg-white/[0.08] transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-gaude-orange/10 border border-gaude-orange/20 flex items-center justify-center mb-4 text-gaude-orange">
                <ind.icon size={18} />
              </div>
              
              <h3 className="font-space-grotesk text-md font-bold uppercase tracking-tight text-white mb-2">
                {ind.title}
              </h3>
              
              <p className="font-inter text-xs leading-relaxed text-white/60">
                {ind.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. START YOUR TRANSFORMATION CTA SECTION */}
      <section className="relative z-10 bg-[#050505] border-y border-white/5 py-16 md:py-24">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gaude-orange/10 blur-[130px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-archivo text-3xl uppercase leading-[0.85] tracking-tighter text-white md:text-6xl">
              Start Your Business <br /> <span className="text-gaude-orange">Transformation</span> With Editco
            </h2>
            
            <p className="mt-6 max-w-2xl mx-auto font-inter text-base font-medium leading-relaxed text-white/70 md:text-xl">
              Whether you need a better website, automated calls, WhatsApp follow-ups, CRM systems, or complete growth funnels — we can build the system your business needs to grow smarter.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                data-cal-link="editco-media/15min"
                data-cal-namespace="15min"
                data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                className="flex h-14 cursor-pointer items-center justify-center rounded-full bg-gaude-orange px-8 font-archivo text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Book a Free Strategy Call
              </button>
              <button
                onClick={(e) => scrollToSection(e, "lead-form")}
                className="flex h-14 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-8 font-archivo text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-white/40"
              >
                Get a Custom Growth Plan
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. BOOK A CALL — Cal.com embed */}
      <section id="lead-form" ref={leadFormRef} className="relative z-10 mx-auto max-w-5xl px-6 py-16 md:py-28">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-[200px] w-[200px] rounded-full bg-gaude-orange/5 blur-[60px] pointer-events-none" />

          <div className="mb-8 text-center md:mb-10">
            <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-gaude-orange/90">
              GROWTH ACCELERATION
            </span>
            <h2 className="mt-3 font-archivo text-2xl uppercase leading-[0.95] tracking-tighter text-white md:text-4xl">
              Let’s Build Your <span className="text-gaude-orange">Growth System</span>
            </h2>
            <p className="mt-4 font-inter text-sm text-white/60 font-medium md:text-base">
              Book a free 15-minute strategy call — pick a time that works for you.
            </p>
          </div>

          <CalInlineEmbed embedId="cal-services-embed" />
        </div>
      </section>

      {/* FOOTER */}
      <FooterSection />
    </div>
  );
}
