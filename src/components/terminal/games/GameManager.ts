// Game Manager - Handles game sessions and state
import {
  GameId,
  GameInfo,
  GAMES_REGISTRY,
  getGameById,
  isGameAvailable,
} from "./types";
import { SnakeGame, SnakeGameState } from "./snake/SnakeGame";
import { TetrisGame, TetrisGameState } from "./tetris/TetrisGame";

type GameInstance = SnakeGame | TetrisGame;

export type ActiveGame = {
  id: GameId;
  instance: GameInstance;
};

export interface GameSession {
  activeGame: ActiveGame | null;
  isInGameMode: boolean;
}

export class GameManager {
  private session: GameSession = {
    activeGame: null,
    isInGameMode: false,
  };

  private onRender?: (
    lines: string[],
    statusLine: string,
    controlsHelp: string,
  ) => void;
  private onGameEnd?: (finalScore: number, isHighScore: boolean) => void;
  private onGameStart?: (gameInfo: GameInfo) => void;
  private renderInterval: NodeJS.Timeout | null = null;

  public setCallbacks(callbacks: {
    onRender?: (
      lines: string[],
      statusLine: string,
      controlsHelp: string,
    ) => void;
    onGameEnd?: (finalScore: number, isHighScore: boolean) => void;
    onGameStart?: (gameInfo: GameInfo) => void;
  }): void {
    this.onRender = callbacks.onRender;
    this.onGameEnd = callbacks.onGameEnd;
    this.onGameStart = callbacks.onGameStart;
  }

  public isInGameMode(): boolean {
    return this.session.isInGameMode;
  }

  public getActiveGame(): ActiveGame | null {
    return this.session.activeGame;
  }

  public listGames(): GameInfo[] {
    return GAMES_REGISTRY;
  }

  public getAvailableGames(): GameInfo[] {
    return GAMES_REGISTRY.filter((g) => g.version !== "0.0.0");
  }

  public startGame(gameIdOrName: string): {
    success: boolean;
    message: string;
    gameInfo?: GameInfo;
  } {
    const gameInfo = getGameById(gameIdOrName);

    if (!gameInfo) {
      return {
        success: false,
        message: `Game "${gameIdOrName}" not found. Use 'game' to see available games.`,
      };
    }

    if (!isGameAvailable(gameIdOrName)) {
      return {
        success: false,
        message: `"${gameInfo.name}" is coming soon! Stay tuned.`,
      };
    }

    // Clean up any existing game
    this.exitGame();

    // Create game instance based on ID
    let instance: GameInstance;

    switch (gameInfo.id) {
      case "snake":
        instance = new SnakeGame();
        break;
      case "tetris":
        instance = new TetrisGame();
        break;
      default:
        return {
          success: false,
          message: `Game "${gameInfo.id}" is not yet implemented.`,
        };
    }

    this.session = {
      activeGame: {
        id: gameInfo.id,
        instance,
      },
      isInGameMode: true,
    };

    // Set up state change callback for rendering
    instance.setStateChangeCallback(
      (state: SnakeGameState | TetrisGameState) => {
        if (this.onRender) {
          const lines = instance.render();
          const statusLine = instance.getStatusLine();
          const controlsHelp = instance.getControlsHelp();
          this.onRender(lines, statusLine, controlsHelp);
        }

        if (state.gameOver && this.onGameEnd) {
          this.onGameEnd(state.score, state.score > state.highScore);
        }
      },
    );

    instance.start();

    // Start render loop for smooth updates
    this.startRenderLoop();

    if (this.onGameStart) {
      this.onGameStart(gameInfo);
    }

    return {
      success: true,
      message: `Starting ${gameInfo.name}...`,
      gameInfo,
    };
  }

  private startRenderLoop(): void {
    if (this.renderInterval) return;

    this.renderInterval = setInterval(() => {
      if (this.session.activeGame && this.onRender) {
        const { instance } = this.session.activeGame;
        const lines = instance.render();
        const statusLine = instance.getStatusLine();
        const controlsHelp = instance.getControlsHelp();
        this.onRender(lines, statusLine, controlsHelp);
      }
    }, 50); // 20 FPS render rate
  }

