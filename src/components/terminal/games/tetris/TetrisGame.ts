import { GameState } from "../types";

type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

type ActivePiece = {
  type: PieceType;
  matrix: number[][];
  x: number;
  y: number;
};

export interface TetrisGameState extends GameState {
  board: number[][];
  width: number;
  height: number;
  level: number;
  lines: number;
  speed: number;
  currentPiece: ActivePiece | null;
  nextPieceType: PieceType;
  holdPieceType: PieceType | null;
}

const PIECE_ORDER: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

const PIECES: Record<PieceType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const TETRIS_CONFIG = {
  WIDTH: 10,
  HEIGHT: 20,
  INITIAL_SPEED: 700,
  SPEED_STEP: 55,
  MIN_SPEED: 90,
  LINES_PER_LEVEL: 10,
  SOFT_DROP_POINTS: 1,
  HARD_DROP_POINTS_PER_CELL: 2,
};

const TETRIS_CHARS = {
  BLOCK: "██",
  ACTIVE: "▓▓",
  GHOST: "░░",
  EMPTY: "  ",
  BORDER_V: "║",
  TOP_LEFT: "╔",
  TOP_RIGHT: "╗",
  BOT_LEFT: "╚",
  BOT_RIGHT: "╝",
};

function cloneMatrix(matrix: number[][]): number[][] {
  return matrix.map((row) => [...row]);
}

function createEmptyBoard(width: number, height: number): number[][] {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

function rotateClockwise(matrix: number[][]): number[][] {
  const h = matrix.length;
  const w = matrix[0].length;
  const rotated = Array.from({ length: w }, () => Array(h).fill(0));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      rotated[x][h - 1 - y] = matrix[y][x];
    }
  }

  return rotated;
}

export class TetrisGame {
  private state: TetrisGameState;
  private onStateChange?: (state: TetrisGameState) => void;
  private gameLoop: NodeJS.Timeout | null = null;
  private bag: PieceType[] = [];
  private canHold = true;

  constructor() {
    this.state = this.createInitialState();
    this.loadHighScore();
  }

  private createInitialState(): TetrisGameState {
    const width = TETRIS_CONFIG.WIDTH;
    const height = TETRIS_CONFIG.HEIGHT;
    const firstType = this.pickPieceType();

    return {
      board: createEmptyBoard(width, height),
      width,
      height,
      level: 1,
      lines: 0,
      speed: TETRIS_CONFIG.INITIAL_SPEED,
      isRunning: false,
      isPaused: false,
      score: 0,
      highScore: 0,
      gameOver: false,
      currentPiece: this.createPiece(firstType),
      nextPieceType: this.pickPieceType(),
      holdPieceType: null,
    };
  }

  private refillBag(): void {
    this.bag = [...PIECE_ORDER]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((entry) => entry.value);
  }

  private pickPieceType(): PieceType {
    if (this.bag.length === 0) {
      this.refillBag();
    }
    return this.bag.shift() as PieceType;
  }

  private createPiece(type: PieceType): ActivePiece {
    const matrix = cloneMatrix(PIECES[type]);
    const x =
      Math.floor((this.state?.width ?? TETRIS_CONFIG.WIDTH) / 2) -
      Math.ceil(matrix[0].length / 2);
    return { type, matrix, x, y: 0 };
  }

