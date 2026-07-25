"use client";

import { motion } from "framer-motion";
import { ArrowRight, UserRound } from "lucide-react";

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.section
      id="hero"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="text-center px-6 py-20 max-w-3xl mx-auto"
    >
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7 }}
        className="text-4xl md:text-6xl font-extrabold tracking-tight text-[rgb(var(--foreground))]"
      >
        Zigla City
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.7 }}
        className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[rgb(var(--muted))] md:text-lg md:leading-8"
      >
        I build scalable software, solve algorithmic problems, and design
        systems that are reliable, secure, and built to last.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.7 }}
        className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[rgb(var(--muted))] md:text-lg md:leading-8"
      >
        Currently studying{" "}
        <strong className="text-[rgb(var(--foreground))]/80 font-semibold">
          Computer Science at the University of Ghana
        </strong>
        , I'm fascinated by backend engineering, distributed systems, and
        turning ambitious ideas into products people genuinely enjoy using.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        <button
          type="button"
          onClick={() => scrollTo("about")}
          className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan-500/35 bg-[rgb(var(--card-bg))] px-5 py-2.5 text-sm font-medium text-[rgb(var(--foreground))] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-[0_12px_30px_rgba(34,211,238,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background))] dark:bg-linear-to-r dark:from-cyan-500/20 dark:to-purple-500/20 dark:hover:from-cyan-500/30 dark:hover:to-purple-500/30"
        >
          <UserRound className="h-4 w-4 text-cyan-500 transition-transform duration-200 group-hover:scale-110 dark:text-cyan-300" />
          About
        </button>

        <a
          href="/projects"
          className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-[rgb(var(--muted))] transition-colors duration-200 hover:text-[rgb(var(--foreground))] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background))]"
        >
          Work
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </motion.div>
    </motion.section>
  );
}
