'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const initialBoard = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const Sudoku = () => {
  const [board, setBoard] = useState(initialBoard.map(row => [...row]));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
    const value = e.target.value;
    if (/^[1-9]?$/.test(value)) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = value === '' ? 0 : parseInt(value, 10);
      setBoard(newBoard);
    }
  };
  
  const resetGame = () => {
    setBoard(initialBoard.map(row => [...row]));
  }

  const checkSolution = () => {
    // Basic placeholder check
    alert("Check functionality not implemented yet!");
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-center">Sudoku</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-9 border-2 border-primary bg-background">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <Input
                key={`${rowIndex}-${colIndex}`}
                type="text"
                value={cell === 0 ? '' : cell}
                onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
                readOnly={initialBoard[rowIndex][colIndex] !== 0}
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl rounded-none p-0",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10",
                  initialBoard[rowIndex][colIndex] !== 0 ? "bg-muted text-muted-foreground font-bold" : "bg-card text-card-foreground",
                  (colIndex + 1) % 3 === 0 && colIndex < 8 && "border-r-2 border-r-primary",
                  (rowIndex + 1) % 3 === 0 && rowIndex < 8 && "border-b-2 border-b-primary"
                )}
                maxLength={1}
              />
            ))
          )}
        </div>
        <div className="flex gap-4">
          <Button onClick={checkSolution} variant="outline">Check Solution</Button>
          <Button onClick={resetGame}>Reset Board</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { Sudoku };
