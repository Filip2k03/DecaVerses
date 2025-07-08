'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pause, Play, RefreshCw } from 'lucide-react';

const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 15;
const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;

export const Pong = () => {
  const [ball, setBall] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const [ballVelocity, setBallVelocity] = useState({ x: 5, y: 5 });
  const [playerPaddle, setPlayerPaddle] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [opponentPaddle, setOpponentPaddle] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [scores, setScores] = useState({ player: 0, opponent: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number>();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const resetBall = useCallback((keepVelocity = false) => {
    setBall({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
    if (!keepVelocity) {
      setBallVelocity({ x: (Math.random() > 0.5 ? 1 : -1) * 5, y: (Math.random() > 0.5 ? 1 : -1) * 5 });
    }
  }, []);

  const resetGame = useCallback(() => {
    setScores({ player: 0, opponent: 0 });
    setGameOver(false);
    setIsPaused(false);
    setPlayerPaddle(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setOpponentPaddle(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    resetBall();
  }, [resetBall]);

  const togglePause = () => {
      if (!gameOver) {
          setIsPaused(p => !p);
      }
  };
  
  const handlePlayerMove = useCallback((y: number) => {
    if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const mouseY = y - rect.top;
        setPlayerPaddle(Math.max(0, Math.min(mouseY - PADDLE_HEIGHT / 2, GAME_HEIGHT - PADDLE_HEIGHT)));
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handlePlayerMove(e.clientY);
    const gameArea = gameAreaRef.current;
    gameArea?.addEventListener('mousemove', handleMouseMove);
    return () => gameArea?.removeEventListener('mousemove', handleMouseMove);
  }, [handlePlayerMove]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches[0]) {
            handlePlayerMove(e.touches[0].clientY);
        }
    };
    const gameArea = gameAreaRef.current;
    gameArea?.addEventListener('touchmove', handleTouchMove);
    return () => gameArea?.removeEventListener('touchmove', handleTouchMove);
  }, [handlePlayerMove]);


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
    if (gameOver || isPaused) return;

    // Ball movement
    setBall(b => ({ x: b.x + ballVelocity.x, y: b.y + ballVelocity.y }));

    // Ball collision with walls
    if (ball.y <= 0 || ball.y >= GAME_HEIGHT - BALL_SIZE) {
      setBallVelocity(v => ({ ...v, y: -v.y }));
    }

    // Ball collision with paddles
    const hitPlayerPaddle = ball.x <= PADDLE_WIDTH && ball.y + BALL_SIZE > playerPaddle && ball.y < playerPaddle + PADDLE_HEIGHT;
    const hitOpponentPaddle = ball.x >= GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE && ball.y + BALL_SIZE > opponentPaddle && ball.y < opponentPaddle + PADDLE_HEIGHT;

    if (hitPlayerPaddle || hitOpponentPaddle) {
      setBallVelocity(v => ({ ...v, x: -v.x * 1.05 })); // Speed up on hit
    }

    // Score points
    if (ball.x < 0) {
      setScores(s => ({ ...s, opponent: s.opponent + 1 }));
      resetBall(true);
    } else if (ball.x > GAME_WIDTH) {
      setScores(s => ({ ...s, player: s.player + 1 }));
      resetBall(true);
    }

    // Opponent AI
    const opponentCenter = opponentPaddle + PADDLE_HEIGHT / 2;
    if (opponentCenter < ball.y - 20) {
      setOpponentPaddle(p => Math.min(p + 4.5, GAME_HEIGHT - PADDLE_HEIGHT));
    } else if (opponentCenter > ball.y + 20) {
      setOpponentPaddle(p => Math.max(p - 4.5, 0));
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [ball.x, ball.y, ballVelocity.x, ballVelocity.y, playerPaddle, opponentPaddle, gameOver, isPaused, resetBall]);
  
  useEffect(() => {
    if (scores.player >= 5 || scores.opponent >= 5) {
      setGameOver(true);
    }
  }, [scores]);

  useEffect(() => {
    if (isPaused || gameOver) {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        return;
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameLoop, isPaused, gameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-around w-full max-w-lg text-4xl font-headline">
        <span className="text-cyan-400" style={{ textShadow: '0 0 10px hsl(var(--primary))' }}>{scores.player}</span>
        <span className="text-fuchsia-500" style={{ textShadow: '0 0 10px hsl(var(--accent))' }}>{scores.opponent}</span>
      </div>
      <Card>
        <CardContent className="p-0 relative">
          <div
            ref={gameAreaRef}
            className="relative bg-black border-2 border-primary/50 overflow-hidden cursor-none"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT, boxShadow: '0 0 20px hsl(var(--primary)/0.5), inset 0 0 15px hsl(var(--primary)/0.3)' }}
          >
            {(gameOver || isPaused) && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-white gap-4">
                    {gameOver ? (
                        <>
                            <h2 className="text-4xl font-bold font-headline">{scores.player >= 5 ? 'You Win!' : 'You Lose!'}</h2>
                            <Button onClick={resetGame} variant="outline">Play Again</Button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl font-bold font-headline">Paused</h2>
                            <Button onClick={togglePause} variant="outline">Resume</Button>
                        </>
                    )}
                </div>
            )}
            {/* Net */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1">
                {Array.from({length: 20}).map((_, i) => (
                    <div key={i} className="h-4 w-full bg-primary/30 my-3 rounded-full" style={{boxShadow: '0 0 5px hsl(var(--primary)/0.5)'}}/>
                ))}
            </div>
            {/* Ball */}
            <div className="absolute bg-white rounded-full" style={{ left: ball.x, top: ball.y, width: BALL_SIZE, height: BALL_SIZE, boxShadow: '0 0 10px #fff' }} />
            {/* Player Paddle */}
            <div className="absolute bg-cyan-400 rounded-sm" style={{ left: 0, top: playerPaddle, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, boxShadow: '0 0 10px hsl(var(--primary))' }} />
            {/* Opponent Paddle */}
            <div className="absolute bg-fuchsia-500 rounded-sm" style={{ right: 0, top: opponentPaddle, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, boxShadow: '0 0 10px hsl(var(--accent))' }} />
          </div>
        </CardContent>
      </Card>
      <div className="w-full max-w-lg flex flex-col items-center gap-2">
          {!gameOver && (
            <div className="flex gap-2 justify-center">
                <Button onClick={togglePause} variant="outline" disabled={gameOver}>
                    {isPaused ? <Play /> : <Pause />}
                    <span className="ml-2">{isPaused ? 'Resume' : 'Pause'}</span>
                </Button>
                 <Button onClick={resetGame} variant="destructive">
                    <RefreshCw />
                    <span className="ml-2">Restart</span>
                </Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">Move mouse or touch to control paddle. Press P to pause.</p>
      </div>
    </div>
  );
};
