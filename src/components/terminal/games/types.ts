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
    description: "Classic block-stacking puzzle game (Coming Soon)",
    controls: "Arrow keys to move/rotate, Space to drop",
    version: "0.0.0",
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
    (g) => g.id === id || g.name.toLowerCase() === id.toLowerCase()
  );
}

export function isGameAvailable(id: string): boolean {
  const game = getGameById(id);
  return game !== undefined && game.version !== "0.0.0";
}
