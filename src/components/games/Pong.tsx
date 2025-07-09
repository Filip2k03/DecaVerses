
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, RefreshCw, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 15;
const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 2, 4];
type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export const Pong = () => {
  const [ball, setBall] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const [ballVelocity, setBallVelocity] = useState({ x: 4, y: 4 });
  const [playerPaddle, setPlayerPaddle] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [opponentPaddle, setOpponentPaddle] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [scores, setScores] = useState({ player: 0, opponent: 0 });
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameSpeed, setGameSpeed] = useState(1);
  
  const gameLoopRef = useRef<number>();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    const portrait = window.matchMedia("(orientation: portrait)");
    const handleChange = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    setIsPortrait(portrait.matches);
    portrait.addEventListener("change", handleChange);
    return () => portrait.removeEventListener("change", handleChange);
  }, [isMobile]);

  const resetBall = useCallback((serveDirection: 'player' | 'opponent' | 'random' = 'random') => {
    setBall({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
    let newVx;
    if (serveDirection === 'player') newVx = -4;
    else if (serveDirection === 'opponent') newVx = 4;
    else newVx = (Math.random() > 0.5 ? 1 : -1) * 4;
    
    setBallVelocity({ x: newVx, y: (Math.random() > 0.5 ? 1 : -1) * 4 });
  }, []);

  const startGame = useCallback(() => {
    setScores({ player: 0, opponent: 0 });
    setGameState('playing');
    setPlayerPaddle(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setOpponentPaddle(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    resetBall('random');
  }, [resetBall]);

  const togglePause = () => {
      if (gameState === 'playing') setGameState('paused');
      else if (gameState === 'paused') setGameState('playing');
  };
  
  const handlePlayerMove = useCallback((y: number) => {
    if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const mouseY = y - rect.top;
        setPlayerPaddle(Math.max(0, Math.min(mouseY - PADDLE_HEIGHT / 2, GAME_HEIGHT - PADDLE_HEIGHT)));
    }
  }, []);

  useEffect(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea || gameState !== 'playing') return;
    const handleMouseMove = (e: MouseEvent) => handlePlayerMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        e.touches[0] && handlePlayerMove(e.touches[0].clientY);
    };
    
    gameArea.addEventListener('mousemove', handleMouseMove);
    gameArea.addEventListener('touchmove', handleTouchMove);
    return () => {
      gameArea.removeEventListener('mousemove', handleMouseMove);
      gameArea.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handlePlayerMove, gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    // Ball movement
    setBall(prevBall => {
      const newBall = { 
        x: prevBall.x + ballVelocity.x * gameSpeed, 
        y: prevBall.y + ballVelocity.y * gameSpeed 
      };
      let newVel = { ...ballVelocity };

      if (newBall.y <= 0 || newBall.y >= GAME_HEIGHT - BALL_SIZE) {
        newVel.y *= -1;
      }
      
      const hitPlayerPaddle = newBall.x <= PADDLE_WIDTH && newBall.y + BALL_SIZE > playerPaddle && newBall.y < playerPaddle + PADDLE_HEIGHT;
      const hitOpponentPaddle = newBall.x >= GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE && newBall.y + BALL_SIZE > opponentPaddle && newBall.y < opponentPaddle + PADDLE_HEIGHT;

      if (hitPlayerPaddle || hitOpponentPaddle) {
        newVel.x *= -1.05; // Speed up on hit
        newVel.y *= 1.02;
        // Clamp velocity to avoid extreme speeds
        newVel.x = Math.max(-15, Math.min(15, newVel.x));
        newVel.y = Math.max(-15, Math.min(15, newVel.y));
      }
      
      if (newBall.x < 0) {
        setScores(s => ({ ...s, opponent: s.opponent + 1 }));
        resetBall('player');
      } else if (newBall.x > GAME_WIDTH) {
        setScores(s => ({ ...s, player: s.player + 1 }));
        resetBall('opponent');
      }

      setBallVelocity(newVel);
      return newBall;
    });

    // Opponent AI
    const opponentCenter = opponentPaddle + PADDLE_HEIGHT / 2;
    const opponentSpeed = 4.5 * gameSpeed;
    if (opponentCenter < ball.y - 15) {
      setOpponentPaddle(p => Math.min(p + opponentSpeed, GAME_HEIGHT - PADDLE_HEIGHT));
    } else if (opponentCenter > ball.y + 15) {
      setOpponentPaddle(p => Math.max(p - opponentSpeed, 0));
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [ball.y, ballVelocity, playerPaddle, opponentPaddle, gameState, resetBall, gameSpeed]);
  
  useEffect(() => {
    if (scores.player >= 5 || scores.opponent >= 5) {
      setGameState('gameover');
    }
  }, [scores]);

  useEffect(() => {
    if (gameState === 'playing') {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => { if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameLoop, gameState]);

  if (isMobile && isPortrait) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card border-2 border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.5)] w-full max-w-md h-64">
        <Smartphone className="h-16 w-16 mb-4 text-primary animate-pulse" />
        <h3 className="text-2xl font-bold font-headline">Please Rotate Your Phone</h3>
        <p className="text-muted-foreground mt-2">Pong is best played in landscape mode.</p>
      </div>
    );
  }
  
  const getOverlayContent = () => {
    if (gameState === 'menu') {
        return <>
            <h2 className="text-5xl font-bold font-headline">PONG</h2>
            <Button onClick={startGame} variant="outline" size="lg">Start Game</Button>
        </>
    }
    if (gameState === 'gameover') {
        return <>
            <h2 className="text-4xl font-bold font-headline">{scores.player >= 5 ? 'You Win!' : 'You Lose!'}</h2>
            <Button onClick={startGame} variant="outline">Play Again</Button>
        </>
    }
    if (gameState === 'paused') {
        return <>
            <h2 className="text-4xl font-bold font-headline">Paused</h2>
            <Button onClick={togglePause} variant="outline">Resume</Button>
        </>
    }
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-around w-full max-w-lg text-4xl font-headline">
        <span className="text-cyan-400" style={{ textShadow: '0 0 10px hsl(var(--primary))' }}>{scores.player}</span>
        <span className="text-fuchsia-500" style={{ textShadow: '0 0 10px hsl(var(--accent))' }}>{scores.opponent}</span>
      </div>
      
      <div
        ref={gameAreaRef}
        className="relative bg-black border-2 border-primary/50 overflow-hidden cursor-none"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT, boxShadow: '0 0 20px hsl(var(--primary)/0.5), inset 0 0 15px hsl(var(--primary)/0.3)' }}
      >
        {gameState !== 'playing' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-white gap-4">
               {getOverlayContent()}
            </div>
        )}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1">
            {Array.from({length: 20}).map((_, i) => (
                <div key={i} className="h-4 w-full bg-primary/30 my-3 rounded-full" style={{boxShadow: '0 0 5px hsl(var(--primary)/0.5)'}}/>
            ))}
        </div>
        <div className="absolute bg-white rounded-full" style={{ left: ball.x, top: ball.y, width: BALL_SIZE, height: BALL_SIZE, boxShadow: '0 0 10px #fff' }} />
        <div className="absolute bg-cyan-400 rounded-sm" style={{ left: 0, top: playerPaddle, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, boxShadow: '0 0 10px hsl(var(--primary))' }} />
        <div className="absolute bg-fuchsia-500 rounded-sm" style={{ right: 0, top: opponentPaddle, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, boxShadow: '0 0 10px hsl(var(--accent))' }} />
      </div>

      <div className="w-full max-w-lg flex flex-col items-center gap-3">
          {(gameState === 'playing' || gameState === 'paused') && (
            <div className="flex gap-2 justify-center">
                <Button onClick={togglePause} variant="outline" disabled={gameState === 'gameover'}>
                    {gameState === 'paused' ? <Play /> : <Pause />}
                    <span className="ml-2">{gameState === 'paused' ? 'Resume' : 'Pause'}</span>
                </Button>
                 <Button onClick={startGame} variant="destructive">
                    <RefreshCw />
                    <span className="ml-2">Restart</span>
                </Button>
            </div>
          )}
           <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm font-medium mr-2">Speed:</span>
                {SPEED_OPTIONS.map(speed => (
                    <Button key={speed} onClick={() => setGameSpeed(speed)} variant={gameSpeed === speed ? 'default' : 'outline'} size="sm">
                        {speed}x
                    </Button>
                ))}
            </div>
          <p className="text-sm text-muted-foreground">Move mouse or touch to control paddle. Press P to pause.</p>
      </div>
    </div>
  );
};
