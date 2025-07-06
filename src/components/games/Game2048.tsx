'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Board = number[][];

const GRID_SIZE = 4;

const createEmptyBoard = (): Board => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

const Game2048 = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const addNumber = useCallback((newBoard: Board): Board => {
    let added = false;
    while (!added) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (newBoard[row][col] === 0) {
        newBoard[row][col] = Math.random() > 0.9 ? 4 : 2;
        added = true;
      }
    }
    return newBoard;
  }, []);

  const startGame = useCallback(() => {
    let newBoard = createEmptyBoard();
    newBoard = addNumber(newBoard);
    newBoard = addNumber(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  }, [addNumber]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const slide = (row: number[]): number[] => {
    let arr = row.filter(val => val);
    let missing = GRID_SIZE - arr.length;
    let zeros = Array(missing).fill(0);
    return arr.concat(zeros);
  };

  const combine = (row: number[]): [number[], number] => {
    let newScore = 0;
    for (let i = 0; i < GRID_SIZE - 1; i++) {
      if (row[i] !== 0 && row[i] === row[i + 1]) {
        row[i] *= 2;
        newScore += row[i];
        row[i + 1] = 0;
      }
    }
    return [row, newScore];
  };

  const operate = (currentBoard: Board): [Board, boolean, number] => {
    let newBoard = JSON.parse(JSON.stringify(currentBoard));
    let totalScore = 0;
    let moved = false;
    for (let i = 0; i < GRID_SIZE; i++) {
      let row = newBoard[i];
      let originalRow = [...row];
      row = slide(row);
      let [newRow, newScore] = combine(row);
      row = slide(newRow);
      newBoard[i] = row;
      totalScore += newScore;
      if (JSON.stringify(originalRow) !== JSON.stringify(row)) {
        moved = true;
      }
    }
    return [newBoard, moved, totalScore];
  };

  const rotateLeft = (matrix: Board): Board => {
    let result: Board = createEmptyBoard();
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            result[j][GRID_SIZE - 1 - i] = matrix[i][j];
        }
    }
    return result;
  };
  
  const rotateRight = (matrix: Board): Board => {
    let result: Board = createEmptyBoard();
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            result[GRID_SIZE - 1 - j][i] = matrix[i][j];
        }
    }
    return result;
  };
  
  const moveLeft = useCallback(() => {
    if (gameOver) return;
    const [newBoard, moved, newScore] = operate(board);
    if (moved) {
        setBoard(addNumber(newBoard));
        setScore(s => s + newScore);
    }
  }, [board, gameOver, addNumber]);

  const moveRight = useCallback(() => {
    if (gameOver) return;
    let newBoard = rotateRight(rotateRight(board));
    const [operatedBoard, moved, newScore] = operate(newBoard);
    newBoard = rotateLeft(rotateLeft(operatedBoard));
    if (moved) {
        setBoard(addNumber(newBoard));
        setScore(s => s + newScore);
    }
  }, [board, gameOver, addNumber]);

  const moveUp = useCallback(() => {
    if (gameOver) return;
    let newBoard = rotateLeft(board);
    const [operatedBoard, moved, newScore] = operate(newBoard);
    newBoard = rotateRight(operatedBoard);
    if (moved) {
        setBoard(addNumber(newBoard));
        setScore(s => s + newScore);
    }
  }, [board, gameOver, addNumber]);

  const moveDown = useCallback(() => {
    if (gameOver) return;
    let newBoard = rotateRight(board);
    const [operatedBoard, moved, newScore] = operate(newBoard);
    newBoard = rotateLeft(operatedBoard);
    if (moved) {
        setBoard(addNumber(newBoard));
        setScore(s => s + newScore);
    }
  }, [board, gameOver, addNumber]);
  
  const isGameOver = useCallback((currentBoard: Board): boolean => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentBoard[i][j] === 0) return false;
        if (i < GRID_SIZE - 1 && currentBoard[i][j] === currentBoard[i + 1][j]) return false;
        if (j < GRID_SIZE - 1 && currentBoard[i][j] === currentBoard[i][j + 1]) return false;
      }
    }
    return true;
  }, []);

  useEffect(() => {
    if (isGameOver(board)) {
        setGameOver(true);
    }
  }, [board, isGameOver]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    e.preventDefault();
    switch (e.key) {
      case 'ArrowLeft': moveLeft(); break;
      case 'ArrowRight': moveRight(); break;
      case 'ArrowUp': moveUp(); break;
      case 'ArrowDown': moveDown(); break;
    }
  }, [moveLeft, moveRight, moveUp, moveDown, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  const tileColors: Record<number, string> = {
    0: 'bg-muted',
    2: 'bg-blue-100 text-blue-900',
    4: 'bg-blue-200 text-blue-900',
    8: 'bg-green-200 text-green-900',
    16: 'bg-green-300 text-green-900',
    32: 'bg-yellow-300 text-yellow-900',
    64: 'bg-yellow-400 text-yellow-900',
    128: 'bg-red-300 text-red-900',
    256: 'bg-red-400 text-red-900',
    512: 'bg-purple-400 text-white',
    1024: 'bg-purple-500 text-white',
    2048: 'bg-purple-700 text-white',
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>2048</CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-xl font-bold">{score}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {gameOver && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-lg">
            <h2 className="text-4xl font-bold text-destructive">Game Over!</h2>
          </div>
        )}
        <div className="grid grid-cols-4 gap-2 p-2 bg-primary/20 rounded-md">
          {board.map((row, rowIndex) =>
            row.map((value, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  'w-20 h-20 flex items-center justify-center rounded-md text-3xl font-bold transition-all duration-300',
                  tileColors[value] || 'bg-black text-white'
                )}
              >
                {value > 0 && value}
              </div>
            ))
          )}
        </div>
        <Button onClick={startGame}>New Game</Button>
        <p className="text-sm text-muted-foreground">Use arrow keys to play.</p>
      </CardContent>
    </Card>
  );
};

export { Game2048 };
