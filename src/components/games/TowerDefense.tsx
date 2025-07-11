
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, FC } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Trophy, Coins, Heart, Play, Zap, Flame, Snowflake, Bot, Skull, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const GRID_SIZE = 15;
const ENEMY_BASE_SPEED = 0.5;
const PROJECTILE_SPEED = 5;
const TOWER_MAX_HEALTH = 500;
const BOSS_CREDITS = 75;

const PATH_COORDS = [[0, 7], [1, 7], [2, 7], [2, 6], [2, 5], [2, 4], [3, 4], [4, 4], [5, 4], [5, 5], [5, 6], [6, 6], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [8, 2], [9, 2], [10, 2], [10, 3], [10, 4], [10, 5], [10, 6], [10, 7], [10, 8], [10, 9], [11, 9], [12, 9], [12, 8], [12, 7], [12, 6], [13, 6], [14, 6]];

type TowerType = 'laser' | 'fire' | 'ice';
type EnemyType = 'normal' | 'shooter' | 'boss';

type Tower = { id: number; x: number; y: number; type: TowerType; range: number; damage: number; fireRate: number; lastFired: number; health: number; maxHealth: number; };
type Enemy = { id: number; pathProgress: number; maxHealth: number; health: number; speed: number; slowUntil: number; type: EnemyType; lastFired: number; };
type Projectile = { id: number; x: number; y: number; targetId: number; type: TowerType };
type EnemyProjectile = { id: number; x: number; y: number; targetId: number; damage: number; };
type GameState = 'start' | 'playing' | 'wave_over' | 'gameover';

const TOWER_SPECS: Record<TowerType, { name: string; cost: number; range: number; damage: number; fireRate: number; icon: React.FC<any> }> = {
    laser: { name: 'Laser Turret', cost: 50, range: 3, damage: 30, fireRate: 800, icon: Zap },
    fire: { name: 'Fire Cannon', cost: 75, range: 2.5, damage: 15, fireRate: 1500, icon: Flame },
    ice: { name: 'Frost Tower', cost: 60, range: 2, damage: 5, fireRate: 1200, icon: Snowflake },
};
const ENEMY_SPECS = {
    shooter: { fireRate: 2500, damage: 20, range: 4 },
    boss: { fireRate: 1500, damage: 50, range: 5 },
};

const SPLASH_RADIUS_MULTIPLIER = 1.5;
const SLOW_DURATION = 2000;

const EnemySprite = ({ health, maxHealth, type }: { health: number, maxHealth: number, type: EnemyType }) => {
    const healthPercentage = (health / maxHealth) * 100;
    const colorClass = type === 'shooter' ? 'text-orange-400' : 'text-fuchsia-400';
    return (
        <div className="absolute -translate-x-1/2 -translate-y-1/2">
            <Bot className={cn("w-5 h-5 drop-shadow-[0_0_4px_hsl(var(--accent))]", colorClass)} />
            <div className="absolute -top-2 w-5 h-1.5 bg-gray-600 rounded-full overflow-hidden border border-black/50">
                <div className="h-full bg-gradient-to-r from-red-500 to-green-500" style={{ width: `${healthPercentage}%` }} />
            </div>
        </div>
    );
};
const BossEnemySprite = ({ health, maxHealth }: { health: number, maxHealth: number}) => {
    const healthPercentage = (health / maxHealth) * 100;
    return (
        <div className="absolute -translate-x-1/2 -translate-y-1/2">
            <Skull className="w-8 h-8 text-red-500 drop-shadow-[0_0_6px_hsl(var(--destructive))]" />
            <div className="absolute -top-2 w-8 h-1.5 bg-gray-600 rounded-full overflow-hidden border border-black/50">
                <div className="h-full bg-gradient-to-r from-red-500 to-green-500" style={{ width: `${healthPercentage}%` }} />
            </div>
        </div>
    );
};

