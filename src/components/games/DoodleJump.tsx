'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy, Pause, Play, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Joystick } from '@/components/Joystick';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;
const GRAVITY = 0.5;
const JUMP_VELOCITY = -12;
const HORIZONTAL_SPEED = 5;

type Platform = { x: number; y: number; };
type PlayerState = {
  x: number;
  y: number;
  vy: number;
  vx: number;
  dir: 'left' | 'right';
};

const Doodler = ({ dir }: { dir: 'left' | 'right' }) => (
    <svg width="100%" height="100%" viewBox="0 0 50 50" style={{ transform: dir === 'left' ? 'scaleX(-1)' : 'none' }}>
        <g stroke="#000" strokeWidth="1">
            <path d="M10 50 C 10 25, 40 25, 40 50 Z" fill="#96E072" />
            <path d="M18 40 C 18 35, 32 35, 32 40 Z" fill="#78B456" />
            <circle cx="18" cy="25" r="5" fill="white" />
            <circle cx="32" cy="25" r="5" fill="white" />
            <circle cx="19" cy="25" r="2" fill="black" />
            <circle cx="33" cy="25" r="2" fill="black" />
            <path d="M22 15 L28 15 L25 5 Z" fill="#96E072" />
        </g>
    </svg>
);


export const DoodleJump = () => {
  const [player, setPlayer] = useState<PlayerState>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, vy: 0, vx: 0, dir: 'right' });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [score, setScore] = useState(0);
  const [cameraY, setCameraY] = useState(0);
  const [gameOver, setGameOver] = useState(true);
  const [isFalling, setIsFalling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const keysPressed = useRef<{ [key: string]: boolean }>({}).current;
  const gameLoopRef = useRef<number>();
  const isMobile = useIsMobile();
  
  const { scores, updateScore } = useGame();
  const highScore = scores[19] || 0;

  const resetGame = useCallback(() => {
    const initialPlatforms: Platform[] = [];
    let lastY = GAME_HEIGHT;
    for (let i = 0; i < 10; i++) {
        lastY -= (Math.random() * 60 + 60);
        initialPlatforms.push({
            x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH),
            y: lastY,
        });
    }
    setPlatforms(initialPlatforms);
    setPlayer({ x: initialPlatforms[0].x + PLATFORM_WIDTH / 2 - PLAYER_WIDTH / 2, y: initialPlatforms[0].y - PLAYER_HEIGHT, vy: 0, vx: 0, dir: 'right' });
    setScore(0);
    setCameraY(0);
    setGameOver(true); // Will be set to false by start button
    setIsFalling(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const startGame = () => {
    resetGame();
    setGameOver(false);
    setPlayer(p => ({...p, vy: JUMP_VELOCITY }));
  }

  const togglePause = useCallback(() => {
    if (gameOver || isFalling) return;
    setIsPaused(p => !p);
  }, [gameOver, isFalling]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => { 
    if (e.key.toLowerCase() === 'p') {
      togglePause();
    }
    keysPressed[e.key] = true;
  }, [keysPressed, togglePause]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => { delete keysPressed[e.key]; }, [keysPressed]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
  
  const handleJoystickMove = (dir: 'left' | 'right' | 'center' | 'up' | 'down') => {
      if(gameOver || isPaused || isFalling) return;
      if(dir === 'left') setPlayer(p => ({...p, vx: -HORIZONTAL_SPEED}));
      else if(dir === 'right') setPlayer(p => ({...p, vx: HORIZONTAL_SPEED}));
      else setPlayer(p => ({...p, vx: 0}));
  }

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return;
    
    setPlayer(p => {
        let newVx = isMobile ? p.vx : 0;
        if (!isMobile) {
            if (keysPressed['ArrowLeft']) newVx = -HORIZONTAL_SPEED;
            if (keysPressed['ArrowRight']) newVx = HORIZONTAL_SPEED;
        }

        let newDir = p.dir;
        if (newVx < 0) newDir = 'left';
        if (newVx > 0) newDir = 'right';

        let newVy = p.vy + GRAVITY;
        let newY = p.y + newVy;
        let newX = (p.x + newVx + GAME_WIDTH) % GAME_WIDTH;

        // Platform collision
        if (!isFalling && p.vy > 0) {
            platforms.forEach(plat => {
                if (newX + PLAYER_WIDTH > plat.x && newX < plat.x + PLATFORM_WIDTH && p.y + PLAYER_HEIGHT > plat.y && newY + PLAYER_HEIGHT <= plat.y + PLATFORM_HEIGHT) {
                    newVy = JUMP_VELOCITY;
                }
            });
        }
        
        return { ...p, y: newY, vy: newVy, x: newX, vx: newVx, dir: newDir };
    });

    // Camera movement
    if (player.y < cameraY + GAME_HEIGHT / 2) {
      setCameraY(player.y - GAME_HEIGHT / 2);
    }
    
    // Update score
    if(!isFalling) {
        const newScore = Math.max(score, Math.floor(-cameraY));
        setScore(newScore);
    }
    
    // Generate new platforms
    if (platforms.length > 0) {
        const highestPlatform = platforms[platforms.length - 1];
        if (highestPlatform.y > cameraY - PLATFORM_HEIGHT) {
            setPlatforms(p => [...p, {
                x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH),
                y: highestPlatform.y - (Math.random() * 60 + 60),
            }].filter(plat => plat.y < cameraY + GAME_HEIGHT + 50));
        }
    }
    
    // Game Over condition
    if (!isFalling && player.y > cameraY + GAME_HEIGHT) {
        setIsFalling(true);
        updateScore(19, score);
    }
    
    // After falling off screen
    if(isFalling && player.y > cameraY + GAME_HEIGHT + 200) {
        setGameOver(true);
        setIsFalling(false);
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, isPaused, isFalling, isMobile, keysPressed, platforms, player, cameraY, score, updateScore]);

  useEffect(() => {
    if(gameOver || isPaused) {
        if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        return;
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameOver, isPaused, gameLoop]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-sm text-lg font-headline">
        <div>Score: {score}</div>
        <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best: {highScore}</div>
      </div>
      <div className="relative border-2 border-primary/50 overflow-hidden" 
           style={{ 
               width: GAME_WIDTH, 
               height: GAME_HEIGHT,
               backgroundColor: '#f0f8ff',
               backgroundImage: 'linear-gradient(rgba(0,191,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,191,255,0.2) 1px, transparent 1px)',
               backgroundSize: '20px 20px',
            }}
      >
        {gameOver && !isFalling && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 text-white">
                <h2 className="text-4xl font-bold font-headline">{score > 0 ? 'Game Over' : 'Doodle Jump'}</h2>
                <Button onClick={startGame} className="mt-4" variant="outline">
                    {score > 0 ? 'Play Again' : 'Start Game'}
                </Button>
            </div>
        )}
         {isPaused && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 text-white">
                <h2 className="text-4xl font-bold font-headline">Paused</h2>
                <Button onClick={togglePause} className="mt-4" variant="outline">Resume</Button>
            </div>
        )}
        <div className="absolute w-full h-full transition-transform duration-100 ease-linear" style={{ transform: `translateY(${-cameraY}px)` }}>
            {/* Player */}
            <div className="absolute" style={{ left: player.x, top: player.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT }}>
                <Doodler dir={player.dir} />
            </div>

            {/* Platforms */}
            {platforms.map((p, i) => (
                <div key={i} className="absolute bg-green-500 rounded-md border-b-4 border-green-700" style={{ left: p.x, top: p.y, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT }}/>
            ))}
        </div>
      </div>
      <div className="w-full flex flex-col items-center gap-2">
        {!gameOver && !isFalling && (
          <div className="flex gap-2 justify-center">
            <Button onClick={togglePause} variant="outline" disabled={gameOver || isFalling}>
                {isPaused ? <Play /> : <Pause />}
                <span className="ml-2">{isPaused ? 'Resume' : 'Pause'}</span>
            </Button>
            <Button onClick={startGame} variant="destructive">
                <RefreshCw />
                <span className="ml-2">Restart</span>
            </Button>
          </div>
        )}
        <p className="text-sm text-muted-foreground">Use Arrow Keys to move and P to pause.</p>
      </div>
      {isMobile && !gameOver && <Joystick onMove={handleJoystickMove} />}
    </div>
  );
};
