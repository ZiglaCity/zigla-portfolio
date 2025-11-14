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
        : []
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
            className="flex items-center justify-center h-full p-6"
          >
            <div className="w-full max-w-4xl bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-zinc-800/50 border-b border-zinc-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="font-mono text-sm text-cyan-300">
                  ZiglaOS Terminal
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-zinc-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                ref={scrollRef}
                className="h-96 overflow-y-auto p-4 font-mono text-sm text-zinc-100"
              >
                {lines.map((line) => (
                  <div key={line.id} className="mb-1 break-all">
                    {line.content}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 p-3 bg-zinc-800/50 border-t border-zinc-700">
                <span className="text-cyan-300">zigla@enzypher:~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none font-mono text-sm"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
