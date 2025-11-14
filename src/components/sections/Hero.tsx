"use client";

import { motion } from "framer-motion";

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
        className="mt-6 text-lg md:text-xl leading-relaxed text-[rgb(var(--muted))]"
      >
        I’m a software engineer, cybersecurity enthusiast, and AI explorer. I
        craft systems that don’t just work — they think, adapt, and protect.
        Currently pursuing{" "}
        <strong className="text-[rgb(var(--foreground))]/80 font-semibold">
          Computer Science at the University of Ghana
        </strong>
        , I’ve built scalable platforms, excelled in competitive programming
        with{" "}
        <strong className="text-[rgb(var(--foreground))]/80 font-semibold">
          A2SV
        </strong>
        , and bring a security-first mindset to every project.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.7 }}
        className="mt-4 text-sm md:text-base text-[rgb(var(--muted))]"
      >
        My approach combines technical mastery, design thinking, and practical
        experience to turn ideas into reliable, elegant, and impactful software.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-10 flex justify-center gap-4"
      >
        <button
          onClick={() => scrollTo("about")}
          className=" px-5 py-2.5 text-sm rounded-md border transition-colors bg-[rgb(var(--card-bg))] border-[rgb(var(--card-border))] text-[rgb(var(--foreground))] hover:bg-[rgba(var(--card-bg),0.9)] shadow-sm dark:bg-linear-to-r dark:from-cyan-500/20 dark:to-purple-500/20 dark:hover:from-cyan-500/30 dark:hover:to-purple-500/30"
        >
          More About Me
        </button>

        <button
          onClick={() => scrollTo("skills")}
          className=" underline text-sm transition-colors text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] "
        >
          View Skills
        </button>
      </motion.div>
    </motion.section>
  );
}
