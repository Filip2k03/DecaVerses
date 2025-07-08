'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';

type GateType = 'AND' | 'OR' | 'NOT' | 'INPUT' | 'OUTPUT';
type Gate = { id: number; type: GateType; value?: boolean; x: number; y: number };
type Wire = { from: number; to: number };

const Puzzle = {
  inputs: [
    { id: 1, type: 'INPUT' as GateType, value: true, x: 0, y: 1 },
    { id: 2, type: 'INPUT' as GateType, value: false, x: 0, y: 3 },
  ],
  output: { id: 3, type: 'OUTPUT' as GateType, x: 4, y: 2 },
  solution: [
      { id: 4, type: 'AND' as GateType, x: 2, y: 2}
  ],
  solutionWires: [
      { from: 1, to: 4 },
      { from: 2, to: 4 },
      { from: 4, to: 3 },
  ],
  targetValue: false
};

const GATE_TYPES: GateType[] = ['AND', 'OR', 'NOT'];

export const LogicGates = () => {
    const [placedGates, setPlacedGates] = useState<Gate[]>([]);
    const [selectedGate, setSelectedGate] = useState<GateType | null>(null);
    const [puzzleResult, setPuzzleResult] = useState<'pending' | 'success' | 'fail'>('pending');

    const handleGridClick = (x: number, y: number) => {
        if (!selectedGate) return;
        if ([...Puzzle.inputs, Puzzle.output, ...placedGates].some(g => g.x === x && g.y === y)) return;

        setPlacedGates([...placedGates, { id: Date.now(), type: selectedGate, x, y }]);
        setSelectedGate(null);
    };

    const checkSolution = () => {
        // This is a highly simplified check for this specific puzzle.
        // A real implementation would require a full graph traversal algorithm.
        const hasAndGateAtCorrectPosition = placedGates.some(g => g.type === 'AND' && g.x === 2 && g.y === 2);
        
        if (placedGates.length === 1 && hasAndGateAtCorrectPosition) {
            setPuzzleResult('success');
        } else {
            setPuzzleResult('fail');
        }
    };
    
    const reset = () => {
        setPlacedGates([]);
        setSelectedGate(null);
        setPuzzleResult('pending');
    };
    
    const renderGrid = () => {
        const grid = Array(5).fill(null).map(() => Array(5).fill(null));
        const allGates = [...Puzzle.inputs, Puzzle.output, ...placedGates];
        return grid.map((row, y) => row.map((_, x) => {
            const gate = allGates.find(g => g.x === x && g.y === y);
            return (
                <div key={`${x}-${y}`} className="w-20 h-20 border border-primary/20 flex items-center justify-center" onClick={() => handleGridClick(x, y)}>
                    {gate && (
                        <div className={cn("w-16 h-12 rounded-md flex items-center justify-center font-bold text-sm", 
                            gate.type === 'INPUT' && 'bg-green-500/30',
                            gate.type === 'OUTPUT' && 'bg-red-500/30',
                            gate.type !== 'INPUT' && gate.type !== 'OUTPUT' && 'bg-blue-500/30'
                        )}>
                            {gate.type === 'INPUT' ? `IN: ${gate.value ? '1':'0'}` : gate.type}
                        </div>
                    )}
                </div>
            )
        }));
    };

    return (
        <Card className="w-full max-w-2xl bg-card/50 p-4">
            <CardContent className="p-2 flex flex-col items-center gap-4">
                <h3 className="font-headline text-lg">Puzzle 1: Create an AND Gate</h3>
                <p className="text-sm text-center text-muted-foreground">Select a gate from the palette, then place it on the grid to connect the inputs to the output.</p>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-center font-bold">Palette</h4>
                        {GATE_TYPES.map(type => (
                            <Button key={type} variant={selectedGate === type ? 'default' : 'outline'} onClick={() => setSelectedGate(type)}>{type}</Button>
                        ))}
                    </div>
                    <div className="grid grid-cols-5 bg-black/30">
                        {renderGrid()}
                    </div>
                </div>
                 {puzzleResult !== 'pending' && (
                    <Alert variant={puzzleResult === 'success' ? 'default' : 'destructive'} className="mt-4">
                        {puzzleResult === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <AlertTitle>{puzzleResult === 'success' ? 'Success!' : 'Incorrect'}</AlertTitle>
                        <AlertDescription>
                            {puzzleResult === 'success' ? 'You correctly solved the puzzle.' : 'Your circuit does not produce the correct output. Try again.'}
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex gap-4 mt-4">
                    <Button onClick={checkSolution}>Check Solution</Button>
                    <Button onClick={reset} variant="destructive">Reset</Button>
                </div>
            </CardContent>
        </Card>
    );
};
