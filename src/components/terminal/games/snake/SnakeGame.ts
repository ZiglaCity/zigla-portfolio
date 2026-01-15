import { Position, Direction, GameState } from "../types";

export interface SnakeGameState extends GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  gridWidth: number;
  gridHeight: number;
  speed: number;
  level: number;
}

export const SNAKE_CONFIG = {
  INITIAL_LENGTH: 3,
  INITIAL_SPEED: 150, // ms between moves
  SPEED_INCREMENT: 5, // ms faster per level
  MIN_SPEED: 50,
  POINTS_PER_FOOD: 10,
  POINTS_PER_LEVEL: 50, // bonus for leveling up
  FOOD_FOR_LEVEL_UP: 5,
  GRID_WIDTH: 25,
  GRID_HEIGHT: 20, // Taller grid since controls are on sides now
};

// Unicode characters for rendering
// Using double-width characters to make cells appear more square
export const SNAKE_CHARS = {
  HEAD_UP: "▲▲",
  HEAD_DOWN: "▼▼",
  HEAD_LEFT: "◄◄",
  HEAD_RIGHT: "►►",
  BODY: "██",
  BODY_LIGHT: "▓▓",
  FOOD: "●●",
  EMPTY: "  ", // Two spaces
  BORDER_H: "══",
  BORDER_V: "║",
  CORNER_TL: "╔",
  CORNER_TR: "╗",
  CORNER_BL: "╚",
  CORNER_BR: "╝",
};

export class SnakeGame {
  private state: SnakeGameState;
  private foodEaten: number = 0;
  private onStateChange?: (state: SnakeGameState) => void;
  private gameLoop: NodeJS.Timeout | null = null;

  constructor(
    width: number = SNAKE_CONFIG.GRID_WIDTH,
    height: number = SNAKE_CONFIG.GRID_HEIGHT
  ) {
    this.state = this.createInitialState(width, height);
    this.loadHighScore();
  }

  private createInitialState(width: number, height: number): SnakeGameState {
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    // Create initial snake (horizontal, facing right)
    const snake: Position[] = [];
    for (let i = 0; i < SNAKE_CONFIG.INITIAL_LENGTH; i++) {
      snake.push({ x: centerX - i, y: centerY });
    }

    return {
      snake,
      food: this.generateFoodPosition(snake, width, height),
      direction: "RIGHT",
      nextDirection: "RIGHT",
      gridWidth: width,
      gridHeight: height,
      isRunning: false,
      isPaused: false,
      score: 0,
      highScore: 0,
      gameOver: false,
      speed: SNAKE_CONFIG.INITIAL_SPEED,
      level: 1,
    };
  }

  private generateFoodPosition(
    snake: Position[],
    width: number,
    height: number
  ): Position {
    let food: Position;
    do {
      food = {
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
      };
    } while (snake.some((s) => s.x === food.x && s.y === food.y));
    return food;
  }