export const TowerDefense = () => {
    const [towers, setTowers] = useState<Tower[]>([]);
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [enemyProjectiles, setEnemyProjectiles] = useState<EnemyProjectile[]>([]);
    const [gameState, setGameState] = useState<GameState>('start');
    const [wave, setWave] = useState(0);
    const [waveSpawning, setWaveSpawning] = useState(false);
    const [currency, setCurrency] = useState(125);
    const [health, setHealth] = useState(20);
    const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);
    const [gameSpeed, setGameSpeed] = useState(1);
    const [isSoundOn, setIsSoundOn] = useState(true);
    const [cellSize, setCellSize] = useState(32);

    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameLoopRef = useRef<number>();
    const pathRef = useRef<SVGPathElement>(null);
    const pathLength = useRef(0);

    const { isMusicEnabled } = useSettings();
    const normalBgRef = useRef<HTMLAudioElement>(null);
    const bossBgRef = useRef<HTMLAudioElement>(null);
    const laserSfxRef = useRef<HTMLAudioElement>(null);
    const fireSfxRef = useRef<HTMLAudioElement>(null);
    const iceSfxRef = useRef<HTMLAudioElement>(null);
    const buildSfxRef = useRef<HTMLAudioElement>(null);
    const explosionSfxRef = useRef<HTMLAudioElement>(null);

    const score = useMemo(() => Math.max(0, (wave -1) * 100), [wave]);
    const { scores, updateScore } = useGame();
    const highScore = scores[21] || 0;

    useEffect(() => {
        const container = gameContainerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            if (container) {
                setCellSize(container.offsetWidth / GRID_SIZE);
            }
        });
        observer.observe(container);

        setCellSize(container.offsetWidth / GRID_SIZE);

        return () => {
            observer.disconnect();
        };
    }, []);
    
    const svgPath = useMemo(() => {
        if (cellSize === 0) return '';
        return PATH_COORDS.map((p, i) => (i === 0 ? 'M' : 'L') + ` ${p[0] * cellSize + cellSize / 2} ${p[1] * cellSize + cellSize / 2}`).join(' ');
    }, [cellSize]);

    const playSound = (soundRef: React.RefObject<HTMLAudioElement>) => {
        if (isSoundOn && soundRef.current) {
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(e => console.error("SFX playback error:", e));
        }
    };
    
    useEffect(() => {
        const normalAudio = normalBgRef.current;
        const bossAudio = bossBgRef.current;
        if (!normalAudio || !bossAudio) return;

        if (isMusicEnabled && isSoundOn && gameState === 'playing') {
            const isBossWave = wave > 0 && wave % 10 === 0;
            if (isBossWave) {
                normalAudio.pause();
                bossAudio.play().catch(e => console.error("Boss BGM error", e));
            } else {
                bossAudio.pause();
                normalAudio.play().catch(e => console.error("Normal BGM error", e));
            }
        } else {
            normalAudio.pause();
            bossAudio.pause();
        }
    }, [gameState, wave, isMusicEnabled, isSoundOn]);

    const startNextWave = useCallback((currentWave: number) => {
        if(gameState === 'gameover') return;
        setGameState('playing');
        const newWave = currentWave + 1;
        setWave(newWave);
        setWaveSpawning(true);
    }, [gameState]);
    
    const resetGame = useCallback(() => {
        setTowers([]);
        setEnemies([]);
        setProjectiles([]);
        setEnemyProjectiles([]);
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
            const isBossWave = wave % 10 === 0;
            const enemyCount = isBossWave ? 1 : 5 + wave * 3;
            const enemyBaseHealth = 100 + wave * 25;
            let spawnedCount = 0;

            const spawnInterval = setInterval(() => {
                if (spawnedCount < enemyCount) {
                     let enemyType: EnemyType = 'normal';
                    let health = enemyBaseHealth;
                     if (isBossWave) {
                        enemyType = 'boss';
                        health = 2000 + wave * 200;
                    } else if (wave >= 11 && spawnedCount % 5 === 0) {
                        enemyType = 'shooter';
                        health = enemyBaseHealth * 1.2;
                    }

                    setEnemies(e => [...e, { 
                        id: Date.now() + spawnedCount, 
                        pathProgress: 0, 
                        health: health, 
                        maxHealth: health, 
                        speed: ENEMY_BASE_SPEED, 
                        slowUntil: 0,
                        type: enemyType,
                        lastFired: 0,
                    }]);
                    spawnedCount++;
                } else {
                    clearInterval(spawnInterval);
                    setWaveSpawning(false);
                }
            }, 800 / gameSpeed);

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
            setTowers(t => [...t, { id: Date.now(), x, y, type: selectedTower, ...spec, health: TOWER_MAX_HEALTH, maxHealth: TOWER_MAX_HEALTH, lastFired: 0 }]);
            playSound(buildSfxRef);
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
        let tempEnemyProjectiles = [...enemyProjectiles];
        let tempHealth = health;
        let tempCurrency = currency;
        
        const now = Date.now();

        // 1. Tower Firing
        const newProjectiles: Projectile[] = [];
        tempTowers.forEach(tower => {
            if (now - tower.lastFired > tower.fireRate / gameSpeed) {
                const towerCenterX = tower.x * cellSize + cellSize / 2;
                const towerCenterY = tower.y * cellSize + cellSize / 2;
                let bestTarget: Enemy | null = null;
                let maxProgress = -1;

                tempEnemies.forEach(enemy => {
                    const enemyCoords = pathRef.current!.getPointAtLength(enemy.pathProgress);
                    const dist = Math.hypot(enemyCoords.x - towerCenterX, enemyCoords.y - towerCenterY);
                    if (dist < tower.range * cellSize && enemy.pathProgress > maxProgress) {
                        maxProgress = enemy.pathProgress;
                        bestTarget = enemy;
                    }
                });

                if (bestTarget) {
                    newProjectiles.push({ id: Date.now() + Math.random(), x: towerCenterX, y: towerCenterY, targetId: bestTarget.id, type: tower.type });
                    tower.lastFired = now;

                    if (tower.type === 'laser') playSound(laserSfxRef);
                    if (tower.type === 'fire') playSound(fireSfxRef);
                    if (tower.type === 'ice') playSound(iceSfxRef);
                }
            }
        });
        tempProjectiles.push(...newProjectiles);

        // 2. Enemy Firing
        const newEnemyProjectiles: EnemyProjectile[] = [];
        tempEnemies.forEach(enemy => {
            if (enemy.type === 'shooter' || enemy.type === 'boss') {
                const spec = ENEMY_SPECS[enemy.type];
                if (now - enemy.lastFired > spec.fireRate / gameSpeed) {
                    const enemyCoords = pathRef.current!.getPointAtLength(enemy.pathProgress);
                    let closestTower: Tower | null = null;
                    let minDistance = Infinity;
                    
                    tempTowers.forEach(tower => {
                        const towerCoords = {x: tower.x * cellSize + cellSize/2, y: tower.y * cellSize + cellSize/2};
                        const dist = Math.hypot(enemyCoords.x - towerCoords.x, enemyCoords.y - towerCoords.y);
                        if (dist < spec.range * cellSize && dist < minDistance) {
                            minDistance = dist;
                            closestTower = tower;
                        }
                    });

                    if (closestTower) {
                        newEnemyProjectiles.push({ id: Date.now() + Math.random(), x: enemyCoords.x, y: enemyCoords.y, targetId: closestTower.id, damage: spec.damage });
                        enemy.lastFired = now;
                    }
                }
            }
        });
        tempEnemyProjectiles.push(...newEnemyProjectiles);

        // 3. Enemy Movement
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
        if (enemiesReachedEnd.size > 0) tempHealth -= enemiesReachedEnd.size;
        
        // 4. Player Projectile Movement and Collision
        const playerProjectilesToRemove = new Set<number>();
        const enemiesToDamage = new Map<number, { damage: number, type: TowerType }[]>();
        tempProjectiles.forEach(proj => {
            const target = tempEnemies.find(e => e.id === proj.targetId);
            if (!target) { playerProjectilesToRemove.add(proj.id); return; }
            const targetCoords = pathRef.current!.getPointAtLength(target.pathProgress);
            const dx = targetCoords.x - proj.x, dy = targetCoords.y - proj.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < PROJECTILE_SPEED * gameSpeed) {
                playerProjectilesToRemove.add(proj.id);
                playSound(explosionSfxRef);
                if (!enemiesToDamage.has(target.id)) enemiesToDamage.set(target.id, []);
                enemiesToDamage.get(target.id)!.push({ damage: TOWER_SPECS[proj.type].damage, type: proj.type });

                if (proj.type === 'fire') {
                    const splashRadius = SPLASH_RADIUS_MULTIPLIER * cellSize;
                    tempEnemies.forEach(other => {
                        if (other.id === target.id) return;
                        const otherCoords = pathRef.current!.getPointAtLength(other.pathProgress);
                        if (Math.hypot(otherCoords.x - targetCoords.x, otherCoords.y - targetCoords.y) < splashRadius) {
                            if (!enemiesToDamage.has(other.id)) enemiesToDamage.set(other.id, []);
                            enemiesToDamage.get(other.id)!.push({ damage: TOWER_SPECS.fire.damage, type: 'fire' });
                        }
                    });
                }
            } else {
                proj.x += (dx / dist) * PROJECTILE_SPEED * gameSpeed;
                proj.y += (dy / dist) * PROJECTILE_SPEED * gameSpeed;
            }
        });

        // 5. Enemy Projectile Movement and Collision
        const enemyProjectilesToRemove = new Set<number>();
        const towersToDamage = new Map<number, number>();
        tempEnemyProjectiles.forEach(proj => {
            const target = tempTowers.find(t => t.id === proj.targetId);
            if (!target) { enemyProjectilesToRemove.add(proj.id); return; }
            const targetCoords = {x: target.x * cellSize + cellSize/2, y: target.y * cellSize + cellSize/2};
            const dx = targetCoords.x - proj.x, dy = targetCoords.y - proj.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < PROJECTILE_SPEED * gameSpeed) {
                enemyProjectilesToRemove.add(proj.id);
                towersToDamage.set(target.id, (towersToDamage.get(target.id) || 0) + proj.damage);
            } else {
                proj.x += (dx / dist) * PROJECTILE_SPEED * gameSpeed;
                proj.y += (dy / dist) * PROJECTILE_SPEED * gameSpeed;
            }
        });

        // 6. Apply Damage
        const defeatedEnemyIds = new Set<number>();
        if (enemiesToDamage.size > 0) {
            tempEnemies.forEach(enemy => {
                if (enemiesToDamage.has(enemy.id)) {
                    enemiesToDamage.get(enemy.id)!.forEach(d => {
                        enemy.health -= d.damage;
                        if (d.type === 'ice') enemy.slowUntil = now + SLOW_DURATION;
                    });
                    if (enemy.health <= 0) defeatedEnemyIds.add(enemy.id);
                }
            });
        }
        
        defeatedEnemyIds.forEach(id => {
            const enemy = enemies.find(e => e.id === id);
            tempCurrency += enemy?.type === 'boss' ? BOSS_CREDITS : 5;
        });

        tempTowers.forEach(tower => {
            if (towersToDamage.has(tower.id)) {
                tower.health -= towersToDamage.get(tower.id)!;
            }
        });

        // 7. Update State
        setTowers(tempTowers.filter(t => t.health > 0));
        setEnemies(tempEnemies.filter(e => !defeatedEnemyIds.has(e.id)));
        setProjectiles(tempProjectiles.filter(p => !playerProjectilesToRemove.has(p.id)));
        setEnemyProjectiles(tempEnemyProjectiles.filter(p => !enemyProjectilesToRemove.has(p.id)));
        setHealth(tempHealth);
        setCurrency(tempCurrency);

        // 8. Game State Checks
        if (tempHealth <= 0) {
            setGameState('gameover');
            updateScore(21, score);
        } else if (tempEnemies.length === 0 && !waveSpawning) {
            setGameState('wave_over');
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [towers, enemies, projectiles, enemyProjectiles, health, currency, gameState, waveSpawning, gameSpeed, score, updateScore, cellSize]);

    useEffect(() => {
        if(pathRef.current) pathLength.current = pathRef.current.getTotalLength();
        if (gameState === 'playing') {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
    }, [gameState, gameLoop]);
    
    const TowerComponent = ({ tower, cellSize }: { tower: Tower, cellSize: number }) => {
        const Icon = TOWER_SPECS[tower.type].icon;
        const healthPercentage = (tower.health / tower.maxHealth) * 100;
        return (
            <div className="absolute flex flex-col items-center justify-center pointer-events-none" style={{ left: tower.x * cellSize, top: tower.y * cellSize, width: cellSize, height: cellSize }}>
                <Icon className="w-4/6 h-4/6 text-cyan-400 drop-shadow-[0_0_5px_hsl(var(--primary))]"/>
                <div className="absolute -bottom-1 w-6 h-1 bg-gray-600 rounded-full overflow-hidden border border-black/50">
                     <div className="h-full bg-gradient-to-r from-red-500 to-green-500" style={{ width: `${healthPercentage}%` }} />
                </div>
            </div>
        );
    };

    const EnemyComponent = ({ enemy }: { enemy: Enemy }) => {
        if (!pathRef.current || enemy.pathProgress > pathLength.current) return null;
        const point = pathRef.current.getPointAtLength(enemy.pathProgress);
        const Sprite = enemy.type === 'boss' ? BossEnemySprite : EnemySprite;
        return (
            <div className="absolute transition-all duration-100 ease-linear" style={{ transform: `translate(${point.x}px, ${point.y}px)` }}>
                <Sprite health={enemy.health} maxHealth={enemy.maxHealth} type={enemy.type} />
            </div>
        );
    };

    const ProjectileComponent = ({ projectile }: { projectile: Projectile }) => {
        const color = projectile.type === 'laser' ? 'hsl(var(--primary))' : projectile.type === 'fire' ? 'hsl(var(--destructive))' : '#3b82f6';
        const size = projectile.type === 'fire' ? 8 : 5;
        return <circle cx={projectile.x} cy={projectile.y} r={size/2} fill={color} style={{filter: `drop-shadow(0 0 4px ${color})`}}/>;
    };
    
    const EnemyProjectileComponent = ({ projectile }: { projectile: EnemyProjectile }) => {
        return <circle cx={projectile.x} cy={projectile.y} r={4} fill="hsl(var(--destructive))" style={{filter: `drop-shadow(0 0 3px hsl(var(--destructive)))`}}/>;
    };
    
    return (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div 
                ref={gameContainerRef}
                className="relative w-full aspect-square bg-gray-900 border-2 border-primary/50 overflow-hidden lg:col-span-2"
                style={{boxShadow: '0 0 20px hsl(var(--primary)/0.5), inset 0 0 15px hsl(var(--primary)/0.3)'}}
            >
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
                    <path ref={pathRef} d={svgPath} stroke="hsl(var(--primary)/0.2)" strokeWidth={cellSize} fill="none" />
                    {projectiles.map(p => <ProjectileComponent key={p.id} projectile={p} />)}
                    {enemyProjectiles.map(p => <EnemyProjectileComponent key={p.id} projectile={p} />)}
                </svg>

                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}>
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const isPath = PATH_COORDS.some(([px, py]) => px === x && py === y);
                        return <div key={i} className={cn("hover:bg-primary/10 transition-colors", isPath && 'pointer-events-none')} onClick={() => handleGridClick(x, y)} />;
                    })}
                </div>
                
                {towers.map(tower => <TowerComponent key={tower.id} tower={tower} cellSize={cellSize} />)}
                
                {enemies.map(enemy => <EnemyComponent key={enemy.id} enemy={enemy} />)}
            </div>
             <div className="w-full lg:col-span-1 space-y-4">
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
                    <h3 className="text-lg font-bold mb-2">Game Controls</h3>
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
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setIsSoundOn(s => !s)}
                            className="w-9 h-9 ml-2"
                        >
                            {isSoundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                            <span className="sr-only">Toggle Sound</span>
                        </Button>
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
             <>
                <audio ref={normalBgRef} src="https://audio-previews.elements.envatousercontent.com/files/274806894/preview.mp3" loop preload="auto" />
                <audio ref={bossBgRef} src="https://audio-previews.elements.envatousercontent.com/files/465719910/preview.mp3" loop preload="auto" />
                <audio ref={laserSfxRef} src="https://assets.codepen.io/210284/laser.mp3" preload="auto" />
                <audio ref={fireSfxRef} src="https://assets.codepen.io/210284/whoosh.mp3" preload="auto" />
                <audio ref={iceSfxRef} src="https://assets.codepen.io/210284/ice.mp3" preload="auto" />
                <audio ref={buildSfxRef} src="https://assets.codepen.io/210284/click.mp3" preload="auto" />
                <audio ref={explosionSfxRef} src="https://assets.codepen.io/210284/explosion.mp3" preload="auto" />
            </>
        </div>
    );
};
