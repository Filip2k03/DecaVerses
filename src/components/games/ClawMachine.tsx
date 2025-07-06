'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGame } from '@/context/GameContext';
import { Trophy, Award, CarFront, Rocket } from 'lucide-react';
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
};

type ClawState = 'ready' | 'moving' | 'dropping' | 'grabbing' | 'rising' | 'returning';

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
        x: Math.random() * (GAME_WIDTH - size),
        y: GAME_HEIGHT - size - Math.random() * (GAME_HEIGHT / 2),
        captured: false,
      });
    }
    setPrizes(newPrizes);
    setScore(0);
    setAttemptsLeft(INITIAL_ATTEMPTS);
    setGameState('playing');
    setClawState('moving');
    setClawPos({ x: 0, y: 20 });
    setClawDirection(1);
    setCapturedPrize(null);
    setMessage('Drop the claw to grab a prize!');
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleDrop = () => {
    if (clawState === 'moving' && attemptsLeft > 0) {
      setClawState('dropping');
      setAttemptsLeft(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let interval: NodeJS.Timeout;
    
    // Horizontal movement
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
    
    // Vertical movement
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
    
    // State transitions
    if (clawState === 'grabbing') {
        setClawOpen(false);
        setTimeout(() => {
            const clawCenterX = clawPos.x + 20;
            let prizeToGrab: Prize | undefined;
            prizes.forEach(p => {
                if (!p.captured) {
                    const prizeCenterX = p.x + prizeTypes[p.type].size / 2;
                    const dist = Math.abs(clawCenterX - prizeCenterX);
                    if (dist < prizeTypes[p.type].size / 2 && clawPos.y > p.y - 20) {
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
        setTimeout(() => {
            if (capturedPrize) {
                const prizePoints = prizeTypes[capturedPrize.type].points;
                setScore(s => s + prizePoints);
                setPrizes(p => p.filter(pr => pr.id !== capturedPrize.id));
                setMessage(`+${prizePoints} points!`);
                setCapturedPrize(null);
            }
            setClawOpen(true);
            if(attemptsLeft > 0) {
                setClawState('moving');
            } else {
                setGameState('gameover');
                setMessage(`Game Over! Final Score: ${score}`);
                updateScore(9, score);
            }
        }, 500);
    }

    return () => clearInterval(interval);
  }, [clawState, clawDirection, clawPos.x, clawPos.y, prizes, capturedPrize, gameState, attemptsLeft, score, updateScore]);


  const PrizeComponent = useMemo(() => {
    return prizes.map(prize => {
      if (capturedPrize && capturedPrize.id === prize.id) return null;
      const Icon = prizeTypes[prize.type].icon;
      return (
        <div key={prize.id} className="absolute transition-all" style={{ left: prize.x, top: prize.y }}>
          <Icon className="text-primary-foreground drop-shadow-lg" size={prizeTypes[prize.type].size} />
        </div>
      );
    });
  }, [prizes, capturedPrize]);
  
  const CapturedPrizeComponent = useMemo(() => {
      if (!capturedPrize) return null;
      const Icon = prizeTypes[capturedPrize.type].icon;
      return (
           <div className="absolute transition-all" style={{ left: capturedPrize.x, top: capturedPrize.y }}>
             <Icon className="text-primary-foreground drop-shadow-lg" size={prizeTypes[capturedPrize.type].size} />
           </div>
      );
  }, [capturedPrize]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative bg-primary/10 rounded-lg overflow-hidden border-4 border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/50 to-transparent z-10" />
        {/* Prize Pit */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-black/30">
             {PrizeComponent}
             {CapturedPrizeComponent}
        </div>
        
        {/* Claw */}
        <div className="absolute z-20" style={{ left: clawPos.x, top: clawPos.y, width: 40, height: 40 }}>
            {/* Claw arm */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-1 bg-muted-foreground" style={{ height: clawPos.y }} />
            {/* Claw mechanism */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-12 h-4 bg-muted rounded-full" />
            <ClawMachineIcon className={cn("w-10 h-10 text-accent transition-transform", !clawOpen && "rotate-180 scale-125")} />
        </div>
        
        {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
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
