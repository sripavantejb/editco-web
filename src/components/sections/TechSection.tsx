"use client";
import { tech } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";
import { motion } from "framer-motion";

const TECH_STACK = [
  { name: "TYPESCRIPT", color: "#3178c6" },
  { name: "JAVASCRIPT", color: "#f7df1e", textColor: "black" },
  { name: "NEXT.JS", color: "#000000" },
  { name: "REACT", color: "#61dafb", textColor: "black" },
  { name: "NODE.JS", color: "#339933" },
  { name: "MONGODB", color: "#47a248" },
  { name: "PYTHON", color: "#3776ab" },
  { name: "HTML5", color: "#e34f26" },
  { name: "CSS3", color: "#1572b6" },
  { name: "TAILWIND CSS", color: "#06b6d4" },
  { name: "VERCEL", color: "#000000" },
  { name: "AWS", color: "#ff9900" },
  { name: "FIREBASE", color: "#ffca28", textColor: "black" },
  { name: "GOOGLE CLOUD", color: "#4285f4" },
  { name: "EXPRESS.JS", color: "#000000" },
  { name: "WORDPRESS", color: "#21759b" },
  { name: "FIGMA", color: "#f24e1e" },
  { name: "FRAMER", color: "#0055ff" },
  { name: "GITHUB", color: "#181717" },
  { name: "GIT", color: "#f05032" },
  { name: "N8N", color: "#ff6d5a" },
  { name: "OPENAI", color: "#412991" },
  { name: "WHATSAPP API", color: "#25d366" },
  { name: "POSTGRES", color: "#4169e1" },
  { name: "SUPABASE", color: "#3ecf8e" },
  { name: "DOCKER", color: "#2496ed" },
  { name: "REDIS", color: "#dc382d" },
  { name: "NOTION", color: "#000000" },
  { name: "SLACK", color: "#4a154b" },
  { name: "STRIPE", color: "#008cdd" },
  { name: "POSTMAN", color: "#ff6c37" },
  { name: "CANVA", color: "#00c4cc" },
  { name: "THREEJS", color: "#000000" },
  { name: "VUE.JS", color: "#4fc08d" },
  { name: "FLUTTER", color: "#02569b" },
  { name: "RENDER", color: "#46e3b7", textColor: "black" },
  { name: "AZURE", color: "#0089d6" },
  { name: "PORTFOLIO", color: "#ff0000" },
  { name: "PRETTIER", color: "#f7b93e", textColor: "black" },
  { name: "ADOBE", color: "#ff0000" },
  { name: "BABEL", color: "#f9dc3e", textColor: "black" },
  { name: "WEBPACK", color: "#8dd6f9", textColor: "black" },
];

export function TechSection() {
  return (
    <section
      id={tech.id}
      className={`flex min-h-[70svh] flex-col justify-center bg-white px-4 py-16 md:px-8 md:py-24 ${sectionFlow}`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <SectionHeading title={tech.heading} description={tech.description} />
        </div>

        <div className="flex flex-wrap gap-1 md:gap-1.5 justify-center md:justify-start">
          {TECH_STACK.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                delay: i * 0.01,
                duration: 0.2,
                ease: "easeOut"
              }}
              style={{ backgroundColor: item.color }}
              className={`px-3 py-1.5 md:px-5 md:py-2.5 rounded-[4px] font-archivo text-[10px] md:text-xs font-black uppercase tracking-wider shadow-sm transition-transform hover:scale-110 hover:z-10 cursor-default ${item.textColor === 'black' ? 'text-black' : 'text-white'}`}
            >
              {item.name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
