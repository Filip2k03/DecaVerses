'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, RefreshCw, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

const TEXTS: Record<string, string[]> = {
  'QWERTY Basics': ['the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs'],
  'Business': [
    'The quarterly earnings report indicates a significant growth in market share, exceeding all initial projections.',
    'Please review the attached documents and provide your feedback by the end of the business day.',
    'Our core business strategy focuses on leveraging synergistic opportunities to maximize shareholder value.'
  ],
  'Email': [
    'Hi team, just a reminder about the meeting tomorrow at 10 AM. The agenda is attached. Please come prepared.',
    'I hope this email finds you well. I am writing to follow up on our previous conversation regarding the project timeline.'
  ],
  'IT': [
    'The server migration is scheduled for this weekend, expect a brief downtime on Sunday from 2 AM to 4 AM.',
    'To resolve the issue, please clear your browser cache and cookies, then restart the application.',
    'Ensure your operating system and all software are updated with the latest security patches to prevent vulnerabilities.'
  ],
  'Python': [
    'def factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n-1)',
    'import os\n\nfor i in range(5):\n    print(f"Current count is {i}")',
    'class MyClass:\n    def __init__(self, name):\n        self.name = name'
  ],
  'HTML': [
    '<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>My First Heading</h1>\n</body>\n</html>',
    '<nav>\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n  <a href="/contact">Contact</a>\n</nav>'
  ],
  'CSS': [
    'body {\n  font-family: sans-serif;\n  line-height: 1.6;\n  background-color: #f0f0f0;\n}',
    '.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}'
  ]
};

const CATEGORIES = Object.keys(TEXTS);

export const TypingGame = () => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [textToType, setTextToType] = useState('');
  const [userInput, setUserInput] = useState('');
  const [gameState, setGameState] = useState<'waiting' | 'typing' | 'finished'>('waiting');
  const [stats, setStats] = useState({ wpm: 0, accuracy: 0, time: 0 });
  const [charStates, setCharStates] = useState<( 'correct' | 'incorrect' | 'default')[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { scores, updateScore } = useGame();
  const highScore = scores[26] || 0;

  const chooseNewText = useCallback((cat: string) => {
    const texts = TEXTS[cat];
    setTextToType(texts[Math.floor(Math.random() * texts.length)]);
  }, []);

  useEffect(() => {
    chooseNewText(category);
  }, [category, chooseNewText]);
  
  const resetTest = useCallback(() => {
    setGameState('waiting');
    setUserInput('');
    setCharStates([]);
    setStats({ wpm: 0, accuracy: 0, time: 0 });
    if (timerRef.current) clearInterval(timerRef.current);
    chooseNewText(category);
    inputRef.current?.focus();
  }, [category, chooseNewText]);
  
  useEffect(() => {
    resetTest();
  }, [resetTest]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (gameState === 'waiting' && value.length > 0) {
      setGameState('typing');
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
        setStats(s => ({ ...s, time: parseFloat(timeElapsed.toFixed(1)) }));
      }, 100);
    }
    
    setUserInput(value);

    const newCharStates = textToType.split('').map((char, index) => {
      if (index < value.length) {
        return char === value[index] ? 'correct' : 'incorrect';
      }
      return 'default';
    });
    setCharStates(newCharStates);
    
    if (value.length >= textToType.length) {
      setGameState('finished');
      if (timerRef.current) clearInterval(timerRef.current);
      
      const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
      const wordsTyped = textToType.length / 5;
      const wpm = Math.round(wordsTyped / (timeElapsed / 60));
      
      const correctChars = newCharStates.filter(s => s === 'correct').length;
      const accuracy = Math.round((correctChars / textToType.length) * 100);

      setStats({ wpm, accuracy, time: parseFloat(timeElapsed.toFixed(1)) });
      updateScore(26, wpm);
    }
  };

  return (
    <Card className="w-full max-w-3xl p-4">
      <CardContent className="p-2 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Select onValueChange={setCategory} defaultValue={category}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
            </Select>
            <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-lg"><Timer className="h-5 w-5"/>{stats.time}s</div>
                 <div className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5 text-yellow-500"/>{highScore} WPM</div>
            </div>
        </div>
        
        <div
            className="relative p-4 rounded-lg bg-muted text-lg font-mono tracking-wider cursor-text whitespace-pre-wrap"
            onClick={() => inputRef.current?.focus()}
        >
            {textToType.split('').map((char, index) => (
                <span
                    key={index}
                    className={cn({
                        'text-green-500': charStates[index] === 'correct',
                        'text-red-500 bg-red-500/20 rounded': charStates[index] === 'incorrect',
                        'text-muted-foreground': charStates[index] === 'default'
                    })}
                >
                    {char}
                </span>
            ))}
            {gameState !== 'finished' && userInput.length < textToType.length && (
                <span className="absolute animate-pulse bg-primary w-0.5 h-6" style={{
                    left: `${(userInput.length * 9.6) + 16}px`, // This is an approximation for mono fonts
                    top: '16px'
                }}/>
            )}
             <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                className="absolute inset-0 opacity-0 cursor-text"
                disabled={gameState === 'finished'}
                autoFocus
            />
        </div>
        
        {gameState === 'finished' ? (
            <div className="text-center space-y-4">
                <div className="flex justify-around">
                    <div><p className="text-sm text-muted-foreground">WPM</p><p className="text-3xl font-bold">{stats.wpm}</p></div>
                    <div><p className="text-sm text-muted-foreground">Accuracy</p><p className="text-3xl font-bold">{stats.accuracy}%</p></div>
                </div>
                <Button onClick={resetTest} size="lg"><RefreshCw className="mr-2"/>Try Again</Button>
            </div>
        ) : (
            <p className="text-sm text-muted-foreground text-center">Start typing to begin the test.</p>
        )}
      </CardContent>
    </Card>
  );
};
