"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MessageCircle, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

const ANNOUNCEMENT_STORAGE_KEY = "zigla-blog-interactions-announcement-v1";

export default function BlogFeatureAnnouncement() {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const hasSeenAnnouncement = window.localStorage.getItem(
      ANNOUNCEMENT_STORAGE_KEY,
    );
    const timer = window.setTimeout(() => {
      setOpen(!hasSeenAnnouncement);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open !== true) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "seen");
        setOpen(false);
      }
    };
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const dismiss = () => {
    window.localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "seen");
    setOpen(false);
  };

  if (open === null) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-md sm:px-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) dismiss();
          }}
        >
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-feature-announcement-title"
            className="relative w-full max-w-xl overflow-hidden rounded-[1.35rem] border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
          >
            <div className="h-1 w-full bg-cyan-400" />
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-500">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[rgb(var(--muted))] transition-colors hover:bg-[rgb(var(--card-bg))] hover:text-[rgb(var(--foreground))]"
                  aria-label="Dismiss announcement"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-500">
                A new way to engage
              </p>
              <h2
                id="blog-feature-announcement-title"
                className="mt-3 max-w-md text-3xl font-semibold tracking-[-0.02em] text-[rgb(var(--foreground))] sm:text-4xl"
              >
                The conversation is now part of the story.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-[rgb(var(--muted))]">
                You can now react to any blog and leave a comment without
                creating an account. Add your name if you want to be recognized,
                or join anonymously.
              </p>

              <div className="mt-7 grid gap-3 border-y border-[rgb(var(--card-border))] py-5 sm:grid-cols-2">
                <div className="flex gap-3">
                  <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" />
                  <div>
                    <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
                      Leave your take
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[rgb(var(--muted))]">
                      Share a thought under every post.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" />
                  <div>
                    <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
                      React in a second
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[rgb(var(--muted))]">
                      Like, love, laugh, or mark it insightful.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={dismiss}
                  className="px-1 py-2 text-sm font-medium text-[rgb(var(--muted))] transition-colors hover:text-[rgb(var(--foreground))] sm:px-0"
                >
                  Maybe later
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[rgb(var(--foreground))] px-4 py-2.5 text-sm font-semibold text-[rgb(var(--background))] transition-transform hover:-translate-y-0.5"
                >
                  Explore the blogs
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
