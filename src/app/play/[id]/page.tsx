import { games } from '@/lib/data';
import { notFound } from 'next/navigation';
import { BlockStacker } from '@/components/games/BlockStacker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GamePage({ params }: { params: { id: string } }) {
  const game = games.find((g) => g.id === parseInt(params.id, 10));

  if (!game) {
    notFound();
  }

  const renderGame = () => {
    switch (game.id) {
      case 8: // Block Stacker
        return <BlockStacker />;
      default:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{game.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This game is not yet available. Check back soon!</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
          {game.title}
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          {game.description}
        </p>
      </div>
      {renderGame()}
    </div>
  );
}