  private loadHighScore(): void {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zigla-snake-highscore");
      if (saved) {
        this.state.highScore = parseInt(saved, 10);
      }
    }
  }

  private saveHighScore(): void {
    if (
      typeof window !== "undefined" &&
      this.state.score > this.state.highScore
    ) {
      this.state.highScore = this.state.score;
      localStorage.setItem(
        "zigla-snake-highscore",
        this.state.score.toString()
      );
    }
  }

  public setStateChangeCallback(
    callback: (state: SnakeGameState) => void
  ): void {
    this.onStateChange = callback;
  }

  public getState(): SnakeGameState {
    return { ...this.state };
  }

  public start(): void {
    if (this.state.gameOver) {
      this.reset();
    }
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.startGameLoop();
    this.notifyStateChange();
  }

  public pause(): void {
    if (!this.state.isRunning || this.state.gameOver) return;
    this.state.isPaused = !this.state.isPaused;
    if (this.state.isPaused) {
      this.stopGameLoop();
    } else {
      this.startGameLoop();
    }
    this.notifyStateChange();
  }

  public stop(): void {
    this.stopGameLoop();
    this.state.isRunning = false;
    this.saveHighScore();
    this.notifyStateChange();
  }

  public reset(): void {
    this.stopGameLoop();
    this.foodEaten = 0;
    this.state = this.createInitialState(
      this.state.gridWidth,
      this.state.gridHeight
    );
    this.loadHighScore();
    this.notifyStateChange();
  }

  private startGameLoop(): void {
    if (this.gameLoop) return;
    this.gameLoop = setInterval(() => this.tick(), this.state.speed);
  }

  private stopGameLoop(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  public setDirection(dir: Direction): void {
    if (this.state.isPaused || this.state.gameOver || !this.state.isRunning)
      return;

    // Prevent 180-degree turns
    const opposites: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };

    if (opposites[dir] !== this.state.direction) {
      this.state.nextDirection = dir;
    }
  }

  private tick(): void {
    if (this.state.isPaused || this.state.gameOver) return;

    this.state.direction = this.state.nextDirection;
    const head = this.state.snake[0];
    const newHead: Position = { ...head };

    // Move head based on direction
    switch (this.state.direction) {
      case "UP":
        newHead.y -= 1;
        break;
      case "DOWN":
        newHead.y += 1;
        break;
      case "LEFT":
        newHead.x -= 1;
        break;
      case "RIGHT":
        newHead.x += 1;
        break;
    }

    // Check wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= this.state.gridWidth ||
      newHead.y < 0 ||
      newHead.y >= this.state.gridHeight
    ) {
      this.endGame();
      return;
    }

    // Check self collision
    if (this.state.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      this.endGame();
      return;
    }

    // Move snake
    this.state.snake.unshift(newHead);

    // Check food collision
    if (newHead.x === this.state.food.x && newHead.y === this.state.food.y) {
      this.state.score += SNAKE_CONFIG.POINTS_PER_FOOD;
      this.foodEaten += 1;

      // Level up check
      if (this.foodEaten >= SNAKE_CONFIG.FOOD_FOR_LEVEL_UP) {
        this.levelUp();
      }

      // Generate new food
      this.state.food = this.generateFoodPosition(
        this.state.snake,
        this.state.gridWidth,
        this.state.gridHeight
      );
    } else {
      // Remove tail if no food eaten
      this.state.snake.pop();
    }

    this.notifyStateChange();
  }

  private levelUp(): void {
    this.state.level += 1;
    this.state.score += SNAKE_CONFIG.POINTS_PER_LEVEL;
    this.foodEaten = 0;

    // Increase speed
    const newSpeed = Math.max(
      SNAKE_CONFIG.MIN_SPEED,
      this.state.speed - SNAKE_CONFIG.SPEED_INCREMENT
    );

    if (newSpeed !== this.state.speed) {
      this.state.speed = newSpeed;
      this.stopGameLoop();
      this.startGameLoop();
    }
  }

  private endGame(): void {
    this.state.gameOver = true;
    this.state.isRunning = false;
    this.stopGameLoop();
    this.saveHighScore();
    this.notifyStateChange();
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  public render(): string[] {
    const lines: string[] = [];
    const { snake, food, gridWidth, gridHeight, direction } = this.state;

    // Top border (each cell is 2 chars wide, so multiply gridWidth by 2)
    lines.push(
      SNAKE_CHARS.CORNER_TL + "═".repeat(gridWidth * 2) + SNAKE_CHARS.CORNER_TR
    );

    // Game grid
    for (let y = 0; y < gridHeight; y++) {
      let row = SNAKE_CHARS.BORDER_V;
      for (let x = 0; x < gridWidth; x++) {
        const isHead = snake[0].x === x && snake[0].y === y;
        const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
        const isFood = food.x === x && food.y === y;

        if (isHead) {
          // Render head based on direction
          switch (direction) {
            case "UP":
              row += SNAKE_CHARS.HEAD_UP;
              break;
            case "DOWN":
              row += SNAKE_CHARS.HEAD_DOWN;
              break;
            case "LEFT":
              row += SNAKE_CHARS.HEAD_LEFT;
              break;
            case "RIGHT":
              row += SNAKE_CHARS.HEAD_RIGHT;
              break;
          }
        } else if (isBody) {
          // Alternate body characters for visual effect
          const bodyIndex = snake.findIndex((s) => s.x === x && s.y === y);
          row +=
            bodyIndex % 2 === 0 ? SNAKE_CHARS.BODY : SNAKE_CHARS.BODY_LIGHT;
        } else if (isFood) {
          row += SNAKE_CHARS.FOOD;
        } else {
          row += SNAKE_CHARS.EMPTY;
        }
      }
      row += SNAKE_CHARS.BORDER_V;
      lines.push(row);
    }

    // Bottom border
    lines.push(
      SNAKE_CHARS.CORNER_BL + "═".repeat(gridWidth * 2) + SNAKE_CHARS.CORNER_BR
    );

    return lines;
  }

  public getStatusLine(): string {
    const { score, highScore, level, isPaused, gameOver } = this.state;
    let status = `Score: ${score} | High: ${highScore} | Level: ${level}`;
    if (isPaused) status += " | [PAUSED]";
    if (gameOver) status += " | GAME OVER";
    return status;
  }

  public getControlsHelp(): string {
    return "WASD/Arrows: Move | P: Pause | ESC: Exit";
  }
}
