
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy, Coins, Heart, Play, Zap, Flame, Snowflake, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRID_SIZE = 15;
const CELL_SIZE = 32;
const ENEMY_BASE_SPEED = 0.5;
const PROJECTILE_SPEED = 5;

const PATH_COORDS = [[0, 7], [1, 7], [2, 7], [2, 6], [2, 5], [2, 4], [3, 4], [4, 4], [5, 4], [5, 5], [5, 6], [6, 6], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [8, 2], [9, 2], [10, 2], [10, 3], [10, 4], [10, 5], [10, 6], [10, 7], [10, 8], [10, 9], [11, 9], [12, 9], [12, 8], [12, 7], [12, 6], [13, 6], [14, 6]];
const SVG_PATH = PATH_COORDS.map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p[0] * CELL_SIZE + CELL_SIZE/2} ${p[1] * CELL_SIZE + CELL_SIZE/2}`).join(' ');

type TowerType = 'laser' | 'fire' | 'ice';
type Tower = { id: number; x: number; y: number; type: TowerType; range: number; damage: number; fireRate: number; lastFired: number; };
type Enemy = { id: number; pathProgress: number; maxHealth: number; health: number; speed: number; slowUntil: number; };
type Projectile = { id: number; x: number; y: number; targetId: number; type: TowerType };
type GameState = 'start' | 'playing' | 'wave_over' | 'gameover';

const TOWER_SPECS: Record<TowerType, { name: string; cost: number; range: number; damage: number; fireRate: number; icon: React.FC<any> }> = {
    laser: { name: 'Laser Turret', cost: 50, range: 3, damage: 30, fireRate: 800, icon: Zap },
    fire: { name: 'Fire Cannon', cost: 75, range: 2.5, damage: 15, fireRate: 1500, icon: Flame }, // Damage is lower but has splash
    ice: { name: 'Frost Tower', cost: 60, range: 2, damage: 5, fireRate: 1200, icon: Snowflake }, // Damage is low but slows
};
const SPLASH_RADIUS = 1.5 * CELL_SIZE;
const SLOW_DURATION = 2000; // ms

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
    const [gameSpeed, setGameSpeed] = useState(1);

    const gameLoopRef = useRef<number>();
    const pathRef = useRef<SVGPathElement>(null);
    const pathLength = useRef(0);

    const score = useMemo(() => Math.max(0, (wave -1) * 100), [wave]);
    const { scores, updateScore } = useGame();
    const highScore = scores[21] || 0;

    const startNextWave = useCallback((currentWave: number) => {
        if(gameState === 'gameover') return;
        setGameState('playing');
        setWave(currentWave + 1);
        setWaveSpawning(true);
    }, [gameState]);

    const resetGame = useCallback(() => {
        setTowers([]);
        setEnemies([]);
        setProjectiles([]);
        setWave(0);
        setCurrency(125);
        setHealth(20);
        setSelectedTower(null);
        setGameSpeed(1);
        setGameState('playing');
        startNextWave(0);
    }, [startNextWave]);


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
            }, 500 / gameSpeed);

            return () => clearInterval(spawnInterval);
        }
    }, [waveSpawning, wave, gameSpeed]);
    
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
        if (gameState !== 'playing' || !pathRef.current) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
            return;
        }

        let tempTowers = [...towers];
        let tempEnemies = [...enemies];
        let tempProjectiles = [...projectiles];
        let tempHealth = health;
        let tempCurrency = currency;
        
        const now = Date.now();

        // --- 1. Tower Firing ---
        const newProjectiles: Projectile[] = [];
        tempTowers = tempTowers.map(tower => {
            if (now - tower.lastFired > tower.fireRate / gameSpeed) {
                const towerCenterX = tower.x * CELL_SIZE + CELL_SIZE / 2;
                const towerCenterY = tower.y * CELL_SIZE + CELL_SIZE / 2;
                
                let bestTarget: Enemy | null = null;
                let maxProgress = -1;

                tempEnemies.forEach(enemy => {
                    const enemyCoords = pathRef.current!.getPointAtLength(enemy.pathProgress);
                    const dist = Math.hypot(enemyCoords.x - towerCenterX, enemyCoords.y - towerCenterY);
                    if (dist < tower.range * CELL_SIZE && enemy.pathProgress > maxProgress) {
                        maxProgress = enemy.pathProgress;
                        bestTarget = enemy;
                    }
                });

                if (bestTarget) {
                    newProjectiles.push({ id: Date.now() + Math.random(), x: towerCenterX, y: towerCenterY, targetId: bestTarget.id, type: tower.type });
                    return { ...tower, lastFired: now };
                }
            }
            return tower;
        });
        
        tempProjectiles.push(...newProjectiles);

        // --- 2. Enemy Movement ---
        const enemiesReachedEnd = new Set<number>();
        tempEnemies = tempEnemies.map(enemy => {
            const speedMultiplier = now < enemy.slowUntil ? 0.5 : 1;
            const newPathProgress = enemy.pathProgress + (enemy.speed * speedMultiplier * gameSpeed);
            if (newPathProgress >= pathLength.current) {
                enemiesReachedEnd.add(enemy.id);
                return null;
            }
            return { ...enemy, pathProgress: newPathProgress };
        }).filter(Boolean) as Enemy[];

        if (enemiesReachedEnd.size > 0) {
            tempHealth -= enemiesReachedEnd.size;
        }

        // --- 3. Projectile Movement and Collision ---
        const projectilesToRemove = new Set<number>();
        const enemiesToDamage = new Map<number, { damage: number, type: TowerType }[]>();

        tempProjectiles = tempProjectiles.map(proj => {
            const target = tempEnemies.find(e => e.id === proj.targetId);
            if (!target) {
                projectilesToRemove.add(proj.id);
                return proj;
            }

            const targetCoords = pathRef.current!.getPointAtLength(target.pathProgress);
            const dx = targetCoords.x - proj.x;
            const dy = targetCoords.y - proj.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < PROJECTILE_SPEED * gameSpeed) {
                projectilesToRemove.add(proj.id);
                if (!enemiesToDamage.has(target.id)) enemiesToDamage.set(target.id, []);
                enemiesToDamage.get(target.id)!.push({ damage: TOWER_SPECS[proj.type].damage, type: proj.type });

                if (proj.type === 'fire') {
                    tempEnemies.forEach(otherEnemy => {
                        if (otherEnemy.id === target.id) return;
                        const otherCoords = pathRef.current!.getPointAtLength(otherEnemy.pathProgress);
                        if (Math.hypot(otherCoords.x - targetCoords.x, otherCoords.y - targetCoords.y) < SPLASH_RADIUS) {
                            if (!enemiesToDamage.has(otherEnemy.id)) enemiesToDamage.set(otherEnemy.id, []);
                            enemiesToDamage.get(otherEnemy.id)!.push({ damage: TOWER_SPECS.fire.damage, type: 'fire' });
                        }
                    });
                }
                return proj;
            }
            const moveX = (dx / dist) * PROJECTILE_SPEED * gameSpeed;
            const moveY = (dy / dist) * PROJECTILE_SPEED * gameSpeed;
            return { ...proj, x: proj.x + moveX, y: proj.y + moveY };
        });

        // --- 4. Apply Damage & Effects ---
        const defeatedEnemyIds = new Set<number>();
        if (enemiesToDamage.size > 0) {
            tempEnemies = tempEnemies.map(enemy => {
                if (enemiesToDamage.has(enemy.id)) {
                    let newHealth = enemy.health;
                    let newSlowUntil = enemy.slowUntil;
                    enemiesToDamage.get(enemy.id)!.forEach(d => {
                        newHealth -= d.damage;
                        if (d.type === 'ice') newSlowUntil = now + SLOW_DURATION;
                    });

                    if (newHealth <= 0) {
                        defeatedEnemyIds.add(enemy.id);
                        return null;
                    }
                    return { ...enemy, health: newHealth, slowUntil: newSlowUntil };
                }
                return enemy;
            }).filter(Boolean) as Enemy[];
        }
        
        if (defeatedEnemyIds.size > 0) tempCurrency += defeatedEnemyIds.size * 5;
        
        // --- 5. Update State ---
        setTowers(tempTowers);
        setEnemies(tempEnemies.filter(e => !defeatedEnemyIds.has(e.id)));
        setProjectiles(tempProjectiles.filter(p => !projectilesToRemove.has(p.id)));
        setHealth(tempHealth);
        setCurrency(tempCurrency);

        // --- 6. Game State Checks ---
        if (tempHealth <= 0) {
            setGameState('gameover');
            updateScore(21, score);
        } else if (tempEnemies.length === 0 && !waveSpawning) {
            setGameState('wave_over');
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [towers, enemies, projectiles, health, currency, gameState, waveSpawning, gameSpeed, score, updateScore]);

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
        const size = projectile.type === 'fire' ? 8 : 5;
        return <circle cx={projectile.x} cy={projectile.y} r={size/2} fill={color} style={{filter: `drop-shadow(0 0 4px ${color})`}}/>;
    };
    
    return (
        <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
            <div className="relative bg-gray-900 border-2 border-primary/50 overflow-hidden" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE, boxShadow: '0 0 20px hsl(var(--primary)/0.5), inset 0 0 15px hsl(var(--primary)/0.3)'}}>
                 {(gameState === 'start' || gameState === 'gameover' || (gameState === 'wave_over' && !waveSpawning)) && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-white gap-4 text-center p-4">
                        {gameState === 'start' && <>
                            <h2 className="text-4xl font-bold font-headline">Tower Defense 2077</h2>
                            <Button onClick={resetGame} size="lg" className="mt-4">Start Defense</Button>
                        </>}
                        {gameState === 'gameover' && <>
                            <h2 className="text-4xl font-bold font-headline">You Lost!</h2>
                            <p>You were defeated on wave {wave}. Final Score: {score}</p>
                            <Button onClick={resetGame} size="lg" className="mt-4">Re-initialize</Button>
                        </>}
                        {gameState === 'wave_over' && !waveSpawning && <>
                            <h2 className="text-3xl font-bold font-headline">Wave {wave} Complete!</h2>
                             <Button onClick={() => startNextWave(wave)} size="lg">Start Wave {wave + 1}</Button>
                        </>}
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
                
                 <div className="p-4 bg-muted/80 rounded-lg text-center">
                    <h3 className="text-lg font-bold mb-2">Game Speed</h3>
                    <div className="flex justify-center gap-1">
                        {[1, 2, 4, 8].map(speed => (
                            <Button
                                key={speed}
                                size="sm"
                                variant={gameSpeed === speed ? 'default' : 'outline'}
                                onClick={() => setGameSpeed(speed)}
                                disabled={gameState === 'gameover'}
                            >
                                {speed}x
                            </Button>
                        ))}
                    </div>
                </div>

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
