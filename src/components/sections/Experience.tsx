"use client";

import { motion } from "framer-motion";

const journeys = [
  {
    title: "Merrylow — Backend Architect & DevOps Lead",
    period: "2024 – Present",
    description: `Designed and implemented the backend ecosystem for Merrylow — a restaurant platform. Built a scalable architecture using Node.js, Prisma, and PostgreSQL on a VPS server. Handled the entire deployment pipeline from database setup to CI/CD and Nginx reverse proxy configuration. Integrated efficient caching for top vendors and products, implemented image handling and URL mapping directly on the VPS, and migrated data from WooCommerce to Prisma while preserving all relations and improving query efficiency.`,
    focus: [
      "Backend Architecture",
      "Database Design",
      "VPS Deployment",
      "CI/CD Pipelines",
      "Data Migration",
    ],
  },
  {
    title: "A2SV — Competitive Programming & System Design Trainee",
    period: "2025 – Present",
    description: `Selected into the A2SV (African to Silicon Valley) program — one of the few Level-200 CS students in the cohort. Ranked 2nd among Level-300 and 400 students in several algorithmic and system design contests. Solved 200+ LeetCode problems, built confidence in data structures, and gained deep experience in collaborative engineering challenges.`,
    focus: [
      "Algorithms",
      "Data Structures",
      "System Design",
      "Team Collaboration",
    ],
  },
  {
    title: "Course Project — Database Admin & Backend Developer",
    period: "2025",
    description: `Served as the database admin and backend dev in a 7-member course project for a restaurant client. Designed ER and data flow diagrams, managed PostgreSQL schema, and implemented APIs for menu and order management. Followed Kendall’s OO analysis and Sommerville’s design principles for architecture consistency.`,
    focus: [
      "Database Management",
      "UML & Data Modeling",
      "Backend API Design",
      "Team Collaboration",
    ],
  },
];

export default function Journey() {
  return (
    <section
      id="journey"
      className="relative w-full py-24 sm:py-32 flex flex-col items-center"
    >
      <div className="max-w-5xl w-full px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-4 text-center sm:text-left text-cyan-500"
        >
          The Journey
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[rgb(var(--muted))] mb-12 max-w-2xl text-center sm:text-left mx-auto sm:mx-0"
        >
          From solo systems to team engineering, every milestone reflects growth
          through building, learning, and scaling.
        </motion.p>

        <div className="space-y-12 border-l border-[rgb(var(--card-border))] pl-6">
          {journeys.map((j, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))] rounded-2xl p-6 backdrop-blur-sm  hover:border-cyan-500 transition "
            >
              <div className="absolute -left-3 top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <h3 className="text-xl md:text-2xl font-semibold text-[rgb(var(--foreground))]">
                {j.title}
              </h3>
              <p className="text-sm text-[rgb(var(--muted))] mb-3">
                {j.period}
              </p>
              <p className="text-[rgb(var(--muted))] leading-relaxed mb-4 whitespace-pre-line">
                {j.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {j.focus.map((f, idx) => (
                  <span
                    key={idx}
                    className=" px-3 py-1 rounded-full bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))]  text-[rgb(var(--muted))] text-sm "
                  >
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[rgb(var(--muted))] mt-16 text-sm text-center sm:text-left"
        >
          Every project reinforced my problem-solving mindset — from writing
          efficient algorithms to designing systems that scale in the real
          world.
        </motion.p>
      </div>
    </section>
  );
}
