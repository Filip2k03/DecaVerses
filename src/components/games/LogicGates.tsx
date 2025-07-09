'use client';

import React, { useState, useMemo, useCallback, FC, SVGProps } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Lightbulb, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// --- Gate Icons ---
const AndGateIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 5 2v-3s-1-1-4-1-5 2-5 2z" /><path d="M4 6s1 1 4 1 5-2 5-2v3s-1 1-4 1-5-2-5-2z" />
        <path d="M13 5h2.5c2 0 4 1.5 4 4v2c0 2.5-2 4-4 4H15" />
    </svg>
);
const OrGateIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.12 19.14A10 10 0 1 0 5.12 4.86" /><path d="M5.12 4.86C8.25 7.53 12.86 12 5.12 19.14" />
        <path d="M17.88 19.14a10 10 0 1 1 0-14.28" /><path d="M17.88 4.86c-3.13 2.67-7.74 7.14-0.01 14.28" />
    </svg>
);
const NotGateIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h14l-4-4m0 8 4-4" /><circle cx="20" cy="12" r="2" />
    </svg>
);
const XorGateIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.12 4.86A10 10 0 1 0 5.12 19.14" /><path d="M18.88 4.86A10 10 0 1 1 18.88 19.14" />
        <path d="M5.12 4.86C8.25 7.53 12.86 12 5.12 19.14" /><path d="M18.88 4.86c-3.13 2.67-7.74 7.14-.01 14.28" />
    </svg>
);
const GateIcons: Record<GateType, FC<SVGProps<SVGSVGElement>>> = { 'AND': AndGateIcon, 'OR': OrGateIcon, 'NOT': NotGateIcon, 'XOR': XorGateIcon };

type GateType = 'AND' | 'OR' | 'NOT' | 'XOR';
type PlacedGate = { id: number; type: GateType; x: number; y: number };
type Node = { id: string, x: number, y: number, value?: boolean };
type Puzzle = {
    level: number;
    title: string;
    description: string;
    inputs: Node[];
    outputs: Node[];
    palette: GateType[];
    solution: { type: GateType, x: number, y: number }[];
    hint: string;
};

const puzzles: Puzzle[] = [
    { level: 1, title: 'Basic AND', description: 'Make the output TRUE (1).', inputs: [{id:'i1', x:0, y:1, value: true}, {id:'i2', x:0, y:3, value: true}], outputs: [{id:'o1', x:4, y:2}], palette: ['AND', 'OR'], solution: [{type:'AND', x:2, y:2}], hint: 'The AND gate is only true if ALL inputs are true.'},
    { level: 2, title: 'Basic OR', description: 'Make the output TRUE (1).', inputs: [{id:'i1', x:0, y:1, value: true}, {id:'i2', x:0, y:3, value: false}], outputs: [{id:'o1', x:4, y:2}], palette: ['AND', 'OR'], solution: [{type:'OR', x:2, y:2}], hint: 'The OR gate is true if AT LEAST ONE input is true.'},
    { level: 3, title: 'Basic NOT', description: 'Invert the input to make the output TRUE (1).', inputs: [{id:'i1', x:0, y:2, value: false}], outputs: [{id:'o1', x:4, y:2}], palette: ['NOT', 'AND'], solution: [{type:'NOT', x:2, y:2}], hint: 'A NOT gate flips a 0 to a 1, and a 1 to a 0.'},
    { level: 4, title: 'Simple Series', description: 'Combine two gates to get the correct output.', inputs: [{id:'i1',x:0,y:0,value:true}, {id:'i2',x:0,y:2,value:true}, {id:'i3',x:0,y:4,value:false}], outputs:[{id:'o1',x:4,y:2}], palette:['AND','OR'], solution:[{type:'AND',x:1,y:1},{type:'OR',x:3,y:2}], hint: 'Chain the output of one gate into the input of another.'},
    { level: 5, title: 'Exclusive OR (XOR)', description: 'Make the output TRUE (1).', inputs: [{id:'i1', x:0, y:1, value: true}, {id:'i2', x:0, y:3, value: false}], outputs: [{id:'o1', x:4, y:2}], palette: ['AND', 'XOR', 'OR'], solution: [{type:'XOR', x:2, y:2}], hint: 'XOR is true only if the inputs are different.'},
    { level: 6, title: 'False with AND', description: 'Make the output FALSE (0).', inputs: [{id:'i1', x:0, y:1, value: true}, {id:'i2', x:0, y:3, value: false}], outputs: [{id:'o1', x:4, y:2}], palette: ['OR', 'AND'], solution: [{type:'AND', x:2, y:2}], hint: 'How can you get a FALSE output from an AND gate?'},
    { level: 7, title: 'NOT and OR', description: 'Use inversion to your advantage.', inputs: [{id:'i1', x:0, y:1, value: false}, {id:'i2', x:0, y:3, value: false}], outputs: [{id:'o1', x:4, y:2}], palette: ['NOT', 'OR', 'AND'], solution: [{type:'NOT', x:1, y:1}, {type:'OR', x:3, y:2}], hint: 'Try inverting one of the inputs before it reaches the OR gate.'},
    { level: 8, title: 'Complex Circuit', description: 'A bigger challenge.', inputs: [{id:'i1',x:0,y:0,value:true},{id:'i2',x:0,y:2,value:false},{id:'i3',x:0,y:4,value:true}], outputs:[{id:'o1',x:4,y:2}], palette: ['AND','OR','NOT'], solution:[{type:'NOT',x:1,y:2},{type:'AND',x:2,y:0},{type:'OR',x:3,y:1}], hint: 'Think about the order of operations. What needs to happen first?'},
    { level: 9, title: 'XOR Challenge', description: 'Build an XOR gate from basic components.', inputs: [{id:'i1',x:0,y:0,value:true},{id:'i2',x:0,y:4,value:true}], outputs:[{id:'o1',x:4,y:2}], palette:['AND','OR','NOT'], solution:[{type:'OR',x:1,y:2},{type:'AND',x:2,y:0},{type:'NOT',x:3,y:0},{type:'AND',x:3,y:2}], hint:'An XOR gate can be written as (A OR B) AND NOT (A AND B).'},
    { level: 10, title: 'The Final Gate', description: 'One last complex puzzle.', inputs: [{id:'i1',x:0,y:0,value:false},{id:'i2',x:0,y:2,value:true},{id:'i3',x:0,y:4,value:false}], outputs:[{id:'o1',x:4,y:2}], palette:['AND','OR','NOT'], solution:[{type:'NOT',x:1,y:0},{type:'NOT',x:1,y:4},{type:'AND',x:2,y:2},{type:'OR',x:3,y:2}], hint: 'Sometimes you need to invert multiple inputs.'},
];

