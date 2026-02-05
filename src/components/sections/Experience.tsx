"use client";

import { motion } from "framer-motion";
import { journeys } from "@@/data/journey";

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
