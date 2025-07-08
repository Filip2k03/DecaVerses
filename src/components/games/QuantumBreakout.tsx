'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy, Pause, Play, RefreshCw, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 12;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 20;

type Brick = { x: number; y: number; alive: boolean };

export const QuantumBreakout = () => {
  const [paddleX, setPaddleX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ball, setBall] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 4, vy: -4 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const { scores, updateScore } = useGame();
  const highScore = scores[20] || 0;

  const resetGame = useCallback(() => {
    const newBricks: Brick[] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        newBricks.push({
          x: c * (BRICK_WIDTH + 10) + 25,
          y: r * (BRICK_HEIGHT + 10) + 30,
          alive: true,
        });
      }
    }
    setBricks(newBricks);
    setBall({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 4, vy: -4 });
    setPaddleX(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPaused(false);
  }, []);

  const startGame = () => {
    resetGame();
  };
  
  const togglePause = useCallback(() => {
    if (!gameOver) setIsPaused(p => !p);
  }, [gameOver]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const newPaddleX = e.clientX - rect.left - PADDLE_WIDTH / 2;
        setPaddleX(Math.max(0, Math.min(newPaddleX, GAME_WIDTH - PADDLE_WIDTH)));
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameAreaRef.current && e.touches[0]) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const newPaddleX = e.touches[0].clientX - rect.left - PADDLE_WIDTH / 2;
        setPaddleX(Math.max(0, Math.min(newPaddleX, GAME_WIDTH - PADDLE_WIDTH)));
    }
  };

  const gameLoop = useCallback(() => {
    if (isPaused || gameOver) return;
    
    // Ball movement
    let newBall = { ...ball };
    newBall.x += newBall.vx;
    newBall.y += newBall.vy;

    // Wall collision
    if (newBall.x <= 0 || newBall.x >= GAME_WIDTH - BALL_SIZE) newBall.vx *= -1;
    if (newBall.y <= 0) newBall.vy *= -1;

    // Paddle collision
    if (newBall.y + BALL_SIZE >= GAME_HEIGHT - PADDLE_HEIGHT && newBall.x > paddleX && newBall.x < paddleX + PADDLE_WIDTH) {
      newBall.vy *= -1;
    }

    // Brick collision
    const newBricks = [...bricks];
    let bricksDestroyed = 0;
    newBricks.forEach((brick, i) => {
        if (brick.alive && newBall.x > brick.x && newBall.x < brick.x + BRICK_WIDTH && newBall.y > brick.y && newBall.y < brick.y + BRICK_HEIGHT) {
            brick.alive = false;
            newBall.vy *= -1;
            setScore(s => s + 10);
            bricksDestroyed++;
        }
    });
    if (bricksDestroyed > 0) setBricks(newBricks);


    // Bottom wall collision (lose life)
    if (newBall.y > GAME_HEIGHT) {
        setLives(l => l - 1);
        newBall = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 4, vy: -4 };
    }
    
    setBall(newBall);

    if (lives - 1 <= 0) {
      setGameOver(true);
      updateScore(20, score);
    }
    
    if (bricks.every(b => !b.alive) && bricks.length > 0) {
      setGameOver(true);
      updateScore(20, score);
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [ball, bricks, paddleX, isPaused, gameOver, lives, score, updateScore]);
  
  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameLoop]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-xl text-lg font-headline">
        <div>Score: {score}</div>
        <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best: {highScore}</div>
        <div className="flex items-center gap-2">
            {Array.from({length: lives}).map((_, i) => <Heart key={i} className="w-5 h-5 text-red-500 fill-current" />)}
        </div>
      </div>
      <div 
        ref={gameAreaRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative bg-black border-2 border-primary/50 overflow-hidden cursor-none" 
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT, boxShadow: '0 0 20px hsl(var(--primary)/0.5), inset 0 0 15px hsl(var(--primary)/0.3)' }}
      >
        {(gameOver || isPaused) && (
            <div className={cn("absolute inset-0 flex flex-col items-center justify-center z-10 text-white", gameOver ? 'bg-black/80' : 'bg-black/50')}>
                <h2 className="text-4xl font-bold font-headline">
                    {gameOver ? (bricks.every(b => !b.alive) ? "You Win!" : "Game Over") : "Paused"}
                </h2>
                <Button onClick={gameOver ? startGame : togglePause} className="mt-4" variant="outline">
                    {gameOver ? 'Play Again' : 'Resume'}
                </Button>
            </div>
        )}
        <div className="absolute bg-cyan-400" style={{ left: paddleX, bottom: 0, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, boxShadow: '0 0 10px hsl(var(--primary))' }} />
        <div className="absolute bg-white rounded-full" style={{ left: ball.x, top: ball.y, width: BALL_SIZE, height: BALL_SIZE, boxShadow: '0 0 10px #fff' }} />
        {bricks.map((brick, i) => brick.alive && (
            <div key={i} className="absolute bg-fuchsia-500" style={{ left: brick.x, top: brick.y, width: BRICK_WIDTH, height: BRICK_HEIGHT, boxShadow: '0 0 8px hsl(var(--accent))' }} />
        ))}
      </div>
       <div className="w-full flex flex-col items-center gap-2">
         {!gameOver && (
          <div className="flex gap-2 justify-center">
            <Button onClick={togglePause} variant="outline" disabled={gameOver}>
                {isPaused ? <Play /> : <Pause />}
                <span className="ml-2">{isPaused ? 'Resume' : 'Pause'}</span>
            </Button>
            <Button onClick={startGame} variant="destructive">
                <RefreshCw />
                <span className="ml-2">Restart</span>
            </Button>
          </div>
        )}
        <p className="text-sm text-muted-foreground">Move mouse or touch to control paddle.</p>
      </div>
    </div>
  );
};
