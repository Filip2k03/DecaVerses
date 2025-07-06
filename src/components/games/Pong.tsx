'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
  const gameLoopRef = useRef<number>();

  const resetBall = useCallback(() => {
    setBall({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
    setBallVelocity({ x: (Math.random() > 0.5 ? 1 : -1) * 5, y: (Math.random() > 0.5 ? 1 : -1) * 5 });
  }, []);

  const resetGame = useCallback(() => {
    setScores({ player: 0, opponent: 0 });
    setGameOver(false);
    resetBall();
  }, [resetBall]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const gameArea = e.currentTarget as HTMLDivElement;
      if (gameArea) {
        const rect = gameArea.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        setPlayerPaddle(Math.max(0, Math.min(mouseY - PADDLE_HEIGHT / 2, GAME_HEIGHT - PADDLE_HEIGHT)));
      }
    };
    const gameArea = document.getElementById('pong-game-area');
    gameArea?.addEventListener('mousemove', handleMouseMove as any);
    return () => gameArea?.removeEventListener('mousemove', handleMouseMove as any);
  }, []);

  const gameLoop = useCallback(() => {
    if (gameOver) return;

    // Ball movement
    setBall(b => ({ x: b.x + ballVelocity.x, y: b.y + ballVelocity.y }));

    // Ball collision with walls
    if (ball.y <= 0 || ball.y >= GAME_HEIGHT - BALL_SIZE) {
      setBallVelocity(v => ({ ...v, y: -v.y }));
    }

    // Ball collision with paddles
    const hitPlayerPaddle = ball.x <= PADDLE_WIDTH && ball.y > playerPaddle && ball.y < playerPaddle + PADDLE_HEIGHT;
    const hitOpponentPaddle = ball.x >= GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE && ball.y > opponentPaddle && ball.y < opponentPaddle + PADDLE_HEIGHT;

    if (hitPlayerPaddle || hitOpponentPaddle) {
      setBallVelocity(v => ({ ...v, x: -v.x * 1.1 })); // Speed up on hit
    }

    // Score points
    if (ball.x < 0) {
      setScores(s => ({ ...s, opponent: s.opponent + 1 }));
      resetBall();
    } else if (ball.x > GAME_WIDTH) {
      setScores(s => ({ ...s, player: s.player + 1 }));
      resetBall();
    }

    // Opponent AI
    const opponentCenter = opponentPaddle + PADDLE_HEIGHT / 2;
    if (opponentCenter < ball.y - 20) {
      setOpponentPaddle(p => Math.min(p + 4, GAME_HEIGHT - PADDLE_HEIGHT));
    } else if (opponentCenter > ball.y + 20) {
      setOpponentPaddle(p => Math.max(p - 4, 0));
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [ball, ballVelocity, playerPaddle, opponentPaddle, gameOver, resetBall]);
  
  useEffect(() => {
    if (scores.player >= 5 || scores.opponent >= 5) {
      setGameOver(true);
    }
  }, [scores]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameLoop]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-around w-full max-w-lg text-4xl font-headline">
        <span className="text-cyan-400">{scores.player}</span>
        <span className="text-fuchsia-500">{scores.opponent}</span>
      </div>
      <Card>
        <CardContent className="p-0">
          <div
            id="pong-game-area"
            className="relative bg-black border-2 border-primary/50 overflow-hidden"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            {gameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-white">
                    <h2 className="text-4xl font-bold font-headline">{scores.player > scores.opponent ? 'You Win!' : 'You Lose!'}</h2>
                    <Button onClick={resetGame} className="mt-4" variant="outline">Play Again</Button>
                </div>
            )}
            {/* Net */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1">
                {Array.from({length: 20}).map((_, i) => (
                    <div key={i} className="h-4 w-full bg-primary/30 my-3"/>
                ))}
            </div>
            {/* Ball */}
            <div className="absolute bg-white rounded-full" style={{ left: ball.x, top: ball.y, width: BALL_SIZE, height: BALL_SIZE }} />
            {/* Player Paddle */}
            <div className="absolute bg-cyan-400" style={{ left: 0, top: playerPaddle, width: PADDLE_WIDTH, height: PADDLE_HEIGHT }} />
            {/* Opponent Paddle */}
            <div className="absolute bg-fuchsia-500" style={{ right: 0, top: opponentPaddle, width: PADDLE_WIDTH, height: PADDLE_HEIGHT }} />
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">Move your mouse to control the paddle.</p>
    </div>
  );
};
