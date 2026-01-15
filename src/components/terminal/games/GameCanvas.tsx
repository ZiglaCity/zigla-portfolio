"use client";

import { useEffect, useState, useCallback, useRef, memo } from "react";
import { getGameManager, GameInfo } from "./index";

interface GameCanvasProps {
  onExit: () => void;
}

// Memoize the game grid to prevent unnecessary re-renders
const GameGrid = memo(({ lines }: { lines: string[] }) => (
  <pre
    className="text-green-400 text-center select-none whitespace-pre"
    style={{
      fontFamily: "'Courier New', Consolas, monospace",
      fontSize: "14px",
      lineHeight: "1.1",
      letterSpacing: "0",
    }}
  >
    {lines.join("\n")}
  </pre>
));

GameGrid.displayName = "GameGrid";

function GameCanvas({ onExit }: GameCanvasProps) {
  const [gameLines, setGameLines] = useState<string[]>([]);
  const [statusLine, setStatusLine] = useState("");
  const [controlsHelp, setControlsHelp] = useState("");
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isHighScore, setIsHighScore] = useState(false);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);

  // Use ref to always have the latest showGameOver value in the event handler
  const showGameOverRef = useRef(showGameOver);
  showGameOverRef.current = showGameOver;

  useEffect(() => {
    const manager = getGameManager();

    manager.setCallbacks({
      onRender: (lines, status, controls) => {
        setGameLines([...lines]);
        setStatusLine(status);
        setControlsHelp(controls);
      },
      onGameEnd: (score, isHigh) => {
        setShowGameOver(true);
        setFinalScore(score);
        setIsHighScore(isHigh);
      },
      onGameStart: (info) => {
        setGameInfo(info);
        setShowGameOver(false);
        setFinalScore(0);
        setIsHighScore(false);
      },
    });

    // Force initial render from active game
    const activeGame = manager.getActiveGame();
    if (activeGame) {
      const lines = activeGame.instance.render();
      setGameLines([...lines]);
      setStatusLine(activeGame.instance.getStatusLine());
      setControlsHelp(activeGame.instance.getControlsHelp());

      // Get game info from registry
      const games = manager.listGames();
      const info = games.find((g) => g.id === activeGame.id);
      if (info) setGameInfo(info);
    }

    return () => {
      manager.setCallbacks({});
    };
  }, []);

  // Handle keyboard input
  const handleKeyInput = useCallback(
    (e: KeyboardEvent) => {
      // Always prevent default for ALL keys while in game mode
      // This stops any other key from interrupting the game
      e.preventDefault();
      e.stopPropagation();

      const manager = getGameManager();
      const key = e.key;
      const keyLower = key.toLowerCase();

      // ESC - Exit the game (don't call manager.exitGame here, let onExit handle it)
      if (key === "Escape") {
        onExit();
        return;
      }

      // R - Restart only when game is over (use ref for fresh value)
      if (keyLower === "r" && showGameOverRef.current) {
        manager.restartGame();
        setShowGameOver(false);
        return;
      }

      // Only process game controls (WASD, arrows, P) when NOT game over
      if (!showGameOverRef.current) {
        manager.handleKeyInput(key);
      }
    },
    [onExit] // Remove showGameOver from deps since we use ref
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyInput);
    return () => window.removeEventListener("keydown", handleKeyInput);
  }, [handleKeyInput]);

  if (!gameInfo && gameLines.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-400 animate-pulse">Loading game...</div>
      </div>
    );
  }

  // Parse status line into individual stats
  const parseStatus = (status: string) => {
    const parts = status.split(" | ");
    const stats: { label: string; value: string }[] = [];
    parts.forEach((part) => {
      const [label, value] = part.split(": ");
      if (label && value) {
        stats.push({ label: label.trim(), value: value.trim() });
      } else if (part.includes("[")) {
        stats.push({ label: "Status", value: part });
      }
    });
    return stats;
  };

  const stats = parseStatus(statusLine);

  return (
    <div className="flex items-center justify-center h-full p-2 gap-4">
      <div className="flex flex-col justify-center h-full w-40 shrink-0">
        {gameInfo && (
          <div className="mb-4">
            <div className="text-cyan-300 font-bold text-lg flex items-center gap-1">
              🎮 {gameInfo.name}
            </div>
            <div className="text-zinc-600 text-xs mt-1 leading-tight">
              {gameInfo.description}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-zinc-800/50 rounded px-2 py-1.5 border border-zinc-700"
            >
              <div className="text-zinc-500 text-xs uppercase tracking-wider">
                {stat.label}
              </div>
              <div className="text-yellow-400 font-bold font-mono text-lg">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center - Game Grid */}
      <div className="relative flex flex-col items-center">
        <div className="bg-zinc-950 rounded-lg p-3 border-2 border-zinc-700 shadow-lg shadow-green-500/10">
          <GameGrid lines={gameLines} />
        </div>

        {/* Game Over Overlay - Positioned over the game */}
        {showGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
            <div className="p-6 bg-zinc-900/95 border border-red-500/60 rounded-lg text-center">
              <div className="text-red-400 font-bold text-2xl mb-3">
                💀 GAME OVER 💀
              </div>
              <div className="text-zinc-200 text-xl">
                Final Score:{" "}
                <span className="text-yellow-400 font-bold text-2xl">
                  {finalScore}
                </span>
              </div>
              {isHighScore && (
                <div className="text-green-400 font-bold mt-3 animate-pulse text-xl">
                  🏆 NEW HIGH SCORE! 🏆
                </div>
              )}
              <div className="text-zinc-400 text-sm mt-4">
                <kbd className="px-2 py-1 bg-zinc-700 rounded text-cyan-300">
                  R
                </kbd>{" "}
                Restart
                <span className="mx-3 text-zinc-600">|</span>
                <kbd className="px-2 py-1 bg-zinc-700 rounded text-cyan-300">
                  ESC
                </kbd>{" "}
                Exit
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center h-full w-40 shrink-0">
        <div className="mb-4">
          <div className="text-zinc-400 text-xs uppercase tracking-wider mb-2">
            Controls
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-cyan-300 font-mono">
                W
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-cyan-300 font-mono">
                ↑
              </kbd>
              <span className="text-zinc-500">Move Up</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-cyan-300 font-mono">
                S
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-cyan-300 font-mono">
                ↓
              </kbd>
              <span className="text-zinc-500">Move Down</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-cyan-300 font-mono">
                A
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-cyan-300 font-mono">
                ←
              </kbd>
              <span className="text-zinc-500">Move Left</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-cyan-300 font-mono">
                D
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-cyan-300 font-mono">
                →
              </kbd>
              <span className="text-zinc-500">Move Right</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-700 pt-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-cyan-300 font-mono">
                P
              </kbd>
              <span className="text-zinc-500">Pause</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-cyan-300 font-mono">
                R
              </kbd>
              <span className="text-zinc-500">Restart</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-red-400 font-mono">
                ESC
              </kbd>
              <span className="text-zinc-500">Exit Game</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-700 pt-3 mt-3">
          <div className="text-zinc-400 text-xs uppercase tracking-wider mb-2">
            Legend
          </div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-green-400">►►</span>
              <span className="text-zinc-500">Snake Head</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">██</span>
              <span className="text-zinc-500">Snake Body</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">●●</span>
              <span className="text-zinc-500">Food</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameCanvas;
