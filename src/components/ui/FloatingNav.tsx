"use client";

import { motion } from "framer-motion";
import { Menu, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

const HOME_SECTIONS = ["Home", "About", "Skills", "Experience"];
const OTHER_PAGES = ["Projects", "Blogs", "Contact"];

export default function FloatingNav({
  activeIndex,
  onNavigate,
  onEnterTerminal,
  isHome,
}: {
  activeIndex: number;
  onNavigate: (index: number) => void;
  onEnterTerminal: () => void;
  isHome: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(activeIndex);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".nav-panel") && !target.closest(".nav-orb")) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("click", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    setActiveSection(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    if (!isHome) return;

    const sectionIds = ["hero", "about", "skills", "experience"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection) {
          const index = sectionIds.indexOf(visibleSection.target.id);
          if (index !== -1) setActiveSection(index);
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome]);

  const navItems = isHome
    ? [...HOME_SECTIONS, ...OTHER_PAGES]
    : ["Home", ...OTHER_PAGES];

  const handleNavigation = (index: number) => {
    if (isHome && index < HOME_SECTIONS.length) {
      setActiveSection(index);
    }
    setOpen(false);
    onNavigate(index);
  };

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col items-end gap-4 sm:right-6 sm:top-6">
      <div className="pointer-events-auto flex items-center gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="floating-navigation-panel"
          className={`nav-orb flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur text-[rgb(var(--foreground))] transition-[background-color,border-color,box-shadow] duration-200 ${
            open
              ? "border-cyan-400 bg-cyan-400/15 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
              : "border-[rgb(var(--card-border))] bg-[rgb(var(--card-bg))/80] hover:border-cyan-400/70 hover:bg-cyan-400/10 hover:shadow-[0_0_18px_rgba(34,211,238,0.18)]"
          }`}
        >
          <Menu
            className={`h-5 w-5 transition-transform duration-200 ${
              open ? "rotate-90" : ""
            }`}
          />
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={onEnterTerminal}
          aria-label="Open terminal"
          className="flex h-12 w-12 items-center justify-center rounded-md border border-cyan-500/50 bg-[rgb(var(--card-bg))/80] text-cyan-300 shadow-[0_0_0_rgba(34,211,238,0)] transition-[background-color,border-color,box-shadow,color] duration-200 hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-100 hover:shadow-[0_0_18px_rgba(34,211,238,0.35)]"
        >
          <Terminal className="h-5 w-5" />
        </motion.button>
      </div>

      <motion.div
        id="floating-navigation-panel"
        aria-hidden={!open}
        initial={{ opacity: 0, y: -8 }}
        animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{ pointerEvents: open ? "auto" : "none" }}
        className="nav-panel w-64 rounded-2xl border border-[rgb(var(--card-border))] bg-[rgb(var(--card-bg))/90] p-2.5 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:w-72"
      >
        {navItems.map((item, index) => {
          const type =
            isHome && index < HOME_SECTIONS.length
              ? "Scroll to section"
              : "Open page";
          const isSelected = index === activeSection;

          return (
            <motion.button
              type="button"
              key={item}
              onClick={() => handleNavigation(index)}
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`group flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow] duration-150 ${
                isSelected
                  ? "border-[rgb(var(--card-border))] bg-[rgb(var(--foreground))/6] shadow-[inset_2px_0_0_rgba(125,211,252,0.8)]"
                  : "border-transparent hover:border-[rgb(var(--card-border))] hover:bg-[rgb(var(--foreground))/5]"
              }`}
            >
              <div>
                <div className="text-sm font-semibold text-[rgb(var(--foreground))]">
                  {item}
                </div>
                <div className="text-[0.68rem] text-[rgb(var(--muted))]">
                  {type}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {isHome && (
        <div className="pointer-events-auto flex flex-col gap-2">
          {HOME_SECTIONS.map((section, index) => (
            <button
              type="button"
              key={section}
              onClick={() => handleNavigation(index)}
              aria-label={`Go to ${section}`}
              className={`h-2.5 w-2.5 rounded-full border transition-[background-color,box-shadow,transform] duration-200 hover:scale-125 ${
                index === activeSection
                  ? "border-cyan-200 bg-cyan-300 shadow-[0_0_8px_rgba(125,211,252,0.45)]"
                  : "border-[rgb(var(--muted))]/50 bg-[rgb(var(--muted))] hover:bg-cyan-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
