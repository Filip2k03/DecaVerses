'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Trophy, Zap, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const GAME_WIDTH = 500;
const GAME_HEIGHT = 400;
const SHOOTER_ORIGIN = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
const ORB_SIZE = 10;
const ORB_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
const PATH_DATA = "M 50 350 A 200 200 0 0 1 450 350";
const ORB_SPEED = 0.5;
const PROJECTILE_SPEED = 7;
const ORB_SPACING = ORB_SIZE * 2.2;
const SPAWN_INTERVAL = 800; // ms

type Orb = { id: number; color: string; distance: number };
type Projectile = { id: number; x: number; y: number; vx: number; vy: number; color: string };
type GameState = 'menu' | 'playing' | 'gameover';

export const OrbitalDecay = () => {
    const [gameState, setGameState] = useState<GameState>('menu');
    const [orbs, setOrbs] = useState<Orb[]>([]);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [shooterAngle, setShooterAngle] = useState(0);
    const [shooterOrb, setShooterOrb] = useState(ORB_COLORS[0]);
    const [nextShooterOrb, setNextShooterOrb] = useState(ORB_COLORS[1]);
    const [score, setScore] = useState(0);

    const { scores, updateScore } = useGame();
    const highScore = scores[25] || 0;
    const isMobile = useIsMobile();
    
    const gameAreaRef = useRef<SVGSVGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const gameLoopRef = useRef<number>();
    const pathLengthRef = useRef(0);
    const lastSpawnTime = useRef(0);

    const getRandomColor = () => ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)];

    const resetGame = useCallback(() => {
        setGameState('playing');
        setScore(0);
        setOrbs([]);
        setProjectiles([]);
        setShooterOrb(getRandomColor());
        setNextShooterOrb(getRandomColor());
        lastSpawnTime.current = Date.now();
    }, []);

    const handleInputMove = (clientX: number, clientY: number) => {
        if (!gameAreaRef.current) return;
        const rect = gameAreaRef.current.getBoundingClientRect();
        const angle = Math.atan2(clientY - rect.top - SHOOTER_ORIGIN.y, clientX - rect.left - SHOOTER_ORIGIN.x);
        setShooterAngle(angle * 180 / Math.PI + 90);
    };

    const handleShoot = useCallback(() => {
        if (gameState !== 'playing') return;
        const angleRad = (shooterAngle - 90) * Math.PI / 180;
        setProjectiles(p => [...p, {
            id: Date.now(),
            x: SHOOTER_ORIGIN.x,
            y: SHOOTER_ORIGIN.y,
            vx: Math.cos(angleRad) * PROJECTILE_SPEED,
            vy: Math.sin(angleRad) * PROJECTILE_SPEED,
            color: shooterOrb
        }]);
        setShooterOrb(nextShooterOrb);
        setNextShooterOrb(getRandomColor());
    }, [gameState, shooterAngle, shooterOrb, nextShooterOrb]);

    const gameLoop = useCallback(() => {
        if (!pathRef.current) return;
        
        const now = Date.now();

        // Spawn new orbs
        if (now - lastSpawnTime.current > SPAWN_INTERVAL) {
            lastSpawnTime.current = now;
            setOrbs(o => [{ id: now, color: getRandomColor(), distance: 0 }, ...o]);
        }

        // Move orbs
        const updatedOrbs = orbs.map(orb => ({ ...orb, distance: orb.distance + ORB_SPEED })).filter(orb => orb.distance < pathLengthRef.current);
        
        // Game Over Check
        if (orbs.length > 0 && orbs[orbs.length-1].distance >= pathLengthRef.current) {
            setGameState('gameover');
            updateScore(25, score);
        }

        // Move projectiles
        const updatedProjectiles = projectiles
            .map(p => ({...p, x: p.x + p.vx, y: p.y + p.vy}))
            .filter(p => p.x > -10 && p.x < GAME_WIDTH + 10 && p.y > -10 && p.y < GAME_HEIGHT + 10);

        // Collision detection
        const projectilesToRemove = new Set<number>();
        const orbsToRemove = new Set<number>();
        let scoreToAdd = 0;

        updatedProjectiles.forEach(proj => {
            if (projectilesToRemove.has(proj.id)) return;
            for (let i = 0; i < updatedOrbs.length; i++) {
                const orb = updatedOrbs[i];
                if (orbsToRemove.has(orb.id)) continue;

                const point = pathRef.current.getPointAtLength(Math.max(0, orb.distance));
                const dist = Math.hypot(proj.x - point.x, proj.y - point.y);

                if (dist < ORB_SIZE * 2) {
                    projectilesToRemove.add(proj.id);
                    if (proj.color === orb.color) {
                        let matchStartIndex = i;
                        let matchEndIndex = i;
                        
                        for (let k = i - 1; k >= 0; k--) {
                            if (updatedOrbs[k].color === proj.color) matchStartIndex = k;
                            else break;
                        }
                        for (let k = i + 1; k < updatedOrbs.length; k++) {
                            if (updatedOrbs[k].color === proj.color) matchEndIndex = k;
                            else break;
                        }

                        if (matchEndIndex - matchStartIndex + 1 >= 2) {
                            for (let k = matchStartIndex; k <= matchEndIndex; k++) {
                                orbsToRemove.add(updatedOrbs[k].id);
                                scoreToAdd += 10;
                            }
                        }
                    }
                    break; 
                }
            }
        });
        
        setOrbs(updatedOrbs.filter(orb => !orbsToRemove.has(orb.id)));
        setProjectiles(updatedProjectiles.filter(proj => !projectilesToRemove.has(proj.id)));
        if (scoreToAdd > 0) {
            setScore(s => s + scoreToAdd);
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [orbs, projectiles, score, updateScore]);

    useEffect(() => {
        if (pathRef.current) {
            pathLengthRef.current = pathRef.current.getTotalLength();
        }
        if (gameState === 'playing') {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        } else {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        }
        return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
    }, [gameState, gameLoop]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex justify-between w-full max-w-lg text-lg font-headline">
                <div>Score: {score}</div>
                <div className='flex items-center gap-2'><Trophy className='h-5 w-5 text-yellow-500' /> Best: {highScore}</div>
            </div>
            <div className="relative">
                <svg
                    ref={gameAreaRef}
                    width={GAME_WIDTH}
                    height={GAME_HEIGHT}
                    className="bg-gray-900 border-2 border-primary/50 cursor-crosshair"
                    onMouseMove={e => handleInputMove(e.clientX, e.clientY)}
                    onTouchMove={e => handleInputMove(e.touches[0].clientX, e.touches[0].clientY)}
                    onClick={isMobile ? undefined : handleShoot}
                >
                    <path ref={pathRef} d={PATH_DATA} stroke="hsl(var(--primary)/0.3)" strokeWidth="2" fill="none" strokeDasharray="5 5" />
                    
                    {orbs.map(orb => {
                        if (!pathRef.current || orb.distance > pathLengthRef.current) return null;
                        const point = pathRef.current.getPointAtLength(Math.max(0, orb.distance));
                        return <circle key={orb.id} cx={point.x} cy={point.y} r={ORB_SIZE} fill={orb.color} stroke="#fff" strokeWidth="1" />;
                    })}

                    {projectiles.map(p => <circle key={p.id} cx={p.x} cy={p.y} r={ORB_SIZE - 2} fill={p.color} stroke="#000" strokeWidth="1" />)}

                    <g transform={`translate(${SHOOTER_ORIGIN.x}, ${SHOOTER_ORIGIN.y}) rotate(${shooterAngle})`}>
                        <Zap className="text-yellow-400 w-16 h-16 -translate-x-8 -translate-y-8" />
                        <circle cx="0" cy="0" r={ORB_SIZE} fill={shooterOrb} stroke="#fff" strokeWidth="2"/>
                        <circle cx="0" cy="-25" r={ORB_SIZE-3} fill={nextShooterOrb} stroke="#fff" strokeWidth="1" opacity="0.7"/>
                    </g>
                    
                    {(gameState === 'menu' || gameState === 'gameover') && (
                        <foreignObject x="0" y="0" width="100%" height="100%">
                            <div className="w-full h-full bg-black/80 flex flex-col items-center justify-center text-white">
                                <h2 className="text-4xl font-bold font-headline">{gameState === 'gameover' ? 'Game Over' : 'Orbital Decay'}</h2>
                                {gameState === 'gameover' && <p>Final Score: {score}</p>}
                                <Button onClick={resetGame} className="mt-4">
                                    {gameState === 'gameover' ? 'Play Again' : 'Start Game'}
                                </Button>
                            </div>
                        </foreignObject>
                    )}
                </svg>
                 {isMobile && gameState === 'playing' && (
                    <Button onClick={handleShoot} size="lg" className="absolute bottom-4 right-4 h-20 w-20 rounded-full z-10">
                        <Zap className="w-10 h-10" />
                    </Button>
                )}
            </div>
            <Button onClick={resetGame} variant="outline" className={cn(gameState !== 'playing' && 'hidden')}>
                <RefreshCw className="mr-2" />
                Restart
            </Button>
        </div>
    );
};
