'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WORDS = ['CYBERPUNK', 'FUTURISTIC', 'DYSTOPIA', 'NEON', 'ANDROID', 'REPLICANT', 'TECHNOIR'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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
    if (wrongGuesses >= 6) {
      setGameOver(true);
    }
    if (word && word.split('').every(letter => guessedLetters.includes(letter))) {
      setWin(true);
      setGameOver(true);
    }
  }, [wrongGuesses, guessedLetters, word]);
  
  const HangmanDrawing = () => (
    <div className="w-48 h-64 relative">
        {wrongGuesses > 0 && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-foreground" />}
        {wrongGuesses > 1 && <div className="absolute bottom-0 left-1/4 w-2 h-56 bg-foreground" />}
        {wrongGuesses > 2 && <div className="absolute top-0 left-1/4 w-24 h-2 bg-foreground" />}
        {wrongGuesses > 3 && <div className="absolute top-0 right-1/4 w-2 h-10 bg-foreground" />}
        {wrongGuesses > 4 && <div className="absolute top-10 right-1/4 mr-2.5 w-6 h-6 border-2 border-foreground rounded-full" />}
        {wrongGuesses > 5 && <div className="absolute top-16 right-1/4 w-2 h-16 bg-foreground" />}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <HangmanDrawing />
        <div className="flex flex-col items-center">
            {gameOver && <h2 className="text-3xl font-bold font-headline mb-4">{win ? 'YOU WIN!' : 'GAME OVER'}</h2>}
            <div className="flex gap-2 text-4xl font-mono tracking-widest">
                {word.split('').map((letter, i) => (
                <span key={i} className="w-10 h-14 border-b-4 flex items-center justify-center">
                    {guessedLetters.includes(letter) || gameOver ? letter : ''}
                </span>
                ))}
            </div>
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
