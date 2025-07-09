'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import { Trophy, Skull, Crown } from 'lucide-react';

const GRID_SIZE = 9;
const MAX_MISSES = 5;

type MoleType = 'normal' | 'king' | null;

export const WhacAMole = () => {
  const [moles, setMoles] = useState<MoleType[]>(Array(GRID_SIZE).fill(null));
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(true);
  
  const { scores, updateScore } = useGame();
  const highScore = scores[15] || 0;

  const startGame = useCallback(() => {
    setScore(0);
    setMisses(0);
    setGameOver(false);
    setMoles(Array(GRID_SIZE).fill(null));
  }, []);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    updateScore(15, score);
  }, [score, updateScore]);

  const whackMole = (index: number) => {
    if (gameOver || !moles[index]) return;

    const moleType = moles[index];
    setScore(s => s + (moleType === 'king' ? 5 : 1));

    setMoles(m => {
      const newMoles = [...m];
      newMoles[index] = null;
      return newMoles;
    });
  };

  useEffect(() => {
    if (gameOver) return;
    if (misses >= MAX_MISSES) {
      handleGameOver();
      return;
    }

    const level = Math.floor(score / 10) + 1;
    const moleUpTime = Math.max(300, 1000 - level * 40);
    const moleSpawnInterval = Math.max(200, 600 - level * 30);

    const moleInterval = setInterval(() => {
      const emptyHoles = moles.map((m, i) => m === null ? i : -1).filter(i => i !== -1);
      if (emptyHoles.length === 0) return;

      const randomIndex = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
      const isKing = Math.random() < 0.1; // 10% chance for a king mole
      
      setMoles(m => {
        const newMoles = [...m];
        newMoles[randomIndex] = isKing ? 'king' : 'normal';
        return newMoles;
      });

      setTimeout(() => {
        setMoles(m => {
          const newMoles = [...m];
          // Only count as a miss if the mole is still there (wasn't whacked)
          if (newMoles[randomIndex] !== null) {
            setMisses(missCount => missCount + 1);
            newMoles[randomIndex] = null;
          }
          return newMoles;
        });
      }, moleUpTime);
    }, moleSpawnInterval);

    return () => clearInterval(moleInterval);
  }, [gameOver, score, misses, moles, handleGameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-sm text-lg font-headline">
        <div>Score: {score}</div>
        <div className='flex items-center gap-2'><Skull className="h-5 w-5 text-destructive"/> Misses: {misses}/{MAX_MISSES}</div>
        <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best: {highScore}</div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-green-900/50 border-4 border-yellow-800 shadow-inner">
        {moles.map((moleType, index) => (
          <div key={index} className="w-24 h-24 bg-yellow-900/80 rounded-full flex items-center justify-center overflow-hidden [perspective:800px]" onClick={() => whackMole(index)}>
            {moleType && (
                <div className={cn("w-20 h-20 rounded-full border-4 cursor-pointer animate-in slide-in-from-bottom-5 duration-100 [transform-style:preserve-3d] hover:[transform:rotateY(10deg)] transition-transform",
                  moleType === 'normal' ? 'bg-yellow-600 border-yellow-800' : 'bg-amber-400 border-amber-600'
                )}>
                    <div className="w-full h-full relative">
                        {moleType === 'king' && <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-300 rotate-12" />}
                        <div className="absolute top-4 left-5 w-4 h-4 bg-black rounded-full" />
                        <div className="absolute top-4 right-5 w-4 h-4 bg-black rounded-full" />
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-6 h-3 bg-white rounded-t-full" />
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="text-center">
          {misses >= MAX_MISSES && <h2 className="text-2xl font-bold font-headline mb-2">Game Over!</h2>}
          <Button onClick={startGame} size="lg">
            {score > 0 ? "Play Again" : "Start Game"}
          </Button>
        </div>
      )}
    </div>
  );
};
