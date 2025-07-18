'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGame } from '@/context/GameContext';
import { Trophy, Pause, Play, RefreshCw, ArrowUp, ArrowLeft, ArrowDown, ArrowRight } from 'lucide-react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const createEmptyBoard = (): number[][] => Array.from(Array(BOARD_HEIGHT), () => Array(BOARD_WIDTH).fill(0));

const TETROMINOS: Record<string, { shape: number[][] }> = {
  I: { shape: [[1, 1, 1, 1]] },
  J: { shape: [[1, 0, 0], [1, 1, 1]] },
  L: { shape: [[0, 0, 1], [1, 1, 1]] },
  O: { shape: [[1, 1], [1, 1]] },
  S: { shape: [[0, 1, 1], [1, 1, 0]] },
  T: { shape: [[0, 1, 0], [1, 1, 1]] },
  Z: { shape: [[1, 1, 0], [0, 1, 1]] },
};

const TETROMINO_MAP: Record<string, number> = {
    'I': 1, 'J': 2, 'L': 3, 'O': 4, 'S': 5, 'T': 6, 'Z': 7
};

const colors: { [key: number]: string } = {
  0: 'hsl(var(--background) / 0.5)',
  1: 'hsl(var(--chart-1))',
  2: 'hsl(var(--chart-2))',
  3: 'hsl(var(--chart-3))',
  4: 'hsl(var(--chart-4))',
  5: 'hsl(var(--chart-5))',
  6: 'hsl(var(--accent))',
  7: 'hsl(var(--destructive))'
};

const randomTetromino = () => {
  const keys = Object.keys(TETROMINOS);
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return {
    shape: TETROMINOS[randKey].shape,
    colorId: TETROMINO_MAP[randKey],
  };
};

type Piece = { shape: number[][]; colorId: number };
type Position = { x: number; y: number };

