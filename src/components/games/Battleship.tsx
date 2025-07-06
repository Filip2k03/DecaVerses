
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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

export const Battleship = () => {
  const [playerGrid, setPlayerGrid] = useState<Grid>(createEmptyGrid());
  const [opponentGrid, setOpponentGrid] = useState<Grid>(createEmptyGrid());
  const [gameState, setGameState] = useState<'placement' | 'battle' | 'gameover'>('placement');
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [winner, setWinner] = useState<'Player' | 'Opponent' | null>(null);
  const [playerHits, setPlayerHits] = useState(0);
  const [opponentHits, setOpponentHits] = useState(0);
  const [turns, setTurns] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  
  const { toast } = useToast();
  const { scores, updateScore } = useGame();
  const highScore = scores[6] || 0;

  const totalShipParts = useMemo(() => SHIPS.reduce((sum, ship) => sum + ship.size, 0), []);

  const resetGame = useCallback(() => {
    setPlayerGrid(createEmptyGrid());
    setOpponentGrid(createEmptyGrid());
    setGameState('placement');
    setCurrentShipIndex(0);
    setOrientation('horizontal');
    setWinner(null);
    setPlayerHits(0);
    setOpponentHits(0);
    setTurns(0);
    setIsPlayerTurn(true);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const canPlaceShip = useCallback((grid: Grid, size: number, col: number, row: number, orient: 'horizontal' | 'vertical'): boolean => {
    if (orient === 'horizontal' && col + size > GRID_SIZE) return false;
    if (orient === 'vertical' && row + size > GRID_SIZE) return false;
    for (let i = 0; i < size; i++) {
        const checkCol = orient === 'horizontal' ? col + i : col;
        const checkRow = orient === 'vertical' ? row + i : row;
        if (grid[checkRow][checkCol] !== 'empty') return false;
    }
    return true;
  }, []);

  const placeShip = useCallback((grid: Grid, size: number, col: number, row: number, orient: 'horizontal' | 'vertical'): Grid => {
      const newGrid = grid.map(r => [...r]);
      for (let i = 0; i < size; i++) {
        const setCol = orient === 'horizontal' ? col + i : col;
        const setRow = orient === 'vertical' ? row + i : row;
        newGrid[setRow][setCol] = 'ship';
      }
      return newGrid;
  }, []);
  
  const placeOpponentShips = useCallback(() => {
    let newOpponentGrid = createEmptyGrid();
    for (const ship of SHIPS) {
      let placed = false;
      while (!placed) {
        const isHorizontal = Math.random() < 0.5;
        const orient = isHorizontal ? 'horizontal' : 'vertical';
        const col = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? ship.size - 1 : 0)));
        const row = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? 0 : ship.size - 1)));
        if (canPlaceShip(newOpponentGrid, ship.size, col, row, orient)) {
          newOpponentGrid = placeShip(newOpponentGrid, ship.size, col, row, orient);
          placed = true;
        }
      }
    }
    setOpponentGrid(newOpponentGrid);
  }, [canPlaceShip, placeShip]);

  const handlePlacementClick = (col: number, row: number) => {
    if (gameState !== 'placement' || currentShipIndex >= SHIPS.length) return;
    const ship = SHIPS[currentShipIndex];
    if (canPlaceShip(playerGrid, ship.size, col, row, orientation)) {
      setPlayerGrid(placeShip(playerGrid, ship.size, col, row, orientation));
      setCurrentShipIndex(prev => prev + 1);
    } else {
      toast({
        title: "Invalid Placement",
        description: "Cannot place a ship there. It's out of bounds or overlapping another ship.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (gameState === 'placement' && currentShipIndex >= SHIPS.length) {
      placeOpponentShips();
      setGameState('battle');
      toast({ title: "All your ships are placed. The battle begins!" });
    }
  }, [currentShipIndex, gameState, placeOpponentShips, toast]);
  
  const handleGameEnd = useCallback((gameWinner: 'Player' | 'Opponent') => {
      setWinner(gameWinner);
      setGameState('gameover');
      if (gameWinner === 'Player') {
        const score = Math.max(0, 1000 - (turns * 10));
        const currentHighScore = scores[6] || 0;
        if (score > currentHighScore) {
          updateScore(6, score);
        }
      }
  }, [turns, updateScore, scores]);

  useEffect(() => {
    if (gameState !== 'battle') return;
    if (opponentHits === totalShipParts) {
      handleGameEnd('Player');
    } else if (playerHits === totalShipParts) {
      handleGameEnd('Opponent');
    }
  }, [playerHits, opponentHits, totalShipParts, gameState, handleGameEnd]);

  const opponentTurn = useCallback(() => {
    setTimeout(() => {
        let fired = false;
        let attempts = 0;
        while (!fired && attempts < 100) {
            const col = Math.floor(Math.random() * GRID_SIZE);
            const row = Math.floor(Math.random() * GRID_SIZE);
            if (playerGrid[row][col] !== 'hit' && playerGrid[row][col] !== 'miss') {
                setPlayerGrid(currentGrid => {
                    const newPlayerGrid = currentGrid.map(r => [...r]);
                    if (newPlayerGrid[row][col] === 'ship') {
                        newPlayerGrid[row][col] = 'hit';
                        setPlayerHits(h => h + 1);
                        toast({ title: "Opponent hit your ship!" });
                    } else {
                        newPlayerGrid[row][col] = 'miss';
                    }
                    return newPlayerGrid;
                });
                fired = true;
            }
            attempts++;
        }
        setIsPlayerTurn(true);
    }, 800);
  }, [playerGrid, toast]);

  const handleBattleClick = (col: number, row: number) => {
    if (gameState !== 'battle' || !isPlayerTurn || winner || opponentGrid[row][col] === 'hit' || opponentGrid[row][col] === 'miss') return;
    
    const newOpponentGrid = opponentGrid.map(r => [...r]);
    let hit = false;
    if (newOpponentGrid[row][col] === 'ship') {
        newOpponentGrid[row][col] = 'hit';
        setOpponentHits(h => h + 1);
        toast({ title: "It's a hit!", description: "You hit an opponent's ship." });
        hit = true;
    } else {
        newOpponentGrid[row][col] = 'miss';
        toast({ title: "Miss!", variant: "default" });
    }
    setOpponentGrid(newOpponentGrid);

    if (!hit) {
      setTurns(t => t + 1);
      setIsPlayerTurn(false);
      
      // Check for win before opponent turn
      if (opponentHits < totalShipParts) {
          opponentTurn();
      }
    }
  };

  const renderGrid = (grid: Grid, isPlayer: boolean, onCellClick: (col: number, row: number) => void) => (
    <div className="grid grid-cols-10 gap-px bg-primary/20 border-2 border-primary rounded-lg overflow-hidden shadow-[0_0_10px_hsl(var(--primary)/0.4)] aspect-square w-full">
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={cn(
              'flex items-center justify-center transition-colors',
              'bg-background/80 backdrop-blur-sm',
              { 'cursor-pointer hover:bg-primary/20': (gameState === 'placement' && isPlayer) || (gameState === 'battle' && !isPlayer && isPlayerTurn && !winner) },
              { 'cursor-not-allowed': gameState === 'battle' && !isPlayer && !isPlayerTurn },
              { 'bg-primary/30': isPlayer && cell === 'ship' },
              { 'bg-destructive/70 animate-pulse': cell === 'hit' },
              { 'bg-primary/10': cell === 'miss' }
            )}
            onClick={() => onCellClick(x, y)}
          >
            {cell === 'hit' && <Target className="w-5/6 h-5/6 text-destructive-foreground" />}
            {cell === 'miss' && <Waves className="w-5/6 h-5/6 text-primary/50" />}
          </div>
        ))
      )}
    </div>
  );

  const getStatusMessage = () => {
    if (gameState === 'placement') {
      if (currentShipIndex < SHIPS.length) {
        const ship = SHIPS[currentShipIndex];
        return `Place your ${ship.name} (${ship.size} cells)`;
      }
      return "Processing fleet...";
    }
    if (gameState === 'battle') {
        if(winner) return "Battle Over!";
        return isPlayerTurn ? "Your turn to fire!" : "Opponent is firing...";
    }
    if (gameState === 'gameover') {
        return winner === 'Player' ? 'Congratulations, you won!' : 'You have been defeated.';
    }
    return 'Welcome to Battleship';
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-5xl mx-auto p-2">
       <div className="w-full max-w-lg text-center mb-2">
            {gameState === 'gameover' ? (
                <Alert variant={winner === 'Player' ? 'default' : 'destructive'} className="border-2 animate-in fade-in">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-xl font-headline">Game Over!</AlertTitle>
                    <AlertDescription className="text-md">{winner} has won the battle! {winner === 'Player' && `Your score: ${Math.max(0, 1000 - (turns * 10))}`}</AlertDescription>
                </Alert>
            ) : (
                <Alert variant="default" className="border-primary/50 bg-transparent">
                    <Ship className="h-4 w-4" />
                    <AlertTitle className="font-headline text-lg">{getStatusMessage()}</AlertTitle>
                </Alert>
            )}
        </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center w-full">
        <div className="flex flex-col items-center gap-2 flex-1 max-w-sm mx-auto md:max-w-none">
          <h2 className="text-lg font-bold font-headline tracking-widest">Your Fleet</h2>
          {renderGrid(playerGrid, true, (x, y) => handlePlacementClick(x, y))}
        </div>
        <div className="flex flex-col items-center gap-2 flex-1 max-w-sm mx-auto md:max-w-none">
          <h2 className="text-lg font-bold font-headline tracking-widest">Opponent's Waters</h2>
          {renderGrid(opponentGrid, false, (x, y) => handleBattleClick(x, y))}
        </div>
      </div>
      
      <div className="w-full max-w-lg space-y-4 mt-4">
        {gameState === 'placement' && currentShipIndex < SHIPS.length && (
            <Button 
                onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')} 
                className="w-full"
                size="lg"
            >
                <RotateCw className="mr-2 h-5 w-5"/>
                Rotate Ship (Currently: {orientation})
            </Button>
        )}

        <div className="flex gap-4">
            <div className="flex-1 text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Turns</p>
                <p className="font-bold font-mono text-3xl">{turns}</p>
            </div>
            <div className="flex-1 text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                     <Trophy className="h-4 w-4 text-yellow-500"/> High Score
                </p>
                <p className="font-bold font-mono text-3xl">{highScore}</p>
            </div>
        </div>

        <Button onClick={resetGame} className="w-full" size="lg" variant="outline">New Game</Button>
      </div>
    </div>
  );
};

    