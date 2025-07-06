'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Game } from '@/lib/data';
import { Play } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { DynamicGameIcon } from './DynamicGameIcon';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex-grow p-6 flex flex-col items-center justify-center text-center bg-muted/30 dark:bg-muted/10">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
            <DynamicGameIcon iconName={game.icon} className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold font-headline">{game.title}</CardTitle>
        <Badge variant="secondary" className="mt-2">{game.category}</Badge>
      </CardHeader>
      <CardContent className="p-6 pt-4 flex-grow">
        <CardDescription className="text-sm text-center">{game.description}</CardDescription>
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