export function BlockStacker() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(randomTetromino());
  const [position, setPosition] = useState<Position>({ x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();
  const lastMoveTime = useRef(0);
  const moveDebounce = 200; // ms for joystick move repeat rate

  const { scores, updateScore } = useGame();
  const highScore = scores[8] || 0;

  const isValidMove = useCallback((piece: Piece, pos: Position, gameBoard: number[][]) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (gameBoard[newY] && gameBoard[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    updateScore(8, score);
  }, [score, updateScore]);

  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPiece(randomTetromino());
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  }, []);

  const dropPiece = useCallback(() => {
    if (isPaused || gameOver) return;
    const newPosition = { ...position, y: position.y + 1 };
    if (isValidMove(currentPiece, newPosition, board)) {
      setPosition(newPosition);
    } else {
      const newBoard = board.map(row => [...row]);
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            if (position.y + y >= 0) {
                newBoard[position.y + y][position.x + x] = currentPiece.colorId;
            }
          }
        });
      });

      let linesCleared = 0;
      const boardWithoutFullLines = newBoard.filter(row => {
        if (row.every(cell => cell !== 0)) {
          linesCleared++;
          return false;
        }
        return true;
      });
      
      const newEmptyRows = Array.from(Array(linesCleared), () => Array(BOARD_WIDTH).fill(0));
      const finalBoard = [...newEmptyRows, ...boardWithoutFullLines];
      if (linesCleared > 0) {
        setScore(prev => prev + [0, 10, 30, 50, 80][linesCleared] * linesCleared);
      }
      setBoard(finalBoard);

      const newPiece = randomTetromino();
      const newPiecePosition = { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 };
      if (!isValidMove(newPiece, newPiecePosition, finalBoard)) {
        handleGameOver();
      } else {
        setCurrentPiece(newPiece);
        setPosition(newPiecePosition);
      }
    }
  }, [board, currentPiece, isPaused, gameOver, isValidMove, position, handleGameOver]);
  
  const handleControl = useCallback((action: 'left' | 'right' | 'down' | 'rotate' | 'pause') => {
      if (action === 'pause') {
        setIsPaused(p => !p);
        return;
      }

      if (gameOver || isPaused) return;

      if (action === 'rotate') {
        const newShape = currentPiece.shape[0].map((_, colIndex) =>
          currentPiece.shape.map(row => row[colIndex]).reverse()
        );
        const newPiece = { ...currentPiece, shape: newShape };
        if (isValidMove(newPiece, position, board)) {
          setCurrentPiece(newPiece);
        }
      } else if (action === 'left' || action === 'right') {
        const dir = action === 'left' ? -1 : 1;
        const newPosition = { ...position, x: position.x + dir };
        if (isValidMove(currentPiece, newPosition, board)) {
          setPosition(newPosition);
        }
      } else if (action === 'down') {
        dropPiece();
      }
  }, [gameOver, isPaused, currentPiece, position, board, isValidMove, dropPiece]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowLeft': handleControl('left'); break;
        case 'ArrowRight': handleControl('right'); break;
        case 'ArrowDown': handleControl('down'); break;
        case 'ArrowUp': handleControl('rotate'); break;
        case 'p': case 'P': handleControl('pause'); break;
      }
    }, [handleControl]);

    const handleMobileControl = (action: 'rotate' | 'down' | 'left' | 'right') => {
        if (isPaused || gameOver) return;
        
        const now = Date.now();
        if (now - lastMoveTime.current < moveDebounce) return;
        lastMoveTime.current = now;

        handleControl(action);
    };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  useEffect(() => {
    if (gameOver || isPaused) return;
    const interval = setInterval(dropPiece, 1000);
    return () => clearInterval(interval);
  }, [dropPiece, gameOver, isPaused]);
  
  useEffect(() => {
    startGame();
  }, [startGame]);

  const displayBoard = board.map(row => [...row]);
  if (!gameOver) {
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          if (displayBoard[position.y + y]) {
             displayBoard[position.y + y][position.x + x] = currentPiece.colorId;
          }
        }
      });
    });
  }

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
      <div className="relative border-4 border-primary rounded-lg p-1 bg-background shadow-[0_0_20px_hsl(var(--primary)/0.8)]">
        {(gameOver || isPaused) && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 text-white gap-4">
            {gameOver ? (
                <>
                    <h2 className="text-4xl font-bold font-headline">Game Over</h2>
                    <Button onClick={startGame}>Play Again</Button>
                </>
            ) : (
                <>
                    <h2 className="text-4xl font-bold font-headline">Paused</h2>
                    <Button onClick={() => handleControl('pause')}>Resume</Button>
                </>
            )}
            </div>
        )}
        <div
          className="grid gap-px"
          style={{
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            width: 'min(300px, 80vw)',
            height: 'min(600px, 160vw)',
          }}
        >
          {displayBoard.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className="w-full h-full"
                style={{ 
                    backgroundColor: colors[cell] || 'hsl(var(--muted))',
                    boxShadow: cell !== 0 ? `inset 0 0 4px hsl(var(--background)), 0 0 8px ${colors[cell]}` : 'none'
                 }}
              />
            ))
          )}
        </div>
      </div>
      <div className="w-full md:w-64 space-y-4">
         <div className="p-4 bg-muted/80 rounded-lg text-center">
          <h3 className="text-lg font-bold">Score</h3>
          <p className="text-2xl font-mono">{score}</p>
        </div>
         <div className="p-4 bg-muted/80 rounded-lg text-center">
          <h3 className="text-lg font-bold flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            High Score
            </h3>
          <p className="text-2xl font-mono">{highScore}</p>
        </div>
        {!gameOver && (
             <div className="flex gap-2 justify-center">
                <Button onClick={() => handleControl('pause')} variant="outline" className="w-full">
                    {isPaused ? <Play /> : <Pause />}
                    <span className="ml-2">{isPaused ? 'Resume' : 'Pause'}</span>
                </Button>
                 <Button onClick={startGame} variant="destructive" className="w-full">
                    <RefreshCw />
                    <span className="ml-2">Restart</span>
                </Button>
            </div>
        )}
        {gameOver && <Button onClick={startGame} className="w-full">Play Again</Button>}
        <div className="text-sm text-muted-foreground p-2 text-center border rounded-lg">
          <p><strong>Controls:</strong></p>
          <p>Arrow Keys to move</p>
          <p>Up Arrow to rotate</p>
          <p>'P' to pause</p>
        </div>
      </div>
      {isMobile && !gameOver && !isPaused && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 grid grid-cols-3 grid-rows-2 gap-2 w-48 h-32 md:hidden">
            <Button variant="outline" className="col-start-2 h-full w-full" onTouchStart={(e) => { e.preventDefault(); handleMobileControl('rotate'); }}>
                <ArrowUp />
            </Button>
            <Button variant="outline" className="row-start-2 h-full w-full" onTouchStart={(e) => { e.preventDefault(); handleMobileControl('left'); }}>
                <ArrowLeft />
            </Button>
            <Button variant="outline" className="row-start-2 col-start-2 h-full w-full" onTouchStart={(e) => { e.preventDefault(); handleMobileControl('down'); }}>
                <ArrowDown />
            </Button>
            <Button variant="outline" className="row-start-2 col-start-3 h-full w-full" onTouchStart={(e) => { e.preventDefault(); handleMobileControl('right'); }}>
                <ArrowRight />
            </Button>
        </div>
      )}
    </div>
  );
}
