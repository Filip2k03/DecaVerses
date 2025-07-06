'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy, Pause, Play, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Joystick } from '@/components/Joystick';
import { AlienIcon } from '@/components/GameIcons';
import { cn } from '@/lib/utils';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 20;
const INVADER_ROWS = 4;
const INVADER_COLS = 8;
const INVADER_SIZE = 30;

type Bullet = { x: number; y: number; };

const PlayerShip = () => (
    <svg width={PLAYER_WIDTH} height={PLAYER_HEIGHT} viewBox="0 0 40 20">
        <polygon points="20,0 40,20 0,20" className="fill-cyan-400" style={{filter: 'drop-shadow(0 0 5px hsl(var(--primary)))'}} />
    </svg>
);

export const SpaceInvaders = () => {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [invaders, setInvaders] = useState<({ x: number; y: number; alive: boolean })[]>([]);
  const [invaderDirection, setInvaderDirection] = useState<'left' | 'right'>('right');
  const [playerBullets, setPlayerBullets] = useState<Bullet[]>([]);
  const [invaderBullets, setInvaderBullets] = useState<Bullet[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const keysPressed = useRef<{ [key: string]: boolean }>({}).current;
  const gameLoopRef = useRef<number>();
  const isMobile = useIsMobile();

  const { scores, updateScore } = useGame();
  const highScore = scores[18] || 0;

  const createInvaders = useCallback(() => {
    const newInvaders = [];
    for (let r = 0; r < INVADER_ROWS; r++) {
      for (let c = 0; c < INVADER_COLS; c++) {
        newInvaders.push({
          x: c * (INVADER_SIZE + 10) + 50,
          y: r * (INVADER_SIZE + 10) + 30,
          alive: true,
        });
      }
    }
    setInvaders(newInvaders);
  }, []);

  const resetGame = useCallback(() => {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    createInvaders();
    setPlayerBullets([]);
    setInvaderBullets([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPaused(false);
  }, [createInvaders]);

  const togglePause = useCallback(() => {
    if (!gameOver) {
      setIsPaused(p => !p);
    }
  }, [gameOver]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => { keysPressed[e.key] = true; }, [keysPressed]);
  
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ' && !gameOver && !isPaused) {
      setPlayerBullets(b => [...b, { x: playerX + PLAYER_WIDTH / 2 - 2, y: GAME_HEIGHT - PLAYER_HEIGHT }]);
    }
    if (e.key.toLowerCase() === 'p') {
      togglePause();
    }
    delete keysPressed[e.key];
  }, [keysPressed, gameOver, isPaused, playerX, togglePause]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleJoystickMove = (dir: 'left' | 'right' | 'up' | 'down' | 'center') => {
      if(gameOver || isPaused) return;
      if (dir === 'left') setPlayerX(x => Math.max(0, x - 10));
      if (dir === 'right') setPlayerX(x => Math.min(GAME_WIDTH - PLAYER_WIDTH, x + 10));
      if (dir === 'up') setPlayerBullets(b => [...b, { x: playerX + PLAYER_WIDTH / 2 - 2, y: GAME_HEIGHT - PLAYER_HEIGHT }]);
  }

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return;

    // Player movement
    if (keysPressed['ArrowLeft']) setPlayerX(x => Math.max(0, x - 5));
    if (keysPressed['ArrowRight']) setPlayerX(x => Math.min(GAME_WIDTH - PLAYER_WIDTH, x + 5));

    // Bullet movement
    setPlayerBullets(b => b.map(bullet => ({ ...bullet, y: bullet.y - 10 })).filter(b => b.y > 0));
    setInvaderBullets(b => b.map(bullet => ({ ...bullet, y: bullet.y + 5 })).filter(b => b.y < GAME_HEIGHT));

    // Invader movement
    let wallHit = false;
    setInvaders(invs => invs.map(inv => {
      let newX = inv.x + (invaderDirection === 'right' ? 1 : -1);
      if (newX <= 0 || newX >= GAME_WIDTH - INVADER_SIZE) {
        wallHit = true;
      }
      return { ...inv, x: newX };
    }));

    if (wallHit) {
      setInvaderDirection(d => d === 'right' ? 'left' : 'right');
      setInvaders(invs => invs.map(inv => ({...inv, y: inv.y + 10})));
    }
    
    // Invader shooting
    if (Math.random() < 0.02) {
        const aliveInvaders = invaders.filter(i => i.alive);
        if (aliveInvaders.length > 0) {
            const randomInvader = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
            setInvaderBullets(b => [...b, {x: randomInvader.x + INVADER_SIZE/2, y: randomInvader.y + INVADER_SIZE}]);
        }
    }

    // Collision detection
    // Player bullets with invaders
    setPlayerBullets(currentBullets => {
        const bulletsToRemove: number[] = [];
        setInvaders(currentInvaders => {
            const newInvaders = [...currentInvaders];
            currentBullets.forEach((bullet, bIndex) => {
                newInvaders.forEach((invader, iIndex) => {
                    if (invader.alive && bullet.x > invader.x && bullet.x < invader.x + INVADER_SIZE && bullet.y > invader.y && bullet.y < invader.y + INVADER_SIZE) {
                        newInvaders[iIndex].alive = false;
                        bulletsToRemove.push(bIndex);
                        setScore(s => s + 100);
                    }
                });
            });
            return newInvaders;
        });
        return currentBullets.filter((_, index) => !bulletsToRemove.includes(index));
    });
    
    // Invader bullets with player
    invaderBullets.forEach(bullet => {
        if (bullet.x > playerX && bullet.x < playerX + PLAYER_WIDTH && bullet.y > GAME_HEIGHT - PLAYER_HEIGHT) {
            setLives(l => l - 1);
            setInvaderBullets([]);
        }
    });

    if (lives <= 0 || invaders.some(inv => inv.alive && inv.y > GAME_HEIGHT - PLAYER_HEIGHT - 20)) {
        setGameOver(true);
        updateScore(18, score);
    }
    
    if (invaders.every(inv => !inv.alive)) {
        createInvaders();
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, isPaused, keysPressed, invaderDirection, invaders, createInvaders, invaderBullets, playerX, lives, updateScore, score]);
  
  useEffect(() => {
    if (gameOver || isPaused) return;
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameOver, isPaused, gameLoop]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-xl text-lg font-headline">
        <div>Score: {score}</div>
        <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best: {highScore}</div>
        <div>Lives: {lives}</div>
      </div>
      <div className="relative bg-black border-2 border-primary/50 overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT, boxShadow: '0 0 20px hsl(var(--primary)/0.5), inset 0 0 15px hsl(var(--primary)/0.3)' }}>
        {(gameOver || isPaused) && (
            <div className={cn("absolute inset-0 flex flex-col items-center justify-center z-10 text-white", gameOver ? 'bg-black/80' : 'bg-black/50')}>
                <h2 className="text-4xl font-bold font-headline">{gameOver ? 'Game Over' : 'Paused'}</h2>
                <Button onClick={gameOver ? resetGame : togglePause} className="mt-4" variant="outline">
                    {gameOver ? 'Play Again' : 'Resume'}
                </Button>
            </div>
        )}
        
        {/* Player */}
        <div className="absolute" style={{ left: playerX, bottom: 5, width: PLAYER_WIDTH, height: PLAYER_HEIGHT }}>
            <PlayerShip />
        </div>

        {/* Invaders */}
        {invaders.map((inv, i) => inv.alive && (
            <div key={i} className="absolute transition-transform duration-500 ease-linear" style={{ left: inv.x, top: inv.y, width: INVADER_SIZE, height: INVADER_SIZE }}>
                 <AlienIcon className="text-fuchsia-500 w-full h-full" style={{filter: 'drop-shadow(0 0 5px hsl(var(--accent)))'}}/>
            </div>
        ))}
        
        {/* Bullets */}
        {playerBullets.map((b, i) => <div key={`p-${i}`} className="absolute bg-cyan-400" style={{ left: b.x, top: b.y, width: 4, height: 10, boxShadow: '0 0 8px hsl(var(--primary))' }} />)}
        {invaderBullets.map((b, i) => <div key={`i-${i}`} className="absolute bg-red-500" style={{ left: b.x, top: b.y, width: 4, height: 10, boxShadow: '0 0 8px hsl(var(--destructive))' }} />)}
      </div>
       <div className="w-full flex flex-col items-center gap-2">
         {!gameOver && (
          <div className="flex gap-2 justify-center">
            <Button onClick={togglePause} variant="outline" disabled={gameOver}>
                {isPaused ? <Play /> : <Pause />}
                <span className="ml-2">{isPaused ? 'Resume' : 'Pause'}</span>
            </Button>
            <Button onClick={resetGame} variant="destructive">
                <RefreshCw />
                <span className="ml-2">Restart</span>
            </Button>
          </div>
        )}
        <p className="text-sm text-muted-foreground">Use Arrow Keys to move, Space to shoot, and P to pause.</p>
      </div>
      {isMobile && !gameOver && <Joystick onMove={handleJoystickMove} />}
    </div>
  );
};
