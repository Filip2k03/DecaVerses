'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Trophy, Zap, Heart, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PLAYER_SIZE = 30;
const ENEMY_SIZE = 30;
const BULLET_SIZE = 5;
const PLAYER_SPEED = 4;
const BULLET_SPEED = 7;
const ENEMY_SPEED = 1;

type GameObject = { x: number; y: number; };
type Bullet = GameObject & { vx: number; vy: number; };
type Enemy = GameObject & { id: number; };

const PlayerSprite = () => (
    <svg width="100%" height="100%" viewBox="0 0 30 30">
        <circle cx="15" cy="15" r="15" fill="hsl(var(--primary))" />
        <rect x="12" y="0" width="6" height="15" fill="hsl(var(--primary-foreground))" />
    </svg>
);
const EnemySprite = () => (
     <svg width="100%" height="100%" viewBox="0 0 30 30">
        <rect x="0" y="0" width="30" height="30" fill="hsl(var(--destructive))" rx="5"/>
        <circle cx="15" cy="15" r="8" fill="black" />
        <circle cx="15" cy="15" r="4" fill="white" />
    </svg>
);

export const DroidAnnihilator = () => {
    const [player, setPlayer] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dir: { x: 0, y: -1 } });
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [bullets, setBullets] = useState<Bullet[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [gameState, setGameState] = useState<'playing'|'gameover'|'menu'>('menu');
    
    const keysPressed = useRef<{ [key: string]: boolean }>({}).current;
    const gameLoopRef = useRef<number>();
    const lastEnemySpawn = useRef(0);
    const isMobile = useIsMobile();
    const moveVector = useRef({x: 0, y: 0});

    const { scores, updateScore } = useGame();
    const highScore = scores[24] || 0;

    const resetGame = useCallback(() => {
        setPlayer({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dir: { x: 0, y: -1 } });
        setEnemies([]);
        setBullets([]);
        setScore(0);
        setLives(5);
        setGameState('playing');
        lastEnemySpawn.current = Date.now();
    }, []);

    const handleShoot = useCallback(() => {
        if (gameState !== 'playing') return;
        setBullets(b => [...b, { 
            x: player.x + PLAYER_SIZE / 2 - BULLET_SIZE / 2, 
            y: player.y + PLAYER_SIZE / 2 - BULLET_SIZE / 2, 
            vx: player.dir.x * BULLET_SPEED, 
            vy: player.dir.y * BULLET_SPEED 
        }]);
    }, [gameState, player]);
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        keysPressed[e.key] = true;
        if (e.key === ' ') handleShoot();
    }, [keysPressed, handleShoot]);
    const handleKeyUp = useCallback((e: KeyboardEvent) => { delete keysPressed[e.key]; }, [keysPressed]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    const handleMoveStart = (dir: 'up' | 'down' | 'left' | 'right') => {
        const newVector = { ...moveVector.current };
        if (dir === 'up') newVector.y = -1;
        if (dir === 'down') newVector.y = 1;
        if (dir === 'left') newVector.x = -1;
        if (dir === 'right') newVector.x = 1;
        moveVector.current = newVector;
    };
    
    const handleMoveEnd = (dir: 'up' | 'down' | 'left' | 'right') => {
        const newVector = { ...moveVector.current };
        if ((dir === 'up' && newVector.y === -1) || (dir === 'down' && newVector.y === 1)) {
            newVector.y = 0;
        }
        if ((dir === 'left' && newVector.x === -1) || (dir === 'right' && newVector.x === 1)) {
            newVector.x = 0;
        }
        moveVector.current = newVector;
    };

    const gameLoop = useCallback(() => {
        if (gameState !== 'playing') return;

        // Player Movement
        setPlayer(p => {
            let dx = 0;
            let dy = 0;

            if (isMobile) {
                dx = moveVector.current.x;
                dy = moveVector.current.y;
            } else {
                if (keysPressed['ArrowUp'] || keysPressed['w']) dy -= 1;
                if (keysPressed['ArrowDown'] || keysPressed['s']) dy += 1;
                if (keysPressed['ArrowLeft'] || keysPressed['a']) dx -= 1;
                if (keysPressed['ArrowRight'] || keysPressed['d']) dx += 1;
            }
            
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            if (magnitude > 0) {
                dx = (dx / magnitude);
                dy = (dy / magnitude);
            }

            const newX = Math.max(0, Math.min(p.x + dx * PLAYER_SPEED, GAME_WIDTH - PLAYER_SIZE));
            const newY = Math.max(0, Math.min(p.y + dy * PLAYER_SPEED, GAME_HEIGHT - PLAYER_SIZE));
            const newDir = (dx === 0 && dy === 0) ? p.dir : { x: dx, y: dy };
            return { x: newX, y: newY, dir: newDir };
        });

        // Bullet Movement
        setBullets(bs => bs.map(b => ({ ...b, x: b.x + b.vx, y: b.y + b.vy }))
                           .filter(b => b.x > 0 && b.x < GAME_WIDTH && b.y > 0 && b.y < GAME_HEIGHT));

        // Enemy Spawning
        if (Date.now() - lastEnemySpawn.current > 2000) {
            const side = Math.floor(Math.random() * 4);
            let x, y;
            if (side === 0) { x = 0; y = Math.random() * GAME_HEIGHT; } // left
            else if (side === 1) { x = GAME_WIDTH; y = Math.random() * GAME_HEIGHT; } // right
            else if (side === 2) { x = Math.random() * GAME_WIDTH; y = 0; } // top
            else { x = Math.random() * GAME_WIDTH; y = GAME_HEIGHT; } // bottom
            setEnemies(es => [...es, { id: Date.now(), x, y }]);
            lastEnemySpawn.current = Date.now();
        }

        // Enemy Movement
        setEnemies(es => es.map(e => {
            const dx = player.x - e.x;
            const dy = player.y - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return { ...e, x: e.x + (dx / dist) * ENEMY_SPEED, y: e.y + (dy / dist) * ENEMY_SPEED };
        }));

        // Collisions
        const bulletsToRemove = new Set<number>();
        const enemiesToRemove = new Set<number>();

        bullets.forEach((bullet, bIndex) => {
            enemies.forEach((enemy) => {
                if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < (BULLET_SIZE + ENEMY_SIZE) / 2) {
                    bulletsToRemove.add(bIndex);
                    enemiesToRemove.add(enemy.id);
                    setScore(s => s + 100);
                }
            });
        });

        enemies.forEach(enemy => {
            if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < (PLAYER_SIZE + ENEMY_SIZE) / 2) {
                enemiesToRemove.add(enemy.id);
                setLives(l => l - 1);
            }
        });
        
        if (bulletsToRemove.size > 0) setBullets(bs => bs.filter((_, i) => !bulletsToRemove.has(i)));
        if (enemiesToRemove.size > 0) setEnemies(es => es.filter(e => !enemiesToRemove.has(e.id)));

        if (lives <= 1) {
            setGameState('gameover');
            updateScore(24, score);
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, player, bullets, enemies, lives, score, keysPressed, isMobile, updateScore]);
    
    useEffect(() => {
        if (gameState === 'playing') {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
            return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
        }
    }, [gameState, gameLoop]);
    
     if (gameState === 'menu') {
        return <div className="text-center"><Button onClick={resetGame} size="lg">Start Game</Button></div>;
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex justify-between w-full max-w-xl text-lg font-headline">
                <div>Score: {score}</div>
                <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best: {highScore}</div>
                 <div className="flex items-center gap-2">
                    {Array.from({length: lives}).map((_, i) => <Heart key={i} className="w-5 h-5 text-red-500 fill-current" />)}
                </div>
            </div>
            <div className="relative bg-gray-900 border-2 border-primary/50 overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
                {gameState === 'gameover' && (
                     <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-white">
                        <h2 className="text-4xl font-bold font-headline">Game Over</h2>
                        <Button onClick={resetGame} className="mt-4" variant="outline">Play Again</Button>
                    </div>
                )}
                <div className="absolute transition-transform duration-75" style={{ left: player.x, top: player.y, width: PLAYER_SIZE, height: PLAYER_SIZE, transform: `rotate(${Math.atan2(player.dir.y, player.dir.x) * 180 / Math.PI + 90}deg)` }}><PlayerSprite /></div>
                {bullets.map((b, i) => <div key={i} className="absolute bg-yellow-400 rounded-full" style={{ left: b.x, top: b.y, width: BULLET_SIZE, height: BULLET_SIZE }} />)}
                {enemies.map(e => <div key={e.id} className="absolute" style={{ left: e.x, top: e.y, width: ENEMY_SIZE, height: ENEMY_SIZE }}><EnemySprite /></div>)}
            </div>
            {isMobile && gameState === 'playing' && (
                <>
                    <div className="fixed bottom-24 left-8 z-50 grid grid-cols-3 grid-rows-3 gap-2 w-40 h-40 md:hidden">
                        <div />
                        <Button variant="outline" className="h-full w-full col-start-2" onTouchStart={(e)=>{e.preventDefault(); handleMoveStart('up')}} onTouchEnd={()=>handleMoveEnd('up')}><ArrowUp /></Button>
                        <div />
                        <Button variant="outline" className="h-full w-full row-start-2" onTouchStart={(e)=>{e.preventDefault(); handleMoveStart('left')}} onTouchEnd={()=>handleMoveEnd('left')}><ArrowLeft /></Button>
                        <div/>
                        <Button variant="outline" className="h-full w-full row-start-2 col-start-3" onTouchStart={(e)=>{e.preventDefault(); handleMoveStart('right')}} onTouchEnd={()=>handleMoveEnd('right')}><ArrowRight /></Button>
                        <div />
                        <Button variant="outline" className="h-full w-full col-start-2 row-start-3" onTouchStart={(e)=>{e.preventDefault(); handleMoveStart('down')}} onTouchEnd={()=>handleMoveEnd('down')}><ArrowDown /></Button>
                        <div />
                    </div>
                    <Button onClick={handleShoot} className="fixed bottom-28 right-8 z-50 h-24 w-24 rounded-full"><Zap className="w-10 h-10"/></Button>
                </>
            )}
             <p className="text-sm text-muted-foreground hidden md:block">Use WASD/Arrows to move, Space to shoot.</p>
        </div>
    );
};
