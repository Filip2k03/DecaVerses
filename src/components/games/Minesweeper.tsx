'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bomb, Flag, Timer, Trophy } from 'lucide-react';
import { useGame } from '@/context/GameContext';

const BOARD_SIZE = 10;
const MINE_COUNT = 10;

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type Board = Cell[][];

const Minesweeper = () => {
  const [board, setBoard] = useState<Board>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [time, setTime] = useState(0);
  const [flags, setFlags] = useState(MINE_COUNT);
  const { scores, updateScore } = useGame();
  const highScore = scores[7] || 0;

  const createBoard = useCallback(() => {
    const newBoard: Board = Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate adjacent mines
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
              const newRow = row + r;
              const newCol = col + c;
              if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && newBoard[newRow][newCol].isMine) {
                count++;
              }
            }
          }
          newBoard[row][col].adjacentMines = count;
        }
      }
    }
    setBoard(newBoard);
  }, []);

  const resetGame = useCallback(() => {
    createBoard();
    setGameState('playing');
    setTime(0);
    setFlags(MINE_COUNT);
  }, [createBoard]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const checkWinCondition = useCallback((newBoard: Board) => {
    const revealedCount = newBoard.flat().filter(cell => cell.isRevealed).length;
    if (revealedCount === BOARD_SIZE * BOARD_SIZE - MINE_COUNT) {
      setGameState('won');
      if (highScore === 0 || time < highScore) {
        updateScore(7, time);
      }
      const finalBoard = newBoard.map(row => row.map(cell => ({ ...cell, isRevealed: true })));
      setBoard(finalBoard);
    }
  }, [highScore, time, updateScore]);

  const revealCell = (row: number, col: number) => {
    if (gameState !== 'playing' || board[row][col].isRevealed || board[row][col].isFlagged) return;

    const newBoard = JSON.parse(JSON.stringify(board));

    if (newBoard[row][col].isMine) {
      setGameState('lost');
      // Reveal all mines
      const finalBoard = newBoard.map((r: Cell[]) => r.map((c: Cell) => ({ ...c, isRevealed: true })));
      setBoard(finalBoard);
      return;
    }
    
    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) return;
      newBoard[r][c].isRevealed = true;
      if (newBoard[r][c].adjacentMines === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            reveal(r + i, c + j);
          }
        }
      }
    };
    
    reveal(row, col);
    setBoard(newBoard);
    checkWinCondition(newBoard);
  };

  const toggleFlag = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameState !== 'playing' || board[row][col].isRevealed) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    const cell = newBoard[row][col];
    
    if (cell.isFlagged) {
      cell.isFlagged = false;
      setFlags(f => f + 1);
    } else if (flags > 0) {
      cell.isFlagged = true;
      setFlags(f => f - 1);
    }
    setBoard(newBoard);
  };

  const cellColor = (cell: Cell) => {
    if (!cell.isRevealed) return 'bg-muted hover:bg-muted/80';
    return 'bg-background';
  };
  
  const numberColor = [
    '', 'text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-500', 'text-maroon-500', 'text-teal-500', 'text-black', 'text-gray-500'
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-4 flex flex-col items-center gap-4">
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md font-mono text-lg">
              <Flag className="h-5 w-5 text-destructive" /> {flags.toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md font-mono text-lg">
                <Timer className="h-5 w-5" /> {time.toString().padStart(3, '0')}
            </div>
          </div>

          <div className="grid grid-cols-10 gap-px bg-primary/20 border border-primary rounded-md overflow-hidden">
            {board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => revealCell(r, c)}
                  onContextMenu={(e) => toggleFlag(e, r, c)}
                  disabled={gameState !== 'playing'}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center font-bold text-lg transition-colors',
                    cellColor(cell)
                  )}
                >
                  {cell.isRevealed && cell.isMine && <Bomb className="text-destructive h-6 w-6" />}
                  {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && <span className={numberColor[cell.adjacentMines]}>{cell.adjacentMines}</span>}
                  {cell.isFlagged && !cell.isRevealed && <Flag className="text-destructive h-5 w-5" />}
                </button>
              ))
            )}
          </div>
          {gameState !== 'playing' && (
            <div className="text-center">
              <p className="text-2xl font-bold">
                {gameState === 'won' ? 'You Win!' : 'Game Over!'}
              </p>
               {gameState === 'won' && <p>Your time: {time}s</p>}
              <Button onClick={resetGame} className="mt-2">Play Again</Button>
            </div>
          )}
          <div className="flex gap-4 items-center">
            <p className="text-sm text-muted-foreground">High Score (Time): </p>
             <div className="flex items-center gap-1 p-2 bg-muted rounded-md font-mono text-md">
                <Trophy className="h-4 w-4 text-yellow-500" /> {highScore > 0 ? `${highScore}s` : '-'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { Minesweeper };
