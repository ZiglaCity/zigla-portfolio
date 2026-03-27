export type GameId = "snake" | "tetris" | "custom";

export interface GameInfo {
  id: GameId;
  name: string;
  description: string;
  controls: string;
  version: string;
}

export interface Position {
  x: number;
  y: number;
}

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  score: number;
  highScore: number;
  gameOver: boolean;
}

export interface GameRenderer {
  render: () => string[];
  getWidth: () => number;
  getHeight: () => number;
}

export const GAMES_REGISTRY: GameInfo[] = [
  {
    id: "snake",
    name: "Snake",
    description:
      "Classic snake game - eat food, grow longer, don't hit yourself!",
    controls: "WASD or Arrow keys to move, P to pause, ESC to exit",
    version: "1.0.0",
  },
  {
    id: "tetris",
    name: "Tetris",
    description: "Stack falling blocks, clear lines, and chase high scores.",
    controls:
      "A/D or Left/Right: Move, W/X/Up: Rotate, Z: CCW, S/Down: Soft drop, Space: Hard drop, C: Hold",
    version: "1.0.0",
  },
  {
    id: "custom",
    name: "Mystery Game",
    description: "A special surprise game (Coming Soon)",
    controls: "TBD",
    version: "0.0.0",
  },
];

export function getGameById(id: string): GameInfo | undefined {
  return GAMES_REGISTRY.find(
    (g) => g.id === id || g.name.toLowerCase() === id.toLowerCase(),
  );
}

export function isGameAvailable(id: string): boolean {
  const game = getGameById(id);
  return game !== undefined && game.version !== "0.0.0";
}
