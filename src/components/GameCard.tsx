'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Game } from '@/lib/data';
import { Users, Play } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={game.image}
            alt={game.title}
            fill
            className="object-cover"
            data-ai-hint={game.aiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <Badge variant="secondary" className="mb-2">{game.category}</Badge>
        <CardTitle className="text-xl font-bold font-headline">{game.title}</CardTitle>
        <CardDescription className="mt-2 text-sm">{game.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between p-4 bg-muted/50">
        <Link href={`/play/${game.id}`}>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Play
          </Button>
        </Link>
        <Button variant="outline" size="icon" aria-label="Local Multiplayer">
          <Users className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
