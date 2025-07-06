'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
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

type Platform = { x: number; y: number; };

export const DoodleJump = () => {
  const [player, setPlayer] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, vy: 0, vx: 0 });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [score, setScore] = useState(0);
  const [cameraY, setCameraY] = useState(0);
  const [gameOver, setGameOver] = useState(true);

  const keysPressed = useRef<{ [key: string]: boolean }>({}).current;
  const gameLoopRef = useRef<number>();
  const isMobile = useIsMobile();
  
  const { scores, updateScore } = useGame();
  const highScore = scores[19] || 0;

  const resetGame = useCallback(() => {
    const initialPlatforms: Platform[] = [];
    for (let i = 0; i < 10; i++) {
        initialPlatforms.push({
            x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH),
            y: GAME_HEIGHT - 70 * i,
        });
    }
    setPlatforms(initialPlatforms);
    setPlayer({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, vy: 0, vx: 0 });
    setScore(0);
    setCameraY(0);
    setGameOver(false);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => { keysPressed[e.key] = true; }, [keysPressed]);
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
      if(dir === 'left') setPlayer(p => ({...p, vx: -5}));
      else if(dir === 'right') setPlayer(p => ({...p, vx: 5}));
      else setPlayer(p => ({...p, vx: 0}));
  }

  const gameLoop = useCallback(() => {
    if (gameOver) return;
    
    let newVx = 0;
    if (keysPressed['ArrowLeft']) newVx = -5;
    if (keysPressed['ArrowRight']) newVx = 5;

    setPlayer(p => {
        let newVy = p.vy + GRAVITY;
        let newY = p.y + newVy;
        let newX = (p.x + (isMobile ? p.vx : newVx) + GAME_WIDTH) % GAME_WIDTH;

        // Platform collision
        if (p.vy > 0) {
            platforms.forEach(plat => {
                if (newX < plat.x + PLATFORM_WIDTH && newX + PLAYER_WIDTH > plat.x && p.y < plat.y + PLATFORM_HEIGHT && newY >= plat.y) {
                    newVy = JUMP_VELOCITY;
                }
            });
        }
        
        return { ...p, y: newY, vy: newVy, x: newX, vx: isMobile ? p.vx : 0 };
    });

    // Camera movement
    if (player.y < cameraY + GAME_HEIGHT / 2) {
      setCameraY(player.y - GAME_HEIGHT / 2);
    }
    
    // Update score
    const newScore = Math.max(score, Math.floor(-cameraY));
    setScore(newScore);

    // Generate new platforms
    if (platforms.length > 0 && platforms[platforms.length - 1].y > cameraY) {
        setPlatforms(p => [...p, {
            x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH),
            y: p[p.length - 1].y - (Math.random() * 60 + 60),
        }].filter(plat => plat.y < cameraY + GAME_HEIGHT + 50));
    }
    
    // Game Over condition
    if (player.y > cameraY + GAME_HEIGHT) {
        setGameOver(true);
        updateScore(19, score);
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, keysPressed, platforms, player, cameraY, isMobile, score, updateScore]);

  useEffect(() => {
    if(gameOver) return;
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameOver, gameLoop]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-sm text-lg font-headline">
        <div>Score: {score}</div>
        <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best: {highScore}</div>
      </div>
      <div className="relative bg-black border-2 border-primary/50 overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-white">
                <h2 className="text-4xl font-bold font-headline">Game Over</h2>
                <Button onClick={resetGame} className="mt-4" variant="outline">Play Again</Button>
            </div>
        )}
        <div className="absolute w-full h-full" style={{ transform: `translateY(${-cameraY}px)` }}>
            {/* Player */}
            <div className="absolute bg-cyan-400" style={{ left: player.x, top: player.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT }}/>
            {/* Platforms */}
            {platforms.map((p, i) => (
                <div key={i} className="absolute bg-green-500" style={{ left: p.x, top: p.y, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT }}/>
            ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Use Arrow Keys to move.</p>
      {isMobile && !gameOver && <Joystick onMove={handleJoystickMove} />}
    </div>
  );
};
