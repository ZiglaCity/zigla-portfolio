"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Globe,
  Cpu,
  Layers,
  Terminal,
  Database,
  GitBranch,
  Brain,
  ShieldCheck,
} from "lucide-react";

const skillGroups = [
  {
    title: "Core Stack",
    skills: [
      { name: "TypeScript, Java", icon: Code2 },
      { name: "React / Next.js", icon: Globe },
      { name: "Tailwind CSS", icon: Layers },
      { name: "Node.js / Express", icon: Terminal },
      { name: "Prisma / Supabase", icon: Database },
    ],
  },
  {
    title: "Engineering",
    skills: [
      { name: "Full-Stack Development", icon: Cpu },
      { name: "System Design", icon: Layers },
      { name: "Automation & Scripts", icon: Terminal },
      { name: "Desktop Apps", icon: Code2 },
      { name: "Databases (SQL / NoSQL)", icon: Database },
    ],
  },
  {
    title: "AI & Tools",
    skills: [
      { name: "Python / FastAPI", icon: Code2 },
      { name: "Machine Learning", icon: Brain },
      { name: "Git / Docker / CI-CD", icon: GitBranch },
      { name: "Security & Testing", icon: ShieldCheck },
      { name: "Prompt Engineering", icon: Cpu },
    ],
  },
];

export default function Skills() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-6xl mx-auto px-6 py-20 text-[rgb(var(--foreground))]"
    >
      <div className="text-center mb-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[rgb(var(--foreground))]">
          Skills &{" "}
          <span className="text-cyan-500 dark:text-cyan-400">Stack</span>
        </h1>
        <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto text-[rgb(var(--muted))]">
          A blend of systems thinking, clean architecture, and curiosity across
          software, automation, and security.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {skillGroups.map((group, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 15px 25px rgba(0,0,0,0.08)",
            }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl p-6 backdrop-blur-sm transition bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))] hover:border-cyan-500"
          >
            <h2 className="text-xl font-semibold mb-6 text-center text-[rgb(var(--foreground))]">
              {group.title}
            </h2>

            <div className="space-y-3">
              {group.skills.map(({ name, icon: Icon }) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-3 transition text-[rgb(var(--muted))] hover:text-cyan-500"
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm md:text-base">{name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-16 text-center italic text-sm text-[rgb(var(--muted))]">
        “Every stack is a story — from logic to launch.”
      </p>
    </motion.div>
  );
}
