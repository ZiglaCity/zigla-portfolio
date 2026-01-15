"use client";

import { GameDisplayState } from "../useGameSession";

interface GameDisplayProps {
  displayState: GameDisplayState;
}

export default function GameDisplay({ displayState }: GameDisplayProps) {
  const {
    gameLines,
    statusLine,
    controlsHelp,
    gameInfo,
    showGameOver,
    finalScore,
    isHighScore,
  } = displayState;

  if (!gameInfo) return null;

  return (
    <div className="font-mono text-sm">
      {/* Game Header */}
      <div className="text-center mb-2">
        <div className="text-cyan-300 font-bold text-lg">
          🎮 {gameInfo.name} 🎮
        </div>
        <div className="text-zinc-500 text-xs">{gameInfo.description}</div>
      </div>

      {/* Game Grid */}
      <div className="bg-zinc-950 rounded p-2 border border-zinc-700 overflow-hidden">
        <pre
          className="text-green-400 leading-none text-center select-none"
          style={{ fontFamily: "monospace", fontSize: "12px" }}
        >
          {gameLines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </pre>
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center mt-2 px-1">
        <div className="text-yellow-400 text-xs font-bold">{statusLine}</div>
      </div>

      <div className="text-zinc-500 text-xs mt-1 text-center">
        {controlsHelp}
      </div>

      {showGameOver && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded text-center">
          <div className="text-red-400 font-bold text-lg mb-1">
            💀 GAME OVER 💀
          </div>
          <div className="text-zinc-300">
            Final Score:{" "}
            <span className="text-yellow-400 font-bold">{finalScore}</span>
          </div>
          {isHighScore && (
            <div className="text-green-400 font-bold mt-1 animate-pulse">
              🏆 NEW HIGH SCORE! 🏆
            </div>
          )}
          <div className="text-zinc-500 text-xs mt-2">
            Press <span className="text-cyan-300">R</span> to restart or{" "}
            <span className="text-cyan-300">ESC</span> to exit
          </div>
        </div>
      )}
    </div>
  );
}
