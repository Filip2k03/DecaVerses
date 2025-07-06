'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

const ROWS = 6;
const COLS = 7;
type Player = 1 | 2;
type Board = (Player | null)[][];

const createEmptyBoard = (): Board => Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

const checkWin = (board: Board): Player | null => {
  // Check horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const player = board[r][c];
      if (player && player === board[r][c + 1] && player === board[r][c + 2] && player === board[r][c + 3]) {
        return player;
      }
    }
  }
  // Check vertical
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r][c];
      if (player && player === board[r + 1][c] && player === board[r + 2][c] && player === board[r + 3][c]) {
        return player;
      }
    }
  }
  // Check diagonal (down-right)
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const player = board[r][c];
      if (player && player === board[r + 1][c + 1] && player === board[r + 2][c + 2] && player === board[r + 3][c + 3]) {
        return player;
      }
    }
  }
  // Check diagonal (up-right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const player = board[r][c];
      if (player && player === board[r - 1][c + 1] && player === board[r - 2][c + 2] && player === board[r - 3][c + 3]) {
        return player;
      }
    }
  }
  return null;
};

export const ConnectFour = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDraw, setIsDraw] = useState(false);

  const handleColumnClick = (colIndex: number) => {
    if (winner || board[0][colIndex]) return;

    const newBoard = board.map(row => [...row]);
    let rowPlaced = false;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!newBoard[r][colIndex]) {
        newBoard[r][colIndex] = currentPlayer;
        rowPlaced = true;
        break;
      }
    }

    if (rowPlaced) {
      setBoard(newBoard);
      const newWinner = checkWin(newBoard);
      if (newWinner) {
        setWinner(newWinner);
      } else if (newBoard.flat().every(cell => cell !== null)) {
        setIsDraw(true);
      } else {
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      }
    }
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(1);
    setWinner(null);
    setIsDraw(false);
  };

  const getStatusMessage = () => {
    if (winner) return `Player ${winner} Wins!`;
    if (isDraw) return "It's a Draw!";
    return `Player ${currentPlayer}'s Turn`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold font-headline">{getStatusMessage()}</h2>
      <Card className="bg-primary/80 p-2 shadow-[0_0_20px_hsl(var(--primary)/0.8)]">
        <CardContent className="p-0">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {Array.from({ length: COLS }).map((_, c) => (
              <div key={c} className="flex flex-col-reverse gap-2" onClick={() => handleColumnClick(c)}>
                {Array.from({ length: ROWS }).map((_, r) => (
                  <div key={r} className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center cursor-pointer">
                    {board[r][c] && (
                      <div className={cn("w-8 h-8 rounded-full transition-colors animate-in fade-in zoom-in-50", 
                        board[r][c] === 1 ? 'bg-cyan-400' : 'bg-fuchsia-500'
                      )} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Button onClick={resetGame} variant="outline">
        <RefreshCw className="mr-2" />
        New Game
      </Button>
    </div>
  );
};
