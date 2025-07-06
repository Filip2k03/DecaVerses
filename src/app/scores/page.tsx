'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { games } from '@/lib/data';
import { Trophy } from 'lucide-react';
import { DynamicGameIcon } from '@/components/DynamicGameIcon';
import { useGame } from '@/context/GameContext';

const SCORED_GAME_IDS = [2, 4, 6, 7, 8, 9, 12, 13, 14, 15, 18, 19];

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
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
          High Scores
        </h1>
        <p className="mx-auto mt-2 max-w-[700px] text-muted-foreground md:text-xl">
          Check out your personal bests across all games in the DecaVerse.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            My Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Game</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">High Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGames.map((game) => {
                const score = scores[game.id] || 0;
                const isScoredGame = SCORED_GAME_IDS.includes(game.id);
                return (
                  <TableRow key={game.id}>
                    <TableCell>
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <DynamicGameIcon iconName={game.icon} className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{game.title}</TableCell>
                    <TableCell className="text-muted-foreground">{game.category}</TableCell>
                    <TableCell className="text-right font-mono text-lg">
                      {isScoredGame ? score.toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
