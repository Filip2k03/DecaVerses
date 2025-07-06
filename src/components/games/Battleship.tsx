
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ship, Target, Waves, AlertTriangle, Trophy, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/context/GameContext';

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
  const [playerHits, setPlayerHits] = useState(0);
  const [opponentHits, setOpponentHits] = useState(0);
  const [turns, setTurns] = useState(0);
  const [turnMessage, setTurnMessage] = useState<string>('');
  const { toast } = useToast();
  const { scores, updateScore } = useGame();
  const highScore = scores[6] || 0;

  const totalShipParts = useMemo(() => SHIPS.reduce((sum, ship) => sum + ship.size, 0), []);

  const placeOpponentShips = useCallback(() => {
    let opponentGridWithShips = createEmptyGrid();
    for (const ship of SHIPS) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const isHorizontal = Math.random() < 0.5;
        const col = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? ship.size - 1 : 0)));
        const row = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? 0 : ship.size - 1)));
        if (canPlaceShip(opponentGridWithShips, ship.size, col, row, isHorizontal ? 'horizontal' : 'vertical')) {
          opponentGridWithShips = placeShip(opponentGridWithShips, ship.size, col, row, isHorizontal ? 'horizontal' : 'vertical');
          placed = true;
        }
        attempts++;
      }
      if (!placed) console.error("Could not place opponent ship:", ship.name);
    }
    setOpponentGrid(opponentGridWithShips);
  }, []);

  useEffect(() => {
    if (gameState === 'placement' && currentShipIndex >= SHIPS.length) {
      placeOpponentShips();
      setGameState('battle');
      setTurnMessage("Your turn! Fire at the opponent's grid.");
    }
  }, [currentShipIndex, gameState, placeOpponentShips]);
  
  const handleGameEnd = useCallback((gameWinner: 'Player' | 'Opponent') => {
      setWinner(gameWinner);
      setGameState('gameover');
      if (gameWinner === 'Player') {
        const score = Math.max(0, 100 - turns);
        updateScore(6, score);
      }
  }, [turns, updateScore]);

  useEffect(() => {
    if (opponentHits === totalShipParts && gameState === 'battle') {
      handleGameEnd('Player');
    }
    if (playerHits === totalShipParts && gameState === 'battle') {
      handleGameEnd('Opponent');
    }
  }, [playerHits, opponentHits, totalShipParts, handleGameEnd, gameState]);

  const canPlaceShip = (grid: Grid, size: number, col: number, row: number, orient: 'horizontal' | 'vertical') => {
    if (orient === 'horizontal' && col + size > GRID_SIZE) return false;
    if (orient === 'vertical' && row + size > GRID_SIZE) return false;

    for (let i = 0; i < size; i++) {
        const checkCol = orient === 'horizontal' ? col + i : col;
        const checkRow = orient === 'vertical' ? row + i : row;
        if (grid[checkRow][checkCol] !== 'empty') {
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
      toast({
        title: "Invalid Placement",
        description: "You can't place a ship there. It's either out of bounds or overlapping another ship.",
        variant: "destructive",
      });
    }
  };

  const opponentTurn = () => {
    setTurnMessage("Opponent is thinking...");
    setTimeout(() => {
        let fired = false;
        let attempts = 0;
        while (!fired && attempts < 100) {
            const col = Math.floor(Math.random() * GRID_SIZE);
            const row = Math.floor(Math.random() * GRID_SIZE);
            if (playerGrid[row][col] !== 'hit' && playerGrid[row][col] !== 'miss') {
                const newPlayerGrid = playerGrid.map(r => [...r]);
                if (newPlayerGrid[row][col] === 'ship') {
                newPlayerGrid[row][col] = 'hit';
                setPlayerHits(h => h + 1);
                } else {
                newPlayerGrid[row][col] = 'miss';
                }
                setPlayerGrid(newPlayerGrid);
                fired = true;
            }
            attempts++;
        }
        setTurnMessage("Your turn! Fire at the opponent's grid.");
    }, 600);
  };

  const handleBattleClick = (col: number, row: number) => {
    if (gameState !== 'battle' || opponentGrid[row][col] === 'hit' || opponentGrid[row][col] === 'miss' || winner) return;
    
    setTurns(t => t + 1);
    const newOpponentGrid = opponentGrid.map(r => [...r]);
    let newOpponentHits = opponentHits;
    if (newOpponentGrid[row][col] === 'ship') {
        newOpponentGrid[row][col] = 'hit';
        newOpponentHits++;
        setOpponentHits(newOpponentHits);
    } else {
        newOpponentGrid[row][col] = 'miss';
    }
    setOpponentGrid(newOpponentGrid);
    
    if (winner === null && newOpponentHits < totalShipParts) {
      opponentTurn();
    }
  };

  const resetGame = () => {
    setPlayerGrid(createEmptyGrid());
    setOpponentGrid(createEmptyGrid());
    setGameState('placement');
    setCurrentShipIndex(0);
    setOrientation('horizontal');
    setWinner(null);
    setPlayerHits(0);
    setOpponentHits(0);
    setTurns(0);
    setTurnMessage('');
    placeOpponentShips();
  };
  
  useEffect(() => {
    placeOpponentShips();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderGrid = (grid: Grid, isPlayer: boolean, onClick: (col: number, row: number) => void) => (
    <div className="grid grid-cols-10 gap-px bg-primary/20 border-2 border-primary rounded-lg overflow-hidden shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={cn(
              'aspect-square flex items-center justify-center transition-colors',
              'bg-background/80 backdrop-blur-sm',
              { 'cursor-pointer hover:bg-primary/20': (gameState === 'placement' && isPlayer) || (gameState === 'battle' && !isPlayer && !winner)},
              { 'bg-primary/30': isPlayer && cell === 'ship' },
              { 'bg-destructive/70 animate-pulse': cell === 'hit' },
              { 'bg-primary/10': cell === 'miss' }
            )}
            onClick={() => onClick(x, y)}
          >
            {cell === 'hit' && <Target className="w-5/6 h-5/6 text-destructive-foreground" />}
            {cell === 'miss' && <Waves className="w-5/6 h-5/6 text-primary/50" />}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl mx-auto">
      {gameState === 'gameover' && (
        <Alert variant={winner === 'Player' ? 'default' : 'destructive'} className="max-w-md text-center border-2 animate-in fade-in">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-2xl font-headline">Game Over!</AlertTitle>
            <AlertDescription className="text-lg">{winner} has won the battle! {winner === 'Player' && `Your score: ${Math.max(0, 100 - turns)}`}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 justify-center w-full">
        <div className="flex flex-col items-center gap-3 flex-1">
          <h2 className="text-xl font-bold font-headline tracking-widest">Your Fleet</h2>
          {renderGrid(playerGrid, true, (x, y) => handlePlacementClick(x, y))}
        </div>
        <div className="flex flex-col items-center gap-3 flex-1">
          <h2 className="text-xl font-bold font-headline tracking-widest">Opponent's Waters</h2>
          {renderGrid(opponentGrid, false, (x, y) => handleBattleClick(x, y))}
        </div>
      </div>
      
      <div className="w-full max-w-lg space-y-4">
        <Card className="bg-muted/30">
            <CardContent className="p-4">
                {gameState === 'placement' && currentShipIndex < SHIPS.length && (
                    <div className='text-center space-y-2'>
                      <h3 className="font-bold text-lg font-headline">Place your ships</h3>
                      <p className="text-muted-foreground">
                        Placing: {SHIPS[currentShipIndex].name} (Size: {SHIPS[currentShipIndex].size})
                      </p>
                      <Button onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')} className="w-full">
                          <RotateCw />
                          Rotate Ship ({orientation})
                      </Button>
                    </div>
                )}

                {gameState === 'battle' && winner === null && (
                <Alert variant="default" className="text-center border-primary/50 bg-transparent">
                    <Ship className="h-4 w-4" />
                    <AlertTitle className="font-headline text-lg">{turnMessage || "Battle commencing..."}</AlertTitle>
                    <AlertDescription>Click on the opponent's grid to fire.</AlertDescription>
                </Alert>
                )}

                {gameState === 'gameover' && (
                  <div className='text-center'>
                     <p className='text-lg text-muted-foreground'>The battle is over. Care for another round?</p>
                  </div>
                )}
            </CardContent>
        </Card>
        
        <div className="flex gap-4">
            <Card className="flex-1 bg-muted/30">
                <CardHeader className="p-4 text-center">
                    <CardTitle className="text-sm text-muted-foreground">Turns Taken</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-center">
                    <p className="font-bold font-mono text-3xl">{turns}</p>
                </CardContent>
            </Card>
            <Card className="flex-1 bg-muted/30">
                <CardHeader className="p-4 text-center">
                    <CardTitle className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                         <Trophy className="h-4 w-4 text-yellow-500"/> High Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-center">
                    <p className="font-bold font-mono text-3xl">{highScore}</p>
                </CardContent>
            </Card>
        </div>

        <Button onClick={resetGame} className="w-full" size="lg">New Game</Button>
      </div>
    </div>
  );
};

export { Battleship };
