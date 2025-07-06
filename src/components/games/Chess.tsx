'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

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

// --- SVG Piece Components ---

const WhiteKing = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.5 11.63V6M20 8h5M22.5 25s4.5-7.5 3-10.5c0 0-1.5-1-3-1s-3 1-3 1c-1.5 3 3 10.5 3 10.5" fill="none"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s-2.5-1-7.5-1-6.5 1-6.5 1-2-1-7 1z" /><path d="M11.5 30c5.5-3 15.5-3 21 0" fill="none"/><path d="M12.5 30.5s-1 1-1 3.5-1 3-1 3" fill="none"/><path d="M31.5 30.5s1 1 1 3.5 1 3 1 3" fill="none"/></g></svg>);
const WhiteQueen = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s-2.5-1-7.5-1-6.5 1-6.5 1-2-1-7 1z"/><path d="M11.5 30c5.5-3 15.5-3 21 0" fill="none"/><path d="M11.5 14.5c5.5-3 15.5-3 21 0" fill="none"/><path d="M11.5 14.5s-1.5 12.5 3.5 15.5-4 1-4 1-1.5-1-1.5-1 1.5-1 1.5-1-2.5 2-2.5 2s-6.5-1-9-15.5z" /><path d="M32.5 14.5s1.5 12.5-3.5 15.5 4 1 4 1 1.5-1 1.5-1-1.5-1-1.5-1 2.5 2 2.5 2 6.5-1 9-15.5z"/></g></svg>);
const WhiteRook = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" /><path d="M34 14l-3 3H14l-3-3" /><path d="M31 17v12.5H14V17" /><path d="M31 32l1.5 4H12.5L14 32" /><path d="M14 17h17" fill="none"/></g></svg>);
const WhiteBishop = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 36h27v-3H9v3zM12 33h21v-3H12v3zM15 30h15v-3H15v3z"/><path d="M22.5 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/><path d="M22.5 28.25c-6.25-1-11-6.25-11-13.25C11.5 8.75 16 3 22.5 3S33.5 8.75 33.5 15c0 7-4.75 12.25-11 13.25z" /><path d="M17.5 26l-3.5-2.5" fill="none"/><path d="M27.5 26l3.5-2.5" fill="none"/></g></svg>);
const WhiteKnight = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10c10-2 12 12 12 12s-4-2-12-2c-8 0-10 4-10 4s-4 2-4-6c0-8 6-6 6-6s-2 2-2 4 2 4 2 4-2-2-4-2c-2 0-2 2-2 4s2 4 2 4-2-2-2-4-2-4 0-6c2-2 6-2 6-2z" /><path d="M22 24c-5-2-12-3-12-3s-1 2 2 3c3 1 10 2 10 2z" /><path d="M28 20l-3 8" fill="none"/><path d="M12 35.5h21v-3H12v3zM15 32.5h15v-3H15v3zM22.5 30l-4-4" fill="none"/></g></svg>);
const WhitePawn = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 1.44.78 2.7 1.94 3.46.02.01.04.02.06.03-2.5.6-4.94 2-4.94 4.51v3H30v-3c0-2.51-2.44-3.91-4.94-4.51.02-.01.04-.02.06-.03C26.22 15.7 27 14.44 27 13c0-2.21-1.79-4-4-4z" /><path d="M12 36h21v-3H12v3zM15 33h15v-3H15v3z"/></g></svg>);

