'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Piece = 'r' | 'n' | 'b' | 'q' | 'k' | 'p' | 'R' | 'N' | 'B' | 'Q' | 'K' | 'P' | null;
type Board = Piece[][];

const initialBoard: Board = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const pieceToUnicode: Record<NonNullable<Piece>, string> = {
  r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
  R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙',
};

export function Chess() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);

  const handleSquareClick = (row: number, col: number) => {
    // This is a placeholder for game logic.
    // In a real game, you would handle piece movement here.
    if (selectedPiece && board[row][col] === null) {
      const newBoard = board.map(r => [...r]);
      const [prevRow, prevCol] = selectedPiece;
      newBoard[row][col] = newBoard[prevRow][prevCol];
      newBoard[prevRow][prevCol] = null;
      setBoard(newBoard);
      setSelectedPiece(null);
    } else if (board[row][col] !== null) {
      setSelectedPiece([row, col]);
    } else {
        setSelectedPiece(null);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-center">Chess</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-8 border-2 border-primary bg-background">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isLightSquare = (rowIndex + colIndex) % 2 !== 0;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  className={cn(
                    'w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-4xl cursor-pointer',
                    isLightSquare ? 'bg-secondary' : 'bg-primary/20',
                    selectedPiece && selectedPiece[0] === rowIndex && selectedPiece[1] === colIndex ? 'bg-yellow-400' : ''
                  )}
                >
                  {piece && pieceToUnicode[piece]}
                </div>
              );
            })
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Note: This is a visual-only chessboard. Full game logic is not implemented.
        </p>
      </CardContent>
    </Card>
  );
}
