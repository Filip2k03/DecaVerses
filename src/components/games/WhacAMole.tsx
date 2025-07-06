'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import { Trophy, Timer } from 'lucide-react';

const GRID_SIZE = 9;
const GAME_DURATION = 30; // seconds

export const WhacAMole = () => {
  const [moles, setMoles] = useState<boolean[]>(Array(GRID_SIZE).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isActive, setIsActive] = useState(false);
  
  const { scores, updateScore } = useGame();
  const highScore = scores[15] || 0;

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsActive(true);
    setMoles(Array(GRID_SIZE).fill(false));
  };

  const whackMole = (index: number) => {
    if (!isActive || !moles[index]) return;
    setScore(s => s + 1);
    setMoles(m => {
      const newMoles = [...m];
      newMoles[index] = false;
      return newMoles;
    });
  };

  useEffect(() => {
    if (!isActive) return;
    if (timeLeft === 0) {
      setIsActive(false);
      updateScore(15, score);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, score, updateScore]);

  useEffect(() => {
    if (!isActive) return;

    const moleInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * GRID_SIZE);
      setMoles(m => {
        const newMoles = [...m];
        newMoles[randomIndex] = true;
        return newMoles;
      });
      setTimeout(() => {
        setMoles(m => {
          const newMoles = [...m];
          newMoles[randomIndex] = false;
          return newMoles;
        });
      }, Math.random() * 500 + 500); // Moles stay up for 0.5-1s
    }, 600); // New mole appears every 0.6s

    return () => clearInterval(moleInterval);
  }, [isActive]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-sm text-lg font-headline">
        <div>Score: {score}</div>
        <div className='flex items-center gap-2'><Timer className="h-5 w-5"/> Time: {timeLeft}</div>
        <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best: {highScore}</div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-green-900/50 border-4 border-yellow-800">
        {moles.map((isUp, index) => (
          <div key={index} className="w-24 h-24 bg-yellow-900/80 rounded-full flex items-center justify-center overflow-hidden" onClick={() => whackMole(index)}>
            {isUp && (
                <div className="w-20 h-20 bg-yellow-600 rounded-full border-4 border-yellow-800 cursor-pointer animate-in slide-in-from-bottom-5 duration-100">
                    <div className="w-full h-full relative">
                        <div className="absolute top-4 left-5 w-4 h-4 bg-black rounded-full" />
                        <div className="absolute top-4 right-5 w-4 h-4 bg-black rounded-full" />
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-6 h-3 bg-white rounded-t-full" />
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>
      {!isActive && (
        <div className="text-center">
          {timeLeft === 0 && <h2 className="text-2xl font-bold font-headline mb-2">Time's Up!</h2>}
          <Button onClick={startGame} size="lg">
            {timeLeft === 0 ? "Play Again" : "Start Game"}
          </Button>
        </div>
      )}
    </div>
  );
};
