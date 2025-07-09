
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy, Pause, Play, RefreshCw, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 12;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 20;

const BRICK_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

type Brick = { x: number; y: number; health: number; color: string };
type GameStatus = 'playing' | 'paused' | 'gameover' | 'victory';

export const QuantumBreakout = () => {
  const [paddleX, setPaddleX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ball, setBall] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 4, vy: -4 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const moveDirection = useRef<'left' | 'right' | null>(null);

  const { scores, updateScore } = useGame();
  const highScore = scores[20] || 0;
  const isMobile = useIsMobile();

  const generateBricks = useCallback((currentLevel: number) => {
    const newBricks: Brick[] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        newBricks.push({
          x: c * (BRICK_WIDTH + 10) + 25,
          y: r * (BRICK_HEIGHT + 10) + 30,
          health: currentLevel,
          color: BRICK_COLORS[r % BRICK_COLORS.length],
        });
      }
    }
    setBricks(newBricks);
  }, []);

  const resetGame = useCallback(() => {
    setLevel(1);
    generateBricks(1);
    setBall({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 4, vy: -4 });
    setPaddleX(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
    setScore(0);
    setLives(3);
    setGameStatus('playing');
  }, [generateBricks]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  const togglePause = useCallback(() => {
    if (gameStatus === 'playing') setGameStatus('paused');
    else if (gameStatus === 'paused') setGameStatus('playing');
  }, [gameStatus]);

  // Paddle movement from direct input (mouse/touch)
  const handleDirectMove = (clientX: number) => {
      if (gameAreaRef.current) {
          const rect = gameAreaRef.current.getBoundingClientRect();
          const newPaddleX = clientX - rect.left - PADDLE_WIDTH / 2;
          setPaddleX(Math.max(0, Math.min(newPaddleX, GAME_WIDTH - PADDLE_WIDTH)));
      }
  };

  // Paddle movement from buttons (for mobile)
  const paddleMoveLoop = useCallback(() => {
    if (moveDirection.current) {
        setPaddleX(x => {
            const newX = x + (moveDirection.current === 'left' ? -8 : 8);
            return Math.max(0, Math.min(newX, GAME_WIDTH - PADDLE_WIDTH));
        });
    }
    requestAnimationFrame(paddleMoveLoop);
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(paddleMoveLoop);
    return () => cancelAnimationFrame(frameId);
  }, [paddleMoveLoop]);
  
  const handleMoveStart = (dir: 'left' | 'right') => { moveDirection.current = dir; };
  const handleMoveEnd = () => { moveDirection.current = null; };

  const gameLoop = useCallback(() => {
    if (gameStatus !== 'playing') return;
    
    // Ball movement
    setBall(b => {
        let { x, y, vx, vy } = { ...b };
        x += vx;
        y += vy;
        
        // Wall collision
        if (x <= 0 || x >= GAME_WIDTH - BALL_SIZE) vx *= -1;
        if (y <= 0) vy *= -1;
        
        // Paddle collision
        if (y + BALL_SIZE >= GAME_HEIGHT - PADDLE_HEIGHT && x + BALL_SIZE > paddleX && x < paddleX + PADDLE_WIDTH) {
            vy = -Math.abs(vy);
            const hitPos = (x - paddleX) / PADDLE_WIDTH;
            vx = (hitPos - 0.5) * 8; // Change angle based on where it hits the paddle
        }

        // Brick collision
        setBricks(currentBricks => {
            const newBricks = [...currentBricks];
            let hit = false;
            for (const brick of newBricks) {
                if (brick.health > 0 && x + BALL_SIZE > brick.x && x < brick.x + BRICK_WIDTH && y + BALL_SIZE > brick.y && y < brick.y + BRICK_HEIGHT) {
                    hit = true;
                    brick.health -= 1;
                    setScore(s => s + 10 * level);
                    break; // one hit per frame
                }
            }
            if (hit) vy *= -1;
            return newBricks;
        });

        // Bottom wall collision (lose life)
        if (y > GAME_HEIGHT) {
            setLives(l => l - 1);
            if (lives - 1 <= 0) {
                setGameStatus('gameover');
                updateScore(20, score);
            } else {
                x = paddleX + PADDLE_WIDTH / 2;
                y = GAME_HEIGHT / 2;
                vx = 4;
                vy = -4;
            }
        }
        
        // Check for level clear
        if (bricks.length > 0 && bricks.every(b => b.health === 0)) {
            setLevel(l => l + 1);
            generateBricks(level + 1);
            x = GAME_WIDTH / 2;
            y = GAME_HEIGHT / 2;
            vx = 4 + (level + 1) * 0.5;
            vy = -4 - (level + 1) * 0.5;
        }

        return { x, y, vx, vy };
    });
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameStatus, paddleX, bricks, lives, level, score, updateScore, generateBricks]);
  
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameLoop]);

  const getStatusMessage = () => {
    switch(gameStatus) {
        case 'gameover': return 'Game Over';
        case 'paused': return 'Paused';
        case 'victory': return 'You Win!';
        default: return 'Playing';
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-xl text-lg font-headline">
        <div>Score: {score}</div>
        <div>Level: {level}</div>
        <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best: {highScore}</div>
        <div className="flex items-center gap-2">
            {Array.from({length: lives}).map((_, i) => <Heart key={i} className="w-5 h-5 text-red-500 fill-current" />)}
        </div>
      </div>
      <div 
        ref={gameAreaRef}
        onMouseMove={(e) => handleDirectMove(e.clientX)}
        onTouchMove={(e) => handleDirectMove(e.touches[0].clientX)}
        className="relative bg-black border-2 border-primary/50 overflow-hidden cursor-none" 
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT, boxShadow: '0 0 20px hsl(var(--primary)/0.5), inset 0 0 15px hsl(var(--primary)/0.3)' }}
      >
        {gameStatus !== 'playing' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-white">
                <h2 className="text-4xl font-bold font-headline">{getStatusMessage()}</h2>
                <Button onClick={gameStatus === 'gameover' || gameStatus === 'victory' ? resetGame : togglePause} className="mt-4" variant="outline">
                    {gameStatus === 'paused' ? 'Resume' : 'Play Again'}
                </Button>
            </div>
        )}
        <div className="absolute bg-cyan-400 rounded-md border-b-4 border-cyan-600" style={{ left: paddleX, bottom: 0, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, boxShadow: '0 0 10px hsl(var(--primary))' }} />
        <div className="absolute bg-white rounded-full" style={{ left: ball.x, top: ball.y, width: BALL_SIZE, height: BALL_SIZE, boxShadow: '0 0 10px #fff' }} />
        {bricks.map((brick, i) => brick.health > 0 && (
            <div key={i} className="absolute rounded-md border-b-4" style={{ 
                left: brick.x, top: brick.y, 
                width: BRICK_WIDTH, height: BRICK_HEIGHT, 
                backgroundColor: brick.color,
                borderColor: `color-mix(in srgb, ${brick.color}, #000 30%)`,
                boxShadow: `0 0 8px ${brick.color}`,
                opacity: brick.health / level,
            }} />
        ))}
      </div>
       <div className="w-full max-w-xl flex flex-col items-center gap-2">
         {(gameStatus === 'playing' || gameStatus === 'paused') && (
          <div className="flex gap-2 justify-center">
            <Button onClick={togglePause} variant="outline">
                {gameStatus === 'paused' ? <Play /> : <Pause />}
                <span className="ml-2">{gameStatus === 'paused' ? 'Resume' : 'Pause'}</span>
            </Button>
            <Button onClick={resetGame} variant="destructive">
                <RefreshCw />
                <span className="ml-2">Restart</span>
            </Button>
          </div>
        )}
        <p className="text-sm text-muted-foreground hidden md:block">Move mouse to control paddle.</p>
        
        {isMobile && gameStatus === 'playing' && (
            <div className="flex justify-between w-full mt-4">
                <Button
                    size="lg"
                    className="w-32 h-16"
                    onMouseDown={() => handleMoveStart('left')}
                    onMouseUp={handleMoveEnd}
                    onTouchStart={() => handleMoveStart('left')}
                    onTouchEnd={handleMoveEnd}
                >
                    <ArrowLeft className="w-8 h-8"/>
                </Button>
                <Button
                    size="lg"
                    className="w-32 h-16"
                    onMouseDown={() => handleMoveStart('right')}
                    onMouseUp={handleMoveEnd}
                    onTouchStart={() => handleMoveStart('right')}
                    onTouchEnd={handleMoveEnd}
                >
                    <ArrowRight className="w-8 h-8"/>
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};
