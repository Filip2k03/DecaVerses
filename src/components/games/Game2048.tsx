'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Joystick } from '@/components/Joystick';

type Board = number[][];

const GRID_SIZE = 4;

const createEmptyBoard = (): Board => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

const Game2048 = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const isMobile = useIsMobile();
  const lastMoveTime = useRef(0);
  const moveDebounce = 200; // ms to prevent accidental double moves

  const addNumber = useCallback((newBoard: Board): Board => {
    const boardCopy = JSON.parse(JSON.stringify(newBoard));
    const emptyCells: {row: number, col: number}[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (boardCopy[row][col] === 0) {
          emptyCells.push({row, col});
        }
      }
    }
    
    if (emptyCells.length > 0) {
        const {row, col} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        boardCopy[row][col] = Math.random() > 0.9 ? 4 : 2;
    }
    return boardCopy;
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
  
  const rotateBoard = (matrix: Board, direction: 'left' | 'right'): Board => {
    const newBoard = createEmptyBoard();
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (direction === 'right') {
          newBoard[i][j] = matrix[GRID_SIZE - 1 - j][i];
        } else { // left
          newBoard[i][j] = matrix[j][GRID_SIZE - 1 - i];
        }
      }
    }
    return newBoard;
  };

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

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let currentBoard = JSON.parse(JSON.stringify(board));
    let rotatedBoard = currentBoard;
    let rotations = 0;

    switch (direction) {
        case 'up': rotatedBoard = rotateBoard(currentBoard, 'left'); rotations = 1; break;
        case 'down': rotatedBoard = rotateBoard(currentBoard, 'right'); rotations = 1; break;
        case 'right': rotatedBoard = rotateBoard(rotateBoard(currentBoard, 'right'), 'right'); rotations = 2; break;
        case 'left': break; // no rotation needed
    }
    
    const [operatedBoard, moved, newScore] = operate(rotatedBoard);
    
    let finalBoard = operatedBoard;
    if (rotations > 0) {
        if (direction === 'up') finalBoard = rotateBoard(operatedBoard, 'right');
        if (direction === 'down') finalBoard = rotateBoard(operatedBoard, 'left');
        if (direction === 'right') finalBoard = rotateBoard(rotateBoard(operatedBoard, 'left'), 'left');
    }

    if (moved) {
      const newBoardWithNumber = addNumber(finalBoard);
      setBoard(newBoardWithNumber);
      setScore(s => s + newScore);
      if (isGameOver(newBoardWithNumber)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, addNumber, isGameOver]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    e.preventDefault();
    switch (e.key) {
      case 'ArrowLeft': handleMove('left'); break;
      case 'ArrowRight': handleMove('right'); break;
      case 'ArrowUp': handleMove('up'); break;
      case 'ArrowDown': handleMove('down'); break;
    }
  }, [handleMove, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  const handleJoystickMove = (dir: 'up' | 'down' | 'left' | 'right' | 'center') => {
      if (dir === 'center' || gameOver) return;
      
      const now = Date.now();
      if (now - lastMoveTime.current < moveDebounce) return;
      lastMoveTime.current = now;
      
      handleMove(dir);
  };
  
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
    <div className='flex flex-col items-center gap-4'>
        <Card className="w-full max-w-md relative overflow-hidden">
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
                <div className="relative">
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
                            'w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-md text-2xl sm:text-3xl font-bold transition-all duration-300',
                            tileColors[value] || 'bg-black text-white'
                            )}
                        >
                            {value > 0 && value}
                        </div>
                        ))
                    )}
                    </div>
                </div>
                <Button onClick={startGame}>New Game</Button>
                <p className="text-sm text-muted-foreground text-center">Use arrow keys or joystick to play.</p>
            </CardContent>
        </Card>
        {isMobile && !gameOver && <Joystick onMove={handleJoystickMove} />}
    </div>
  );
};

export { Game2048 };
