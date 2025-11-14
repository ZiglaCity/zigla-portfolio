import { motion } from "framer-motion";
import { User, Coffee, Terminal } from "lucide-react";

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-[rgb(var(--foreground))]"
    >
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[rgb(var(--foreground))]">
          More About{" "}
          <span className="text-cyan-500 dark:text-cyan-400">Zigla City</span>
        </h1>
        <p className="text-base md:text-lg text-[rgb(var(--muted))] max-w-2xl mx-auto leading-relaxed">
          The mind behind the security, the engineer behind the system, and the
          dreamer behind the screen.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.03, boxShadow: "0 15px 25px rgba(0,0,0,0.1)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl p-6 backdrop-blur-sm transition bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))] hover:border-cyan-500"
        >
          <div className="flex items-center mb-4">
            <User className="w-6 h-6 text-cyan-500 dark:text-cyan-400 mr-3" />
            <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">
              Solomon
            </h2>
          </div>
          <p className="text-[rgb(var(--muted))] leading-relaxed mb-3 text-sm md:text-base">
            Some people know me as <strong>Solomon Dzah</strong> — calm,
            observant, and grounded. The guy who listens before building, who
            believes the best solutions come from understanding deeply before
            typing.
          </p>
          <p className="text-[rgb(var(--muted))] leading-relaxed text-sm md:text-base">
            A2SV taught me that debugging isn’t just about fixing code — it’s
            about understanding systems, people, and how design impacts trust.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.03, boxShadow: "0 15px 25px rgba(0,0,0,0.1)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl p-6 backdrop-blur-sm transition bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))] hover:border-purple-500"
        >
          <div className="flex items-center mb-4">
            <Terminal className="w-6 h-6 text-purple-500 dark:text-purple-400 mr-3" />
            <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">
              Zigla City
            </h2>
          </div>
          <p className="text-[rgb(var(--muted))] leading-relaxed mb-3 text-sm md:text-base">
            Others know me as <strong>Zigla City</strong> — the midnight
            architect. The one fusing creativity with precision, caffeine with
            clarity, and chaos with control.
          </p>
          <p className="text-[rgb(var(--muted))] leading-relaxed text-sm md:text-base">
            In my world, systems don’t just function — they think, adapt, and
            protect. Every design choice is guided by purpose and security.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.02, boxShadow: "0 15px 25px rgba(0,0,0,0.08)" }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl p-8 backdrop-blur-sm bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))]"
      >
        <div className="flex items-center mb-1">
          <Coffee className="w-6 h-6 text-amber-500 dark:text-amber-400 mr-3" />
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">
            My Philosophy
          </h2>
        </div>
        <blockquote className="text-base md:text-lg italic leading-relaxed text-[rgb(var(--muted))] border-l-4 border-cyan-500 dark:border-cyan-400 pl-6">
          “I don’t just write code — I spark systems to think. Every keystroke
          is a ripple in the Enzyphic ecosystem, where security meets
          creativity, and chaos turns into clarity. Each project is a dialogue
          between what exists and what could exist, a place where curiosity,
          discipline, and imagination collide.”
        </blockquote>
      </motion.div>

      <p className="mt-12 text-base italic text-center text-[rgb(var(--muted))]">
        "Innovation Over Imitation, Always!"
      </p>
    </motion.div>
  );
}
