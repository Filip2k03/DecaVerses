import { GameCard } from '@/components/GameCard';
import { games } from '@/lib/data';
import { Gamepad2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto">
      <div className="mb-12 text-center">
        <div className="inline-block rounded-full bg-primary/10 p-4">
            <Gamepad2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-6xl font-headline">
          Welcome to DecaVerse
        </h1>
        <p className="mx-auto mt-4 max-w-[700px] text-lg text-muted-foreground md:text-xl">
          Your portal to a universe of classic and modern offline games. Ready to play?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