  private loadHighScore(): void {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zigla-tetris-highscore");
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
        "zigla-tetris-highscore",
        this.state.score.toString(),
      );
    }
  }

  public setStateChangeCallback(
    callback: (state: TetrisGameState) => void,
  ): void {
    this.onStateChange = callback;
  }

  public getState(): TetrisGameState {
    return {
      ...this.state,
      board: this.state.board.map((row) => [...row]),
      currentPiece: this.state.currentPiece
        ? {
            ...this.state.currentPiece,
            matrix: cloneMatrix(this.state.currentPiece.matrix),
          }
        : null,
    };
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
    this.bag = [];
    this.canHold = true;
    this.state = this.createInitialState();
    this.loadHighScore();
    this.notifyStateChange();
  }

  public moveLeft(): void {
    this.tryMove(-1, 0);
  }

  public moveRight(): void {
    this.tryMove(1, 0);
  }

  public softDrop(): void {
    if (this.tryMove(0, 1)) {
      this.state.score += TETRIS_CONFIG.SOFT_DROP_POINTS;
      this.notifyStateChange();
      return;
    }

    this.lockCurrentPiece();
    this.notifyStateChange();
  }

  public hardDrop(): void {
    if (!this.isPlayable()) return;

    let dropped = 0;
    while (this.tryMove(0, 1, false)) {
      dropped += 1;
    }

    this.state.score += dropped * TETRIS_CONFIG.HARD_DROP_POINTS_PER_CELL;
    this.lockCurrentPiece();
    this.notifyStateChange();
  }

  public rotateClockwise(): void {
    this.rotate(true);
  }

  public rotateCounterClockwise(): void {
    this.rotate(false);
  }

  public holdCurrentPiece(): void {
    if (!this.isPlayable() || !this.canHold || !this.state.currentPiece) {
      return;
    }

    const currentType = this.state.currentPiece.type;

    if (!this.state.holdPieceType) {
      this.state.holdPieceType = currentType;
      this.spawnPiece(this.state.nextPieceType);
      this.state.nextPieceType = this.pickPieceType();
    } else {
      const swappedType = this.state.holdPieceType;
      this.state.holdPieceType = currentType;
      this.spawnPiece(swappedType);
    }

    this.canHold = false;
    this.notifyStateChange();
  }

  private startGameLoop(): void {
    if (this.gameLoop) return;
    this.gameLoop = setInterval(() => this.tick(), this.state.speed);
  }

  private stopGameLoop(): void {
    if (!this.gameLoop) return;
    clearInterval(this.gameLoop);
    this.gameLoop = null;
  }

  private resetGameLoopForSpeed(): void {
    if (!this.state.isRunning || this.state.isPaused) return;
    this.stopGameLoop();
    this.startGameLoop();
  }

  private isPlayable(): boolean {
    return this.state.isRunning && !this.state.isPaused && !this.state.gameOver;
  }

  private tick(): void {
    if (!this.isPlayable()) return;

    if (!this.tryMove(0, 1, false)) {
      this.lockCurrentPiece();
    }

    this.notifyStateChange();
  }

  private tryMove(dx: number, dy: number, shouldNotify = true): boolean {
    if (!this.isPlayable() || !this.state.currentPiece) return false;

    const candidate: ActivePiece = {
      ...this.state.currentPiece,
      x: this.state.currentPiece.x + dx,
      y: this.state.currentPiece.y + dy,
    };

    if (this.collides(candidate)) {
      return false;
    }

    this.state.currentPiece = candidate;
    if (shouldNotify) {
      this.notifyStateChange();
    }
    return true;
  }

  private rotate(clockwise: boolean): void {
    if (!this.isPlayable() || !this.state.currentPiece) return;

    const piece = this.state.currentPiece;
    let rotated = cloneMatrix(piece.matrix);

    if (clockwise) {
      rotated = rotateClockwise(rotated);
    } else {
      rotated = rotateClockwise(rotateClockwise(rotateClockwise(rotated)));
    }

    const kicks = [0, -1, 1, -2, 2];
    for (const kickX of kicks) {
      const candidate: ActivePiece = {
        ...piece,
        matrix: rotated,
        x: piece.x + kickX,
      };

      if (!this.collides(candidate)) {
        this.state.currentPiece = candidate;
        this.notifyStateChange();
        return;
      }
    }
  }

  private collides(piece: ActivePiece): boolean {
    for (let y = 0; y < piece.matrix.length; y++) {
      for (let x = 0; x < piece.matrix[y].length; x++) {
        if (!piece.matrix[y][x]) continue;

        const boardX = piece.x + x;
        const boardY = piece.y + y;

        if (
          boardX < 0 ||
          boardX >= this.state.width ||
          boardY >= this.state.height
        ) {
          return true;
        }

        if (boardY >= 0 && this.state.board[boardY][boardX] !== 0) {
          return true;
        }
      }
    }

    return false;
  }

  private lockCurrentPiece(): void {
    const piece = this.state.currentPiece;
    if (!piece) return;

    for (let y = 0; y < piece.matrix.length; y++) {
      for (let x = 0; x < piece.matrix[y].length; x++) {
        if (!piece.matrix[y][x]) continue;
        const boardX = piece.x + x;
        const boardY = piece.y + y;

        if (boardY < 0) {
          this.endGame();
          return;
        }

        if (
          boardY >= 0 &&
          boardY < this.state.height &&
          boardX >= 0 &&
          boardX < this.state.width
        ) {
          this.state.board[boardY][boardX] = 1;
        }
      }
    }

    this.clearLines();
    this.canHold = true;

    const nextType = this.state.nextPieceType;
    this.state.nextPieceType = this.pickPieceType();
    this.spawnPiece(nextType);
  }

  private spawnPiece(type: PieceType): void {
    const piece = this.createPiece(type);
    this.state.currentPiece = piece;

    if (this.collides(piece)) {
      this.endGame();
    }
  }

  private clearLines(): void {
    const remainingRows = this.state.board.filter((row) =>
      row.some((cell) => cell === 0),
    );
    const cleared = this.state.height - remainingRows.length;

    if (cleared <= 0) {
      return;
    }

    const freshRows = Array.from({ length: cleared }, () =>
      Array(this.state.width).fill(0),
    );
    this.state.board = [...freshRows, ...remainingRows];
    this.state.lines += cleared;

    const lineScores = [0, 100, 300, 500, 800];
    this.state.score += (lineScores[cleared] ?? 0) * this.state.level;

    const targetLevel =
      Math.floor(this.state.lines / TETRIS_CONFIG.LINES_PER_LEVEL) + 1;
    if (targetLevel > this.state.level) {
      this.state.level = targetLevel;
      this.state.speed = Math.max(
        TETRIS_CONFIG.MIN_SPEED,
        TETRIS_CONFIG.INITIAL_SPEED -
          (this.state.level - 1) * TETRIS_CONFIG.SPEED_STEP,
      );
      this.resetGameLoopForSpeed();
    }
  }

  private getGhostPieceY(piece: ActivePiece): number {
    let ghostY = piece.y;
    while (
      !this.collides({
        ...piece,
        y: ghostY + 1,
      })
    ) {
      ghostY += 1;
    }
    return ghostY;
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
    const { board, width, height, currentPiece } = this.state;

    lines.push(
      TETRIS_CHARS.TOP_LEFT + "═".repeat(width * 2) + TETRIS_CHARS.TOP_RIGHT,
    );

    const display = board.map((row) => [...row]);

    if (currentPiece) {
      const ghostY = this.getGhostPieceY(currentPiece);

      for (let y = 0; y < currentPiece.matrix.length; y++) {
        for (let x = 0; x < currentPiece.matrix[y].length; x++) {
          if (!currentPiece.matrix[y][x]) continue;
          const gx = currentPiece.x + x;
          const gy = ghostY + y;
          if (
            gy >= 0 &&
            gy < height &&
            gx >= 0 &&
            gx < width &&
            display[gy][gx] === 0
          ) {
            display[gy][gx] = 2;
          }
        }
      }

      for (let y = 0; y < currentPiece.matrix.length; y++) {
        for (let x = 0; x < currentPiece.matrix[y].length; x++) {
          if (!currentPiece.matrix[y][x]) continue;
          const bx = currentPiece.x + x;
          const by = currentPiece.y + y;
          if (by >= 0 && by < height && bx >= 0 && bx < width) {
            display[by][bx] = 3;
          }
        }
      }
    }

    for (let y = 0; y < height; y++) {
      let row = TETRIS_CHARS.BORDER_V;
      for (let x = 0; x < width; x++) {
        const cell = display[y][x];
        if (cell === 1) {
          row += TETRIS_CHARS.BLOCK;
        } else if (cell === 2) {
          row += TETRIS_CHARS.GHOST;
        } else if (cell === 3) {
          row += TETRIS_CHARS.ACTIVE;
        } else {
          row += TETRIS_CHARS.EMPTY;
        }
      }
      row += TETRIS_CHARS.BORDER_V;
      lines.push(row);
    }

    lines.push(
      TETRIS_CHARS.BOT_LEFT + "═".repeat(width * 2) + TETRIS_CHARS.BOT_RIGHT,
    );

    return lines;
  }

  public getStatusLine(): string {
    const {
      score,
      highScore,
      level,
      lines,
      isPaused,
      gameOver,
      nextPieceType,
      holdPieceType,
    } = this.state;
    let status = `Score: ${score} | High: ${highScore} | Level: ${level} | Lines: ${lines} | Next: ${nextPieceType} | Hold: ${holdPieceType ?? "-"}`;
    if (isPaused) status += " | [PAUSED]";
    if (gameOver) status += " | GAME OVER";
    return status;
  }

  public getControlsHelp(): string {
    return "A/D/Left/Right: Move | W/X/Up: Rotate | Z: CCW | S/Down: Soft Drop | Space: Hard Drop | C: Hold | P: Pause | ESC: Exit";
  }
}
