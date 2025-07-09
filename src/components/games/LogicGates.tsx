'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';

// Simplified types for this specific puzzle
type GateType = 'AND' | 'OR' | 'NOT';
type PlacedGate = { id: number; type: GateType; x: number; y: number };

// The puzzle definition
const PUZZLE = {
  inputs: [
    { id: 1, value: true, x: 0, y: 1 },
    { id: 2, value: false, x: 0, y: 3 },
  ],
  output: { id: 3, x: 4, y: 2 },
  solutionGate: { type: 'AND' as GateType, x: 2, y: 2 },
  targetValue: false, // For an AND gate, 1 AND 0 = 0 (false)
};

const PALETTE: GateType[] = ['AND', 'OR', 'NOT'];
const GRID_COLS = 5;
const GRID_ROWS = 5;
const CELL_SIZE = 80; // For SVG coordinate calculations

export const LogicGates = () => {
    const [placedGate, setPlacedGate] = useState<PlacedGate | null>(null);
    const [selectedGateType, setSelectedGateType] = useState<GateType | null>(null);
    const [puzzleResult, setPuzzleResult] = useState<'pending' | 'success' | 'fail'>('pending');

    const handleGridClick = (x: number, y: number) => {
        if (!selectedGateType) return;
        
        // Prevent placing on inputs/outputs
        if ([...PUZZLE.inputs, PUZZLE.output].some(g => g.x === x && g.y === y)) return;
        
        // Allow only one gate for this puzzle
        setPlacedGate({ id: Date.now(), type: selectedGateType, x, y });
        setSelectedGateType(null);
    };

    const checkSolution = () => {
        if (!placedGate) {
            setPuzzleResult('fail');
            return;
        }
        
        const isCorrectGate = placedGate.type === PUZZLE.solutionGate.type;
        const isCorrectPosition = placedGate.x === PUZZLE.solutionGate.x && placedGate.y === PUZZLE.solutionGate.y;

        if (isCorrectGate && isCorrectPosition) {
            setPuzzleResult('success');
        } else {
            setPuzzleResult('fail');
        }
    };
    
    const reset = () => {
        setPlacedGate(null);
        setSelectedGateType(null);
        setPuzzleResult('pending');
    };

    const allGates = useMemo(() => {
        const gates = [
            ...PUZZLE.inputs.map(i => ({...i, type: 'INPUT'})),
            {...PUZZLE.output, type: 'OUTPUT'},
        ];
        if (placedGate) {
            gates.push(placedGate);
        }
        return gates;
    }, [placedGate]);

    const getGatePosition = (x: number, y: number) => ({
        cx: x * CELL_SIZE + CELL_SIZE / 2,
        cy: y * CELL_SIZE + CELL_SIZE / 2,
    });
    
    const isSolved = puzzleResult === 'success';

    return (
        <Card className="w-full max-w-3xl bg-card/50 p-4">
            <CardContent className="p-2 flex flex-col items-center gap-4">
                <h3 className="font-headline text-lg">Puzzle 1: Build an AND Gate</h3>
                <p className="text-sm text-center text-muted-foreground max-w-md">Select a gate from the palette, place it on the grid to produce the correct output.</p>
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-center font-bold">Palette</h4>
                        {PALETTE.map(type => (
                            <Button key={type} variant={selectedGateType === type ? 'default' : 'outline'} onClick={() => setSelectedGateType(type)}>{type}</Button>
                        ))}
                    </div>
                    <div className="relative bg-black/30" style={{width: GRID_COLS * CELL_SIZE, height: GRID_ROWS * CELL_SIZE}}>
                        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}>
                            {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
                                const x = i % GRID_COLS;
                                const y = Math.floor(i / GRID_COLS);
                                return <div key={i} className="border border-primary/20" onClick={() => handleGridClick(x, y)} />;
                            })}
                        </div>

                        <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                            {isSolved && placedGate && (
                                <>
                                    <line x1={getGatePosition(PUZZLE.inputs[0].x, PUZZLE.inputs[0].y).cx} y1={getGatePosition(PUZZLE.inputs[0].x, PUZZLE.inputs[0].y).cy} x2={getGatePosition(placedGate.x, placedGate.y).cx} y2={getGatePosition(placedGate.x, placedGate.y).cy} stroke="hsl(var(--primary))" strokeWidth="2" />
                                    <line x1={getGatePosition(PUZZLE.inputs[1].x, PUZZLE.inputs[1].y).cx} y1={getGatePosition(PUZZLE.inputs[1].x, PUZZLE.inputs[1].y).cy} x2={getGatePosition(placedGate.x, placedGate.y).cx} y2={getGatePosition(placedGate.x, placedGate.y).cy} stroke="hsl(var(--primary))" strokeWidth="2" />
                                    <line x1={getGatePosition(placedGate.x, placedGate.y).cx} y1={getGatePosition(placedGate.x, placedGate.y).cy} x2={getGatePosition(PUZZLE.output.x, PUZZLE.output.y).cx} y2={getGatePosition(PUZZLE.output.x, PUZZLE.output.y).cy} stroke="hsl(var(--primary))" strokeWidth="2" />
                                </>
                            )}
                        </svg>

                        {allGates.map(gate => {
                            return (
                                <div key={gate.id} className="absolute w-16 h-16 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{left: getGatePosition(gate.x, gate.y).cx, top: getGatePosition(gate.x, gate.y).cy}}>
                                    <div className={cn("w-16 h-12 rounded-md flex flex-col items-center justify-center font-bold text-sm border-2", 
                                        gate.type === 'INPUT' && 'bg-green-500/30 border-green-500',
                                        gate.type === 'OUTPUT' && !isSolved && 'bg-red-500/30 border-red-500',
                                        gate.type !== 'INPUT' && gate.type !== 'OUTPUT' && 'bg-blue-500/30 border-blue-500',
                                        isSolved && gate.type === 'OUTPUT' && 'bg-green-500/30 border-green-500'
                                    )}>
                                        <span>{gate.type}</span>
                                        {gate.type === 'INPUT' && <span>Value: {gate.value ? '1':'0'}</span>}
                                        {gate.type === 'OUTPUT' && <span>Target: {PUZZLE.targetValue ? '1':'0'}</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                 {puzzleResult !== 'pending' && (
                    <Alert variant={puzzleResult === 'success' ? 'default' : 'destructive'} className="mt-4 max-w-md">
                        {puzzleResult === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <AlertTitle>{puzzleResult === 'success' ? 'Correct!' : 'Incorrect Circuit'}</AlertTitle>
                        <AlertDescription>
                            {puzzleResult === 'success' ? 'You solved the puzzle! Inputs 1 and 0 with an AND gate correctly produce 0.' : 'Your gate placement or type is incorrect. Please try again.'}
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex gap-4 mt-4">
                    <Button onClick={checkSolution} disabled={!placedGate}>Check Solution</Button>
                    <Button onClick={reset} variant="destructive">Reset</Button>
                </div>
            </CardContent>
        </Card>
    );
};
