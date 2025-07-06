'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface ScoreData {
  [gameId: number]: number;
}

interface GameContextType {
  scores: ScoreData;
  updateScore: (gameId: number, newScore: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'decaverse-highscores';

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [scores, setScores] = useState<ScoreData>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedScores = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedScores) {
        setScores(JSON.parse(storedScores));
      }
    } catch (error) {
      console.warn("Could not read scores from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  const updateScore = useCallback((gameId: number, newScore: number) => {
    if (!isInitialized) return;

    setScores(prevScores => {
      const currentHighScore = prevScores[gameId] || 0;
      // For time-based scores (like Minesweeper, id 7), lower is better.
      const isTimeBased = gameId === 7;
      
      if (isTimeBased) {
          if (currentHighScore === 0 || newScore < currentHighScore) {
            const newScores = { ...prevScores, [gameId]: newScore };
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newScores));
            } catch (error) {
                console.warn("Could not save scores to localStorage", error);
            }
            return newScores;
          }
      } else {
        if (newScore > currentHighScore) {
            const newScores = { ...prevScores, [gameId]: newScore };
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newScores));
            } catch (error) {
                console.warn("Could not save scores to localStorage", error);
            }
            return newScores;
        }
      }
      return prevScores;
    });
  }, [isInitialized]);

  const value = {
    scores,
    updateScore,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
