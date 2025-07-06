'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Joystick } from '@/components/Joystick';
import { useGame } from '@/context/GameContext';
import { Trophy, Pause, Play, RefreshCw } from 'lucide-react';

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
  const [isPaused, setIsPaused] = useState(false);
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
    setIsPaused(false);
    setScore(0);
  }, []);

  const togglePause = () => {
      if (!gameOver) {
          setIsPaused(p => !p);
      }
  }

  const changeDirection = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if(isPaused) return;
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
  }, [direction, isPaused]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
    }
    switch (e.key) {
      case 'ArrowUp': changeDirection('up'); break;
      case 'ArrowDown': changeDirection('down'); break;
      case 'ArrowLeft': changeDirection('left'); break;
      case 'ArrowRight': changeDirection('right'); break;
    }
  }, [changeDirection, togglePause]);

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
    if (isPaused) return;
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
  }, [snake, direction, food, speed, handleGameOver, isPaused]);

  useEffect(() => {
    if (gameOver || isPaused) return;
    const interval = setInterval(gameLoop, speed);
    return () => clearInterval(interval);
  }, [gameLoop, speed, gameOver, isPaused]);


  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="bg-transparent border-none shadow-none">
        <CardContent className="p-2 relative">
            <div
                className="relative bg-muted/20"
                style={{
                    width: BOARD_SIZE * CELL_SIZE,
                    height: BOARD_SIZE * CELL_SIZE,
                    border: '2px solid hsl(var(--primary))',
                    boxShadow: 'inset 0 0 15px hsl(var(--primary)/0.5), 0 0 15px hsl(var(--primary)/0.5)',
                }}
            >
                {(gameOver || isPaused) && (
                     <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 text-white gap-4">
                        {gameOver ? (
                            <>
                                <h2 className="text-4xl font-bold font-headline">Game Over</h2>
                                <Button onClick={resetGame}>Play Again</Button>
                            </>
                        ) : (
                            <>
                                <h2 className="text-4xl font-bold font-headline">Paused</h2>
                                <Button onClick={togglePause}>Resume</Button>
                            </>
                        )}
                    </div>
                )}
                {/* Grid pattern */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)/0.1) 1px, transparent 1px), linear-gradient(to right, hsl(var(--primary)/0.1) 1px, transparent 1px)', backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` }} />

                <div
                    style={{
                        width: BOARD_SIZE * CELL_SIZE,
                        height: BOARD_SIZE * CELL_SIZE,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                        gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
                    }}
                >
                    {snake.map((segment, index) => (
                    <div
                        key={index}
                        style={{
                            gridColumnStart: segment.x + 1,
                            gridRowStart: segment.y + 1,
                            backgroundColor: index === 0 ? 'hsl(var(--accent))' : 'hsl(var(--primary))',
                            borderRadius: '4px',
                            boxShadow: `0 0 8px ${index === 0 ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}`
                        }}
                    />
                    ))}
                    <div
                        style={{
                            gridColumnStart: food.x + 1,
                            gridRowStart: food.y + 1,
                            backgroundColor: 'hsl(var(--destructive))',
                            borderRadius: '50%',
                            boxShadow: '0 0 10px hsl(var(--destructive))'
                        }}
                    />
                </div>
            </div>
        </CardContent>
      </Card>
      <div className="text-center w-full max-w-sm">
        <div className='flex gap-4 mb-4 justify-center'>
            <div className='p-2 rounded-md bg-muted flex-1'>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">{score}</p>
            </div>
            <div className='p-2 rounded-md bg-muted flex-1'>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Trophy className='h-4 w-4 text-yellow-500' /> High Score</p>
                <p className="text-2xl font-bold">{highScore}</p>
            </div>
        </div>
        {!gameOver && (
            <div className="flex gap-2 justify-center">
                <Button onClick={togglePause} variant="outline">
                    {isPaused ? <Play /> : <Pause />}
                    <span className="ml-2">{isPaused ? 'Resume' : 'Pause'}</span>
                </Button>
                 <Button onClick={resetGame} variant="destructive">
                    <RefreshCw />
                    <span className="ml-2">Restart</span>
                </Button>
            </div>
        )}
      </div>
      {isMobile && !gameOver && <Joystick onMove={handleJoystickMove} />}
    </div>
  );
};

export { Snake };
