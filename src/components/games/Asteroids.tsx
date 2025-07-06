'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Trophy, Pause, Play, RefreshCw } from 'lucide-react';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const SHIP_SIZE = 20;
const BULLET_SPEED = 5;
const ASTEROID_SPEED = 1;

type GameObject = { x: number; y: number; dx: number; dy: number; size: number; rotation?: number };

export const Asteroids = () => {
  const [ship, setShip] = useState<GameObject>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 0, dy: 0, size: SHIP_SIZE, rotation: 0 });
  const [asteroids, setAsteroids] = useState<GameObject[]>([]);
  const [bullets, setBullets] = useState<GameObject[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [invincible, setInvincible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const keysPressed = useRef<{ [key: string]: boolean }>({}).current;
  const gameLoopRef = useRef<number>();

  const { scores, updateScore } = useGame();
  const highScore = scores[12] || 0;

  const createAsteroids = useCallback((count: number) => {
    const newAsteroids: GameObject[] = [];
    for (let i = 0; i < count; i++) {
      newAsteroids.push({
        x: Math.random() * GAME_WIDTH, y: Math.random() * GAME_HEIGHT,
        dx: (Math.random() - 0.5) * ASTEROID_SPEED * 2, dy: (Math.random() - 0.5) * ASTEROID_SPEED * 2,
        size: 50,
      });
    }
    setAsteroids(newAsteroids);
  }, []);
  
  const resetGame = useCallback(() => {
    setShip({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 0, dy: 0, size: SHIP_SIZE, rotation: 0 });
    setBullets([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setLevel(1);
    createAsteroids(4);
    setIsPaused(false);
  }, [createAsteroids]);

  const togglePause = useCallback(() => {
      if (!gameOver) {
          setIsPaused(p => !p);
      }
  }, [gameOver]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => { keysPressed[e.key] = true; }, [keysPressed]);
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ' && !gameOver && !isPaused) {
      setBullets(b => [...b, {
        x: ship.x, y: ship.y,
        dx: Math.sin(ship.rotation! * Math.PI / 180) * BULLET_SPEED,
        dy: -Math.cos(ship.rotation! * Math.PI / 180) * BULLET_SPEED,
        size: 5,
      }]);
    }
    if (e.key.toLowerCase() === 'p') {
        togglePause();
    }
    delete keysPressed[e.key];
  }, [keysPressed, ship, gameOver, isPaused, togglePause]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return;

    // Ship movement
    setShip(s => {
      let newDx = s.dx * 0.99;
      let newDy = s.dy * 0.99;
      let newRotation = s.rotation!;
      if (keysPressed['ArrowUp']) {
        newDx += Math.sin(s.rotation! * Math.PI / 180) * 0.1;
        newDy -= Math.cos(s.rotation! * Math.PI / 180) * 0.1;
      }
      if (keysPressed['ArrowLeft']) newRotation -= 5;
      if (keysPressed['ArrowRight']) newRotation += 5;

      let newX = (s.x + newDx + GAME_WIDTH) % GAME_WIDTH;
      let newY = (s.y + newDy + GAME_HEIGHT) % GAME_HEIGHT;
      return { ...s, x: newX, y: newY, dx: newDx, dy: newDy, rotation: newRotation };
    });

    // Asteroids movement
    setAsteroids(a => a.map(ast => ({
      ...ast,
      x: (ast.x + ast.dx + GAME_WIDTH) % GAME_WIDTH,
      y: (ast.y + ast.dy + GAME_HEIGHT) % GAME_HEIGHT,
    })));

    // Bullets movement
    setBullets(b => b.map(bull => ({ ...bull, x: bull.x + bull.dx, y: bull.y + bull.dy })).filter(bull => bull.x > 0 && bull.x < GAME_WIDTH && bull.y > 0 && bull.y < GAME_HEIGHT));

    // Collision detection
    const newAsteroids = [...asteroids];
    const newBullets = [...bullets];
    const newAsteroidsToAdd: GameObject[] = [];
    let scoreToAdd = 0;

    for (let i = newBullets.length - 1; i >= 0; i--) {
      for (let j = newAsteroids.length - 1; j >= 0; j--) {
        const bullet = newBullets[i];
        const asteroid = newAsteroids[j];
        if (Math.hypot(bullet.x - asteroid.x, bullet.y - asteroid.y) < asteroid.size / 2) {
          newBullets.splice(i, 1);
          if (asteroid.size > 25) {
            newAsteroidsToAdd.push({ ...asteroid, dx: asteroid.dx + Math.random() - 0.5, dy: asteroid.dy + Math.random() - 0.5, size: asteroid.size / 2 });
            newAsteroidsToAdd.push({ ...asteroid, dx: asteroid.dx + Math.random() - 0.5, dy: asteroid.dy + Math.random() - 0.5, size: asteroid.size / 2 });
            scoreToAdd += 20;
          } else {
             scoreToAdd += 50;
          }
          newAsteroids.splice(j, 1);
          break;
        }
      }
    }
    setScore(s => s + scoreToAdd);
    setBullets(newBullets);
    setAsteroids(current => [...current.filter(a => newAsteroids.includes(a)), ...newAsteroidsToAdd]);

    // Ship-asteroid collision
    if (!invincible) {
      for (const asteroid of asteroids) {
        if (Math.hypot(ship.x - asteroid.x, ship.y - asteroid.y) < ship.size / 2 + asteroid.size / 2) {
          setLives(l => l - 1);
          setInvincible(true);
          setShip({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 0, dy: 0, size: SHIP_SIZE, rotation: 0 });
          setTimeout(() => setInvincible(false), 2000);
          if (lives - 1 <= 0) {
            setGameOver(true);
            updateScore(12, score);
          }
          break;
        }
      }
    }

    if (asteroids.length === 0 && !gameOver) {
        setLevel(l => l + 1);
        createAsteroids(level + 4);
    }


    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, isPaused, keysPressed, bullets, asteroids, ship, invincible, lives, score, level, createAsteroids, updateScore]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameLoop]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-2xl text-lg font-headline">
        <div>Score: {score}</div>
        <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best: {highScore}</div>
        <div>Lives: {lives}</div>
      </div>
      <div className="relative bg-black border-2 border-primary/50 overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-white">
                <h2 className="text-4xl font-bold font-headline">Game Over</h2>
                <Button onClick={resetGame} className="mt-4" variant="outline">Play Again</Button>
            </div>
        )}
        {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-white">
                <h2 className="text-4xl font-bold font-headline">Paused</h2>
                <Button onClick={togglePause} className="mt-4" variant="outline">Resume</Button>
            </div>
        )}
        {/* Ship */}
        {!gameOver && <div className="absolute" style={{ left: ship.x, top: ship.y, transform: `translate(-50%, -50%) rotate(${ship.rotation}deg)` }}>
          <svg width={SHIP_SIZE} height={SHIP_SIZE} viewBox="0 0 20 20" className={invincible ? "animate-pulse" : ""}>
            <polygon points="10,0 20,20 10,15 0,20" className="fill-cyan-400 stroke-white" strokeWidth="1.5" />
          </svg>
        </div>}
        {/* Asteroids */}
        {asteroids.map((ast, i) => (
          <div key={i} className="absolute rounded-full border-2 border-gray-400" style={{ left: ast.x - ast.size/2, top: ast.y - ast.size/2, width: ast.size, height: ast.size }}/>
        ))}
        {/* Bullets */}
        {bullets.map((b, i) => (
          <div key={i} className="absolute bg-fuchsia-500 rounded-full" style={{ left: b.x - b.size/2, top: b.y - b.size/2, width: b.size, height: b.size }}/>
        ))}
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
    </div>
  );
};
