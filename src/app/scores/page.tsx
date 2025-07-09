'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { games } from '@/lib/data';
import { Trophy } from 'lucide-react';
import { DynamicGameIcon } from '@/components/DynamicGameIcon';
import { useGame } from '@/context/GameContext';

const SCORED_GAME_IDS = [2, 4, 6, 7, 8, 9, 12, 13, 14, 15, 18, 19, 20, 21, 23, 24];

export default function ScoresPage() {
  const { scores } = useGame();

  const sortedGames = [...games].sort((a, b) => {
    const scoreA = scores[a.id] || 0;
    const scoreB = scores[b.id] || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="container mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-block rounded-full bg-primary/10 p-4">
          <Trophy className="h-10 w-10 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}/>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl font-headline" style={{ textShadow: '0 0 10px hsl(var(--primary))' }}>
          High Scores
        </h1>
        <p className="mx-auto mt-2 max-w-[700px] text-muted-foreground md:text-xl">
          Check out your personal bests across all games in the DecaVerse.
        </p>
      </div>
      
      <div className="bg-black/50 border-2 border-primary/30 rounded-lg shadow-[0_0_20px_hsl(var(--primary)/0.5)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b-primary/30">
                <TableHead className="w-[50px] text-primary">Game</TableHead>
                <TableHead className="text-primary">Title</TableHead>
                <TableHead className="text-primary">Category</TableHead>
                <TableHead className="text-right text-primary">High Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGames.map((game) => {
                const score = scores[game.id] || 0;
                const isScoredGame = SCORED_GAME_IDS.includes(game.id);
                return (
                  <TableRow key={game.id} className="border-b-primary/20 last:border-b-0">
                    <TableCell>
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                        <DynamicGameIcon iconName={game.icon} className="h-6 w-6 text-primary" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium" style={{ textShadow: '0 0 4px hsl(var(--foreground))' }}>{game.title}</TableCell>
                    <TableCell className="text-muted-foreground">{game.category}</TableCell>
                    <TableCell className="text-right font-mono text-lg" style={{ textShadow: '0 0 4px hsl(var(--primary))' }}>
                      {isScoredGame ? score.toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
