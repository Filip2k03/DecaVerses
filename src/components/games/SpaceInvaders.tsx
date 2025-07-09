'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy, Pause, Play, RefreshCw, ArrowLeft, ArrowRight, Zap, Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlienIcon } from '@/components/GameIcons';
import { cn } from '@/lib/utils';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 20;
const INVADER_ROWS = 4;
const INVADER_COLS = 8;
const INVADER_SIZE = 30;
const MAX_PLAYER_BULLETS = 6;
const KILLS_PER_POWERUP = 10;

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
  const [level, setLevel] = useState(1);
  const [gunLevel, setGunLevel] = useState(1);
  const [killsForPowerUp, setKillsForPowerUp] = useState(0);
  const [gameOver, setGameOver] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const keysPressed = useRef<{ [key: string]: boolean }>({}).current;
  const gameLoopRef = useRef<number>();
  const moveDirection = useRef<'left' | 'right' | null>(null);
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
    setLevel(1);
    setGunLevel(1);
    setKillsForPowerUp(0);
    setGameOver(false);
    setIsPaused(false);
    setInvaderDirection('right');
  }, [createInvaders]);

  const togglePause = useCallback(() => {
    if (!gameOver) {
      setIsPaused(p => !p);
    }
  }, [gameOver]);
  
  const handleShoot = useCallback(() => {
    if (gameOver || isPaused || playerBullets.length >= MAX_PLAYER_BULLETS) return;

    setPlayerBullets(b => {
        let newBullets: Bullet[] = [];
        if (gunLevel === 1) {
            newBullets = [{ x: playerX + PLAYER_WIDTH / 2 - 2, y: GAME_HEIGHT - PLAYER_HEIGHT }];
        } else if (gunLevel === 2) {
            newBullets = [
                { x: playerX + PLAYER_WIDTH * 0.25, y: GAME_HEIGHT - PLAYER_HEIGHT },
                { x: playerX + PLAYER_WIDTH * 0.75 - 4, y: GAME_HEIGHT - PLAYER_HEIGHT }
            ];
        } else { // gunLevel 3
            newBullets = [
                { x: playerX, y: GAME_HEIGHT - PLAYER_HEIGHT },
                { x: playerX + PLAYER_WIDTH / 2 - 2, y: GAME_HEIGHT - PLAYER_HEIGHT },
                { x: playerX + PLAYER_WIDTH - 4, y: GAME_HEIGHT - PLAYER_HEIGHT }
            ];
        }
        return [...b, ...newBullets].slice(0, MAX_PLAYER_BULLETS);
    });
}, [gameOver, isPaused, playerBullets.length, playerX, gunLevel]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => { keysPressed[e.key] = true; }, [keysPressed]);
  
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ') handleShoot();
    if (e.key.toLowerCase() === 'p') togglePause();
    delete keysPressed[e.key];
  }, [handleShoot, togglePause]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleMoveStart = (dir: 'left' | 'right') => { moveDirection.current = dir; };
  const handleMoveEnd = () => { moveDirection.current = null; };

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return;

    // Player movement
    if (keysPressed['ArrowLeft'] || moveDirection.current === 'left') setPlayerX(x => Math.max(0, x - 5));
    if (keysPressed['ArrowRight'] || moveDirection.current === 'right') setPlayerX(x => Math.min(GAME_WIDTH - PLAYER_WIDTH, x + 5));

    // Bullet movement
    const invaderBulletSpeed = 4 + level * 0.5;
    setPlayerBullets(b => b.map(bullet => ({ ...bullet, y: bullet.y - 10 })).filter(b => b.y > 0));
    setInvaderBullets(b => b.map(bullet => ({ ...bullet, y: bullet.y + invaderBulletSpeed })).filter(b => b.y < GAME_HEIGHT));

    // Invader movement
    const invaderMoveSpeed = 0.5 + level * 0.25;
    let wallWasHit = false;
    const aliveInvaders = invaders.filter(i => i.alive);
    if (aliveInvaders.length > 0) {
        const leftMostX = Math.min(...aliveInvaders.map(i => i.x));
        const rightMostX = Math.max(...aliveInvaders.map(i => i.x));
        if ((invaderDirection === 'right' && rightMostX + INVADER_SIZE >= GAME_WIDTH) ||
            (invaderDirection === 'left' && leftMostX <= 0)) {
            wallWasHit = true;
        }
    }

    if (wallWasHit) {
        setInvaderDirection(d => d === 'right' ? 'left' : 'right');
        setInvaders(invs => invs.map(inv => ({ ...inv, y: inv.y + 10 })));
    } else {
        setInvaders(invs => invs.map(inv => ({ ...inv, x: inv.x + (invaderDirection === 'right' ? invaderMoveSpeed : -invaderMoveSpeed) })));
    }
    
    // Invader shooting
    const firingRate = 0.015 + level * 0.005;
    if (Math.random() < firingRate && aliveInvaders.length > 0) {
        const randomInvader = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
        setInvaderBullets(b => [...b, {x: randomInvader.x + INVADER_SIZE/2, y: randomInvader.y + INVADER_SIZE}]);
    }

    // Collision detection: Player bullets with invaders
    let newKills = 0;
    setPlayerBullets(currentBullets => {
        const bulletsToRemove = new Set<number>();
        setInvaders(currentInvaders => {
            const newInvaders = [...currentInvaders];
            currentBullets.forEach((bullet, bIndex) => {
                if (bulletsToRemove.has(bIndex)) return;
                for (let i = 0; i < newInvaders.length; i++) {
                    const invader = newInvaders[i];
                    if (invader.alive && bullet.x > invader.x && bullet.x < invader.x + INVADER_SIZE && bullet.y > invader.y && bullet.y < invader.y + INVADER_SIZE) {
                        newInvaders[i].alive = false;
                        bulletsToRemove.add(bIndex);
                        newKills++;
                        break; // Bullet hits one invader and is removed
                    }
                }
            });
            return newInvaders;
        });
        if(newKills > 0) {
            setScore(s => s + newKills * (100 * level));
            setKillsForPowerUp(k => k + newKills);
        }
        return currentBullets.filter((_, index) => !bulletsToRemove.has(index));
    });

    // Power-up check
    if (killsForPowerUp >= KILLS_PER_POWERUP) {
        setGunLevel(gl => Math.min(gl + 1, 3));
        setKillsForPowerUp(k => k % KILLS_PER_POWERUP);
    }
    
    // Collision detection: Invader bullets with player
    let playerWasHit = false;
    setInvaderBullets(currentBullets => currentBullets.filter(bullet => {
        if (bullet.x > playerX && bullet.x < playerX + PLAYER_WIDTH && bullet.y > GAME_HEIGHT - PLAYER_HEIGHT && bullet.y < GAME_HEIGHT) {
            playerWasHit = true;
            return false;
        }
        return true;
    }));

    if (playerWasHit) {
      setLives(l => l - 1);
      if (lives - 1 <= 0) {
        setGameOver(true);
        updateScore(18, score);
      }
    }

    // Game over if invaders reach player
    if (invaders.some(inv => inv.alive && inv.y > GAME_HEIGHT - PLAYER_HEIGHT - 20)) {
        setGameOver(true);
        updateScore(18, score);
    }
    
    // Level clear
    if (invaders.length > 0 && invaders.every(inv => !inv.alive)) {
        setLevel(l => l + 1);
        setInvaderBullets([]);
        setPlayerBullets([]);
        createInvaders();
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, isPaused, keysPressed, moveDirection.current, invaderDirection, invaders, createInvaders, playerX, lives, updateScore, score, level, killsForPowerUp, gunLevel]);
  
  useEffect(() => {
    if (!gameOver) {
        resetGame();
    }
  }, []);

  useEffect(() => {
    if (gameOver || isPaused) {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        return;
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameOver, isPaused, gameLoop]);

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
      <div className="relative bg-black border-2 border-primary/50 overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT, boxShadow: '0 0 20px hsl(var(--primary)/0.5), inset 0 0 15px hsl(var(--primary)/0.3)' }}>
        {(gameOver || isPaused) && (
            <div className={cn("absolute inset-0 flex flex-col items-center justify-center z-10 text-white", gameOver ? 'bg-black/80' : 'bg-black/50')}>
                <h2 className="text-4xl font-bold font-headline">{gameOver ? 'Game Over' : 'Paused'}</h2>
                <Button onClick={gameOver ? resetGame : togglePause} className="mt-4" variant="outline">
                    {gameOver ? 'Play Again' : 'Resume'}
                </Button>
            </div>
        )}
        
        <div className="absolute" style={{ left: playerX, bottom: 5, width: PLAYER_WIDTH, height: PLAYER_HEIGHT }}>
            <PlayerShip />
        </div>

        {invaders.map((inv, i) => inv.alive && (
            <div key={i} className="absolute" style={{ left: inv.x, top: inv.y, width: INVADER_SIZE, height: INVADER_SIZE }}>
                 <AlienIcon className="text-fuchsia-500 w-full h-full" style={{filter: 'drop-shadow(0 0 5px hsl(var(--accent)))'}}/>
            </div>
        ))}
        
        {playerBullets.map((b, i) => <div key={`p-${i}`} className="absolute bg-cyan-400" style={{ left: b.x, top: b.y, width: 4, height: 10, boxShadow: '0 0 8px hsl(var(--primary))' }} />)}
        {invaderBullets.map((b, i) => <div key={`i-${i}`} className="absolute bg-red-500" style={{ left: b.x, top: b.y, width: 4, height: 10, boxShadow: '0 0 8px hsl(var(--destructive))' }} />)}
      </div>
       <div className="w-full max-w-xl flex flex-col items-center gap-2">
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
        <p className="text-sm text-muted-foreground hidden md:block">Use Arrow Keys to move, Space to shoot, and P to pause.</p>
        
        {isMobile && !gameOver && (
            <div className="flex justify-between w-full mt-4">
                <Button
                    size="lg"
                    className="w-24 h-16"
                    onTouchStart={() => handleMoveStart('left')}
                    onTouchEnd={handleMoveEnd}
                    onMouseDown={() => handleMoveStart('left')}
                    onMouseUp={handleMoveEnd}
                >
                    <ArrowLeft className="w-8 h-8"/>
                </Button>
                <Button size="lg" className="w-24 h-16" onClick={handleShoot}>
                    <Zap className="w-8 h-8"/>
                </Button>
                <Button
                    size="lg"
                    className="w-24 h-16"
                    onTouchStart={() => handleMoveStart('right')}
                    onTouchEnd={handleMoveEnd}
                    onMouseDown={() => handleMoveStart('right')}
                    onMouseUp={handleMoveEnd}
                >
                    <ArrowRight className="w-8 h-8"/>
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};
