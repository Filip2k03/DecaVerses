import { GameCard } from '@/components/GameCard';
import { games } from '@/lib/data';

export default function Home() {
  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
          Welcome to DecaVerse
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Your portal to ten amazing offline games. Ready to play?
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
