
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy, Coins, Heart, Play, Zap, Flame, Snowflake, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRID_SIZE = 15;
const CELL_SIZE = 32;
const ENEMY_BASE_SPEED = 0.5;

const PATH_COORDS = [[0, 7], [1, 7], [2, 7], [2, 6], [2, 5], [2, 4], [3, 4], [4, 4], [5, 4], [5, 5], [5, 6], [6, 6], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [8, 2], [9, 2], [10, 2], [10, 3], [10, 4], [10, 5], [10, 6], [10, 7], [10, 8], [10, 9], [11, 9], [12, 9], [12, 8], [12, 7], [12, 6], [13, 6], [14, 6]];
const SVG_PATH = PATH_COORDS.map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p[0] * CELL_SIZE + CELL_SIZE/2} ${p[1] * CELL_SIZE + CELL_SIZE/2}`).join(' ');

type TowerType = 'laser' | 'fire' | 'ice';
type Tower = { id: number; x: number; y: number; type: TowerType; range: number; damage: number; fireRate: number; lastFired: number; };
type Enemy = { id: number; pathProgress: number; maxHealth: number; health: number; speed: number; slowUntil: number; };
type Projectile = { id: number; from: { x: number, y: number }; to: { x: number, y: number }; type: TowerType };
type GameState = 'start' | 'playing' | 'wave_over' | 'gameover';

const TOWER_SPECS: Record<TowerType, { name: string; cost: number; range: number; damage: number; fireRate: number; icon: React.FC<any> }> = {
    laser: { name: 'Laser Turret', cost: 50, range: 3, damage: 30, fireRate: 800, icon: Zap },
    fire: { name: 'Fire Cannon', cost: 75, range: 2.5, damage: 15, fireRate: 1500, icon: Flame }, // Damage is lower but has splash
    ice: { name: 'Frost Tower', cost: 60, range: 2, damage: 5, fireRate: 1200, icon: Snowflake }, // Damage is low but slows
};
const SPLASH_RADIUS = 1.5 * CELL_SIZE;
const SLOW_DURATION = 2000; // ms

// Component for rendering an enemy
const EnemySprite = ({ health, maxHealth }: { health: number, maxHealth: number}) => {
    const healthPercentage = (health / maxHealth) * 100;
    return (
        <div className="absolute -translate-x-1/2 -translate-y-1/2">
            <Bot className="w-5 h-5 text-fuchsia-400 drop-shadow-[0_0_4px_hsl(var(--accent))]" />
            <div className="absolute -top-2 w-5 h-1.5 bg-gray-600 rounded-full overflow-hidden border border-black/50">
                <div className="h-full bg-gradient-to-r from-red-500 to-green-500" style={{ width: `${healthPercentage}%` }} />
            </div>
        </div>
    );
};

export const TowerDefense = () => {
    const [towers, setTowers] = useState<Tower[]>([]);
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [gameState, setGameState] = useState<GameState>('start');
    const [wave, setWave] = useState(0);
    const [waveSpawning, setWaveSpawning] = useState(false);
    const [currency, setCurrency] = useState(125);
    const [health, setHealth] = useState(20);
    const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);

    const gameLoopRef = useRef<number>();
    const pathRef = useRef<SVGPathElement>(null);
    const pathLength = useRef(0);

    const score = useMemo(() => Math.max(0, (wave -1) * 100), [wave]);
    const { scores, updateScore } = useGame();
    const highScore = scores[21] || 0;

    const resetGame = useCallback(() => {
        setTowers([]);
        setEnemies([]);
        setProjectiles([]);
        setWave(0);
        setCurrency(125);
        setHealth(20);
        setSelectedTower(null);
        setGameState('playing');
        startNextWave(0); // Start with wave 0 which will become wave 1
    }, []);

    const startNextWave = useCallback((currentWave: number) => {
        if(gameState === 'gameover') return;
        setGameState('playing');
        setWave(currentWave + 1);
        setWaveSpawning(true);
    }, [gameState]);

    useEffect(() => {
        if (waveSpawning && wave > 0) {
            const enemyCount = 5 + wave * 3;
            const enemyHealth = 100 + wave * 25;
            let spawnedCount = 0;

            const spawnInterval = setInterval(() => {
                if (spawnedCount < enemyCount) {
                    setEnemies(e => [...e, { id: Date.now() + spawnedCount, pathProgress: 0, health: enemyHealth, maxHealth: enemyHealth, speed: ENEMY_BASE_SPEED, slowUntil: 0 }]);
                    spawnedCount++;
                } else {
                    clearInterval(spawnInterval);
                    setWaveSpawning(false);
                }
            }, 500);

            return () => clearInterval(spawnInterval);
        }
    }, [waveSpawning, wave]);
    
    const handleGridClick = (x: number, y: number) => {
        if (!selectedTower) return;
        if (gameState !== 'playing' && gameState !== 'wave_over') return;
        if (PATH_COORDS.some(([px, py]) => px === x && py === y)) return;
        if (towers.some(t => t.x === x && t.y === y)) return;

        const spec = TOWER_SPECS[selectedTower];
        if (currency >= spec.cost) {
            setCurrency(c => c - spec.cost);
            setTowers(t => [...t, { id: Date.now(), x, y, type: selectedTower, ...spec, lastFired: 0 }]);
        }
    };

    const gameLoop = useCallback(() => {
        if (gameState !== 'playing' || !pathRef.current) return;

        const now = Date.now();
        const newProjectiles: Projectile[] = [];

        // Tower Firing
        setTowers(currentTowers => currentTowers.map(tower => {
            if (now - tower.lastFired > tower.fireRate) {
                const towerCenterX = tower.x * CELL_SIZE + CELL_SIZE / 2;
                const towerCenterY = tower.y * CELL_SIZE + CELL_SIZE / 2;
                
                let bestTarget: Enemy | null = null;
                let maxProgress = -1;

                enemies.forEach(enemy => {
                    const enemyCoords = pathRef.current?.getPointAtLength(enemy.pathProgress);
                    if (enemyCoords) {
                        const dist = Math.hypot(enemyCoords.x - towerCenterX, enemyCoords.y - towerCenterY);
                        if (dist < tower.range * CELL_SIZE && enemy.pathProgress > maxProgress) {
                            maxProgress = enemy.pathProgress;
                            bestTarget = enemy;
                        }
                    }
                });

                if (bestTarget) {
                    const targetCoords = pathRef.current?.getPointAtLength(bestTarget.pathProgress);
                    if (targetCoords) {
                        newProjectiles.push({
                            id: Date.now() + Math.random(),
                            from: { x: towerCenterX, y: towerCenterY },
                            to: { x: targetCoords.x, y: targetCoords.y },
                            type: tower.type,
                        });
                        return { ...tower, lastFired: now };
                    }
                }
            }
            return tower;
        }));
        
        if (newProjectiles.length > 0) {
            setProjectiles(p => [...p, ...newProjectiles]);
            setTimeout(() => {
                setProjectiles(current => current.filter(p => !newProjectiles.find(np => np.id === p.id)));
            }, 100);
            
            // Apply projectile effects immediately
            setEnemies(currentEnemies => {
                let enemiesToUpdate = [...currentEnemies];
                newProjectiles.forEach(proj => {
                    if (!pathRef.current) return;
                    const towerSpec = TOWER_SPECS[proj.type];
                    const target = enemies.sort((a,b) => b.pathProgress - a.pathProgress).find(e => {
                        const eCoords = pathRef.current!.getPointAtLength(e.pathProgress);
                        return Math.hypot(eCoords.x - proj.to.x, eCoords.y - proj.to.y) < CELL_SIZE;
                    });

                    if (target) {
                        if (proj.type === 'laser') {
                             enemiesToUpdate = enemiesToUpdate.map(e => e.id === target.id ? {...e, health: e.health - towerSpec.damage} : e);
                        } else if (proj.type === 'fire') {
                            enemiesToUpdate.forEach((enemy, index) => {
                                const enemyCoords = pathRef.current!.getPointAtLength(enemy.pathProgress);
                                if (Math.hypot(enemyCoords.x - proj.to.x, enemyCoords.y - proj.to.y) < SPLASH_RADIUS) {
                                    enemiesToUpdate[index] = {...enemy, health: enemy.health - towerSpec.damage};
                                }
                            });
                        } else if (proj.type === 'ice') {
                            enemiesToUpdate = enemiesToUpdate.map(e => e.id === target.id ? {...e, health: e.health - towerSpec.damage, slowUntil: now + SLOW_DURATION} : e);
                        }
                    }
                });
                return enemiesToUpdate;
            });
        }

        // Enemy Logic
        const enemiesEscaped: number[] = [];
        const enemiesDefeated: number[] = [];
        
        const updatedEnemies = enemies.map(enemy => {
            if (enemy.health <= 0) {
                enemiesDefeated.push(enemy.id);
                return null;
            }
            const speedMultiplier = now < enemy.slowUntil ? 0.5 : 1;
            const newPathProgress = enemy.pathProgress + (enemy.speed * speedMultiplier);

            if (newPathProgress >= pathLength.current) {
                enemiesEscaped.push(enemy.id);
                return null;
            }
            return { ...enemy, pathProgress: newPathProgress };
        }).filter((e): e is Enemy => e !== null);

        setEnemies(updatedEnemies);
        
        if (enemiesEscaped.length > 0) {
            setHealth(h => Math.max(0, h - enemiesEscaped.length));
        }
        if (enemiesDefeated.length > 0) {
            setCurrency(c => c + enemiesDefeated.length * 5);
        }
        
        // State checks
        if (health - enemiesEscaped.length <= 0) {
            setGameState('gameover');
            updateScore(21, score);
        } else if (updatedEnemies.length === 0 && !waveSpawning) {
            setGameState('wave_over');
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, enemies, waveSpawning, health, score, updateScore]);

    useEffect(() => {
        if(pathRef.current) pathLength.current = pathRef.current.getTotalLength();
        if (gameState === 'playing') {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
    }, [gameState, gameLoop]);
    
    const EnemyComponent = ({ enemy }: { enemy: Enemy }) => {
        if (!pathRef.current || enemy.pathProgress > pathLength.current) return null;
        const point = pathRef.current.getPointAtLength(enemy.pathProgress);
        return (
            <div className="absolute transition-all duration-100 ease-linear" style={{ transform: `translate(${point.x}px, ${point.y}px)` }}>
                <EnemySprite health={enemy.health} maxHealth={enemy.maxHealth} />
            </div>
        );
    };

    const ProjectileComponent = ({ projectile }: { projectile: Projectile }) => {
        const color = projectile.type === 'laser' ? 'hsl(var(--primary))' : projectile.type === 'fire' ? 'hsl(var(--destructive))' : '#3b82f6';
        return <line x1={projectile.from.x} y1={projectile.from.y} x2={projectile.to.x} y2={projectile.to.y} stroke={color} strokeWidth="2" style={{filter: `drop-shadow(0 0 4px ${color})`}}/>
    };
    
    return (
        <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
            <div className="relative bg-gray-900 border-2 border-primary/50 overflow-hidden" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE, boxShadow: '0 0 20px hsl(var(--primary)/0.5), inset 0 0 15px hsl(var(--primary)/0.3)'}}>
                 {(gameState === 'start' || gameState === 'gameover') && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-white gap-4 text-center p-4">
                        <h2 className="text-4xl font-bold font-headline">{gameState === 'gameover' ? 'Core Integrity Failure' : 'Tower Defense 2077'}</h2>
                        {gameState === 'gameover' && <p>You survived until wave {wave}. Final Score: {score}</p>}
                        <Button onClick={resetGame} size="lg" className="mt-4">
                            {gameState === 'gameover' ? 'Re-initialize' : 'Start Defense'}
                        </Button>
                    </div>
                )}
                <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                    <path ref={pathRef} d={SVG_PATH} stroke="hsl(var(--primary)/0.2)" strokeWidth="20" fill="none" />
                    {projectiles.map(p => <ProjectileComponent key={p.id} projectile={p} />)}
                </svg>

                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}>
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const isPath = PATH_COORDS.some(([px, py]) => px === x && py === y);
                        return <div key={i} className={cn("hover:bg-primary/10 transition-colors", isPath && 'pointer-events-none')} onClick={() => handleGridClick(x, y)} />;
                    })}
                </div>
                
                {towers.map((tower, i) => {
                    const Icon = TOWER_SPECS[tower.type].icon;
                    return (
                        <div key={i} className="absolute flex items-center justify-center pointer-events-none" style={{ left: tower.x * CELL_SIZE, top: tower.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}>
                            <Icon className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_5px_hsl(var(--primary))]"/>
                        </div>
                    )
                })}
                
                {enemies.map(enemy => <EnemyComponent key={enemy.id} enemy={enemy} />)}
            </div>
             <div className="w-full lg:w-64 space-y-4">
                <div className="p-4 bg-muted/80 rounded-lg text-center">
                    <h3 className="text-lg font-bold">Wave</h3>
                    <p className="text-2xl font-mono">{wave}</p>
                </div>
                <div className="flex gap-4">
                    <div className="p-2 flex-1 bg-muted/80 rounded-lg text-center">
                        <h3 className="text-sm font-bold flex items-center justify-center gap-1"><Coins className="h-4 w-4 text-yellow-500" /> Credits</h3>
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
                
                {gameState === 'wave_over' && !waveSpawning && (
                    <Button onClick={() => startNextWave(wave)} className="w-full" size="lg">
                        Start Wave {wave + 1}
                    </Button>
                )}

                 <div className={cn("p-4 bg-muted/80 rounded-lg", gameState !== 'wave_over' && gameState !== 'playing' && 'opacity-50')}>
                    <h3 className="text-lg font-bold text-center mb-2">Build Defenses</h3>
                    <div className="space-y-2">
                    {(Object.keys(TOWER_SPECS) as TowerType[]).map(type => {
                        const spec = TOWER_SPECS[type];
                        const Icon = spec.icon;
                        return (
                             <Button 
                                key={type}
                                className="w-full justify-start" 
                                variant={selectedTower === type ? 'default' : 'outline'}
                                disabled={(gameState !== 'wave_over' && gameState !== 'playing') || currency < spec.cost}
                                onClick={() => setSelectedTower(type)}
                            >
                                <Icon className="mr-2"/> {spec.name} ({spec.cost})
                            </Button>
                        )
                    })}
                    </div>
                </div>
            </div>
        </div>
    );
};
