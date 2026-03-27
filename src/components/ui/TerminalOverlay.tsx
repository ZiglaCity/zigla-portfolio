"use client";

import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTerminal } from "../terminal/useTerminal";
import GameCanvas from "../terminal/games/GameCanvas";
import { X } from "lucide-react";

export default function TerminalOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    lines,
    input,
    setInput,
    handleKeyDown,
    scrollRef,
    inputRef,
    isBooting,
    gameSession,
  } = useTerminal(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("terminalHistory") || "[]")
      : [],
    onClose,
    open,
  );

  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const isInGame = gameSession.isGameActive;

  // Handle exiting game mode
  const handleGameExit = useCallback(() => {
    gameSession.exitGame();
  }, [gameSession]);

  // Handle keyboard events for game mode - now handled by GameCanvas
  // No need for global handler here anymore

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
            className="flex items-center justify-center h-full p-0 sm:p-2 lg:p-4"
          >
            <div
              ref={terminalContainerRef}
              className="w-full h-full sm:h-[94vh] sm:w-[96vw] sm:max-w-[1700px] bg-zinc-900/95 sm:border border-zinc-800 sm:rounded-xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-3 sm:p-3 bg-zinc-800/50 border-b border-zinc-700 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="font-mono text-xs sm:text-sm text-cyan-300 flex items-center gap-2">
                  {isInGame && (
                    <span className="text-green-400 animate-pulse">🎮</span>
                  )}
                  ZiglaOS Terminal
                  {isInGame && (
                    <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                      GAME MODE
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 sm:p-1.5 hover:bg-red-500/20 rounded-lg sm:rounded bg-zinc-700 sm:bg-zinc-700/80 border border-zinc-600 text-zinc-100 hover:text-red-400 transition-colors"
                  aria-label="Close terminal"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Terminal Output or Game Canvas */}
              {isInGame ? (
                <div className="flex-1 overflow-hidden min-h-0">
                  <GameCanvas onExit={handleGameExit} />
                </div>
              ) : (
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-2 sm:p-3 font-mono text-xs sm:text-sm text-zinc-100 min-h-0"
                >
                  {lines.map((line) => (
                    <div key={line.id} className="mb-1 break-all">
                      {line.content}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-zinc-800/50 border-t border-zinc-700 shrink-0">
                <span className="text-cyan-300 text-xs sm:text-sm whitespace-nowrap">
                  {isBooting
                    ? "booting..."
                    : isInGame
                      ? "🎮 playing..."
                      : "zigla@enzypher:~$"}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none font-mono text-xs sm:text-sm min-w-0 text-zinc-100 caret-cyan-300 placeholder:text-zinc-500 disabled:opacity-50"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  placeholder={
                    isBooting
                      ? "Please wait..."
                      : isInGame
                        ? "Use WASD/Arrows to play, ESC to exit..."
                        : "Type a command..."
                  }
                  disabled={isBooting || isInGame}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
