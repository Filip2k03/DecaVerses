
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bomb, Flag, Timer, Trophy } from 'lucide-react';
import { useGame } from '@/context/GameContext';

const DIFFICULTY_SETTINGS = {
  easy: { size: 10, mines: 10, label: 'Easy' },
  normal: { size: 16, mines: 40, label: 'Normal' },
  hard: { size: 24, mines: 99, label: 'Hard' },
  expert: { size: 32, mines: 150, label: 'Expert' },
};
type Difficulty = keyof typeof DIFFICULTY_SETTINGS;

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};
type Board = Cell[][];

const createNewBoard = (size: number, mineCount: number): Board => {
    const newBoard: Board = Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate adjacent mines
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
              const newRow = row + r;
              const newCol = col + c;
              if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && newBoard[newRow][newCol].isMine) {
                count++;
              }
            }
          }
          newBoard[row][col].adjacentMines = count;
        }
      }
    }
    return newBoard;
};

const Minesweeper = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Board>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [time, setTime] = useState(0);
  const [flags, setFlags] = useState(DIFFICULTY_SETTINGS.easy.mines);
  const [clickMode, setClickMode] = useState<'reveal' | 'flag'>('reveal');
  const { scores, updateScore } = useGame();
  const highScore = scores[7] || 0;

  const resetGame = useCallback((newDifficulty: Difficulty) => {
    const { size, mines } = DIFFICULTY_SETTINGS[newDifficulty];
    const newBoard = createNewBoard(size, mines);
    setBoard(newBoard);
    setGameState('playing');
    setTime(0);
    setFlags(mines);
    setDifficulty(newDifficulty);
    setClickMode('reveal');
  }, []);

  useEffect(() => {
    resetGame('easy');
  }, [resetGame]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const checkWinCondition = useCallback((newBoard: Board) => {
    const { size, mines } = DIFFICULTY_SETTINGS[difficulty];
    const revealedCount = newBoard.flat().filter(cell => cell.isRevealed).length;
    if (revealedCount === size * size - mines) {
      setGameState('won');
      const currentHighScore = scores[7] || 0;
      if (currentHighScore === 0 || time < currentHighScore) {
        updateScore(7, time);
      }
      const finalBoard = newBoard.map(row => row.map(cell => ({ ...cell, isRevealed: true })));
      setBoard(finalBoard);
    }
  }, [difficulty, scores, time, updateScore]);

  const revealCell = (row: number, col: number) => {
    if (gameState !== 'playing' || board[row][col].isRevealed || board[row][col].isFlagged) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    const { size } = DIFFICULTY_SETTINGS[difficulty];

    if (newBoard[row][col].isMine) {
      setGameState('lost');
      const finalBoard = newBoard.map((r: Cell[]) => r.map((c: Cell) => ({ ...c, isRevealed: true })));
      setBoard(finalBoard);
      return;
    }
    
    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= size || c < 0 || c >= size || newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) return;
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
  
  const handleToggleFlag = (row: number, col: number) => {
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

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing') return;
    if (clickMode === 'reveal') {
      revealCell(row, col);
    } else {
      handleToggleFlag(row, col);
    }
  };
  
  const handleContextMenu = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    handleToggleFlag(row, col);
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    resetGame(newDifficulty);
  };

  const cellColor = (cell: Cell) => {
    if (!cell.isRevealed) return 'bg-muted hover:bg-muted/80';
    return 'bg-background/50';
  };
  
  const numberColor = [ '', 'text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-500', 'text-maroon-500', 'text-teal-500', 'text-black', 'text-gray-500' ];
  const cellSizeClass = difficulty === 'expert' ? 'w-6 h-6' : difficulty === 'hard' ? 'w-7 h-7' : 'w-8 h-8';

  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="w-full">
        <CardContent className="p-4 flex flex-col items-center gap-4">
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-1 sm:gap-2 p-2 bg-muted rounded-md font-mono text-base sm:text-lg">
              <Bomb className="h-5 w-5 text-destructive" /> {DIFFICULTY_SETTINGS[difficulty].mines.toString().padStart(3, '0')}
            </div>
             <div className="flex items-center gap-1 sm:gap-2 p-2 bg-muted rounded-md font-mono text-base sm:text-lg">
                <Flag className="h-5 w-5 text-primary" /> {flags.toString().padStart(3, '0')}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 p-2 bg-muted rounded-md font-mono text-base sm:text-lg">
                <Timer className="h-5 w-5" /> {time.toString().padStart(3, '0')}
            </div>
          </div>
          
          <div className="flex justify-center gap-2 flex-wrap">
            {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map(d => (
              <Button
                key={d}
                variant={difficulty === d ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDifficultyChange(d)}
              >
                {DIFFICULTY_SETTINGS[d].label}
              </Button>
            ))}
          </div>

           <Button
              variant={clickMode === 'flag' ? 'default' : 'outline'}
              onClick={() => setClickMode(m => m === 'reveal' ? 'flag' : 'reveal')}
              className="w-48"
          >
              {clickMode === 'reveal' ? <Bomb className="mr-2 h-5 w-5" /> : <Flag className="mr-2 h-5 w-5" />}
              Mode: {clickMode === 'reveal' ? 'Reveal' : 'Flag'}
          </Button>

          <div className="overflow-auto max-w-full">
            <div
              className="grid gap-px bg-primary/20 border border-primary rounded-md overflow-hidden"
              style={{ gridTemplateColumns: `repeat(${DIFFICULTY_SETTINGS[difficulty].size}, 1fr)` }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => handleContextMenu(e, r, c)}
                    disabled={gameState !== 'playing'}
                    className={cn(
                      'flex items-center justify-center font-bold text-lg transition-colors',
                      cellSizeClass,
                      cellColor(cell)
                    )}
                  >
                    {cell.isRevealed && cell.isMine && <Bomb className="text-destructive h-5/6 w-5/6" />}
                    {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && <span className={numberColor[cell.adjacentMines]}>{cell.adjacentMines}</span>}
                    {cell.isFlagged && !cell.isRevealed && <Flag className="text-primary h-5/6 w-5/6" />}
                  </button>
                ))
              )}
            </div>
          </div>

          {gameState !== 'playing' && (
            <div className="text-center pt-2">
              <p className="text-2xl font-bold">
                {gameState === 'won' ? 'You Win!' : 'Game Over!'}
              </p>
               {gameState === 'won' && <p>Your time: {time}s</p>}
              <Button onClick={() => resetGame(difficulty)} className="mt-2">Play Again</Button>
            </div>
          )}

           <div className="flex gap-4 items-center pt-2">
            <p className="text-sm text-muted-foreground">Best Time (Any Difficulty): </p>
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