const GRID_COLS = 5;
const GRID_ROWS = 5;
const CELL_SIZE = 80;

export const LogicGates = () => {
    const [gameState, setGameState] = useState<'start' | 'loading' | 'playing' | 'level_complete' | 'all_complete'>('start');
    const [currentLevel, setCurrentLevel] = useState(0);
    const [placedGates, setPlacedGates] = useState<PlacedGate[]>([]);
    const [selectedGateType, setSelectedGateType] = useState<GateType | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'fail', message: string } | null>(null);
    const [showHint, setShowHint] = useState(false);
    const isMobile = useIsMobile();
    
    const puzzle = puzzles[currentLevel];

    const resetLevel = useCallback(() => {
        setPlacedGates([]);
        setSelectedGateType(null);
        setFeedback(null);
        setShowHint(false);
    }, []);
    
    const startGame = () => {
        setCurrentLevel(0);
        resetLevel();
        setGameState('loading');
        setTimeout(() => setGameState('playing'), 1000);
    };

    const handleNextLevel = () => {
        if (currentLevel < puzzles.length - 1) {
            setCurrentLevel(c => c + 1);
            resetLevel();
            setGameState('loading');
            setTimeout(() => setGameState('playing'), 500);
        } else {
            setGameState('all_complete');
        }
    };
    
    const handleGridClick = (x: number, y: number) => {
        if (!selectedGateType) return;
        const isOccupied = [...puzzle.inputs, ...puzzle.outputs, ...placedGates].some(g => g.x === x && g.y === y);
        if (isOccupied) return;
        
        setPlacedGates(pg => [...pg, { id: Date.now(), type: selectedGateType, x, y }]);
        setSelectedGateType(null);
    };

    const checkSolution = () => {
        if (placedGates.length !== puzzle.solution.length) {
            setFeedback({ type: 'fail', message: 'Incorrect number of gates placed.' });
            return;
        }
        const isCorrect = puzzle.solution.every(sol => 
            placedGates.some(pg => pg.type === sol.type && pg.x === sol.x && pg.y === sol.y)
        );

        if (isCorrect) {
            setGameState('level_complete');
        } else {
            setFeedback({ type: 'fail', message: 'Gate placement or type is incorrect. Try again!' });
        }
    };
    
    const allNodes = useMemo(() => {
        return [...puzzle.inputs, ...puzzle.outputs, ...placedGates];
    }, [puzzle, placedGates]);

    const getGatePosition = (x: number, y: number) => ({
        cx: x * CELL_SIZE + CELL_SIZE / 2,
        cy: y * CELL_SIZE + CELL_SIZE / 2,
    });

    const gridDimensions = {
        width: GRID_COLS * CELL_SIZE,
        height: GRID_ROWS * CELL_SIZE,
    };

    if (gameState === 'start') {
        return (
             <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card border-2 border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.5)] w-full max-w-md h-96">
                <h1 className="text-3xl font-bold font-headline">Logic Gates Challenge</h1>
                <p className="text-muted-foreground my-4">A puzzle game of digital logic. Wire up the circuits to produce the correct output. Do you have what it takes to crack the system?</p>
                <p className="text-sm text-muted-foreground mb-6">"Bring back to memo with play old game with modern style" - <span className="text-primary">Stephanfilip</span></p>
                <Button onClick={startGame} size="lg">Begin Challenge</Button>
            </div>
        )
    }
    
    if (gameState === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Level {puzzle.level}...</p>
            </div>
        )
    }

    if (gameState === 'all_complete') {
        return (
             <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-card border-2 border-green-500/50 shadow-[0_0_20px_hsl(var(--primary)/0.5)] w-full max-w-md h-96">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h1 className="text-3xl font-bold font-headline">All Levels Complete!</h1>
                <p className="text-muted-foreground my-4">Congratulations, you've mastered the logic gates! You are a true Netrunner.</p>
                <Button onClick={startGame} size="lg">Play Again</Button>
            </div>
        )
    }

    return (
        <Card className="w-full max-w-4xl bg-card/50 p-2 md:p-4">
            <CardContent className="p-1 flex flex-col items-center gap-4">
                <div className="text-center">
                    <h3 className="font-headline text-2xl">Level {puzzle.level}: {puzzle.title}</h3>
                    <p className="text-sm text-muted-foreground">{puzzle.description}</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-start w-full">
                    <div className={cn("flex md:flex-col gap-2 p-2 rounded-lg bg-muted/30 border", isMobile && "flex-wrap justify-center")}>
                        <h4 className="text-center font-bold w-full md:w-auto">Palette</h4>
                        {puzzle.palette.map(type => {
                            const Icon = GateIcons[type];
                            return (
                                <Button key={type} variant={selectedGateType === type ? 'default' : 'outline'} onClick={() => setSelectedGateType(type)} className="flex items-center gap-2">
                                    <Icon className="w-5 h-5" /> <span>{type}</span>
                                </Button>
                            );
                        })}
                    </div>
                    <div className="relative bg-black/30" style={{width: gridDimensions.width, height: gridDimensions.height}}>
                         <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}>
                            {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
                                const x = i % GRID_COLS;
                                const y = Math.floor(i / GRID_ROWS);
                                return <div key={i} className="border border-primary/20" onClick={() => handleGridClick(x, y)} />;
                            })}
                        </div>
                        {allNodes.map(node => {
                            const Icon = (node.type && node.type in GateIcons) ? GateIcons[node.type as GateType] : null;
                            const isInput = 'value' in node;
                            return (
                                <div key={node.id} className="absolute w-16 h-16 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{left: getGatePosition(node.x, node.y).cx, top: getGatePosition(node.x, node.y).cy}}>
                                    <div className={cn("w-16 h-12 rounded-md flex flex-col items-center justify-center font-bold text-sm border-2", 
                                        isInput && 'bg-green-500/30 border-green-500',
                                        node.type === 'OUTPUT' && 'bg-red-500/30 border-red-500',
                                        !isInput && node.type !== 'OUTPUT' && 'bg-blue-500/30 border-blue-500',
                                    )}>
                                        {Icon ? <Icon className="w-5 h-5 mb-1" /> : <span>{node.type}</span>}
                                        {isInput ? <span>{node.value ? '1':'0'}</span> : <span>{node.type}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-48">
                        <Button onClick={checkSolution} disabled={placedGates.length === 0}>Check Solution</Button>
                        <Button onClick={resetLevel} variant="destructive">Reset Level</Button>
                        <Dialog>
                            <DialogTrigger asChild><Button variant="outline">How to Play</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>How to Play Logic Gates</DialogTitle></DialogHeader>
                                <div className="space-y-2 text-sm">
                                    <p>1. Your goal is to use the gates from the <span className="text-primary font-bold">Palette</span> to build a circuit.</p>
                                    <p>2. The circuit must take the green <span className="text-green-400 font-bold">INPUT</span> values and produce the correct value at the red <span className="text-red-400 font-bold">OUTPUT</span> node.</p>
                                    <p>3. Select a gate from the palette and click on an empty square in the grid to place it.</p>
                                    <p>4. When you think your circuit is correct, press <span className="text-primary font-bold">Check Solution</span>.</p>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button onClick={() => setShowHint(h => !h)} variant="secondary"><Lightbulb className="mr-2"/>Hint</Button>
                    </div>
                </div>
                
                 {feedback && (
                    <div className={cn("mt-4 p-3 rounded-md text-sm font-medium flex items-center", feedback.type === 'fail' && "bg-red-900/50 text-red-200")}>
                        <XCircle className="h-5 w-5 mr-2" /> {feedback.message}
                    </div>
                )}
                {showHint && (
                     <div className="mt-4 p-3 rounded-md text-sm bg-yellow-900/50 text-yellow-200 flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2" /> {puzzle.hint}
                    </div>
                )}
                 {gameState === 'level_complete' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-white gap-4">
                         <CheckCircle className="h-16 w-16 text-green-500" />
                         <h2 className="text-3xl font-bold font-headline">Level {puzzle.level} Complete!</h2>
                         <Button onClick={handleNextLevel} size="lg">Next Level</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
