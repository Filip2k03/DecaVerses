
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Game } from '@/lib/data';
import { Play, Trophy } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { DynamicGameIcon } from './DynamicGameIcon';
import { useGame } from '@/context/GameContext';

interface GameCardProps {
  game: Game;
}

const SCORED_GAME_IDS = [2, 4, 6, 7, 8, 9, 12, 13, 14, 15, 18, 19, 20, 21, 23, 24, 25, 26];

export function GameCard({ game }: GameCardProps) {
  const { scores } = useGame();
  const highScore = scores[game.id] || 0;
  const isScoredGame = SCORED_GAME_IDS.includes(game.id);

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 border border-transparent hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
      <CardHeader className="flex-grow p-6 flex flex-col items-center justify-center text-center bg-muted/30 dark:bg-muted/10">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
            <DynamicGameIcon iconName={game.icon} className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold font-headline">{game.title}</CardTitle>
        <Badge variant="secondary" className="mt-2">{game.category}</Badge>
      </CardHeader>
      <CardContent className="p-6 pt-4 flex-grow flex flex-col justify-between">
        <CardDescription className="text-sm text-center mb-4">{game.description}</CardDescription>
        {isScoredGame && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-auto">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>High Score:</span>
                <span className="font-mono font-bold">{highScore.toLocaleString()}</span>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center p-4 pt-0">
        <Link href={`/play/${game.id}`} className="w-full">
          <Button className="w-full">
            <Play className="mr-2 h-4 w-4" />
            Play Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
