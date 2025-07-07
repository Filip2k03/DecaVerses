'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Expanded word list
const WORDS = [
    'CYBERPUNK', 'FUTURISTIC', 'DYSTOPIA', 'NEON', 'ANDROID', 
    'REPLICANT', 'TECHNOIR', 'AUGMENTED', 'MEGACORP', 'NETRUNNER',
    'CHROME', 'MATRIX', 'IMPLANT', 'VIRTUAL', 'HOLOGRAM',
    'SYNTHETIC', 'BLADERUNNER', 'NEUROMANCER', 'CYBORG', 'HACKER'
];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_WRONG_GUESSES = 10;

// SVG-based drawing component for better precision and more detail
const HangmanDrawing = ({ numberOfGuesses }: { numberOfGuesses: number }) => {
    const Head = <circle cx="160" cy="70" r="20" strokeWidth="4" fill="none" />;
    const Body = <line x1="160" y1="90" x2="160" y2="150" strokeWidth="4" />;
    const LeftArm = <line x1="160" y1="110" x2="130" y2="130" strokeWidth="4" />;
    const RightArm = <line x1="160" y1="110" x2="190" y2="130" strokeWidth="4" />;
    const LeftLeg = <line x1="160" y1="150" x2="130" y2="180" strokeWidth="4" />;
    const RightLeg = <line x1="160" y1="150" x2="190" y2="180" strokeWidth="4" />;

    const bodyParts = [Head, Body, LeftArm, RightArm, LeftLeg, RightLeg];

    return (
        <svg height="250" width="200" viewBox="0 0 200 250" className="stroke-current text-foreground drop-shadow-[0_0_8px_hsl(var(--primary))]">
            {/* Gallows */}
            {numberOfGuesses > 0 && <line x1="20" y1="230" x2="120" y2="230" strokeWidth="4" />} {/* Base */}
            {numberOfGuesses > 1 && <line x1="70" y1="230" x2="70" y2="20" strokeWidth="4" />} {/* Pole */}
            {numberOfGuesses > 2 && <line x1="70" y1="20" x2="160" y2="20" strokeWidth="4" />} {/* Beam */}
            {numberOfGuesses > 3 && <line x1="160" y1="20" x2="160" y2="50" strokeWidth="4" />} {/* Rope */}
            
            {/* Man */}
            {bodyParts.slice(0, numberOfGuesses - 4)}
        </svg>
    );
};


export const Hangman = () => {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const startGame = useCallback(() => {
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);
    setWin(false);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const handleGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || gameOver) return;
    
    setGuessedLetters(gl => [...gl, letter]);
    if (!word.includes(letter)) {
      setWrongGuesses(wg => wg + 1);
    }
  };

  useEffect(() => {
    const isWin = word && word.split('').every(letter => guessedLetters.includes(letter));
    const isLoss = wrongGuesses >= MAX_WRONG_GUESSES;

    if (isWin) {
      setWin(true);
      setGameOver(true);
    }
    if (isLoss) {
      setWin(false);
      setGameOver(true);
    }
  }, [wrongGuesses, guessedLetters, word]);
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <HangmanDrawing numberOfGuesses={wrongGuesses} />
        <div className="flex flex-col items-center">
            {gameOver && <h2 className="text-3xl font-bold font-headline mb-4">{win ? 'YOU WIN!' : 'GAME OVER'}</h2>}
             <div className="flex gap-2 text-4xl font-mono tracking-widest">
                {word.split('').map((letter, i) => (
                <span key={i} className="w-10 h-14 border-b-4 flex items-center justify-center border-primary/50 text-primary">
                    {guessedLetters.includes(letter) || (gameOver && !win) ? letter : ''}
                </span>
                ))}
            </div>
            {gameOver && !win && <p className="mt-2 text-muted-foreground">The word was: {word}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
        {ALPHABET.map(letter => (
          <Button
            key={letter}
            variant="outline"
            size="icon"
            onClick={() => handleGuess(letter)}
            disabled={guessedLetters.includes(letter) || gameOver}
            className={cn(guessedLetters.includes(letter) && (word.includes(letter) ? 'bg-cyan-500/50' : 'bg-fuchsia-500/50'))}
          >
            {letter}
          </Button>
        ))}
      </div>
      <Button onClick={startGame}>New Game</Button>
    </div>
  );
};
