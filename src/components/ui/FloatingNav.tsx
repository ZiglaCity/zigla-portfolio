"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";

const HOME_SECTIONS = ["Home", "About", "Skills", "Experience"];
const OTHER_PAGES = ["Projects", "Blogs", "Contact"];

export default function FloatingNav({
  activeIndex,
  onNavigate,
  onEnterTerminal,
  isHome,
}: {
  activeIndex: number;
  onNavigate: (i: number) => void;
  onEnterTerminal: () => void;
  isHome: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".nav-panel") && !target.closest(".nav-orb"))
        setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const navItems = isHome
    ? [...HOME_SECTIONS, ...OTHER_PAGES]
    : ["Home", ...OTHER_PAGES];

  return (
    <div className="fixed right-4 sm:right-6 top-4 sm:top-6 z-50 flex flex-col items-end gap-4">
      <div className="flex items-center gap-3">
        {/* Orb menu button */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen((s) => !s)}
          className="nav-orb w-12 h-12 rounded-full bg-[rgb(var(--card-bg))/80] border border-[rgb(var(--card-border))] flex items-center justify-center backdrop-blur text-[rgb(var(--foreground))]"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        {/* Terminal entry button */}
        <button
          onClick={onEnterTerminal}
          className="w-12 h-12 rounded-md bg-[rgb(var(--card-bg))/80] border border-[rgb(var(--card-border))] flex items-center justify-center text-cyan-400 font-mono"
        >
          &gt;_
        </button>
      </div>

      <motion.div
        className={`nav-panel w-56 sm:w-60 rounded-xl bg-[rgb(var(--card-bg))/80] border border-[rgb(var(--card-border))] backdrop-blur-sm p-3 shadow-md ${
          open ? "block" : "hidden"
        }`}
        initial={{ opacity: 0, y: -8 }}
        animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
      >
        {navItems.map((item, i) => {
          const type = isHome
            ? i < HOME_SECTIONS.length
              ? "slide"
              : "page"
            : i === 0
            ? "page"
            : "page";

          return (
            <button
              key={item}
              onClick={() => onNavigate(i)}
              className={`block w-full text-left p-2 rounded-md hover:bg-[rgb(var(--card-border))/30] transition ${
                i === activeIndex ? "ring-1 ring-cyan-400/30" : ""
              }`}
            >
              <div className="text-sm font-medium text-[rgb(var(--foreground))]">
                {item}
              </div>
              <div className="text-xs text-[rgb(var(--muted))]">{type}</div>
            </button>
          );
        })}
      </motion.div>

      {/* Dots on home only */}
      {isHome && (
        <div className="flex flex-col gap-2">
          {HOME_SECTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={`w-2 h-2 rounded-full ${
                i === activeIndex ? "bg-cyan-400" : "bg-[rgb(var(--muted))]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
