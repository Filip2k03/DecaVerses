'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy, Coins, Heart, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TowerDefenseIcon } from '../GameIcons';

const GRID_SIZE = 15;
const CELL_SIZE = 32;
const PATH = [[0, 7], [1, 7], [2, 7], [2, 6], [2, 5], [2, 4], [3, 4], [4, 4], [5, 4], [5, 5], [5, 6], [6, 6], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [8, 2], [9, 2], [10, 2], [10, 3], [10, 4], [10, 5], [10, 6], [10, 7], [10, 8], [10, 9], [11, 9], [12, 9], [12, 8], [12, 7], [12, 6], [13, 6], [14, 6]];

type Tower = { x: number; y: number; range: number; fireRate: number; lastFired: number; };
type Enemy = { id: number; pathIndex: number; x: number; y: number; health: number; };
type GameState = 'start' | 'playing' | 'gameover';

export const TowerDefense = () => {
    const [towers, setTowers] = useState<Tower[]>([]);
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [gameState, setGameState] = useState<GameState>('start');
    const [wave, setWave] = useState(0);
    const [currency, setCurrency] = useState(100);
    const [health, setHealth] = useState(20);
    const [selectedTower, setSelectedTower] = useState<'laser' | null>('laser');

    const { scores, updateScore } = useGame();
    const highScore = scores[21] || 0;
    const score = useMemo(() => wave * 100, [wave]);

    const gameLoopRef = useRef<number>();

    const startGame = () => {
        setTowers([]);
        setEnemies([]);
        setWave(0);
        setCurrency(100);
        setHealth(20);
        setGameState('playing');
    };

    const handleGridClick = (x: number, y: number) => {
        if (gameState !== 'playing' || !selectedTower) return;
        if (PATH.some(([px, py]) => px === x && py === y)) return;
        if (towers.some(t => t.x === x && t.y === y)) return;

        const cost = 50;
        if (currency >= cost) {
            setCurrency(c => c - cost);
            setTowers(t => [...t, { x, y, range: 3, fireRate: 1000, lastFired: 0 }]);
        }
    };
    
    const gameTick = useCallback(() => {
        if (gameState !== 'playing') return;

        const now = Date.now();
        
        // Tower Firing
        setTowers(towers.map(tower => {
            if (now - tower.lastFired > tower.fireRate) {
                 const targets = enemies.filter(enemy => {
                    const dx = enemy.x - (tower.x * CELL_SIZE + CELL_SIZE/2);
                    const dy = enemy.y - (tower.y * CELL_SIZE + CELL_SIZE/2);
                    return Math.sqrt(dx*dx + dy*dy) < tower.range * CELL_SIZE;
                 });

                 if (targets.length > 0) {
                     setEnemies(currentEnemies => currentEnemies.map(e => e.id === targets[0].id ? {...e, health: e.health - 25} : e));
                     return {...tower, lastFired: now};
                 }
            }
            return tower;
        }));

        // Enemy movement
        setEnemies(currentEnemies => {
            const newEnemies = currentEnemies.map(enemy => {
                if (enemy.pathIndex >= PATH.length - 1) {
                    setHealth(h => h - 1);
                    return null;
                }
                const nextPathIndex = enemy.pathIndex + 1;
                const [targetX, targetY] = PATH[nextPathIndex];
                const newX = targetX * CELL_SIZE + CELL_SIZE/2;
                const newY = targetY * CELL_SIZE + CELL_SIZE/2;

                return { ...enemy, pathIndex: nextPathIndex, x: newX, y: newY };
            }).filter((e): e is Enemy => e !== null && e.health > 0);
            return newEnemies;
        });

        // Wave management
        if (enemies.length === 0) {
            setWave(w => w + 1);
            const newEnemies: Enemy[] = [];
            for (let i = 0; i < 5 + wave * 2; i++) {
                newEnemies.push({ id: Date.now() + i, pathIndex: 0, x: PATH[0][0]*CELL_SIZE+CELL_SIZE/2, y: PATH[0][1]*CELL_SIZE+CELL_SIZE/2, health: 100 + wave * 20 });
            }
            // Stagger spawn
            const staggeredEnemies: Enemy[] = [];
            newEnemies.forEach((enemy, i) => {
                setTimeout(() => setEnemies(e => [...e, enemy]), i * 500);
            });
        }
        
        if (health <= 1) {
            setGameState('gameover');
            updateScore(21, score);
        }

    }, [gameState, towers, enemies, wave, health, score, updateScore]);

    useEffect(() => {
        if (gameState === 'playing') {
            const interval = setInterval(gameTick, 500);
            return () => clearInterval(interval);
        }
    }, [gameState, gameTick]);


    return (
        <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
            <div className="relative bg-black border-2 border-primary/50 overflow-hidden" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE, boxShadow: '0 0 20px hsl(var(--primary)/0.5), inset 0 0 15px hsl(var(--primary)/0.3)'}}>
                 {(gameState === 'start' || gameState === 'gameover') && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-white">
                        <h2 className="text-4xl font-bold font-headline">{gameState === 'gameover' ? 'Game Over' : 'Tower Defense'}</h2>
                        <p>Score: {score}</p>
                        <Button onClick={startGame} className="mt-4" variant="outline">
                            {gameState === 'gameover' ? 'Play Again' : 'Start Game'}
                        </Button>
                    </div>
                )}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}>
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const isPath = PATH.some(([px, py]) => px === x && py === y);
                        return <div key={i} className={cn("border border-primary/10", isPath && 'bg-primary/10')} onClick={() => handleGridClick(x, y)} />;
                    })}
                </div>
                {PATH.slice(0, -1).map(([x1, y1], i) => {
                    const [x2, y2] = PATH[i+1];
                    return <div key={i} className="absolute bg-primary/30 z-0" style={{ left: Math.min(x1,x2)*CELL_SIZE, top: Math.min(y1,y2)*CELL_SIZE, width: (Math.abs(x1-x2)+1)*CELL_SIZE, height: (Math.abs(y1-y2)+1)*CELL_SIZE }} />
                })}
                {towers.map((tower, i) => <div key={i} className="absolute flex items-center justify-center" style={{ left: tower.x * CELL_SIZE, top: tower.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}><TowerDefenseIcon className="w-5 h-5 text-cyan-400" /></div>)}
                {enemies.map(enemy => <div key={enemy.id} className="absolute w-4 h-4 bg-fuchsia-500 rounded-full transition-all duration-500 ease-linear" style={{ left: enemy.x - 8, top: enemy.y - 8, opacity: enemy.health / (100 + wave * 20) }} />)}
            </div>
             <div className="w-full lg:w-64 space-y-4">
                <div className="p-4 bg-muted/80 rounded-lg text-center">
                    <h3 className="text-lg font-bold">Wave</h3>
                    <p className="text-2xl font-mono">{wave}</p>
                </div>
                <div className="flex gap-4">
                    <div className="p-2 flex-1 bg-muted/80 rounded-lg text-center">
                        <h3 className="text-sm font-bold flex items-center justify-center gap-1"><Coins className="h-4 w-4 text-yellow-500" /> Cycles</h3>
                        <p className="text-xl font-mono">{currency}</p>
                    </div>
                    <div className="p-2 flex-1 bg-muted/80 rounded-lg text-center">
                        <h3 className="text-sm font-bold flex items-center justify-center gap-1"><Heart className="h-4 w-4 text-red-500" /> Core</h3>
                        <p className="text-xl font-mono">{health}</p>
                    </div>
                </div>
                 <div className="p-4 bg-muted/80 rounded-lg text-center">
                    <h3 className="text-lg font-bold flex items-center justify-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" /> High Score
                    </h3>
                    <p className="text-2xl font-mono">{highScore}</p>
                </div>
                 <div className="p-4 bg-muted/80 rounded-lg">
                    <h3 className="text-lg font-bold text-center mb-2">Build</h3>
                    <Button className="w-full" variant={selectedTower === 'laser' ? 'default' : 'outline'}>
                        <TowerDefenseIcon className="mr-2"/> Laser Tower (50)
                    </Button>
                </div>
            </div>
        </div>
    );
};
