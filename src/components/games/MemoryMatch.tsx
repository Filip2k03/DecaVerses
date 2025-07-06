'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Card, CardContent } from '@/components/ui/card';
import { DynamicGameIcon } from '@/components/DynamicGameIcon';
import { cn } from '@/lib/utils';
import { Trophy, Timer } from 'lucide-react';

const ICONS = ['SnakeIcon', 'Chess', 'Battleship', 'Minesweeper', 'BlockStacker', 'ClawMachineIcon'];
type CardData = { id: number; icon: string; isFlipped: boolean; isMatched: boolean };

const createShuffledBoard = (): CardData[] => {
  const duplicatedIcons = [...ICONS, ...ICONS];
  const shuffled = duplicatedIcons.sort(() => Math.random() - 0.5);
  return shuffled.map((icon, index) => ({ id: index, icon, isFlipped: false, isMatched: false }));
};

export const MemoryMatch = () => {
  const [cards, setCards] = useState<CardData[]>(createShuffledBoard());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const { scores, updateScore } = useGame();
  const highScore = scores[13] || 0;

  const resetGame = useCallback(() => {
    setCards(createShuffledBoard());
    setFlippedCards([]);
    setMoves(0);
    setTime(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!gameOver) {
      timer = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameOver]);

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || cards[index].isFlipped || gameOver) return;

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);
    setCards(c => c.map((card, i) => (i === index ? { ...card, isFlipped: true } : card)));

    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      const [firstIndex, secondIndex] = newFlippedCards;
      if (cards[firstIndex].icon === cards[secondIndex].icon) {
        setCards(c => c.map(card => (card.icon === cards[firstIndex].icon ? { ...card, isMatched: true } : card)));
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(c => c.map((card, i) => (i === firstIndex || i === secondIndex ? { ...card, isFlipped: false } : card)));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (cards.every(c => c.isMatched) && cards.length > 0) {
      setGameOver(true);
      updateScore(13, time);
    }
  }, [cards, time, updateScore]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-md text-lg font-headline">
        <div className="flex items-center gap-1">Moves: {moves}</div>
        <div className="flex items-center gap-1"><Timer className="h-5 w-5" /> {time}s</div>
        <div className="flex items-center gap-1"><Trophy className="h-5 w-5 text-yellow-500" /> Best: {highScore > 0 ? `${highScore}s` : '-'}</div>
      </div>
      <Card className="p-4 bg-primary/10">
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <div key={card.id} className="w-20 h-20 [perspective:1000px]" onClick={() => handleCardClick(index)}>
                <div
                className={cn(
                    'relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d]',
                    card.isFlipped && '[transform:rotateY(180deg)]'
                )}
                >
                    <div className="absolute w-full h-full rounded-lg bg-primary/50 flex items-center justify-center [backface-visibility:hidden]">
                    </div>
                    <div className="absolute w-full h-full rounded-lg bg-card flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        <DynamicGameIcon iconName={card.icon} className={cn("w-10 h-10", card.isMatched ? "text-cyan-400" : "text-primary-foreground")} />
                    </div>
                </div>
            </div>
          ))}
        </div>
      </Card>
      {gameOver && (
        <div className="text-center">
            <h2 className="text-2xl font-bold font-headline">You Win!</h2>
            <p>Your time: {time}s</p>
            <Button onClick={resetGame} className="mt-2" variant="outline">Play Again</Button>
        </div>
      )}
    </div>
  );
};