  private stopRenderLoop(): void {
    if (this.renderInterval) {
      clearInterval(this.renderInterval);
      this.renderInterval = null;
    }
  }

  public exitGame(): {
    success: boolean;
    message: string;
    finalScore?: number;
  } {
    if (!this.session.activeGame) {
      return {
        success: false,
        message: "No game is currently running.",
      };
    }

    const { id, instance } = this.session.activeGame;
    const state = instance.getState();
    const finalScore = state.score;

    instance.stop();
    this.stopRenderLoop();

    this.session = {
      activeGame: null,
      isInGameMode: false,
    };

    return {
      success: true,
      message: `Exited ${id}. Final score: ${finalScore}`,
      finalScore,
    };
  }

  public pauseGame(): { success: boolean; message: string } {
    if (!this.session.activeGame) {
      return {
        success: false,
        message: "No game is currently running.",
      };
    }

    const { instance } = this.session.activeGame;
    instance.pause();
    const state = instance.getState();

    return {
      success: true,
      message: state.isPaused ? "Game paused." : "Game resumed.",
    };
  }

  public restartGame(): { success: boolean; message: string } {
    if (!this.session.activeGame) {
      return {
        success: false,
        message: "No game is currently running.",
      };
    }

    const { instance } = this.session.activeGame;
    instance.reset();
    instance.start();

    return {
      success: true,
      message: "Game restarted!",
    };
  }

  public handleKeyInput(key: string): boolean {
    if (!this.session.activeGame || !this.session.isInGameMode) {
      return false; // Key not handled
    }

    const { id, instance } = this.session.activeGame;

    // Handle game-specific input
    switch (id) {
      case "snake":
        return this.handleSnakeInput(instance as SnakeGame, key);
      case "tetris":
        return this.handleTetrisInput(instance as TetrisGame, key);
      default:
        return false;
    }
  }

  private handleSnakeInput(game: SnakeGame, key: string): boolean {
    const normalizedKey = key.toLowerCase();

    // Only handle movement and pause keys here
    // ESC and R are handled by GameCanvas for proper React state management
    switch (normalizedKey) {
      case "w":
      case "arrowup":
        game.setDirection("UP");
        return true;
      case "s":
      case "arrowdown":
        game.setDirection("DOWN");
        return true;
      case "a":
      case "arrowleft":
        game.setDirection("LEFT");
        return true;
      case "d":
      case "arrowright":
        game.setDirection("RIGHT");
        return true;
      case "p":
        this.pauseGame();
        return true;
      default:
        // Return true anyway - we're in game mode, all keys are "handled"
        // (ignored but not passed through)
        return true;
    }
  }

  private handleTetrisInput(game: TetrisGame, key: string): boolean {
    const normalizedKey = key.toLowerCase();

    switch (normalizedKey) {
      case "a":
      case "arrowleft":
        game.moveLeft();
        return true;
      case "d":
      case "arrowright":
        game.moveRight();
        return true;
      case "s":
      case "arrowdown":
        game.softDrop();
        return true;
      case "w":
      case "arrowup":
      case "x":
        game.rotateClockwise();
        return true;
      case "z":
        game.rotateCounterClockwise();
        return true;
      case " ":
      case "space":
        game.hardDrop();
        return true;
      case "c":
        game.holdCurrentPiece();
        return true;
      case "p":
        this.pauseGame();
        return true;
      default:
        return true;
    }
  }

  public destroy(): void {
    this.exitGame();
    this.stopRenderLoop();
  }
}

// Singleton instance for use across the app
let gameManagerInstance: GameManager | null = null;

export function getGameManager(): GameManager {
  if (!gameManagerInstance) {
    gameManagerInstance = new GameManager();
  }
  return gameManagerInstance;
}
