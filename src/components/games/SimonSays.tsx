'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

const COLORS = ['green', 'red', 'yellow', 'blue'];
const COLOR_CLASSES = {
  green: 'bg-green-500 hover:bg-green-600',
  red: 'bg-red-500 hover:bg-red-600',
  yellow: 'bg-yellow-400 hover:bg-yellow-500',
  blue: 'bg-blue-500 hover:bg-blue-600',
};

export const SimonSays = () => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(true);

  const { scores, updateScore } = useGame();
  const highScore = scores[14] || 0;

  const addNewColor = () => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence(s => [...s, nextColor]);
  };

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setLevel(1);
    setGameOver(false);
  };

  useEffect(() => {
    if (level > 0 && !gameOver) {
      const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      setSequence(s => [...s, nextColor]);
    }
  }, [level, gameOver]);

  const playSequence = useCallback(() => {
    setIsPlayerTurn(false);
    sequence.forEach((color, index) => {
      setTimeout(() => {
        setActiveColor(color);
        setTimeout(() => setActiveColor(null), 500);
      }, (index + 1) * 700);
    });
    setTimeout(() => setIsPlayerTurn(true), sequence.length * 700 + 500);
  }, [sequence]);
  
  useEffect(() => {
    if (sequence.length > 0 && !gameOver) {
        playSequence();
    }
  }, [sequence, gameOver, playSequence]);
  
  const handleColorClick = (color: string) => {
    if (!isPlayerTurn || gameOver) return;
    
    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);
    
    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
        setGameOver(true);
        updateScore(14, level -1);
        return;
    }
    
    if (newPlayerSequence.length === sequence.length) {
        setIsPlayerTurn(false);
        setPlayerSequence([]);
        setTimeout(() => {
            setLevel(l => l + 1);
        }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-sm text-lg font-headline">
        <div>Level: {gameOver ? 0 : level}</div>
        <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best: {highScore}</div>
      </div>
      <div className="relative w-80 h-80 rounded-full bg-background p-4 shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
        <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full">
            {COLORS.map(color => (
                <div
                    key={color}
                    onClick={() => handleColorClick(color)}
                    className={cn(
                        'rounded-xl cursor-pointer transition-all duration-200 border-4 border-transparent',
                        COLOR_CLASSES[color as keyof typeof COLOR_CLASSES],
                        activeColor === color && 'scale-105 border-white',
                        !isPlayerTurn && 'cursor-not-allowed',
                    )}
                />
            ))}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {gameOver ? 'Start' : isPlayerTurn ? 'Your Turn' : 'Watch'}
        </div>
      </div>
      {gameOver ? (
        <Button onClick={startGame} size="lg">Start Game</Button>
      ) : (
        <p className="text-muted-foreground">{isPlayerTurn ? "Repeat the sequence" : "Memorize the sequence"}</p>
      )}
    </div>
  );
};
