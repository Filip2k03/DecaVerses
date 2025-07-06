'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGame } from '@/context/GameContext';
import { Trophy, Award, CarFront, Rocket, PackageCheck } from 'lucide-react';
import { AlienIcon, BearIcon, ClawMachineIcon } from '@/components/GameIcons';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 400;
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

type ClawState = 'ready' | 'moving' | 'dropping' | 'grabbing' | 'rising' | 'returning' | 'releasing';

export function ClawMachine() {
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [clawPos, setClawPos] = useState({ x: 0, y: 20 });
  const [clawState, setClawState] = useState<ClawState>('moving');
  const [clawOpen, setClawOpen] = useState(true);
  const [clawDirection, setClawDirection] = useState(1);
  const [capturedPrize, setCapturedPrize] = useState<Prize | null>(null);
  const [score, setScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(INITIAL_ATTEMPTS);
  const [message, setMessage] = useState('Drop the claw to grab a prize!');

  const { scores, updateScore } = useGame();
  const highScore = scores[9] || 0;

  const resetGame = useCallback(() => {
    const newPrizes: Prize[] = [];
    for (let i = 0; i < PRIZE_COUNT; i++) {
      const type = (Object.keys(prizeTypes) as PrizeType[])[Math.floor(Math.random() * 4)];
      const size = prizeTypes[type].size;
      newPrizes.push({
        id: i,
        type,
        x: Math.random() * (GAME_WIDTH - size * 2) + size,
        y: GAME_HEIGHT - size - Math.random() * (GAME_HEIGHT / 2.5),
        captured: false,
        rotation: Math.random() * 40 - 20,
      });
    }
    setPrizes(newPrizes);
    setScore(0);
    setAttemptsLeft(INITIAL_ATTEMPTS);
    setGameState('playing');
    setClawState('moving');
    setClawPos({ x: GAME_WIDTH / 2, y: 20 });
    setClawDirection(1);
    setCapturedPrize(null);
    setMessage('Drop the claw to grab a prize!');
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleDrop = () => {
    if (clawState === 'moving' && attemptsLeft > 0 && gameState === 'playing') {
      setClawState('dropping');
      setAttemptsLeft(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let interval: NodeJS.Timeout;
    
    if (clawState === 'moving') {
      interval = setInterval(() => {
        setClawPos(prev => {
          const newX = prev.x + CLAW_SPEED_X * clawDirection;
          if (newX <= 0 || newX >= GAME_WIDTH - 40) {
            setClawDirection(d => -d);
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
                const prizePoints = prizeTypes[capturedPrize.type].points;
                setScore(s => s + prizePoints);
                setPrizes(p => p.map(pr => pr.id === capturedPrize.id ? { ...pr, captured: true } : pr));
                setMessage(`+${prizePoints} points!`);
                setCapturedPrize(null);
            }
            setClawOpen(true);

            setTimeout(() => {
                if (attemptsLeft > 0) {
                    setClawState('moving');
                } else {
                    setGameState('gameover');
                    const finalScore = score + (capturedPrize ? prizeTypes[capturedPrize.type].points : 0);
                    setMessage(`Game Over! Final Score: ${finalScore}`);
                    updateScore(9, finalScore);
                }
            }, 500);
        }, 500);
    }

    return () => clearInterval(interval);
  }, [clawState, clawDirection, clawPos.x, clawPos.y, prizes, capturedPrize, gameState, attemptsLeft, score, updateScore]);


  const PrizeComponent = useMemo(() => {
    return prizes.map(prize => {
      if (prize.captured || (capturedPrize && capturedPrize.id === prize.id)) return null;
      const Icon = prizeTypes[prize.type].icon;
      const size = prizeTypes[prize.type].size;
      return (
        <div key={prize.id} className="absolute transition-all" style={{ left: prize.x, top: prize.y, width: size, height: size }}>
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
           <div className="absolute transition-all" style={{ left: capturedPrize.x, top: capturedPrize.y, width: size, height: size }}>
             <Icon className="text-primary-foreground drop-shadow-lg" style={{width: '100%', height: '100%'}} />
           </div>
      );
  }, [capturedPrize]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative bg-gradient-to-b from-blue-900/30 to-background rounded-lg overflow-hidden border-4 border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.5)] [perspective:1000px]"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* Back Wall */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/50" 
             style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)/0.1) 1px, transparent 1px), linear-gradient(to right, hsl(var(--primary)/0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}/>
        
        {/* Prize Pit */}
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-black/40 [transform-style:preserve-3d] [transform:translateY(25%)_rotateX(55deg)]">
             {PrizeComponent}
             {CapturedPrizeComponent}
        </div>
        
        {/* Gantry */}
        <div className="absolute top-2 left-0 w-full h-4 [transform-style:preserve-3d]" style={{transform: `translateX(${clawPos.x}px) translateZ(-20px)`}}>
            <div className="absolute w-12 h-4 bg-muted rounded-t-md left-1/2 -translate-x-1/2" />
        </div>

        {/* Claw */}
        <div className="absolute z-20 transition-transform duration-500" style={{ left: clawPos.x, top: 0, width: 40, height: GAME_HEIGHT, transform: `translateZ(50px) rotateX(${(clawState === 'moving' ? Math.sin(clawPos.x / 20) * 5 : 0)}deg)` }}>
            {/* Claw arm */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-muted to-muted/50 origin-top" style={{ height: clawPos.y }} />
            {/* Claw mechanism */}
            <div className="absolute left-1/2 -translate-x-1/2 w-8 h-4 bg-muted rounded-full shadow-inner" style={{top: clawPos.y}} />
            <div className="absolute" style={{top: clawPos.y + 10, left: 0}}>
                <ClawMachineIcon className={cn("w-10 h-10 text-accent transition-transform duration-500", !clawOpen && "rotate-180 scale-y-125")} />
            </div>
        </div>
        
        {/* Prize Chute */}
        <div className="absolute top-0 left-0 w-24 h-full bg-black/30 z-10">
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
                <PackageCheck className="w-10 h-10 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent rounded-lg"/>
            </div>
            <p className="absolute bottom-28 text-center w-full text-sm font-headline text-primary/70">PRIZE</p>
        </div>

        {/* Glass glare */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-lg" />
        
        {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 animate-in fade-in">
                <h2 className="text-3xl font-bold text-destructive-foreground font-headline">Game Over</h2>
                <p className="text-xl text-primary-foreground">Final Score: {score}</p>
                <Button onClick={resetGame} className="mt-4">Play Again</Button>
            </div>
        )}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Button onClick={handleDrop} disabled={clawState !== 'moving' || gameState === 'gameover'} className="w-full text-lg font-bold" size="lg">
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