const BlackKing = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#333" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.5 11.63V6M20 8h5M22.5 25s4.5-7.5 3-10.5c0 0-1.5-1-3-1s-3 1-3 1c-1.5 3 3 10.5 3 10.5" fill="none"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s-2.5-1-7.5-1-6.5 1-6.5 1-2-1-7 1z" /><path d="M11.5 30c5.5-3 15.5-3 21 0" fill="none"/><path d="M12.5 30.5s-1 1-1 3.5-1 3-1 3" fill="none"/><path d="M31.5 30.5s1 1 1 3.5 1 3 1 3" fill="none"/></g></svg>);
const BlackQueen = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#333" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s-2.5-1-7.5-1-6.5 1-6.5 1-2-1-7 1z"/><path d="M11.5 30c5.5-3 15.5-3 21 0" fill="none"/><path d="M11.5 14.5c5.5-3 15.5-3 21 0" fill="none"/><path d="M11.5 14.5s-1.5 12.5 3.5 15.5-4 1-4 1-1.5-1-1.5-1 1.5-1 1.5-1-2.5 2-2.5 2s-6.5-1-9-15.5z" /><path d="M32.5 14.5s1.5 12.5-3.5 15.5 4 1 4 1 1.5-1 1.5-1-1.5-1-1.5-1 2.5 2 2.5 2 6.5-1 9-15.5z"/></g></svg>);
const BlackRook = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#333" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" /><path d="M34 14l-3 3H14l-3-3" /><path d="M31 17v12.5H14V17" /><path d="M31 32l1.5 4H12.5L14 32" /><path d="M14 17h17" fill="none"/></g></svg>);
const BlackBishop = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#333" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 36h27v-3H9v3zM12 33h21v-3H12v3zM15 30h15v-3H15v3z"/><path d="M22.5 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/><path d="M22.5 28.25c-6.25-1-11-6.25-11-13.25C11.5 8.75 16 3 22.5 3S33.5 8.75 33.5 15c0 7-4.75 12.25-11 13.25z" /><path d="M17.5 26l-3.5-2.5" fill="none"/><path d="M27.5 26l3.5-2.5" fill="none"/></g></svg>);
const BlackKnight = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#333" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10c10-2 12 12 12 12s-4-2-12-2c-8 0-10 4-10 4s-4 2-4-6c0-8 6-6 6-6s-2 2-2 4 2 4 2 4-2-2-4-2c-2 0-2 2-2 4s2 4 2 4-2-2-2-4-2-4 0-6c2-2 6-2 6-2z" /><path d="M22 24c-5-2-12-3-12-3s-1 2 2 3c3 1 10 2 10 2z" /><path d="M28 20l-3 8" fill="none"/><path d="M12 35.5h21v-3H12v3zM15 32.5h15v-3H15v3zM22.5 30l-4-4" fill="none"/></g></svg>);
const BlackPawn = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} viewBox="0 0 45 45"><g fill="#333" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 1.44.78 2.7 1.94 3.46.02.01.04.02.06.03-2.5.6-4.94 2-4.94 4.51v3H30v-3c0-2.51-2.44-3.91-4.94-4.51.02-.01.04-.02.06-.03C26.22 15.7 27 14.44 27 13c0-2.21-1.79-4-4-4z" /><path d="M12 36h21v-3H12v3zM15 33h15v-3H15v3z"/></g></svg>);


const pieceToComponent: Record<NonNullable<Piece>, React.FC<React.SVGProps<SVGSVGElement>>> = {
  k: BlackKing, q: BlackQueen, r: BlackRook, b: BlackBishop, n: BlackKnight, p: BlackPawn,
  K: WhiteKing, Q: WhiteQueen, R: WhiteRook, B: WhiteBishop, N: WhiteKnight, P: WhitePawn,
};

export function Chess() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);

  const handleSquareClick = (row: number, col: number) => {
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
  
  const getPieceComponent = (piece: Piece) => {
    if (!piece) return null;
    const Component = pieceToComponent[piece];
    return <Component className="w-full h-full p-1" />;
  };

  return (
    <Card className="w-full max-w-lg border-primary/20 bg-transparent">
        <CardContent className="flex flex-col items-center gap-4 p-4">
            <div className="grid grid-cols-8 border-2 border-primary/50 bg-background shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
            {board.map((row, rowIndex) =>
                row.map((piece, colIndex) => {
                const isLightSquare = (rowIndex + colIndex) % 2 !== 0;
                return (
                    <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    className={cn(
                        'w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer transition-colors duration-200',
                        isLightSquare ? 'bg-primary/10' : 'bg-primary/30',
                        'hover:bg-primary/40',
                        selectedPiece && selectedPiece[0] === rowIndex && selectedPiece[1] === colIndex ? 'bg-accent/50 ring-2 ring-accent' : ''
                    )}
                    >
                        <div className="w-full h-full transition-transform duration-200 hover:scale-110">
                            {getPieceComponent(piece)}
                        </div>
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
