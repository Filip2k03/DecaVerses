'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Joystick } from '@/components/Joystick';
import { useGame } from '@/context/GameContext';
import { Trophy } from 'lucide-react';

const BOARD_SIZE = 20;
const CELL_SIZE = 20; // in pixels

const getRandomCoords = () => ({
  x: Math.floor(Math.random() * BOARD_SIZE),
  y: Math.floor(Math.random() * BOARD_SIZE),
});

const Snake = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState(getRandomCoords());
  const [direction, setDirection] = useState({ x: 0, y: -1 }); // Start moving up
  const [speed, setSpeed] = useState<number | null>(200);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const isMobile = useIsMobile();
  const { scores, updateScore } = useGame();
  const highScore = scores[2] || 0;

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setSpeed(null);
    updateScore(2, score);
  }, [score, updateScore]);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(getRandomCoords());
    setDirection({ x: 0, y: -1 });
    setSpeed(200);
    setGameOver(false);
    setScore(0);
  }, []);

  const changeDirection = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    switch (dir) {
      case 'up':
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case 'down':
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case 'left':
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case 'right':
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
    }
  }, [direction]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': changeDirection('up'); break;
      case 'ArrowDown': changeDirection('down'); break;
      case 'ArrowLeft': changeDirection('left'); break;
      case 'ArrowRight': changeDirection('right'); break;
    }
  }, [changeDirection]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  const handleJoystickMove = (dir: 'up' | 'down' | 'left' | 'right' | 'center') => {
      if (gameOver) return;
      if (dir !== 'center') {
          changeDirection(dir);
      }
  }

  const gameLoop = useCallback(() => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    head.x += direction.x;
    head.y += direction.y;
    
    // Wall collision
    if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
      handleGameOver();
      return;
    }
    
    // Self collision
    for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
            handleGameOver();
            return;
        }
    }

    newSnake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      setScore(s => s + 10);
      setFood(getRandomCoords());
      if (speed && speed > 50) setSpeed(s => (s ? s * 0.95 : null));
    } else {
      newSnake.pop();
    }
    
    setSnake(newSnake);
  }, [snake, direction, food, speed, handleGameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(gameLoop, speed);
    return () => clearInterval(interval);
  }, [gameLoop, speed, gameOver]);


  return (
    <div className="flex flex-col items-center gap-4">
      <Card>
        <CardContent className="p-2">
            <div
                style={{
                width: BOARD_SIZE * CELL_SIZE,
                height: BOARD_SIZE * CELL_SIZE,
                display: 'grid',
                gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
                border: '2px solid hsl(var(--primary))',
                backgroundColor: 'hsl(var(--muted))'
                }}
            >
                {snake.map((segment, index) => (
                <div
                    key={index}
                    style={{
                    gridColumnStart: segment.x + 1,
                    gridRowStart: segment.y + 1,
                    backgroundColor: index === 0 ? 'hsl(var(--foreground))' : 'hsl(var(--accent))',
                    borderRadius: '4px'
                    }}
                />
                ))}
                <div
                style={{
                    gridColumnStart: food.x + 1,
                    gridRowStart: food.y + 1,
                    backgroundColor: 'hsl(var(--destructive))',
                    borderRadius: '50%'
                }}
                />
            </div>
        </CardContent>
      </Card>
      <div className="text-center">
        <div className='flex gap-4 mb-4 justify-center'>
            <div className='p-2 rounded-md bg-muted'>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">{score}</p>
            </div>
            <div className='p-2 rounded-md bg-muted'>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Trophy className='h-4 w-4 text-yellow-500' /> High Score</p>
                <p className="text-2xl font-bold">{highScore}</p>
            </div>
        </div>

        {gameOver && (
          <div className="mt-4">
            <p className="text-2xl font-bold text-destructive">Game Over!</p>
            <Button onClick={resetGame} className="mt-2">Play Again</Button>
          </div>
        )}
      </div>
      {isMobile && !gameOver && <Joystick onMove={handleJoystickMove} />}
    </div>
  );
};

export { Snake };
