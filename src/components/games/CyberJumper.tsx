'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Trophy, ArrowLeft, ArrowRight, ArrowUp, Flag } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 40;
const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const MOVE_SPEED = 5;

const levelPlatforms = [
  { x: 0, y: GAME_HEIGHT - 20, width: 200, height: 20 },
  { x: 250, y: GAME_HEIGHT - 80, width: 150, height: 20 },
  { x: 500, y: GAME_HEIGHT - 140, width: 150, height: 20 },
  { x: 300, y: GAME_HEIGHT - 220, width: 100, height: 20 },
  { x: 100, y: GAME_HEIGHT - 300, width: 150, height: 20 },
  { x: 750, y: GAME_HEIGHT - 350, width: 50, height: 50 }, // Goal
];

const PlayerSprite = () => (
    <svg width="100%" height="100%" viewBox="0 0 30 40">
        <rect x="5" y="0" width="20" height="15" fill="#3B82F6" rx="3" />
        <rect x="0" y="15" width="30" height="25" fill="#60A5FA" rx="5" />
        <circle cx="15" cy="28" r="4" fill="#1E40AF" />
    </svg>
);


export const CyberJumper = () => {
    const [player, setPlayer] = useState({ x: 50, y: 50, vx: 0, vy: 0, onGround: false });
    const [gameState, setGameState] = useState<'playing'|'won'|'menu'>('menu');
    const [time, setTime] = useState(0);

    const keysPressed = useRef<{ [key: string]: boolean }>({}).current;
    const moveDirection = useRef<'left' | 'right' | null>(null);
    const gameLoopRef = useRef<number>();
    const isMobile = useIsMobile();
    
    const { scores, updateScore } = useGame();
    const highScore = scores[23] || 0;

    const resetGame = useCallback(() => {
        setPlayer({ x: 50, y: GAME_HEIGHT - 60, vx: 0, vy: 0, onGround: false });
        setTime(0);
        setGameState('playing');
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => { keysPressed[e.key] = true; }, [keysPressed]);
    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.key === ' ') {
            if (player.onGround) {
                setPlayer(p => ({ ...p, vy: JUMP_STRENGTH }));
            }
        }
        delete keysPressed[e.key];
    }, [player.onGround, keysPressed]);
    
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
    const handleJump = () => {
        if (player.onGround) {
            setPlayer(p => ({ ...p, vy: JUMP_STRENGTH }));
        }
    };

    const gameLoop = useCallback(() => {
        if (gameState !== 'playing') return;

        setPlayer(p => {
            let { x, y, vx, vy, onGround } = { ...p };
            
            // Horizontal movement
            vx = 0;
            if (keysPressed['ArrowLeft'] || moveDirection.current === 'left') vx = -MOVE_SPEED;
            if (keysPressed['ArrowRight'] || moveDirection.current === 'right') vx = MOVE_SPEED;
            x += vx;
            x = Math.max(0, Math.min(x, GAME_WIDTH - PLAYER_WIDTH));
            
            // Vertical movement
            vy += GRAVITY;
            y += vy;

            // Platform collision
            onGround = false;
            for (const platform of levelPlatforms) {
                if (x + PLAYER_WIDTH > platform.x && x < platform.x + platform.width &&
                    p.y + PLAYER_HEIGHT <= platform.y && y + PLAYER_HEIGHT >= platform.y) {
                    y = platform.y - PLAYER_HEIGHT;
                    vy = 0;
                    onGround = true;
                }
            }

            // Goal collision
            const goal = levelPlatforms[levelPlatforms.length - 1];
            if (x + PLAYER_WIDTH > goal.x && x < goal.x + goal.width && y + PLAYER_HEIGHT > goal.y && y < goal.y + goal.height) {
                setGameState('won');
                const score = Math.max(0, 10000 - time * 10);
                updateScore(23, score);
            }
            
            return { x, y, vx, vy, onGround };
        });

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, time, updateScore]);

    useEffect(() => {
        if (gameState === 'playing') {
            const timer = setInterval(() => setTime(t => t + 1), 1000);
            gameLoopRef.current = requestAnimationFrame(gameLoop);
            return () => {
                clearInterval(timer);
                if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            }
        }
    }, [gameState, gameLoop]);
    
    if (gameState === 'menu') {
        return <div className="text-center"><Button onClick={resetGame} size="lg">Start Game</Button></div>;
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex justify-between w-full max-w-xl text-lg font-headline">
                <div>Time: {time}</div>
                <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best Score: {highScore}</div>
            </div>
            <div className="relative bg-black border-2 border-primary/50 overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
                 {gameState === 'won' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-white">
                        <h2 className="text-4xl font-bold font-headline">You Win!</h2>
                        <p>Your Score: {Math.max(0, 10000 - time * 10)}</p>
                        <Button onClick={resetGame} className="mt-4" variant="outline">Play Again</Button>
                    </div>
                )}
                <div className="absolute" style={{ left: player.x, top: player.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT }}><PlayerSprite /></div>
                {levelPlatforms.map((p, i) => {
                    const isGoal = i === levelPlatforms.length - 1;
                    return (
                        <div key={i} className={cn("absolute", isGoal ? 'bg-yellow-500' : 'bg-gray-500')} style={{ left: p.x, top: p.y, width: p.width, height: p.height }}>
                            {isGoal && <Flag className="w-full h-full text-white p-2"/>}
                        </div>
                    );
                })}
            </div>
            {isMobile && gameState === 'playing' && (
                <div className="flex justify-between w-full max-w-sm mt-4">
                    <Button onTouchStart={() => handleMoveStart('left')} onTouchEnd={handleMoveEnd} size="lg" className="w-24 h-16"><ArrowLeft /></Button>
                    <Button onClick={handleJump} size="lg" className="w-24 h-16"><ArrowUp /></Button>
                    <Button onTouchStart={() => handleMoveStart('right')} onTouchEnd={handleMoveEnd} size="lg" className="w-24 h-16"><ArrowRight /></Button>
                </div>
            )}
            <p className="text-sm text-muted-foreground hidden md:block">Arrow keys to move, Space to jump.</p>
        </div>
    );
}
