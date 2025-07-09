
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess, type Square, type PieceSymbol, type Color } from 'chess.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Cpu, RefreshCw, Crown } from 'lucide-react';

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


type GameState = {
  game: Chess;
  board: ({ square: Square; type: PieceSymbol; color: Color; } | null)[][];
  gameMode: 'menu' | 'pvp' | 'pvc';
  selectedSquare: Square | null;
  legalMoves: string[];
  status: string;
}

const pieceToComponent: Record<PieceSymbol, Record<Color, React.FC<React.SVGProps<SVGSVGElement>>>> = {
  p: { w: WhitePawn, b: BlackPawn },
  n: { w: WhiteKnight, b: BlackKnight },
  b: { w: WhiteBishop, b: BlackBishop },
  r: { w: WhiteRook, b: BlackRook },
  q: { w: WhiteQueen, b: BlackQueen },
  k: { w: WhiteKing, b: BlackKing },
};

const getPieceComponent = (piece: { type: PieceSymbol; color: Color } | null) => {
    if (!piece) return null;
    const Component = pieceToComponent[piece.type][piece.color];
    return <Component className="w-full h-full p-1 cursor-pointer" />;
};


export function Chess() {
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState<({ square: Square; type: PieceSymbol; color: Color; } | null)[][]>(game.board());
  const [gameMode, setGameMode] = useState<'menu' | 'pvp' | 'pvc'>('menu');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  const updateStatus = useCallback(() => {
    let moveColor = game.turn() === 'w' ? 'White' : 'Black';

    if (game.isCheckmate()) {
      setStatus(`Checkmate! ${moveColor === 'White' ? 'Black' : 'White'} wins.`);
    } else if (game.isDraw()) {
      setStatus('Draw!');
    } else {
      setStatus(`${moveColor}'s turn to move.`);
      if (game.isCheck()) {
        setStatus(s => s + ' (in check)');
      }
    }
  }, [game]);
  
  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setBoard(newGame.board());
    setSelectedSquare(null);
    setLegalMoves([]);
    // The status will be updated by the useEffect below, which depends on 'game'
  }, []);

  useEffect(() => {
    updateStatus();
  }, [game, updateStatus]);

  const makeMove = useCallback((from: Square, to: Square) => {
    try {
        const gameCopy = new Chess(game.fen());
        const move = gameCopy.move({
            from,
            to,
            promotion: 'q', // auto-promote to queen for simplicity
        });
        
        if (move === null) return false; // illegal move
        
        setGame(gameCopy);
        setBoard(gameCopy.board());
        setSelectedSquare(null);
        setLegalMoves([]);
        return true;
    } catch(e) {
        return false;
    }
  }, [game]);

  const makeComputerMove = useCallback(() => {
    if (game.isGameOver()) return;
    const moves = game.moves({ verbose: true });
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    if (randomMove) {
      makeMove(randomMove.from, randomMove.to);
    }
  }, [game, makeMove]);
  
  useEffect(() => {
    if (gameMode === 'pvc' && game.turn() === 'b' && !game.isGameOver()) {
      const timeout = setTimeout(makeComputerMove, 700);
      return () => clearTimeout(timeout);
    }
  }, [game, gameMode, makeComputerMove]);


  const handleSquareClick = (square: Square) => {
    if (game.isGameOver() || (gameMode === 'pvc' && game.turn() === 'b')) return;
    
    if (selectedSquare && legalMoves.includes(square)) {
        makeMove(selectedSquare, square);
        return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setLegalMoves(moves.map(move => move.to));
    } else {
        setSelectedSquare(null);
        setLegalMoves([]);
    }
  };

  const startMode = (mode: 'pvp' | 'pvc') => {
      resetGame();
      setGameMode(mode);
  }
  
  if (gameMode === 'menu') {
      return (
          <Card className="w-full max-w-md bg-card/70 backdrop-blur-sm border-none">
              <CardHeader><CardTitle className="text-center flex items-center justify-center gap-2"><Crown />Choose Game Mode</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                  <Button onClick={() => startMode('pvp')} className="w-full" size="lg"><User className="mr-2"/>Player vs Player</Button>
                  <Button onClick={() => startMode('pvc')} className="w-full" size="lg"><Cpu className="mr-2"/>Player vs Computer</Button>
              </CardContent>
          </Card>
      );
  }

  return (
    <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold font-headline">{status}</h2>
        <Card className="p-2 border-primary/20 bg-transparent shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
            <CardContent className="p-0">
                <div className="grid grid-cols-8 bg-background">
                {board.map((row, rowIndex) =>
                    row.map((piece, colIndex) => {
                        const square: Square = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}` as Square;
                        const isLightSquare = (rowIndex + colIndex) % 2 !== 0;
                        const isLegalMove = legalMoves.includes(square);
                        return (
                            <div
                                key={square}
                                onClick={() => handleSquareClick(square)}
                                className={cn(
                                    'w-12 h-12 md:w-14 md:h-14 flex items-center justify-center cursor-pointer relative',
                                    isLightSquare ? 'bg-primary/10' : 'bg-primary/30',
                                    selectedSquare === square && 'bg-accent/50 ring-2 ring-accent z-10'
                                )}
                            >
                                <div className="w-full h-full transition-transform duration-200 hover:scale-110">
                                    {getPieceComponent(piece)}
                                </div>
                                {isLegalMove && (
                                    <div className="absolute w-1/3 h-1/3 rounded-full bg-green-500/50 pointer-events-none" />
                                )}
                            </div>
                        );
                    })
                )}
                </div>
            </CardContent>
        </Card>
        <div className="flex gap-4">
            <Button onClick={resetGame} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Game
            </Button>
            <Button variant="outline" onClick={() => setGameMode('menu')}>Change Mode</Button>
        </div>
    </div>
  );
}
