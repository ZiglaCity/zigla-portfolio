"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTerminal } from "../terminal/useTerminal";
import { X } from "lucide-react";

export default function TerminalOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { lines, input, setInput, handleKeyDown, scrollRef, inputRef } =
    useTerminal(
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("terminalHistory") || "[]")
        : [],
      onClose
    );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="flex items-center justify-center h-full p-0 sm:p-8 lg:p-12"
          >
            <div className="w-full h-full sm:h-[80vh] sm:max-w-6xl lg:max-w-7xl bg-zinc-900/95 sm:border border-zinc-800 sm:rounded-xl shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-3 sm:p-3 bg-zinc-800/50 border-b border-zinc-700 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="font-mono text-xs sm:text-sm text-cyan-300">
                  ZiglaOS Terminal
                </div>
                <button
                  onClick={onClose}
                  className="p-2 sm:p-1.5 hover:bg-red-500/20 rounded-lg sm:rounded bg-zinc-700 sm:bg-zinc-700/80 border border-zinc-600 text-zinc-100 hover:text-red-400 transition-colors"
                  aria-label="Close terminal"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Terminal Output */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-xs sm:text-sm text-zinc-100 min-h-0"
              >
                {lines.map((line) => (
                  <div key={line.id} className="mb-1 break-all">
                    {line.content}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-3 bg-zinc-800/50 border-t border-zinc-700 shrink-0">
                <span className="text-cyan-300 text-xs sm:text-sm whitespace-nowrap">
                  zigla@enzypher:~$
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none font-mono text-xs sm:text-sm min-w-0 text-zinc-100 caret-cyan-300 placeholder:text-zinc-500"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="Type a command..."
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
