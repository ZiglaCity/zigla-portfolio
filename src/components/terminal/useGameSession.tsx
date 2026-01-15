"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GameManager, getGameManager, GameInfo } from "./games";

export interface GameDisplayState {
  isActive: boolean;
  gameLines: string[];
  statusLine: string;
  controlsHelp: string;
  gameInfo: GameInfo | null;
  showGameOver: boolean;
  finalScore: number;
  isHighScore: boolean;
}

const initialDisplayState: GameDisplayState = {
  isActive: false,
  gameLines: [],
  statusLine: "",
  controlsHelp: "",
  gameInfo: null,
  showGameOver: false,
  finalScore: 0,
  isHighScore: false,
};

export function useGameSession() {
  const [displayState, setDisplayState] =
    useState<GameDisplayState>(initialDisplayState);
  const [isGameActive, setIsGameActive] = useState(false);
  const gameManagerRef = useRef<GameManager | null>(null);

  // Initialize game manager
  useEffect(() => {
    gameManagerRef.current = getGameManager();

    gameManagerRef.current.setCallbacks({
      onRender: (lines, statusLine, controlsHelp) => {
        setDisplayState((prev) => ({
          ...prev,
          gameLines: lines,
          statusLine,
          controlsHelp,
        }));
      },
      onGameEnd: (finalScore, isHighScore) => {
        setDisplayState((prev) => ({
          ...prev,
          showGameOver: true,
          finalScore,
          isHighScore,
        }));
      },
      onGameStart: (gameInfo) => {
        setDisplayState((prev) => ({
          ...prev,
          isActive: true,
          gameInfo,
          showGameOver: false,
          finalScore: 0,
          isHighScore: false,
        }));
        setIsGameActive(true);
      },
    });

    return () => {
      gameManagerRef.current?.destroy();
    };
  }, []);

  const startGame = useCallback((gameIdOrName: string) => {
    if (!gameManagerRef.current)
      return { success: false, message: "Game system not initialized" };
    const result = gameManagerRef.current.startGame(gameIdOrName);
    if (result.success) {
      setIsGameActive(true);
    }
    return result;
  }, []);

  const exitGame = useCallback(() => {
    if (!gameManagerRef.current)
      return { success: false, message: "Game system not initialized" };
    const result = gameManagerRef.current.exitGame();
    if (result.success) {
      setDisplayState(initialDisplayState);
      setIsGameActive(false);
    }
    return result;
  }, []);

  const pauseGame = useCallback(() => {
    if (!gameManagerRef.current)
      return { success: false, message: "Game system not initialized" };
    return gameManagerRef.current.pauseGame();
  }, []);

  const restartGame = useCallback(() => {
    if (!gameManagerRef.current)
      return { success: false, message: "Game system not initialized" };
    return gameManagerRef.current.restartGame();
  }, []);

  const handleGameKeyInput = useCallback((key: string): boolean => {
    if (!gameManagerRef.current) return false;
    return gameManagerRef.current.handleKeyInput(key);
  }, []);

  const isInGameMode = useCallback((): boolean => {
    return isGameActive;
  }, [isGameActive]);

  const listGames = useCallback(() => {
    return gameManagerRef.current?.listGames() ?? [];
  }, []);

  const getAvailableGames = useCallback(() => {
    return gameManagerRef.current?.getAvailableGames() ?? [];
  }, []);

  return {
    displayState,
    startGame,
    exitGame,
    pauseGame,
    restartGame,
    handleGameKeyInput,
    isInGameMode,
    isGameActive,
    listGames,
    getAvailableGames,
  };
}
