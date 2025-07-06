
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGame } from '@/context/GameContext';
import { Trophy, Award, CarFront, Rocket, PackageCheck } from 'lucide-react';
import { AlienIcon, BearIcon, ClawMachineIcon } from '@/components/GameIcons';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 320; // Main play area height
const BASE_HEIGHT = 80; // Control panel height
const TOTAL_HEIGHT = GAME_HEIGHT + BASE_HEIGHT;

const CLAW_SPEED_X = 2;
const CLAW_SPEED_Y = 4;
const INITIAL_ATTEMPTS = 10;
const PRIZE_COUNT = 15;

const prizeTypes = {
  car: { icon: CarFront, points: 10, size: 30 },
  bear: { icon: BearIcon, points: 20, size: 35 },
  ufo: { icon: Rocket, points: 30, size: 25 },
  alien: { icon: AlienIcon, points: 50, size: 30 },
};
type PrizeType = keyof typeof prizeTypes;

type Prize = {
  id: number;
  type: PrizeType;
  x: number;
  y: number;
  captured: boolean;
  rotation: number;
};

type ClawState = 'ready' | 'dropping' | 'grabbing' | 'rising' | 'returning' | 'releasing';

export function ClawMachine() {
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [clawPos, setClawPos] = useState({ x: GAME_WIDTH / 2 - 20, y: 20 });
  const [clawDirection, setClawDirection] = useState<'left' | 'right'>('right');
  const [clawState, setClawState] = useState<ClawState>('ready');
  const [clawOpen, setClawOpen] = useState(true);
  const [capturedPrize, setCapturedPrize] = useState<Prize | null>(null);
  const [score, setScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(INITIAL_ATTEMPTS);
  const [message, setMessage] = useState('Position the claw and drop it!');

  const { scores, updateScore } = useGame();
  const highScore = scores[9] || 0;

  const resetGame = useCallback(() => {
    const newPrizes: Prize[] = [];
    for (let i = 0; i < PRIZE_COUNT; i++) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 20) {
            const type = (Object.keys(prizeTypes) as PrizeType[])[Math.floor(Math.random() * 4)];
            const size = prizeTypes[type].size;
            const newPrizeCandidate = {
                id: i,
                type,
                x: Math.random() * (GAME_WIDTH - size * 2) + size,
                y: GAME_HEIGHT - size - Math.random() * (GAME_HEIGHT / 1.8),
                captured: false,
                rotation: Math.random() * 40 - 20,
            };

            const isOverlapping = newPrizes.some(p => {
                const pSize = prizeTypes[p.type].size;
                const dist = Math.sqrt(
                    Math.pow(p.x + pSize/2 - (newPrizeCandidate.x + size/2), 2) +
                    Math.pow(p.y + pSize/2 - (newPrizeCandidate.y + size/2), 2)
                );
                return dist < (pSize/2 + size/2);
            });

            if (!isOverlapping && newPrizeCandidate.y > GAME_HEIGHT / 2) {
                newPrizes.push(newPrizeCandidate);
                placed = true;
            }
            attempts++;
        }
    }

    setPrizes(newPrizes);
    setScore(0);
    setAttemptsLeft(INITIAL_ATTEMPTS);
    setGameState('playing');
    setClawState('ready');
    setClawPos({ x: 0, y: 20 });
    setClawDirection('right');
    setCapturedPrize(null);
    setMessage('Time it right and drop the claw!');
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleDrop = () => {
    if (clawState === 'ready' && attemptsLeft > 0 && gameState === 'playing') {
      setClawState('dropping');
      setAttemptsLeft(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let interval: NodeJS.Timeout;

    if (clawState === 'ready') {
        interval = setInterval(() => {
            setClawPos(prev => {
                let newX = prev.x;
                if (clawDirection === 'right') {
                    newX += CLAW_SPEED_X;
                    if (newX >= GAME_WIDTH - 40) {
                        setClawDirection('left');
                        newX = GAME_WIDTH - 40;
                    }
                } else {
                    newX -= CLAW_SPEED_X;
                    if (newX <= 0) {
                        setClawDirection('right');
                        newX = 0;
                    }
                }
                return { ...prev, x: newX };
            });
        }, 20);
    }
    
    if (clawState === 'dropping' || clawState === 'rising') {
       interval = setInterval(() => {
         setClawPos(prev => {
           const newY = prev.y + (clawState === 'dropping' ? CLAW_SPEED_Y : -CLAW_SPEED_Y);
           
           if(capturedPrize) {
               setCapturedPrize(p => p ? {...p, y: newY + 30} : null);
           }
           
           if (clawState === 'dropping' && newY >= GAME_HEIGHT - 30) {
               setClawState('grabbing');
               return { ...prev, y: GAME_HEIGHT - 30 };
           }
           if (clawState === 'rising' && newY <= 20) {
               setClawState('returning');
               return { ...prev, y: 20 };
           }
           return { ...prev, y: newY };
         });
       }, 20);
    }
    
    if (clawState === 'grabbing') {
        setClawOpen(false);
        setTimeout(() => {
            const clawCenterX = clawPos.x + 20;
            let prizeToGrab: Prize | undefined;
            prizes.forEach(p => {
                if (!p.captured) {
                    const prizeCenterX = p.x + prizeTypes[p.type].size / 2;
                    const prizeCenterY = p.y + prizeTypes[p.type].size / 2;
                    const dist = Math.sqrt(Math.pow(clawCenterX - prizeCenterX, 2) + Math.pow(clawPos.y + 20 - prizeCenterY, 2));

                    if (dist < prizeTypes[p.type].size) {
                        prizeToGrab = p;
                    }
                }
            });

            if (prizeToGrab && Math.random() > 0.4) { // 60% chance of success
                setMessage(`You got a ${prizeToGrab.type}!`);
                setCapturedPrize(prizeToGrab);
            } else {
                setMessage('Oh, so close!');
            }
            setClawState('rising');
        }, 500);
    }

    if (clawState === 'returning') {
        interval = setInterval(() => {
            setClawPos(prev => {
                const targetX = 30; // Chute position
                const newX = prev.x + (prev.x > targetX ? -CLAW_SPEED_X : CLAW_SPEED_X);
                if (Math.abs(newX - targetX) < CLAW_SPEED_X) {
                    setClawState('releasing');
                    return { ...prev, x: targetX };
                }
                if (capturedPrize) {
                    setCapturedPrize(p => p ? {...p, x: newX } : null);
                }
                return { ...prev, x: newX };
            });
        }, 20);
    }

    if (clawState === 'releasing') {
        setTimeout(() => {
            if (capturedPrize) {
                // Animate prize drop
                const prizeElement = document.getElementById(`prize-${capturedPrize.id}`);
                if (prizeElement) {
                    prizeElement.style.transition = 'top 0.5s ease-in, opacity 0.5s';
                    prizeElement.style.top = `${TOTAL_HEIGHT}px`;
                    prizeElement.style.opacity = '0';
                }

                const prizePoints = prizeTypes[capturedPrize.type].points;
                setScore(s => s + prizePoints);
                setPrizes(p => p.map(pr => pr.id === capturedPrize.id ? { ...pr, captured: true } : pr));
                setMessage(`+${prizePoints} points!`);
                setCapturedPrize(null);
            }
            setClawOpen(true);

            setTimeout(() => {
                if (attemptsLeft > 0) {
                    setClawState('ready');
                } else {
                    setGameState('gameover');
                    const finalScore = score + (capturedPrize ? prizeTypes[capturedPrize.type].points : 0);
                    setMessage(`Game Over! Final Score: ${finalScore}`);
                    updateScore(9, finalScore);
                }
            }, 1000);
        }, 500);
    }

    return () => {
        clearInterval(interval);
    };
  }, [clawState, clawPos.x, clawPos.y, prizes, capturedPrize, gameState, attemptsLeft, score, updateScore, clawDirection]);

  const PrizeComponent = useMemo(() => {
    return prizes.map(prize => {
      if (prize.captured || (capturedPrize && capturedPrize.id === prize.id)) return null;
      const Icon = prizeTypes[prize.type].icon;
      const size = prizeTypes[prize.type].size;
      return (
        <div id={`prize-${prize.id}`} key={prize.id} className="absolute transition-all" style={{ left: prize.x, top: prize.y, width: size, height: size }}>
          <Icon className="text-primary-foreground drop-shadow-[0_4px_3px_rgba(0,0,0,0.6)]" style={{width: '100%', height: '100%', transform: `rotate(${prize.rotation}deg)`}} />
        </div>
      );
    });
  }, [prizes, capturedPrize]);
  
  const CapturedPrizeComponent = useMemo(() => {
      if (!capturedPrize) return null;
      const Icon = prizeTypes[capturedPrize.type].icon;
      const size = prizeTypes[capturedPrize.type].size;
      return (
           <div id={`prize-${capturedPrize.id}`} className="absolute" style={{ left: capturedPrize.x, top: capturedPrize.y, width: size, height: size, transition: 'top 0.1s linear' }}>
             <Icon className="text-primary-foreground drop-shadow-lg" style={{width: '100%', height: '100%'}} />
           </div>
      );
  }, [capturedPrize]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative rounded-lg border-4 border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.5)] [perspective:1000px] overflow-hidden"
        style={{ width: GAME_WIDTH, height: TOTAL_HEIGHT }}
      >
        {/* Play Area */}
        <div className="relative w-full h-full">
            {/* Back Wall */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-background/50" 
                 style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)/0.1) 1px, transparent 1px), linear-gradient(to right, hsl(var(--primary)/0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}/>

            {/* Prize Pit Floor */}
            <div className="absolute bottom-0 left-0 w-full bg-black/40" style={{height: BASE_HEIGHT, transform: 'translateY(40px) rotateX(70deg)'}} />

            {/* Prizes */}
            <div className="absolute inset-0">
                {PrizeComponent}
                {CapturedPrizeComponent}
            </div>

            {/* Gantry */}
            <div className="absolute top-2 left-0 w-full h-4 [transform-style:preserve-3d]" style={{transform: `translateX(${clawPos.x}px) translateZ(-20px)`}}>
                <div className="absolute w-12 h-4 bg-muted/80 rounded-t-md left-1/2 -translate-x-1/2 shadow-lg" />
            </div>

            {/* Claw */}
            <div className="absolute z-20" style={{ left: clawPos.x, top: 0, width: 40, height: TOTAL_HEIGHT, transform: 'translateZ(50px)' }}>
                {/* Claw Cable */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-muted to-muted/20 origin-top" style={{ height: clawPos.y + 10 }} />
                {/* Claw Mechanism */}
                <div className="absolute left-1/2 -translate-x-1/2 w-8 h-4 bg-muted rounded-full shadow-inner" style={{top: clawPos.y}} />
                <div className="absolute drop-shadow-lg" style={{top: clawPos.y + 10, left: 0}}>
                    <ClawMachineIcon className={cn("w-10 h-10 text-accent transition-transform duration-500", !clawOpen && "rotate-180 scale-y-125")} />
                </div>
            </div>

             {/* Glass glare */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-lg" />
        </div>

        {/* Machine Base */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-900 to-gray-800 border-t-4 border-primary/50" style={{height: BASE_HEIGHT}}>
            {/* Prize Chute Opening */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 bg-black/50 rounded-lg shadow-inner flex items-center justify-center">
                <PackageCheck className="w-10 h-10 text-primary/30" />
            </div>
             {/* Base Detail */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-1 bg-primary/20 rounded-full" />
        </div>

        {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 animate-in fade-in">
                <h2 className="text-3xl font-bold text-destructive-foreground font-headline">Game Over</h2>
                <p className="text-xl text-primary-foreground">Final Score: {score}</p>
                <Button onClick={resetGame} className="mt-4">Play Again</Button>
            </div>
        )}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Button onClick={handleDrop} disabled={clawState !== 'ready' || gameState === 'gameover'} className="w-full text-lg font-bold" size="lg">
          DROP CLAW
        </Button>

        <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-lg font-bold font-headline">{message}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Score
            </p>
            <p className="font-bold font-mono text-3xl">{score}</p>
          </div>
          <div className="flex-1 text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" /> High Score
            </p>
            <p className="font-bold font-mono text-3xl">{highScore}</p>
          </div>
           <div className="flex-1 text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Tries Left</p>
            <p className="font-bold font-mono text-3xl">{attemptsLeft}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
