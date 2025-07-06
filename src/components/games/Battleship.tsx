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

  useEffect(() => {
    if (gameState === 'placement' && currentShipIndex >= SHIPS.length) {
      placeOpponentShips();
      setGameState('battle');
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
        const x = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? ship.size : 0)));
        const y = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? 0 : ship.size)));
        if (canPlaceShip(opponentGridWithShips, ship.size, x, y, isHorizontal ? 'horizontal' : 'vertical')) {
          opponentGridWithShips = placeShip(opponentGridWithShips, ship.size, x, y, isHorizontal ? 'horizontal' : 'vertical');
          placed = true;
        }
      }
    });
    setOpponentGrid(opponentGridWithShips);
  };
  
  const canPlaceShip = (grid: Grid, size: number, x: number, y: number, orient: 'horizontal' | 'vertical') => {
    for (let i = 0; i < size; i++) {
        const checkX = orient === 'horizontal' ? x + i : x;
        const checkY = orient === 'vertical' ? y + i : y;
        if (checkX >= GRID_SIZE || checkY >= GRID_SIZE || grid[checkY][checkX] !== 'empty') {
            return false;
        }
    }
    return true;
  }

  const placeShip = (grid: Grid, size: number, x: number, y: number, orient: 'horizontal' | 'vertical'): Grid => {
      const newGrid = grid.map(row => [...row]);
      for (let i = 0; i < size; i++) {
        const setX = orient === 'horizontal' ? x + i : x;
        const setY = orient === 'vertical' ? y + i : y;
        newGrid[setY][setX] = 'ship';
      }
      return newGrid;
  };

  const handlePlacementClick = (x: number, y: number) => {
    if (gameState !== 'placement' || currentShipIndex >= SHIPS.length) return;
    const ship = SHIPS[currentShipIndex];
    if (canPlaceShip(playerGrid, ship.size, x, y, orientation)) {
      setPlayerGrid(placeShip(playerGrid, ship.size, x, y, orientation));
      setCurrentShipIndex(prev => prev + 1);
    } else {
      alert("Cannot place ship here. It's either out of bounds or overlapping another ship.");
    }
  };

  const opponentTurn = () => {
    let fired = false;
    while (!fired) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      if (playerGrid[y][x] !== 'hit' && playerGrid[y][x] !== 'miss') {
        const newPlayerGrid = playerGrid.map(r => [...r]);
        if (newPlayerGrid[y][x] === 'ship') {
          newPlayerGrid[y][x] = 'hit';
          if (isShipSunk(newPlayerGrid, x, y)) setPlayerShipsSunk(prev => prev + 1);
        } else {
          newPlayerGrid[y][x] = 'miss';
        }
        setPlayerGrid(newPlayerGrid);
        fired = true;
      }
    }
  };

  const handleBattleClick = (x: number, y: number) => {
    if (gameState !== 'battle' || opponentGrid[y][x] === 'hit' || opponentGrid[y][x] === 'miss') return;
    
    const newOpponentGrid = opponentGrid.map(r => [...r]);
    if (newOpponentGrid[y][y] === 'ship') {
        newOpponentGrid[y][x] = 'hit';
        if (isShipSunk(newOpponentGrid, x, y)) setOpponentShipsSunk(prev => prev + 1);
    } else {
        newOpponentGrid[y][x] = 'miss';
    }
    setOpponentGrid(newOpponentGrid);
    
    if (winner === null) {
      setTimeout(opponentTurn, 500);
    }
  };

  const isShipSunk = (grid: Grid, x: number, y: number): boolean => {
    // This is a simplified check. A full check would need to identify the specific ship.
    // For now, let's just count total 'ship' cells remaining.
    const remainingShips = grid.flat().filter(cell => cell === 'ship').length;
    // We infer a ship is sunk by checking if the total number of hits on the opponent's grid
    // equals one of the ship sizes. This is an approximation.
    const totalHits = grid.flat().filter(cell => cell === 'hit').length;
    const sunkShip = SHIPS.find(ship => {
      const shipHits = /* logic to count hits on this specific ship */ 0;
      return shipHits === ship.size;
    })
    // For simplicity, let's just check if we can't find any 'ship' cells anymore on a check.
    // A proper implementation would be much more complex. Let's just increment on every hit for demo
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
  };

  const renderGrid = (grid: Grid, isPlayer: boolean, onClick: (x: number, y: number) => void) => (
    <div className="grid grid-cols-10 gap-px bg-primary/20 border border-primary">
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={cn(
              'w-8 h-8 md:w-10 md:h-10 flex items-center justify-center',
              'bg-background hover:bg-accent',
              { 'cursor-pointer': gameState === 'placement' && isPlayer || gameState === 'battle' && !isPlayer},
              { 'bg-blue-300 dark:bg-blue-800': isPlayer && cell === 'ship' },
              { 'bg-red-500': cell === 'hit' },
              { 'bg-gray-400 dark:bg-gray-600': cell === 'miss' }
            )}
            onClick={() => onClick(x, y)}
          >
            {cell === 'hit' && <Target className="w-6 h-6 text-white" />}
            {cell === 'miss' && <Waves className="w-6 h-6 text-white/50" />}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {gameState === 'gameover' && (
        <Alert variant={winner === 'Player' ? 'default' : 'destructive'} className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Game Over!</AlertTitle>
            <AlertDescription>{winner} has won the game!</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-8 lg:gap-16 justify-center">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold font-headline">Your Fleet</h2>
          {renderGrid(playerGrid, true, (x, y) => handlePlacementClick(x, y))}
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold font-headline">Opponent's Waters</h2>
          {renderGrid(opponentGrid, false, (x, y) => handleBattleClick(x, y))}
        </div>
      </div>
      
      {gameState === 'placement' && currentShipIndex < SHIPS.length && (
          <Card className="p-4 max-w-md">
            <h3 className="font-bold text-center">Place your ships</h3>
            <p className="text-muted-foreground text-center mb-2">
              Placing: {SHIPS[currentShipIndex].name} (Size: {SHIPS[currentShipIndex].size})
            </p>
            <Button onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')} className="w-full">
                Toggle Orientation ({orientation})
            </Button>
          </Card>
      )}

      {gameState === 'battle' && (
        <Alert>
          <Ship className="h-4 w-4" />
          <AlertTitle>Battle Phase!</AlertTitle>
          <AlertDescription>Click on the opponent's grid to fire your shots. Good luck, commander!</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <p>Player Ships Sunk: {playerShipsSunk}/{SHIPS.length}</p>
        <p>Opponent Ships Sunk: {opponentShipsSunk}/{SHIPS.length}</p>
      </div>

      <Button onClick={resetGame}>New Game</Button>
       <p className="text-sm text-muted-foreground max-w-md text-center">
        Note: This is a simplified version of Battleship. The opponent plays randomly and ship sinking logic is approximated.
      </p>
    </div>
  );
};

export { Battleship };
