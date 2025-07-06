'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { X, Circle, RefreshCw } from 'lucide-react';

type Player = 'X' | 'O' | null;

const TicTacToe = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);

  const calculateWinner = (squares: Player[]): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6], // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  useEffect(() => {
    const newWinner = calculateWinner(board);
    if (newWinner) {
      setWinner(newWinner);
    } else if (!board.includes(null)) {
      setIsDraw(true);
    }
  }, [board]);

  const handleClick = (index: number) => {
    if (board[index] || winner) {
      return;
    }
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
  };

  const renderSquare = (index: number) => {
    const value = board[index];
    return (
      <button
        className={cn(
          "w-24 h-24 flex items-center justify-center text-4xl font-bold border rounded-lg transition-all duration-200",
          "border-primary/20 bg-background",
          "hover:bg-accent focus:bg-accent",
          "disabled:cursor-not-allowed",
          value === 'X' ? "text-primary" : "text-destructive",
          winner && "bg-muted/50"
        )}
        onClick={() => handleClick(index)}
        disabled={!!board[index] || !!winner}
        aria-label={`Square ${index + 1}`}
      >
        {value === 'X' && <X className="h-12 w-12" />}
        {value === 'O' && <Circle className="h-12 w-12" />}
      </button>
    );
  };

  let status;
  if (winner) {
    status = `Winner: Player ${winner}!`;
  } else if (isDraw) {
    status = 'It\'s a Draw!';
  } else {
    status = `Next player: ${currentPlayer}`;
  }

  return (
    <Card className="w-full max-w-md bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{status}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="grid grid-cols-3 gap-2 bg-primary/10 p-2 rounded-lg">
          {Array(9).fill(null).map((_, i) => renderSquare(i))}
        </div>
        <Button onClick={resetGame}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {winner || isDraw ? 'Play Again' : 'Reset Game'}
        </Button>
      </CardContent>
    </Card>
  );
};

export { TicTacToe };
