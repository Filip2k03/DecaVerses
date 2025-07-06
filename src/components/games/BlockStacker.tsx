'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const createEmptyBoard = (): number[][] => Array.from(Array(BOARD_HEIGHT), () => Array(BOARD_WIDTH).fill(0));

const TETROMINOS: Record<string, { shape: number[][] }> = {
  I: { shape: [[1, 1, 1, 1]] },
  J: { shape: [[1, 0, 0], [1, 1, 1]] },
  L: { shape: [[0, 0, 1], [1, 1, 1]] },
  O: { shape: [[1, 1], [1, 1]] },
  S: { shape: [[0, 1, 1], [1, 1, 0]] },
  T: { shape: [[0, 1, 0], [1, 1, 1]] },
  Z: { shape: [[1, 1, 0], [0, 1, 1]] },
};

const TETROMINO_MAP: Record<string, number> = {
    'I': 1, 'J': 2, 'L': 3, 'O': 4, 'S': 5, 'T': 6, 'Z': 7
};

const colors: { [key: number]: string } = {
  0: 'hsl(var(--muted))',
  1: 'hsl(var(--chart-1))',
  2: 'hsl(var(--chart-2))',
  3: 'hsl(var(--chart-3))',
  4: 'hsl(var(--chart-4))',
  5: 'hsl(var(--chart-5))',
  6: 'hsl(var(--accent))',
  7: 'hsl(var(--destructive))'
};

const randomTetromino = () => {
  const keys = Object.keys(TETROMINOS);
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return {
    shape: TETROMINOS[randKey].shape,
    colorId: TETROMINO_MAP[randKey],
  };
};

type Piece = { shape: number[][]; colorId: number };
type Position = { x: number; y: number };

export function BlockStacker() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(randomTetromino());
  const [position, setPosition] = useState<Position>({ x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const isValidMove = useCallback((piece: Piece, pos: Position, gameBoard: number[][]) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (gameBoard[newY] && gameBoard[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const rotatePiece = useCallback(() => {
    if (gameOver || isPaused) return;
    const newShape = currentPiece.shape[0].map((_, colIndex) =>
      currentPiece.shape.map(row => row[colIndex]).reverse()
    );
    const newPiece = { ...currentPiece, shape: newShape };
    if (isValidMove(newPiece, position, board)) {
      setCurrentPiece(newPiece);
    }
  }, [board, currentPiece, gameOver, isPaused, isValidMove, position]);

  const movePiece = useCallback((dir: number) => {
    if (gameOver || isPaused) return;
    const newPosition = { ...position, x: position.x + dir };
    if (isValidMove(currentPiece, newPosition, board)) {
      setPosition(newPosition);
    }
  }, [board, currentPiece, gameOver, isPaused, isValidMove, position]);

  const dropPiece = useCallback(() => {
    if (isPaused) return;
    const newPosition = { ...position, y: position.y + 1 };
    if (isValidMove(currentPiece, newPosition, board)) {
      setPosition(newPosition);
    } else {
      const newBoard = board.map(row => [...row]);
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            newBoard[position.y + y][position.x + x] = currentPiece.colorId;
          }
        });
      });

      let linesCleared = 0;
      const boardWithoutFullLines = newBoard.filter(row => {
        if (row.every(cell => cell !== 0)) {
          linesCleared++;
          return false;
        }
        return true;
      });
      
      const newEmptyRows = Array.from(Array(linesCleared), () => Array(BOARD_WIDTH).fill(0));
      const finalBoard = [...newEmptyRows, ...boardWithoutFullLines];
      if (linesCleared > 0) {
        setScore(prev => prev + [0, 10, 30, 50, 80][linesCleared]);
      }
      setBoard(finalBoard);

      const newPiece = randomTetromino();
      const newPiecePosition = { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 };
      if (!isValidMove(newPiece, newPiecePosition, finalBoard)) {
        setGameOver(true);
      } else {
        setCurrentPiece(newPiece);
        setPosition(newPiecePosition);
      }
    }
  }, [board, currentPiece, isPaused, isValidMove, position]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
        return;
      }
      if (gameOver || isPaused) return;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          dropPiece();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotatePiece();
          break;
      }
    },[gameOver, isPaused, movePiece, dropPiece, rotatePiece]);

  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPiece(randomTetromino());
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  useEffect(() => {
    if (gameOver || isPaused) return;
    const interval = setInterval(dropPiece, 1000);
    return () => clearInterval(interval);
  }, [dropPiece, gameOver, isPaused]);
  
  useEffect(() => {
    startGame();
  }, [startGame]);

  const displayBoard = board.map(row => [...row]);
  if (!gameOver) {
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          if (displayBoard[position.y + y]) {
             displayBoard[position.y + y][position.x + x] = currentPiece.colorId;
          }
        }
      });
    });
  }

  return (
    <div className="flex flex-col md:flex-row items-start gap-4">
      <div className="border-4 border-primary rounded-lg p-2 bg-background">
        <div
          className="grid gap-px"
          style={{
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            width: 'min(300px, 80vw)',
            height: 'min(600px, 160vw)',
          }}
        >
          {displayBoard.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className="w-full h-full rounded-[2px]"
                style={{ backgroundColor: colors[cell] || 'hsl(var(--muted))' }}
              />
            ))
          )}
        </div>
      </div>
      <div className="w-full md:w-64 space-y-4">
        {gameOver && (
          <div className="flex flex-col items-center p-4 bg-destructive text-destructive-foreground rounded-lg">
            <h2 className="text-2xl font-bold">Game Over</h2>
            <p>Your score: {score}</p>
          </div>
        )}
        <div className="p-4 bg-muted rounded-lg text-center">
          <h3 className="text-lg font-bold">Score</h3>
          <p className="text-2xl font-mono">{score}</p>
        </div>
        <Button onClick={startGame} className="w-full">
          {gameOver ? 'Play Again' : 'Restart'}
        </Button>
        <Button onClick={() => setIsPaused(p => !p)} className="w-full" variant="outline">
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <div className="text-sm text-muted-foreground p-2 text-center border rounded-lg">
          <p><strong>Controls:</strong></p>
          <p>Arrow Keys to move</p>
          <p>Up Arrow to rotate</p>
          <p>'P' to pause</p>
        </div>
      </div>
    </div>
  );
};
