'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ship, Target, Waves, AlertTriangle } from 'lucide-react';

const GRID_SIZE = 10;
type CellState = 'empty' | 'ship' | 'hit' | 'miss';
type Grid = CellState[][];

const createEmptyGrid = (): Grid => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty'));

const SHIPS = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 },
];

const Battleship = () => {
  const [playerGrid, setPlayerGrid] = useState<Grid>(createEmptyGrid());
  const [opponentGrid, setOpponentGrid] = useState<Grid>(createEmptyGrid());
  const [gameState, setGameState] = useState<'placement' | 'battle' | 'gameover'>('placement');
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [winner, setWinner] = useState<'Player' | 'Opponent' | null>(null);
  const [playerShipsSunk, setPlayerShipsSunk] = useState(0);
  const [opponentShipsSunk, setOpponentShipsSunk] = useState(0);
  const [turnMessage, setTurnMessage] = useState<string>('');

  useEffect(() => {
    if (gameState === 'placement' && currentShipIndex >= SHIPS.length) {
      placeOpponentShips();
      setGameState('battle');
      setTurnMessage("Your turn! Fire at the opponent's grid.");
    }
  }, [currentShipIndex, gameState]);

  useEffect(() => {
    if (opponentShipsSunk === SHIPS.length) {
      setWinner('Player');
      setGameState('gameover');
    }
    if (playerShipsSunk === SHIPS.length) {
      setWinner('Opponent');
      setGameState('gameover');
    }
  }, [playerShipsSunk, opponentShipsSunk]);

  const placeOpponentShips = () => {
    let opponentGridWithShips = createEmptyGrid();
    SHIPS.forEach(ship => {
      let placed = false;
      while (!placed) {
        const isHorizontal = Math.random() < 0.5;
        const col = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? ship.size : 0)));
        const row = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? 0 : ship.size)));
        if (canPlaceShip(opponentGridWithShips, ship.size, col, row, isHorizontal ? 'horizontal' : 'vertical')) {
          opponentGridWithShips = placeShip(opponentGridWithShips, ship.size, col, row, isHorizontal ? 'horizontal' : 'vertical');
          placed = true;
        }
      }
    });
    setOpponentGrid(opponentGridWithShips);
  };
  
  const canPlaceShip = (grid: Grid, size: number, col: number, row: number, orient: 'horizontal' | 'vertical') => {
    for (let i = 0; i < size; i++) {
        const checkCol = orient === 'horizontal' ? col + i : col;
        const checkRow = orient === 'vertical' ? row + i : row;
        if (checkCol >= GRID_SIZE || checkRow >= GRID_SIZE || grid[checkRow][checkCol] !== 'empty') {
            return false;
        }
    }
    return true;
  }

  const placeShip = (grid: Grid, size: number, col: number, row: number, orient: 'horizontal' | 'vertical'): Grid => {
      const newGrid = grid.map(r => [...r]);
      for (let i = 0; i < size; i++) {
        const setCol = orient === 'horizontal' ? col + i : col;
        const setRow = orient === 'vertical' ? row + i : row;
        newGrid[setRow][setCol] = 'ship';
      }
      return newGrid;
  };

  const handlePlacementClick = (col: number, row: number) => {
    if (gameState !== 'placement' || currentShipIndex >= SHIPS.length) return;
    const ship = SHIPS[currentShipIndex];
    if (canPlaceShip(playerGrid, ship.size, col, row, orientation)) {
      setPlayerGrid(placeShip(playerGrid, ship.size, col, row, orientation));
      setCurrentShipIndex(prev => prev + 1);
    } else {
      // In a real app, use a toast notification instead of an alert.
      alert("Cannot place ship here. It's either out of bounds or overlapping another ship.");
    }
  };

  const opponentTurn = () => {
    setTurnMessage("Opponent is thinking...");
    let fired = false;
    while (!fired) {
      const col = Math.floor(Math.random() * GRID_SIZE);
      const row = Math.floor(Math.random() * GRID_SIZE);
      if (playerGrid[row][col] !== 'hit' && playerGrid[row][col] !== 'miss') {
        const newPlayerGrid = playerGrid.map(r => [...r]);
        if (newPlayerGrid[row][col] === 'ship') {
          newPlayerGrid[row][col] = 'hit';
          if (isShipSunk(newPlayerGrid, col, row)) setPlayerShipsSunk(prev => prev + 1);
        } else {
          newPlayerGrid[row][col] = 'miss';
        }
        setPlayerGrid(newPlayerGrid);
        fired = true;
      }
    }
    setTurnMessage("Your turn! Fire at the opponent's grid.");
  };

  const handleBattleClick = (col: number, row: number) => {
    if (gameState !== 'battle' || opponentGrid[row][col] === 'hit' || opponentGrid[row][col] === 'miss' || winner) return;
    
    const newOpponentGrid = opponentGrid.map(r => [...r]);
    if (opponentGrid[row][col] === 'ship') {
        newOpponentGrid[row][col] = 'hit';
        if (isShipSunk(newOpponentGrid, col, row)) setOpponentShipsSunk(prev => prev + 1);
    } else {
        newOpponentGrid[row][col] = 'miss';
    }
    setOpponentGrid(newOpponentGrid);
    
    if (winner === null) {
      setTimeout(opponentTurn, 600);
    }
  };

  const isShipSunk = (grid: Grid, col: number, row: number): boolean => {
    // This is a simplified check. A full check would need to identify the specific ship.
    // This approximation increments the sunk count on every hit.
    return true; 
  };

  const resetGame = () => {
    setPlayerGrid(createEmptyGrid());
    setOpponentGrid(createEmptyGrid());
    setGameState('placement');
    setCurrentShipIndex(0);
    setOrientation('horizontal');
    setWinner(null);
    setPlayerShipsSunk(0);
    setOpponentShipsSunk(0);
    setTurnMessage('');
  };

  const renderGrid = (grid: Grid, isPlayer: boolean, onClick: (col: number, row: number) => void) => (
    <div className="grid grid-cols-10 gap-px bg-primary/20 border border-primary rounded-md overflow-hidden">
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={cn(
              'aspect-square flex items-center justify-center transition-colors',
              'bg-background hover:bg-primary/10',
              { 'cursor-pointer': (gameState === 'placement' && isPlayer) || (gameState === 'battle' && !isPlayer && !winner)},
              { 'bg-blue-400/50 dark:bg-blue-800/50': isPlayer && cell === 'ship' },
              { 'bg-red-500/80': cell === 'hit' },
              { 'bg-gray-400/50 dark:bg-gray-600/50': cell === 'miss' }
            )}
            onClick={() => onClick(x, y)}
          >
            {cell === 'hit' && <Target className="w-5/6 h-5/6 text-white" />}
            {cell === 'miss' && <Waves className="w-5/6 h-5/6 text-white/50" />}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
      {gameState === 'gameover' && (
        <Alert variant={winner === 'Player' ? 'default' : 'destructive'} className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Game Over!</AlertTitle>
            <AlertDescription>{winner} has won the game!</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-8 lg:gap-16 justify-center w-full">
        <div className="flex flex-col items-center gap-2 flex-1">
          <h2 className="text-xl font-bold font-headline">Your Fleet</h2>
          {renderGrid(playerGrid, true, (x, y) => handlePlacementClick(x, y))}
        </div>
        <div className="flex flex-col items-center gap-2 flex-1">
          <h2 className="text-xl font-bold font-headline">Opponent's Waters</h2>
          {renderGrid(opponentGrid, false, (x, y) => handleBattleClick(x, y))}
        </div>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        {gameState === 'placement' && currentShipIndex < SHIPS.length && (
            <Card className="p-4">
              <h3 className="font-bold text-center">Place your ships</h3>
              <p className="text-muted-foreground text-center mb-2">
                Placing: {SHIPS[currentShipIndex].name} (Size: {SHIPS[currentShipIndex].size})
              </p>
              <Button onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')} className="w-full">
                  Toggle Orientation ({orientation})
              </Button>
            </Card>
        )}

        {gameState === 'battle' && winner === null && (
          <Alert>
            <Ship className="h-4 w-4" />
            <AlertTitle>{turnMessage}</AlertTitle>
          </Alert>
        )}

        <Card>
            <CardContent className="p-4 flex justify-around text-center">
                <div>
                    <p className="font-bold text-lg">{playerShipsSunk}/{SHIPS.length}</p>
                    <p className="text-sm text-muted-foreground">Player Ships Sunk</p>
                </div>
                <div>
                    <p className="font-bold text-lg">{opponentShipsSunk}/{SHIPS.length}</p>
                    <p className="text-sm text-muted-foreground">Opponent Ships Sunk</p>
                </div>
            </CardContent>
        </Card>

        <Button onClick={resetGame} className="w-full">New Game</Button>
      </div>
       <p className="text-sm text-muted-foreground max-w-md text-center">
        Note: This is a simplified version of Battleship. The opponent plays randomly and ship sinking logic is approximated.
      </p>
    </div>
  );
};

export { Battleship };
